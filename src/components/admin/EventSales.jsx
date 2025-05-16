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

  const filteredSales = sales.filter(sale => {
    const fullName = `${sale.name} ${sale.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase().trim());
  });
// Crear un acumulador de menús
const menuCounts = {};

sales.forEach(sale => {
  const selected = sale.selectedMenus || {};
  Object.values(selected).forEach(menu => {
    if (menu) {
      menuCounts[menu] = (menuCounts[menu] || 0) + 1;
    }
  });
});

  return (
    <Container>
      <h2 className="my-4 text-white">Ventas del Evento: {eventName}</h2>

      <Button 
        variant="outline-light" 
        className="mb-3"
        onClick={() => navigate('/admin/dashboard')}
      >
        Volver al Dashboard
      </Button>
      <Button 
        variant="success" 
        className="mb-3 mx-2"
        onClick={() => navigate(`/admin/events/${eventId}/add-manual-sale`)}
      >
        Añadir Venta Manual
      </Button>

      <h4 className="text-white mt-4">Resumen de Menús Vendidos</h4>
<Table striped bordered hover variant="dark">
  <thead>
    <tr>
      <th>Menú</th>
      <th>Cantidad Vendida</th>
    </tr>
  </thead>
  <tbody>
    {Object.entries(menuCounts).map(([menuName, count]) => (
      <tr key={menuName}>
        <td>{menuName}</td>
        <td>{count}</td>
      </tr>
    ))}
  </tbody>
</Table>



      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Buscar por nombre o apellido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Fecha de Compra</th>
            <th>Menús Seleccionados</th>
            <th>Tipo</th>
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
                    {Object.entries(sale.selectedMenus || {}).map(([moment, menu]) => {
                      const fixedMoment = moment.replace('_t', 'T').replace('_z', 'Z');
                      const date = new Date(fixedMoment);
                      return (
                        <li key={moment}>
                          {isNaN(date) ? 'Fecha inválida' : `${date.toLocaleString('es-AR')}: ${menu}`}
                        </li>
                      );
                    })}
                  </ul>
                </td>
                <td>{sale.metadataType === 'manual' ? 'Transferencia/Efectivo' : 'Mercado Pago'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">No hay ventas registradas para este evento.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default EventSales;
