import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Table, Button } from 'react-bootstrap';

const EventMenuSummary = () => {
  const { eventId } = useParams();
  const [sales, setSales] = useState([]);
  const [eventName, setEventName] = useState('');
  const [menuCounts, setMenuCounts] = useState({});
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

      // Procesar conteo de menús
      const counts = {};
      response.data.sales.forEach((sale) => {
        const selected = sale.selectedMenus || {};
        Object.values(selected).forEach(menu => {
          if (menu) {
            counts[menu] = (counts[menu] || 0) + 1;
          }
        });
      });

      setMenuCounts(counts);
    } catch (error) {
      console.error('Error al obtener las ventas del evento:', error);
    }
  };

  return (
    <Container>
      <h2 className="my-4 text-white">Resumen de Menús del Evento: {eventName}</h2>

      <Button 
        variant="outline-light" 
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        Volver a Ventas
      </Button>

      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>Menú</th>
            <th>Cantidad Vendida</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(menuCounts).map(([menu, count]) => (
            <tr key={menu}>
              <td>{menu}</td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default EventMenuSummary;
