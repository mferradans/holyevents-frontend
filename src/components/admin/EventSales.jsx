import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Container, Button, Form } from 'react-bootstrap';

const EventSales = () => {
  const { eventId } = useParams();
  const [sales, setSales] = useState([]);
  const [eventName, setEventName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchSales();
  }, [eventId]);

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/events/${eventId}/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSales(response.data.sales);
      setEventName(response.data.eventName);
    } catch (error) {
      console.error('Error al obtener las ventas del evento:', error);
    }
  };

  // Filtrado en tiempo real por nombre o apellido
  const filteredSales = sales.filter(sale => {
    const fullName = `${sale.name} ${sale.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase().trim());
  });

  return (
    <Container>
      <h2 className="my-4 text-white">Ventas del Evento: {eventName}</h2>

      {/* Botón para volver al Dashboard */}
      <Button 
        variant="outline-light" 
        className="mb-3"
        onClick={() => navigate('/admin/dashboard')}
      >
        Volver al Dashboard
      </Button>

      {/* Buscador en tiempo real */}
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Buscar por nombre o apellido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      {/* Tabla de ventas */}
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Fecha de Compra</th>
            <th>Menús Seleccionados</th>
          </tr>
        </thead>
        <tbody>
          {filteredSales.length > 0 ? (
            filteredSales.map((sale) => (
              <tr key={sale._id}>
                <td>{sale.name}</td>
                <td>{sale.lastName}</td>
                <td>{sale.email}</td>
                <td>{sale.tel || "No proporcionado"}</td>
                <td>{new Date(sale.transactionDate).toLocaleDateString('es-AR')}</td>
                <td>
                  <ul>
                    {Object.entries(sale.selectedMenus || {}).map(([moment, menu]) => (
                      <li key={moment}>
                        {new Date(moment).toLocaleString()}: {menu}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">No hay ventas registradas para este evento.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default EventSales;
