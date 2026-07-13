const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dfyh7cs1g',
  api_key: '734447488263944',
  api_secret: 'fQgKFWGt0aw8kl8WgBN2z14RX-c'
});

async function run() {
  const r1 = await cloudinary.uploader.upload('/home/ewilliamhe/glimmerfall-tcg/IMG_5194.webp', { folder: 'glimmerfall/card_renders', public_id: 'blinding_radiance', overwrite: true });
  console.log("Uploaded blinding_radiance:", r1.secure_url);
}
run();
