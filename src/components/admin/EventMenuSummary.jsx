import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance.js';
import { Container, Table, Button, Row, Col } from 'react-bootstrap';
import { DateTime } from 'luxon';

const EventMenuSummary = () => {
  const { eventId } = useParams();
  const [sales, setSales] = useState([]);
  const [eventName, setEventName] = useState('');
  const [menuCounts, setMenuCounts] = useState({});
  const [menuByMoment, setMenuByMoment] = useState({});
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

      const ventas = response.data.sales;
      setSales(ventas);
      setEventName(response.data.eventName);

      const globalCounts = {};
      const groupedByMoment = {};

      ventas.forEach((sale) => {
        const selected = sale.selectedMenus || {};
        Object.entries(selected).forEach(([momentKey, menu]) => {
          if (!menu) return;

          globalCounts[menu] = (globalCounts[menu] || 0) + 1;

          if (!groupedByMoment[momentKey]) groupedByMoment[momentKey] = {};
          groupedByMoment[momentKey][menu] = (groupedByMoment[momentKey][menu] || 0) + 1;
        });
      });

      setMenuCounts(globalCounts);
      setMenuByMoment(groupedByMoment);
    } catch (error) {
      console.error('Error al obtener las ventas del evento:', error);
    }
  };

  const formatMoment = (isoString) =>
    DateTime.fromISO(isoString.replace('_t', 'T').replace('_z', 'Z'), { zone: 'utc' })
      .setZone('America/Argentina/Buenos_Aires')
      .setLocale('es')
      .toFormat('cccc dd-MM, HH:mm');

  const totalMenus = Object.values(menuCounts).reduce((acc, val) => acc + val, 0);

  return (
    <Container className="text-white">
      <h2 className="my-4">Resumen de Menús del Evento: {eventName}</h2>

      <Button
        variant="outline-light"
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        Volver a Ventas
      </Button>

      <p><strong>Total de menús vendidos:</strong> {totalMenus}</p>

      {/* Tabla global */}
      <h4 className="mt-4">Totales por Menú</h4>
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>Menú</th>
            <th>Cantidad Vendida</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(menuCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([menu, count]) => (
              <tr key={menu}>
                <td>{menu}</td>
                <td>{count}</td>
              </tr>
            ))}
        </tbody>
      </Table>

      {/* Tablas por momento en grilla de 2 columnas en escritorio */}
      <h4 className="mt-5">Detalle por Momento de Comida</h4>
      <Row className="g-4">
        {Object.entries(menuByMoment)
          .sort(([a], [b]) =>
            new Date(a.replace('_t', 'T').replace('_z', 'Z')) -
            new Date(b.replace('_t', 'T').replace('_z', 'Z'))
          )
          .map(([moment, menus]) => (
            <Col xs={12} md={6} key={moment}>
              <h5 className="text-white">{formatMoment(moment)}</h5>
              <Table striped bordered hover variant="dark">
                <thead>
                  <tr>
                    <th>Menú</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(menus)
                    .sort((a, b) => b[1] - a[1])
                    .map(([menu, count]) => (
                      <tr key={menu}>
                        <td>{menu}</td>
                        <td>{count}</td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </Col>
          ))}
      </Row>
    </Container>
  );
};

export default EventMenuSummary;
