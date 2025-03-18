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
      const response = await axios.post('/api/data/auth/register', formData);
      setMessage('Registration successful!');
      localStorage.setItem('token', response.data.token);
      console.log('User registered:', response.data.user);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
      console.error('Error during registration:', error);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <br/>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <br/>
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <br/>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <br/>
        <select name="source" value={formData.source} onChange={handleChange}>
          <option value="web">Web</option>
          <option value="email">Email</option>
          <option value="social media">Social Media</option>
          <option value="referral">Referral</option>
        </select>
        <br/>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegistrationForm;