const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes required for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Source icon path
const sourceIcon = path.join(__dirname, 'public/icons/WhatsApp Image 2025-08-03 at 19.35.51.jpeg');
const outputDir = path.join(__dirname, 'public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('🔄 Generating PWA icons...');
  
  try {
    for (const size of iconSizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 30, g: 58, b: 138, alpha: 1 } // Blupension blue background
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated icon-${size}x${size}.png`);
    }
    
    console.log('🎉 All PWA icons generated successfully!');
    console.log('📱 Your app is now ready for mobile installation');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

// Run the icon generation
generateIcons(); 