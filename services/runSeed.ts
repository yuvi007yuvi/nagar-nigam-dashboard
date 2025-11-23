import { seedDatabase } from './seedData.js';

// Run the seed function
seedDatabase().then(() => {
  console.log('Seeding completed');
}).catch((error) => {
  console.error('Seeding failed:', error);
});