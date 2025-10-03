// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAllUsers, saveUsers, generateId } from '../utils/mockDatabase';

// Create the context object
const AuthContext = createContext(null);

// This is the provider component that will wrap our entire application
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('spaceex_user_session');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Handles the user signup process.
   */
  const signup = (userData) => {
    const users = getAllUsers();
    
    // Check if user already exists
    const userExists = users.find(user => user.email === userData.email);
    if (userExists) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    // Determine approval status based on role
    const status = userData.role === 'user' ? 'approved' : 'pending';

    // Create new user
    const newUser = {
      id: generateId(),
      email: userData.email,
      password: userData.password,
      role: userData.role,
      status: status,
      name: userData.name || userData.email.split('@')[0],
      createdAt: new Date().toISOString()
    };

    // Save to database
    users.push(newUser);
    saveUsers(users);

    return { 
      success: true, 
      message: status === 'approved' 
        ? 'Signup successful! You can now log in.' 
        : 'Signup successful! Your account is pending admin approval.' 
    };
  };

  /**
   * Handles the user login process.
   */
  const login = (email, password) => {
    const users = getAllUsers();
    const foundUser = users.find(user => user.email === email);

    if (!foundUser || foundUser.password !== password) {
      return { success: false, message: 'Invalid email or password.' };
    }

    // Check if account is approved
    if (foundUser.status === 'pending') {
      return { success: false, message: 'Your account is still pending approval.' };
    }

    // Login successful
    const userSession = { ...foundUser };
    delete userSession.password; // Don't store password in session

    setCurrentUser(userSession);
    localStorage.setItem('spaceex_user_session', JSON.stringify(userSession));

    return { 
      success: true, 
      message: 'Login successful!', 
      user: userSession 
    };
  };

  /**
   * Handles user logout
   */
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('spaceex_user_session');
  };

  /**
   * Approve a pending user (admin only)
   */
  const approveUser = (userId) => {
    const users = getAllUsers();
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, status: 'approved' } : user
    );
    saveUsers(updatedUsers);
    return updatedUsers;
  };

  /**
   * Reject/delete a pending user (admin only)
   */
  const rejectUser = (userId) => {
    const users = getAllUsers();
    const updatedUsers = users.filter(user => user.id !== userId);
    saveUsers(updatedUsers);
    return updatedUsers;
  };

  /**
   * Get all users (admin only)
   */
  const getAllUsersFromDB = () => {
    return getAllUsers();
  };

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    approveUser,
    rejectUser,
    getAllUsers: getAllUsersFromDB
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};