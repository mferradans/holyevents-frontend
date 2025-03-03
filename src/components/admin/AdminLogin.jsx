import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Container, Row, Col, Alert } from 'react-bootstrap';
import './EventForm.css';  

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/admin/dashboard'); // Redirigir al dashboard
    } catch (error) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <div className="full-screen-container">
      <div className="login-box">
        <h2 className="text-center text-white">Iniciar Sesión</h2>
        <h5 className="text-center text-white">solo para administradores</h5>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formEmail">
            <Form.Label className="text-left text-white">Email:</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu email"
              className="bg-dark text-light custom-input" // Aplica la clase personalizada
              required
            />
          </Form.Group>
  
          <Form.Group controlId="formPassword" className="mt-3">
            <Form.Label className="text-white">Contraseña:</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className="bg-dark text-light custom-input" // Aplica la clase personalizada
              required
            />
          </Form.Group>
  
          <div className="d-flex mt-4 justify-content-between align-items-center">
            <Button variant="secondary" onClick={() => navigate('/')} className="flex-grow-1 me-3">
              Volver atrás
            </Button>
            <Button variant="primary" type="submit" className="flex-grow-1">
              Iniciar Sesión
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
  
  
};

export default AdminLogin;
