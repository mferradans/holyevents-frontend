import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import TransactionForm from './TransactionForm';
import { Wallet, initMercadoPago } from '@mercadopago/sdk-react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { DateTime } from 'luxon';

const EventPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [preferenceId, setPreferenceId] = useState(null);
  const [coords, setCoords] = useState(null);
  const [loadingMap, setLoadingMap] = useState(true); // Nuevo: estado de carga del mapa
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL;
  const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/events/${id}`);
        setEvent(response.data);

        const publicKeyResponse = await axios.get(`${API_URL}/api/auth/${response.data.createdBy}/public_key`);
        const publicKey = publicKeyResponse.data.publicKey;

        initMercadoPago(publicKey, { locale: 'es-AR' });

        if (response.data.location) {
          try {
            const locationEncoded = encodeURIComponent(response.data.location);
            const geoRes = await axios.get(
              `https://api.geoapify.com/v1/geocode/search?text=${locationEncoded}&format=json&apiKey=${GEOAPIFY_API_KEY}`
            );
            if (geoRes.data && geoRes.data.results && geoRes.data.results.length > 0) {
              const { lat, lon } = geoRes.data.results[0];
              setCoords({ lat, lon });
            }
          } catch (geoErr) {
            console.error('Error al obtener coordenadas:', geoErr);
          } finally {
            setLoadingMap(false);
          }
        } else {
          setLoadingMap(false);
        }

      } catch (error) {
        console.error('Error al obtener el evento:', error);
        setLoadingMap(false);
      }
    };

    fetchEvent();
  }, [id]);

  const [formData, setFormData] = useState(null);

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

  const formatDate = (isoString) => {
    return DateTime.fromISO(isoString, { zone: 'utc' })
      .setZone('America/Argentina/Buenos_Aires')
      .setLocale('es')
      .toFormat('cccc dd-MM, HH:mm');
  };

  if (!event) return <div>Cargando...</div>;

  return (
    <Container className="text-white">
      <Row className="mt-5">
        <Col md={6} style={{ textAlign: 'left' }}>
          <img
            src={event.coverImage ? event.coverImage : `${API_URL}/uploads/notfound.png`}
            alt={event.name}
            style={{ width: '100%', maxWidth: '400px', borderRadius: '15px', objectFit: 'cover' }}
          />

          <h1 className="mt-3">{event.name}</h1>
          <p><strong>Descripción:</strong> {event.description}</p>
          <p><strong>Fecha de Inicio:</strong> {formatDate(event.startDate)}</p>
          <p><strong>Fecha Fin de Compra:</strong> {formatDate(event.endPurchaseDate)}</p>
          <p><strong>Precio:</strong> ${event.price}</p>

          <p><strong>Ubicación:</strong> {event.location}</p>

          {/* Botón para ver en Google Maps */}
          {coords && (
            <Button
              variant="outline-info"
              size="sm"
              className="mb-2"
              onClick={() => window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lon}`, '_blank')}
            >
              Ver en Google Maps
            </Button>
          )}

          {/* Spinner mientras carga el mapa */}
          {loadingMap && (
            <div className="mt-3 d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
              <Spinner animation="border" role="status" variant="light">
                <span className="visually-hidden">Cargando mapa...</span>
              </Spinner>
            </div>
          )}

          {/* Mapa Geoapify */}
          {!loadingMap && coords && (
            <div className="mt-2 mb-3" style={{ borderRadius: '10px', overflow: 'hidden' }}>
              <iframe
                title="Mapa del evento"
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '10px' }}
                src={`https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=300&center=lonlat:${coords.lon},${coords.lat}&zoom=15&marker=lonlat:${coords.lon},${coords.lat};color:%23ff0000;size:large&apiKey=${GEOAPIFY_API_KEY}`}
                loading="lazy"
              ></iframe>
            </div>
          )}

          <p><strong>Capacidad:</strong> {event.capacity} personas</p>

          {event.hasMenu && event.menuMoments.length > 0 && (
            <p>
              <strong>Incluye {event.menuMoments.length} menú{event.menuMoments.length > 1 ? 's' : ''}</strong> (
              {event.menuMoments.map((moment) => formatDate(moment.dateTime)).join(', ')} )
            </p>
          )}
        </Col>

        <Col md={6}>
          <TransactionForm event={event} onSubmit={handleFormSubmit} formDataExternal={setFormData} />
          <div style={{ marginTop: '20px' }}>
            {preferenceId && <Wallet initialization={{ preferenceId }} />}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default EventPage;
