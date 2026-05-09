
import { getAllUsersWithRoles } from './userRoleService.ts';

async function listAllUsers() {
    console.log('Fetching all users and their roles...');
    try {
        const result = await getAllUsersWithRoles();
        if (result.success) {
            console.log('\nUsers found in database:');
            console.log('------------------------');
            result.data.forEach((user: any) => {
                console.log(`Email: ${user.email}`);
                console.log(`Name: ${user.displayName || 'N/A'}`);
                console.log(`Role: ${user.role}`);
                console.log(`UID: ${user.id}`);
                console.log('------------------------');
            });
        } else {
            console.error('Failed to fetch users:', result.error);
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
    process.exit(0);
}

listAllUsers();
