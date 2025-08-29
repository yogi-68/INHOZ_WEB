import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SignupForm = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle signup logic here
    console.log('Signup submitted', { email, password, confirmPassword });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="form-container"
    >
      <h2 className="form-title">Create your account</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          className="form-input"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-input"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="form-button">
          Sign up
        </button>
      </form>
      <div className="form-switch">
        <button onClick={onSwitchToLogin} className="form-switch-link">
          Already have an account? Sign in
        </button>
      </div>
    </motion.div>
  );
};

export default SignupForm;
