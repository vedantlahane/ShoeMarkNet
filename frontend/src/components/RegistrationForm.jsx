import React, { useState } from 'react';
import axios from 'axios';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    source: 'web'
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    const apiBaseUrl = import.meta.env.MODE === "production"
        ? import.meta.env.VITE_API_URL_PROD
        : import.meta.env.VITE_API_URL_DEV;
      
      const response = await axios.post(`${apiBaseUrl}/api/data/auth/register`, formData);
      setMessage('Registration successful!');
      localStorage.setItem('token', response.data.token);
      console.log('User registered:', response.data.user);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
      console.error('Error during registration:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Register</h2>
      {message && <p className="text-center text-green-600 mb-4">{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
        <select
          name="source"
          value={formData.source}
          onChange={handleChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        >
          <option value="web">Web</option>
          <option value="email">Email</option>
          <option value="social media">Social Media</option>
          <option value="referral">Referral</option>
        </select>
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;