import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TransactionForm from './TransactionForm';
import { Wallet, initMercadoPago } from '@mercadopago/sdk-react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { DateTime } from 'luxon';
import linkifyHtml from 'linkify-html';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa'; // ✅ Íconos

const EventPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [preferenceId, setPreferenceId] = useState(null);
  const [coords, setCoords] = useState(null);
  const [loadingMap, setLoadingMap] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL;
  const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_KEY;
  const [adminPhone, setAdminPhone] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/events/${id}`);
        setEvent(response.data);

        const adminResponse = await axios.get(`${API_URL}/api/auth/${response.data.createdBy}/data`);
        const publicKey = adminResponse.data.publicKey;
        setAdminPhone(adminResponse.data.telefono || null);
        initMercadoPago(publicKey, { locale: 'es-AR' });
        
        if (response.data.location) {
          try {
            const locationEncoded = encodeURIComponent(response.data.location);
            const geoRes = await axios.get(
              `https://api.geoapify.com/v1/geocode/search?text=${locationEncoded}&format=json&apiKey=${GEOAPIFY_API_KEY}`
            );
            if (geoRes.data?.results?.length > 0) {
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

          <p><strong>Descripción:</strong></p>

<div className="mb-3">
  {(() => {
    const lines = event.description.split(/\r?\n/);

    return lines.map((line, index) => {
      if (line.includes('instagram.com')) {
        const match = line.match(/https?:\/\/(www\.)?instagram\.com[^\s]*/);
        return match ? (
          <div key={index}>
            <a href={match[0]} target="_blank" rel="noopener noreferrer" className="text-white">
              <FaInstagram style={{ fontSize: '1.5rem', marginRight: '8px' }} />
              Ver Instagram
            </a>
          </div>
        ) : null;
      }

      if (line.includes('wa.me') || line.includes('whatsapp.com')) {
        const match = line.match(/https?:\/\/(www\.)?(wa\.me|whatsapp\.com)[^\s]*/);
        return match ? (
          <div key={index}>
            <a href={match[0]} target="_blank" rel="noopener noreferrer" className="text-white">
              <FaWhatsapp style={{ fontSize: '1.5rem', marginRight: '8px' }} />
              Enviar WhatsApp
            </a>
          </div>
        ) : null;
      }

      // Enlaces normales o texto plano
      const html = linkifyHtml(line, {
        target: '_blank',
        rel: 'noopener noreferrer'
      });

      return <div key={index} dangerouslySetInnerHTML={{ __html: html }} />;
    });
  })()}
</div>


          <p><strong>Fecha de Inicio:</strong> {formatDate(event.startDate)}</p>
          <p><strong>Fecha Fin de Compra:</strong> {formatDate(event.endPurchaseDate)}</p>
          <p><strong>Precio:</strong> ${event.price}</p>
          <p><strong>Ubicación:</strong> {event.location}</p>

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

          {loadingMap && (
            <div className="mt-3 d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
              <Spinner animation="border" role="status" variant="light">
                <span className="visually-hidden">Cargando mapa...</span>
              </Spinner>
            </div>
          )}

          {!loadingMap && coords && (
            <div className="mt-2 mb-3" style={{ borderRadius: '10px', overflow: 'hidden' }}>
              <iframe
                title="Mapa del evento"
                width="100%"
                height="200" // ✅ altura reducida
                style={{ border: 0, borderRadius: '10px' }}
                src={`https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=200&center=lonlat:${coords.lon},${coords.lat}&zoom=15&marker=lonlat:${coords.lon},${coords.lat};color:%23ff0000;size:large&apiKey=${GEOAPIFY_API_KEY}`}
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
        <TransactionForm event={event} onSubmit={handleFormSubmit} formDataExternal={setFormData} adminPhone={adminPhone} />
          <div style={{ marginTop: '20px' }}>
            {preferenceId && <Wallet initialization={{ preferenceId }} />}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default EventPage;
