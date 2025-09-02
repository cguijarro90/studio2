// To run this script:
// 1. Make sure you have a service account key JSON file for your Firebase project.
// 2. Set the FIREBASE_SERVICE_ACCOUNT_KEY environment variable in your .env file to the content of that JSON file.
//    Example: FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", ...}'
// 3. Run `npm run db:seed` from your terminal.

import 'dotenv/config';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, GeoPoint } from 'firebase-admin/firestore';
import { BIOMASS_TYPES } from '../src/lib/types';

if (getApps().length === 0) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in .env file. Cannot seed database.');
  }

  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.GOOGLE_PROJECT_ID,
  });
}

const db = getFirestore();
const biomassCollection = db.collection('biomass_sources');

const locations = [
    { name: 'Planta de Biomasa de Huesca', type: 'pellets', quantity: 15000, lat: 42.1354, lng: -0.4087 },
    { name: 'Central Térmica de Soria', type: 'pellets', quantity: 25000, lat: 41.7636, lng: -2.4676 },
    { name: 'Cooperativa Agrícola de Soria', type: 'otros', quantity: 5000, lat: 41.6520, lng: -2.5960 },
    { name: 'Explotación Forestal de Burgos', type: 'carbon', quantity: 8000, lat: 42.3439, lng: -3.6999 },
    { name: 'Granja Porcina de Lérida', type: 'otros', quantity: 3500, lat: 41.6176, lng: 0.6200 },
    { name: 'Aserradero de La Rioja', type: 'pellets', quantity: 12000, lat: 42.4628, lng: -2.4450 },
    { name: 'Almazara de Jaén', type: 'otros', quantity: 6000, lat: 37.7796, lng: -3.7849 },
    { name: 'Industria Cárnica de Zamora', type: 'carbon', quantity: 2500, lat: 41.5035, lng: -5.7492 },
    { name: 'Planta de Tratamiento de Residuos de León', type: 'carbon', quantity: 18000, lat: 42.5987, lng: -5.5671 },
    { name: 'Viñedos de Valladolid', type: 'otros', quantity: 4000, lat: 41.6523, lng: -4.7245 },
    { name: 'Central de Biomasa de Ciudad Real', type: 'pellets', quantity: 30000, lat: 38.9863, lng: -3.9216 },
    { name: 'Cultivos Energéticos de Cuenca', type: 'pellets', quantity: 22000, lat: 40.0704, lng: -2.1374 },
    { name: 'Forestal del Pirineo Catalán', type: 'carbon', quantity: 9500, lat: 42.3683, lng: 1.8983 },
    { name: 'Residuos de Poda de Olivar en Córdoba', type: 'otros', quantity: 7500, lat: 37.8882, lng: -4.7794 },
    { name: 'Planta de Biogás de Salamanca', type: 'carbon', quantity: 11000, lat: 40.9701, lng: -5.6635 },
];

async function seedDatabase() {
  console.log('Starting to seed database...');
  const batch = db.batch();
  const count = 200;

  for (let i = 0; i < count; i++) {
    const baseLocation = locations[i % locations.length];

    // Add some random offset to the location
    const lat = baseLocation.lat + (Math.random() - 0.5) * 0.1;
    const lng = baseLocation.lng + (Math.random() - 0.5) * 0.1;

    // Create a more descriptive name
    const name = `${baseLocation.name} - Punto ${Math.floor(i / locations.length) + 1}`;
    
    // Vary quantity slightly
    const quantity = baseLocation.quantity * (0.8 + Math.random() * 0.4);

    const newDocRef = biomassCollection.doc();
    batch.set(newDocRef, {
      name: name,
      type: baseLocation.type,
      quantity: Math.floor(quantity),
      location: new GeoPoint(lat, lng),
    });
  }

  try {
    await batch.commit();
    console.log(`Successfully seeded ${count} documents into Firestore.`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Check if collection is empty before seeding
biomassCollection.limit(1).get().then(snapshot => {
    if (snapshot.empty) {
        seedDatabase();
    } else {
        console.log('Database already contains data. Deleting old data before seeding...');
        // Delete all documents in the collection
        const deleteBatch = db.batch();
        biomassCollection.listDocuments().then(documents => {
            documents.forEach(doc => deleteBatch.delete(doc));
            deleteBatch.commit().then(() => {
                console.log('Old data deleted. Starting new seed...');
                seedDatabase();
            }).catch(error => {
                console.error("Error deleting old data:", error);
            });
        });
    }
}).catch(error => {
    console.error("Could not check collection:", error);
});
