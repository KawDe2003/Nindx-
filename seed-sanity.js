
import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Mocking __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---
// You need to create a Write Token in Sanity Manage (https://www.sanity.io/manage)
// and paste it here, or run with: SANITY_TOKEN=your_token node seed-sanity.js
const SANITY_TOKEN = process.env.SANITY_TOKEN;

if (!SANITY_TOKEN) {
  console.error('❌ Error: SANITY_TOKEN is missing.');
  console.log('Please get a Write Token from https://www.sanity.io/manage and run:');
  console.log('export SANITY_TOKEN=your_token; node seed-sanity.js (Linux/Mac)');
  console.log('$env:SANITY_TOKEN="your_token"; node seed-sanity.js (PowerShell)');
  process.exit(1);
}

const client = createClient({
  projectId: 'vms7m54z', // From your sanity.js
  dataset: 'production',
  apiVersion: '2024-03-01',
  token: SANITY_TOKEN,
  useCdn: false,
});

async function seed() {
  try {
    console.log('🚀 Starting Sanity Seeding...');
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'data.json'), 'utf8'));

    // 1. Upload Hot Deals
    console.log('📦 Uploading Hot Deals...');
    for (const car of data.hotDeals) {
      let imageAsset;
      
      // If it's a local image, upload it
      if (car.image.startsWith('/images/')) {
        const imagePath = path.join(__dirname, 'public', car.image);
        if (fs.existsSync(imagePath)) {
          console.log(`  🖼️  Uploading image for ${car.name}...`);
          imageAsset = await client.assets.upload('image', fs.createReadStream(imagePath));
        }
      }

      await client.create({
        _type: 'car',
        make: car.name.split(' ')[1] || car.name, // Simple split
        model: car.trim,
        year: parseInt(car.name.split(' ')[0]) || 2024,
        price: car.price,
        featured: car.featured,
        image: imageAsset ? {
          _type: 'image',
          asset: { _type: 'reference', _ref: imageAsset._id }
        } : undefined
      });
      console.log(`  ✅ Created ${car.name}`);
    }

    console.log('\n✨ Seeding Complete!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
}

seed();
