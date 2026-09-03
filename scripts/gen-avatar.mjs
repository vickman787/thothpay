import sharp from "sharp"

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" fill="#0e0a05"/>
  <path d="M 30,20 C 52,34 74,58 88,84 L 74,92 C 62,70 42,48 26,38 Z" fill="#e8b84b"/>
  <path d="M 30,20 L 88,84" stroke="#0e0a05" stroke-width="5" stroke-linecap="round"/>
  <path d="M 34,28 L 24,34 M 44,38 L 34,44 M 56,52 L 46,58 M 66,66 L 58,72" stroke="#0e0a05" stroke-width="4" stroke-linecap="round"/>
  <circle cx="70" cy="90" r="19" fill="#e8b84b"/>
  <circle cx="70" cy="90" r="11" fill="#0e0a05"/>
</svg>`

// Agent avatar shown on 8004scan (square). A 512 tile keeps it crisp everywhere.
const dir = new URL("../assets/", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")
import fs from "node:fs"
fs.mkdirSync(dir, { recursive: true })
await sharp(Buffer.from(LOGO_SVG)).resize(512, 512).jpeg({ quality: 92 }).toFile(`${dir}thothpay-avatar.jpg`)
console.log("wrote assets/thothpay-avatar.jpg")
