const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

async function run() {
  const src = path.join(__dirname, '..', 'src', 'assets', 'london-corgi.png')
  const out = path.join(__dirname, '..', 'src', 'assets', 'london-corgi.webp')

  if (!fs.existsSync(src)) {
    console.error('Source image not found:', src)
    process.exit(1)
  }

  try {
    const meta = fs.statSync(src)
    console.log('Original size:', meta.size)

    await sharp(src)
      .resize({ width: 900, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(out)

    const newMeta = fs.statSync(out)
    console.log('Optimized size:', newMeta.size)
  } catch (e) {
    console.error('Image optimization failed:', e)
    process.exit(1)
  }
}

run()
