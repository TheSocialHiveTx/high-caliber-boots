import sharp from 'sharp';

async function main() {
  const input = 'assets/images/branding/logo.png';
  const output = 'assets/images/branding/social-share.png';

  const logo = await sharp(input)
    .resize(550, 550, {
      fit: 'contain',
      background: { r: 247, g: 244, b: 238, alpha: 1 }
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 247, g: 244, b: 238, alpha: 1 }
    }
  })
    .composite([
      {
        input: logo,
        left: 325,
        top: 40
      }
    ])
    .png()
    .toFile(output);

  console.log(`Created ${output}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
