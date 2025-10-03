// frontend/src/utils/mockDatabase.js

// This key will be used to store our user list in the browser's localStorage.
const DB_KEY = 'spaceex_user_database';

/**
 * Initializes the mock database in localStorage.
 * If no database exists, it creates one with a default admin user.
 * This ensures our app always has a main admin to approve others.
 */
export const initializeDB = () => {
  // Check if the database already exists in localStorage.
  const existingDB = localStorage.getItem(DB_KEY);

  // If it doesn't exist, we create it.
  if (!existingDB) {
    // This is our "seed" data. The first admin account.
    // In the initializeDB function, update the passwords:
const defaultUsers = [
  {
    id: 1,
    email: 'admin@spaceex.org',
    password: 'Admin123!', // Now meets requirements
    role: 'admin',
    status: 'approved',
    name: 'System Administrator',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    email: 'scientist@spaceex.org',
    password: 'Science123!', // Now meets requirements
    role: 'scientist',
    status: 'approved',
    name: 'Research Scientist',
    createdAt: new Date().toISOString()
  }
];
    // We convert the array of users into a JSON string to store it.
    localStorage.setItem(DB_KEY, JSON.stringify(defaultUsers));
  }
};

/**
 * Fetches all users from the mock database.
 * @returns {Array} An array of all user objects.
 */
export const getAllUsers = () => {
  // Get the JSON string from localStorage.
  const dbString = localStorage.getItem(DB_KEY);
  // Parse the JSON string back into a JavaScript array. If it's empty, return an empty array.
  return dbString ? JSON.parse(dbString) : [];
};

/**
 * Saves the entire user list back into the database.
 * This is used after we add, remove, or update a user.
 * @param {Array} users - The updated array of user objects.
 */
export const saveUsers = (users) => {
  // Convert the updated array back to a JSON string.
  const dbString = JSON.stringify(users);
  // Store the updated string in localStorage, overwriting the old one.
  localStorage.setItem(DB_KEY, dbString);
};

/**
 * Finds a user by email
 * @param {string} email - The email to search for
 * @returns {object|null} The user object or null if not found
 */
export const findUserByEmail = (email) => {
  const users = getAllUsers();
  return users.find(user => user.email === email) || null;
};

/**
 * Generates a new unique ID for users
 * @returns {number} The next available ID
 */
export const generateId = () => {
  const users = getAllUsers();
  return users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
};