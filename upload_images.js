const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: 'dfyh7cs1g',
  api_key: '734447488263944',
  api_secret: 'fQgKFWGt0aw8kl8WgBN2z14RX-c'
});

const uploadDir = path.join(__dirname, 'glimmerfall-client/public/card_renders');

async function uploadImages() {
  const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
  console.log(`Found ${files.length} images to upload.`);

  for (const file of files) {
    const filePath = path.join(uploadDir, file);
    const publicId = file.replace('.png', '').replace('.jpg', '');
    
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'glimmerfall/card_renders',
        public_id: publicId,
        overwrite: true,
      });
      console.log(`Uploaded ${file} -> ${result.secure_url}`);
    } catch (err) {
      console.error(`Failed to upload ${file}:`, err);
    }
  }
  
  console.log('Finished uploading images.');
}

uploadImages();
