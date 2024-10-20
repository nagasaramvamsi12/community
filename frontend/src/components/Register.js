import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      setMessage('Registration successful! Please login.');
      navigate('/login');  // Redirect to login page after success
    } else {
      const data = await response.json();
      setMessage(data.msg || 'Registration failed. Try again.');  // Show the backend error message
    }
  };

  // Navigate to the login page when the "Go to Login" button is clicked
  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="container">
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      {message && <p className="message">{message}</p>}
      
      {/* Button to go to login page */}
      <div className="link">
        <button onClick={handleGoToLogin}>Go to Login</button>
      </div>
    </div>
  );
}

export default Register;
