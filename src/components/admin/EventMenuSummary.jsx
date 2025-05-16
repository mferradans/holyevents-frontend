import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance.js';
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

  // Total de menús vendidos
  const totalMenus = Object.values(menuCounts).reduce((acc, val) => acc + val, 0);

  // Menú más vendido
  const topMenu = Object.entries(menuCounts)
    .sort((a, b) => b[1] - a[1])[0];

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

      {/* Total de menús vendidos */}
      <p className="text-white">
        <strong>Total de menús vendidos:</strong> {totalMenus}
      </p>

      {/* Menú más elegido */}
      {topMenu && (
        <p className="text-white">
          <strong>Menú más elegido:</strong> {topMenu[0]} ({topMenu[1]} ventas)
        </p>
      )}

      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>Menú</th>
            <th>Cantidad Vendida</th>
            <th>% del total</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(menuCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([menu, count]) => (
              <tr key={menu}>
                <td>{menu}</td>
                <td>{count}</td>
                <td>{((count / totalMenus) * 100).toFixed(1)}%</td>
              </tr>
            ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default EventMenuSummary;
