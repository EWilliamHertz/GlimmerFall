const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dfyh7cs1g',
  api_key: '734447488263944',
  api_secret: 'fQgKFWGt0aw8kl8WgBN2z14RX-c'
});

async function run() {
  const r1 = await cloudinary.uploader.upload('/home/ewilliamhe/glimmerfall-tcg/haloed_bastion.webp', { folder: 'glimmerfall/card_renders', public_id: 'haloed_bastion', overwrite: true });
  console.log("Uploaded haloed bastion:", r1.secure_url);
  const r2 = await cloudinary.uploader.upload('/home/ewilliamhe/glimmerfall-tcg/solar_flare.webp', { folder: 'glimmerfall/card_renders', public_id: 'solar_flare', overwrite: true });
  console.log("Uploaded solar flare:", r2.secure_url);
}
run();
