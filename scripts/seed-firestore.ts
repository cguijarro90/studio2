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

const cities = [
  { name: 'Madrid', lat: 40.416775, lng: -3.703790 },
  { name: 'Barcelona', lat: 41.385063, lng: 2.173404 },
  { name: 'Valencia', lat: 39.469907, lng: -0.376288 },
  { name: 'Seville', lat: 37.389092, lng: -5.984459 },
  { name: 'Zaragoza', lat: 41.648823, lng: -0.889085 },
  { name: 'Málaga', lat: 36.721261, lng: -4.421266 },
  { name: 'Murcia', lat: 37.992240, lng: -1.130654 },
  { name: 'Palma', lat: 39.569600, lng: 2.650160 },
  { name: 'Las Palmas', lat: 28.124823, lng: -15.430006 },
  { name: 'Bilbao', lat: 43.263013, lng: -2.934989 },
];

const getRandomElement = <T>(arr: readonly T[] | T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomQuantity = () => Math.floor(Math.random() * 4000) + 100;

async function seedDatabase() {
  console.log('Starting to seed database...');
  const batch = db.batch();
  const count = 200;

  for (let i = 0; i < count; i++) {
    const city = getRandomElement(cities);
    // Add some random offset to the location
    const lat = city.lat + (Math.random() - 0.5) * 0.5;
    const lng = city.lng + (Math.random() - 0.5) * 0.5;

    const newDocRef = biomassCollection.doc();
    batch.set(newDocRef, {
      name: `Source ${i + 1} near ${city.name}`,
      type: getRandomElement(BIOMASS_TYPES),
      quantity: getRandomQuantity(),
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
        console.log('Database already contains data. Skipping seed.');
    }
}).catch(error => {
    console.error("Could not check collection:", error);
});
