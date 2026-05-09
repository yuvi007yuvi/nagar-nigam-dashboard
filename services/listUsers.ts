
import { db } from './services/firebaseConfig.js';
import { collection, getDocs } from 'firebase/firestore';

async function listUsers() {
    try {
        console.log('Fetching users from Firestore...');
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (userList.length === 0) {
            console.log('No users found in the database.');
        } else {
            console.log('Users found:');
            userList.forEach(user => {
                console.log(`- Email: ${user.email}, Name: ${user.displayName || 'N/A'}, UID: ${user.uid}`);
            });
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

listUsers();
