import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setCredentials({ 
      ...credentials, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/data/auth/login', credentials);
      setMessage('Login successful!');
      localStorage.setItem('token', response.data.token);
      console.log('Logged in user:', response.data.user);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
      {message && <p className="text-center text-green-600 mb-4">{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={credentials.email}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
      <p className="text-center mt-4">
        New user? <Link to="/register" className="text-blue-500 hover:underline">Register here</Link>
      </p>
    </div>
  );
};

export default LoginForm;