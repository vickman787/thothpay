import { URL } from 'url'
import { createClient } from '@/utils/supabase/server'
import { embedDocuments, serializeVector } from '@/lib/ai/embeddings'
import { safeFetch } from '@/lib/net/safe-fetch'
import { resolveOwningIdentity } from '@/lib/verification/verify'
import crypto from 'crypto'

function extractMetadata(html: string) {
  // Extremely rudimentary metadata extraction regex for demonstration
  // In production, we would use cheerio and sanitize-html
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled'
  
  // Naive text extraction (strip tags)
  const readableText = html
    .replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '')
    .replace(/<style[^>]*>([\S\s]*?)<\/style>/gmi, '')
    .replace(/<\/?[^>]+(>|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    
  return { title, readableText }
}

export async function registerArticle(targetUrl: string, creatorId: string, price: number = 0.00) {
  const supabase = await createClient()
  
  try {
    // 1. Normalize URL
    const normalizedUrl = new URL(targetUrl).toString()

    // 1b. Ownership gate — only the verified owner of this domain/handle may
    // register content from it. No source row is created without a match.
    const ownership = await resolveOwningIdentity(normalizedUrl, creatorId, supabase)
    if (!ownership.allowed) {
      throw new Error(ownership.reason || 'You have not verified ownership of this source.')
    }

    let title = 'Untitled'
    let readableText = ''

    // 2. Fetch the article content (with SSRF protection).
    //
    // X/Twitter embed the full post body in an <h1 class="sr-only"> element for
    // SEO, so a direct fetch is enough there — no Jina needed. Other JS-heavy
    // platforms, and any direct extraction that comes back too thin to cite,
    // fall back to the Jina AI Reader.
    const isXUrl = /(^|\.)(x\.com|twitter\.com)$/.test(new URL(normalizedUrl).hostname.replace(/^www\./, ''))
    const response = await safeFetch(normalizedUrl).catch(() => null)

    if (response?.ok) {
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('text/html')) {
        const html = await response.text()

        if (isXUrl) {
          // The full post text lives in the sr-only h1 that search engines read.
          const h1 = html.match(/<h1[^>]*class="sr-only"[^>]*>([\s\S]*?)<\/h1>/i)
          const postText = h1
            ? h1[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
            : ''
          if (postText.length >= 200) {
            readableText = postText
          }
          // Title from the page's <title> or og:title, minus the " / X" suffix.
          const pageTitle =
            html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1] ||
            html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
            ''
          const cleaned = pageTitle.replace(/\/ X\s*$/i, '').trim()
          if (cleaned) title = cleaned.replace(/^Vickman on X:\s*/i, '')
        } else {
          const extracted = extractMetadata(html)
          title = extracted.title
          readableText = extracted.readableText
        }
      }
    }

    // Direct fetch failed, wasn't HTML, or yielded too little to cite.
    if (readableText.trim().length < 200) {
      const jinaResponse = await fetch(`https://r.jina.ai/${normalizedUrl}`)
      if (!jinaResponse.ok) {
        throw new Error(`Failed to fetch article (even with Jina AI fallback): ${jinaResponse.statusText}`)
      }
      let jinaText = await jinaResponse.text()

      // Jina pages append platform chrome after the real content (login walls,
      // "Relevant people", nav, etc.). Cut at the first obvious chrome marker so
      // only the article body is embedded and later cited.
      const chromeMarkers = [
        'Log in or sign up for X',
        'Sign in to continue',
        'Relevant people',
        'See what\u2019s happening',
        'Continue with phone',
        'Related stories',
      ]
      const cutIndex = chromeMarkers.reduce(
        (earliest, marker) => {
          const at = jinaText.indexOf(marker)
          return at !== -1 && (earliest === -1 || at < earliest) ? at : earliest
        },
        -1
      )
      if (cutIndex !== -1) jinaText = jinaText.slice(0, cutIndex)

      readableText = jinaText.trim()

      // Jina puts the title in the x-title header, but sometimes it's missing
      const jinaTitle = jinaResponse.headers.get('x-title') || jinaResponse.headers.get('X-Title') || ''
      if (jinaTitle) title = jinaTitle
    }

    if (readableText.trim().length < 200) {
      throw new Error('Could not read enough article content to register this source.')
    }

    const contentHash = crypto.createHash('sha256').update(readableText).digest('hex')

    // 5. Database Insertion
    const { data: existing } = await supabase
      .from('sources')
      .select('id, creator_id, status')
      .eq('url', normalizedUrl)
      .single()

    let sourceId: string;

    if (existing) {
       if (existing.creator_id !== creatorId) {
          throw new Error('This article is already registered by another creator.')
       }
       if (existing.status !== 'deleted') {
          throw new Error('Article already registered (Duplicate)')
       }

       // Reactivate it!
       const { data: updated, error } = await supabase
         .from('sources')
         .update({
           status: 'extracted',
           title,
           content_hash: contentHash,
           price_usdc: price
         })
         .eq('id', existing.id)
         .select('id')
         .single()

       if (error) throw error
       sourceId = updated.id
       
       // Wipe old chunks just in case they survived
       await supabase.from('source_chunks').delete().eq('source_id', sourceId)
       
    } else {
       // Insert new
       const { data: inserted, error } = await supabase
         .from('sources')
         .insert({
           url: normalizedUrl,
           title,
           content_hash: contentHash,
           price_usdc: price,
           creator_id: creatorId,
           status: 'extracted'
         })
         .select('id')
         .single()

       if (error) {
         if (error.code === '23505') {
           throw new Error('Article already registered (Duplicate)')
         }
         throw error
       }
       sourceId = inserted.id
    }

    // 6. Chunking (naive for now)
    const chunks = readableText.match(/.{1,1000}/g) || []

    // Embed chunks for vector retrieval. If the embedding API is unavailable,
    // still register the source — the agent falls back to document-order chunks.
    let embeddings: number[][] | null = null
    if (chunks.length > 0) {
      try {
        embeddings = await embedDocuments(chunks)
      } catch (embedError: any) {
        console.warn(`Embedding failed for ${normalizedUrl}, storing chunks without vectors:`, embedError.message)
      }
    }

    // Insert chunks
    if (chunks.length > 0) {
      const chunkInserts = chunks.map((chunk, i) => ({
        source_id: sourceId,
        chunk_text: chunk,
        ...(embeddings ? { embedding: serializeVector(embeddings[i]) } : {})
      }))

      await supabase.from('source_chunks').insert(chunkInserts)
    }

    return { success: true, sourceId }

  } catch (error: any) {
    console.error('Registration error:', error.message)
    return { success: false, error: error.message }
  }
}
