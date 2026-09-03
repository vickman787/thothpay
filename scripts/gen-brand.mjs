import sharp from "sharp"

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" fill="#0e0a05"/>
  <path d="M 30,20 C 52,34 74,58 88,84 L 74,92 C 62,70 42,48 26,38 Z" fill="#e8b84b"/>
  <path d="M 30,20 L 88,84" stroke="#0e0a05" stroke-width="5" stroke-linecap="round"/>
  <path d="M 34,28 L 24,34 M 44,38 L 34,44 M 56,52 L 46,58 M 66,66 L 58,72" stroke="#0e0a05" stroke-width="4" stroke-linecap="round"/>
  <circle cx="70" cy="90" r="19" fill="#e8b84b"/>
  <circle cx="70" cy="90" r="11" fill="#0e0a05"/>
</svg>`

// apple-icon: 180x180 rounded tile
const apple = await sharp(Buffer.from(LOGO_SVG)).resize(180, 180).png().toBuffer()
await sharp(apple)
  .composite([{ input: await sharp(Buffer.from(LOGO_SVG)).resize(180, 180).png().toBuffer() }])
  .png()
  .toFile("src/app/apple-icon.png")

// opengraph: 1200x630 with wordmark
const og = await sharp({
  create: { width: 1200, height: 630, channels: 4, background: { r: 14, g: 10, b: 5, alpha: 1 } },
})
  .composite([
    { input: await sharp(Buffer.from(LOGO_SVG)).resize(220, 220).png().toBuffer(), left: 80, top: 120 },
  ])
  .png()
  .toFile("src/app/opengraph-image.png")

console.log("done")
