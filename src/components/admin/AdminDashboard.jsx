import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance.js';
import { useNavigate } from 'react-router-dom';
import EventList from './EventList';
import { Container, Row, Col, Button } from 'react-bootstrap';

const AdminDashboard = () => {
  const [adminEmail, setAdminEmail] = useState('');
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    } else {
      axios
        .get(`${API_URL}/api/auth/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if (response.data && response.data.email) {
            setAdminEmail(response.data.email);
          } else {
            setAdminEmail('');
          }
        })
        .catch((error) => {
          localStorage.removeItem('token');
          navigate('/admin/login');
        });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleGoToStatistics = () => {
    navigate('/admin/statistics');
  };

  return (
    <Container className="mt-4 text-white">
      <Row>
        <Col>
          <h1>Dashboard de Administrador</h1>
          {adminEmail && <p><strong>{adminEmail}</strong></p>}
          <EventList />
          <div className="mt-3 d-flex flex-column flex-md-row gap-2">
            <Button 
              variant="outline-primary" 
              onClick={handleGoToStatistics}
              className="w-100 w-md-auto"
              style={{ color: '#3399ff', borderColor: '#3399ff' }}
            >
              Ver Estadísticas
            </Button>
            <Button 
              variant="outline-danger" 
              onClick={handleLogout}
              className="w-100 w-md-auto"
              style={{ color: '#ff4d4d', borderColor: '#ff4d4d' }}
            >
              Cerrar Sesión
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
