import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate(); 
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/events/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error al obtener los eventos:', error);
      alert('Error al obtener los eventos. Verifica tu conexión y vuelve a intentarlo.');
    }
  };

  const handleCreateNewEvent = () => {
    navigate('/admin/event/create');
  };

  const handleEditEvent = (event) => {
    navigate(`/admin/event/edit/${event._id}`);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar este evento?');
    if (confirmed) {
      await axios.delete(`${API_URL}/api/events/${id}`);
      fetchEvents();
    }
  };

  // Navegar a la nueva página de ventas del evento
  const handleViewSales = (eventId) => {
    navigate(`/admin/event/${eventId}/sales`);
  };

  return (
    <Container>
      <h2 className="my-4 text-white">Lista de Eventos</h2>
      <Button 
        variant="outline-primary" 
        onClick={handleCreateNewEvent} 
        className="mb-3"
        style={{ color: '#3399ff', borderColor: '#3399ff' }}
      >
        Crear Nuevo Evento
      </Button>
      <Table striped bordered hover variant="dark" className="custom-rounded-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event._id}>
              <td><strong>{event.name}</strong></td>
              <td>
                <Button 
                  variant="outline-warning" 
                  onClick={() => handleEditEvent(event)} 
                  className="me-2"
                  size="sm"
                >
                  Editar
                </Button>
                <Button 
                  variant="outline-danger" 
                  onClick={() => handleDelete(event._id)}
                  className="me-2"
                  size="sm"
                >
                  Eliminar
                </Button>
                <Button 
                  variant="outline-info" 
                  onClick={() => handleViewSales(event._id)}
                  size="sm"
                >
                  Ver Ventas
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default EventList;
