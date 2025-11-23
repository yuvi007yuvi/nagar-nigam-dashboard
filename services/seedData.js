import { createCustomer, createUserCharge, createFuelEntry, createWeighment, createBulkCollection, createCoverageRecord, createAttendanceRecord, createComplaint, createAdminData } from './databaseService.js';

// Sample data for initialization
export const seedDatabase = async () => {
    try {
        // In a real application, you would add actual data here
        // For now, we're removing all sample data to avoid mock data
        
        console.log("Database seeding completed successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
    }
};