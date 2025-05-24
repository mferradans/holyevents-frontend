import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance.js';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Container, Button, Form, Card, Spinner } from 'react-bootstrap';
import { DateTime } from 'luxon';

const EventSales = () => {
  const { eventId } = useParams();
  const [sales, setSales] = useState([]);
  const [eventName, setEventName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [highlightId, setHighlightId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightParam = urlParams.get('highlight');
    if (highlightParam) {
      setHighlightId(highlightParam);
    }
  }, []);

  useEffect(() => {
    if (eventId) {
      fetchSales();
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [eventId, highlightId]);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/events/${eventId}/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let ventas = response.data.sales;

      if (highlightId) {
        const index = ventas.findIndex(v => v._id === highlightId);
        if (index > -1) {
          const [highlighted] = ventas.splice(index, 1);
          ventas.unshift(highlighted);
          setSearchTerm(`${highlighted.name} ${highlighted.lastName}`);
        }
      }

      setSales(ventas);
      setEventName(response.data.eventName);
    } catch (error) {
      console.error('Error al obtener las ventas del evento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredSales = sales.filter(sale => {
    const fullName = `${sale.name} ${sale.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase().trim());
  });

  const formatDateTime = (iso) => {
    return DateTime.fromISO(iso, { zone: 'utc' })
      .setZone('America/Argentina/Buenos_Aires')
      .setLocale('es')
      .toFormat('cccc dd-MM, HH:mm');
  };

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
      <Button 
        variant="info" 
        className="mb-3 mx-2"
        onClick={() => navigate(`/admin/events/${eventId}/menu-summary`)}
      >
        Ver Resumen de Menús
      </Button>

      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Buscar por nombre o apellido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <Spinner animation="border" variant="light" />
        </div>
      ) : !isMobile ? (
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Fecha de Compra</th>
              <th>Menús</th>
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
                  <td>{formatDateTime(sale.transactionDate)}</td>
                  <td>
                    {sale.selectedMenus && Object.keys(sale.selectedMenus).length > 0 ? (
                      <>
                        <Button 
                          variant="outline-info" 
                          size="sm" 
                          onClick={() => toggleRow(sale._id)}
                        >
                          {expandedRows[sale._id] ? 'Ocultar' : 'Ver Menús'}
                        </Button>
                        {expandedRows[sale._id] && (
                          <ul className="mt-2">
                            {Object.entries(sale.selectedMenus).map(([moment, menu]) => {
                              const fixedMoment = moment.replace('_t', 'T').replace('_z', 'Z');
                              return (
                                <li key={moment}>
                                  {`${formatDateTime(fixedMoment)}: ${menu}`}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </>
                    ) : (
<span className="text-white">Sin menú</span>
                    )}
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
      ) : (
        <>
          {filteredSales.length > 0 ? (
            filteredSales.map((sale) => (
              <Card key={sale._id} className="mb-3 bg-dark text-white">
                <Card.Body>
                  <Card.Title>{sale.name} {sale.lastName}</Card.Title>
                  <Card.Text>
                    <strong>Email:</strong> {sale.email}<br />
                    <strong>Teléfono:</strong> {sale.tel || "No proporcionado"}<br />
                    <strong>Fecha de Compra:</strong> {formatDateTime(sale.transactionDate)}<br />
                    <strong>Tipo:</strong> {sale.metadataType === 'manual' ? 'Transferencia/Efectivo' : 'Mercado Pago'}
                  </Card.Text>
                  {sale.selectedMenus && Object.keys(sale.selectedMenus).length > 0 ? (
                    <>
                      <Button 
                        variant="outline-info" 
                        size="sm"
                        onClick={() => toggleRow(sale._id)}
                      >
                        {expandedRows[sale._id] ? 'Ocultar Menús' : 'Ver Menús'}
                      </Button>
                      {expandedRows[sale._id] && (
                        <ul className="mt-2">
                          {Object.entries(sale.selectedMenus).map(([moment, menu]) => {
                            const fixedMoment = moment.replace('_t', 'T').replace('_z', 'Z');
                            return (
                              <li key={moment}>
                                {`${formatDateTime(fixedMoment)}: ${menu}`}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
<p className="text-white mt-2">Sin menú</p>
                  )}
                </Card.Body>
              </Card>
            ))
          ) : (
            <p className="text-white text-center">No hay ventas registradas para este evento.</p>
          )}
        </>
      )}
    </Container>
  );
};

export default EventSales;
