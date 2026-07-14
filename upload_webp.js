const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dfyh7cs1g',
  api_key: '734447488263944',
  api_secret: 'fQgKFWGt0aw8kl8WgBN2z14RX-c'
});

async function run() {
  const filePath = process.argv[2];
  const publicId = process.argv[3];
  if (!filePath || !publicId) {
    console.error("Usage: node upload_webp.js <filePath> <publicId>");
    return;
  }
  const r1 = await cloudinary.uploader.upload(filePath, { folder: 'glimmerfall/card_renders', public_id: publicId, overwrite: true });
  console.log(`Uploaded ${publicId}:`, r1.secure_url);
}
run();
