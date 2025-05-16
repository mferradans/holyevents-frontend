import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import TransactionForm from './TransactionForm';
import { Wallet, initMercadoPago } from '@mercadopago/sdk-react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';

const EventPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [preferenceId, setPreferenceId] = useState(null);
  const [formData, setFormData] = useState(null);
  const [showWallet, setShowWallet] = useState(false);
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
      setShowWallet(true);
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

  if (!event) return <div className="text-white">Cargando...</div>;

  return (
    <Container className="text-white mt-5">
      <Row className="gx-5 align-items-start flex-column flex-md-row">
        {/* Columna izquierda: imagen y datos */}
        <Col md={6} className="mb-4">
          <img
            src={event.coverImage ? event.coverImage : `${API_URL}/uploads/notfound.png`}
            alt={event.name}
            className="w-100 mb-3"
            style={{
              borderRadius: '15px',
              objectFit: 'cover',
              maxHeight: '300px',
            }}
          />

          <h1 className="mb-3">{event.name}</h1>

          <Card className="bg-dark text-white mb-3">
            <Card.Body>
              <p><strong>Descripción:</strong> {event.description}</p>
              <p><strong>Ubicación:</strong> {event.location}</p>
              <p><strong>Fecha de Inicio:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
              <p><strong>Fecha Fin de Compra:</strong> {new Date(event.endPurchaseDate).toLocaleDateString()}</p>
              <p><strong>Capacidad:</strong> {event.capacity} personas</p>
              <p><strong>Precio:</strong> ${event.price}</p>

              {event.hasMenu && event.menuMoments.length > 0 && (
                <p>
                  <strong>Incluye {event.menuMoments.length} menú{event.menuMoments.length > 1 ? 's' : ''}</strong>{' '}
                  ({event.menuMoments.map((moment) =>
                    new Date(moment.dateTime).toLocaleString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  ).join(', ')})
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Columna derecha: formulario */}
        <Col md={6}>
          <Card className="bg-dark text-white p-4">
            <TransactionForm
              event={event}
              onSubmit={handleFormSubmit}
              formDataExternal={setFormData}
              showWallet={showWallet}
              preferenceId={preferenceId}
              setShowWallet={setShowWallet}
            />
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EventPage;
