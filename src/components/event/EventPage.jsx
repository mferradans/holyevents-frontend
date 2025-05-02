import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import TransactionForm from './TransactionForm';
import { Wallet, initMercadoPago } from '@mercadopago/sdk-react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Button } from 'react-bootstrap';

const EventPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [preferenceId, setPreferenceId] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/events/${id}`);
        setEvent(response.data);

        const publicKeyResponse = await axios.get(`${API_URL}/api/auth/${response.data.createdBy}/public_key`);
        const publicKey = publicKeyResponse.data.publicKey;

        initMercadoPago(publicKey, { locale: 'es-AR' });
      } catch (error) {
        console.error('Error al obtener el evento:', error);
      }
    };

    fetchEvent();
  }, [id]);

  const handleFormSubmit = async (formData) => {

    const id = await createPreference(event, formData);
    if (id) {
      setPreferenceId(id);
    }
  };

  const createPreference = async (event, formData) => {
    try {
      const response = await axios.post(`${API_URL}/create_preference`, {
        eventId: event._id,
        price: event.price,
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        tel: formData.tel,
        selectedMenus: formData.selectedMenus, 
      });
      return response.data.id;
    } catch (error) {
      console.error('Error al crear preferencia de pago:', error);
    }
  };
  
  if (!event) return <div>Cargando...</div>;

  return (
    <Container className="text-white">
      <Row className="mt-5">
        {/* Columna izquierda: Detalles del evento */}
        <Col md={6} style={{ textAlign: 'left' }}>
        <img
  src={event.coverImage ? event.coverImage : `${API_URL}/uploads/notfound.png`}
  alt={event.name}
  style={{ width: '100%', maxWidth: '400px', borderRadius: '15px', objectFit: 'cover' }}
/>

          <h1>{event.name}</h1>
          <p><strong>Descripción:</strong> {event.description}</p>
          <p><strong>Ubicación:</strong> {event.location}</p>
          <p><strong>Fecha de Inicio:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
          <p><strong>Fecha Fin de Compra:</strong> {new Date(event.endPurchaseDate).toLocaleDateString()}</p>
          <p><strong>Capacidad:</strong> {event.capacity} personas</p>
          <p><strong>Precio:</strong> ${event.price}</p>

          {event.hasMenu && event.menuMoments.length > 0 && (
  <p>
    <strong>Incluye {event.menuMoments.length} menú{event.menuMoments.length > 1 ? 's' : ''}</strong>{' '}
    ({event.menuMoments.map((moment, i) =>
      new Date(moment.dateTime).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    ).join(', ')})
  </p>
)}

        </Col>

        {/* Columna derecha: Formulario de compra */}
        <Col md={6}>
        <TransactionForm event={event} onSubmit={handleFormSubmit} preferenceId={preferenceId} />

        </Col>
      </Row>
    </Container>
  );
};

export default EventPage;
