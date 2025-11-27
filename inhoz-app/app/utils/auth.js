// Mock user data - in a real app, this would come from an API/backend
const VALID_USERS = [
  { email: 'doctor@inhoz.com', password: 'password123' },
  { email: 'nurse@inhoz.com', password: 'password123' },
];

export const validateUser = (email, password) => {
  const user = VALID_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  return user;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Default export combining all auth utilities
export default {
  validateUser,
  validateEmail,
}; 