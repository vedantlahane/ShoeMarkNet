import React, { useState } from 'react';
import axios from 'axios';

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
      const response = await axios.post('/api/data/auth/login', credentials);
      setMessage('Login successful!');
      localStorage.setItem('token', response.data.token);
      console.log('Logged in user:', response.data.user);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
      console.error('Error during login:', error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={credentials.email}
          onChange={handleChange}
          required
        />
        <br/>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          required
        />
        <br/>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;