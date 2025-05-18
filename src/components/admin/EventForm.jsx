import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance.js';
import { Form, Button, Row, Col, ListGroup, Image } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import './EventForm.css';
import FormData from 'form-data';
import { DateTime } from 'luxon';

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    price: '',
    startDate: '',
    endPurchaseDate: '',
    capacity: '',
    hasMenu: false,
    menuMoments: [],
    coverImage: '',
    imageRemoved: false,
  });

  const [newMenuMoment, setNewMenuMoment] = useState({ dateTime: '', menuOptions: '' });
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Para sugerencias de ubicación
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  const formatDateTime = (isoString) => {
    return DateTime.fromISO(isoString, { zone: 'utc' })
      .setZone('America/Argentina/Buenos_Aires')
      .setLocale('es')
      .toFormat('cccc dd-MM, HH:mm');
  };

  useEffect(() => {
    if (id) {
      const fetchEvent = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_URL}/api/events/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const eventData = response.data;

          const sortedMenuMoments = (eventData.menuMoments || []).sort((a, b) =>
            new Date(a.dateTime) - new Date(b.dateTime)
          );

          setFormData({
            name: eventData.name || '',
            location: eventData.location || '',
            description: eventData.description || '',
            price: eventData.price || '',
            startDate: eventData.startDate ? eventData.startDate.split('T')[0] : '',
            endPurchaseDate: eventData.endPurchaseDate ? eventData.endPurchaseDate.split('T')[0] : '',
            capacity: eventData.capacity || '',
            hasMenu: eventData.hasMenu || false,
            menuMoments: sortedMenuMoments,
            coverImage: eventData.coverImage || '',
            imageRemoved: false,
          });
        } catch (error) {
          console.error('Error al cargar los datos del evento:', error);
        }
      };

      fetchEvent();
    }
  }, [id, API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLocationChange = async (e) => {
    const value = e.target.value;
    setFormData({ ...formData, location: value });

    if (value.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&limit=5&countrycodes=ar`,
        {
          headers: {
            'User-Agent': 'mi-app-eventos/1.0',
            'Accept-Language': 'es',
          },
        }
      );
      const data = await response.json();
      setLocationSuggestions(data);
    } catch (error) {
      console.error('Error al buscar direcciones:', error);
    }
  };

  const handleSelectLocation = (suggestion) => {
    setFormData({ ...formData, location: suggestion.display_name });
    setLocationSuggestions([]);
  };

  const handleAddMenuMoment = () => {
    if (!newMenuMoment.dateTime || !newMenuMoment.menuOptions) return;

    const dateTimeUTC = DateTime
      .fromISO(newMenuMoment.dateTime, { zone: 'America/Argentina/Buenos_Aires' })
      .toUTC()
      .toISO();

    const updatedMoments = [...formData.menuMoments, {
      dateTime: dateTimeUTC,
      menuOptions: newMenuMoment.menuOptions.split(',').map(opt => opt.trim()),
    }];

    const sortedMoments = updatedMoments.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    setFormData({
      ...formData,
      menuMoments: sortedMoments,
    });

    setNewMenuMoment({ dateTime: '', menuOptions: '' });
  };

  const handleRemoveMenuMoment = (indexToRemove) => {
    const updatedMoments = formData.menuMoments.filter((_, index) => index !== indexToRemove);
    setFormData({ ...formData, menuMoments: updatedMoments });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 3 * 1024 * 1024;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Error: Solo se permiten imágenes en formato JPEG, JPG o PNG.");
      return;
    }

    if (file.size > maxSize) {
      alert("Error: La imagen es demasiado grande. El tamaño máximo permitido es de 3MB.");
      return;
    }

    const fileData = new FormData();
    fileData.append("coverImage", file);

    try {
      setIsImageUploading(true);
      const response = await axios.post(`${API_URL}/api/events/upload`, fileData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setFormData({ ...formData, coverImage: response.data.imageUrl, imageRemoved: false });
    } catch (error) {
      console.error("Error al cargar la imagen:", error);
      alert("Hubo un error al subir la imagen. Inténtalo nuevamente.");
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, coverImage: '', imageRemoved: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isImageUploading || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (id) {
        await axios.put(`${API_URL}/api/events/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/api/events/create`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={6}>
          <Form.Group controlId="formName">
            <Form.Label>Nombre del evento</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
          </Form.Group>
        </Col>
        <Col md={6} style={{ position: 'relative' }}>
          <Form.Group controlId="formLocation">
            <Form.Label>Ubicación</Form.Label>
            <Form.Control
              type="text"
              name="location"
              value={formData.location}
              onChange={handleLocationChange}
              autoComplete="off"
              required
            />
            {locationSuggestions.length > 0 && (
              <ListGroup style={{ position: 'absolute', zIndex: 1000, width: '100%' }}>
                {locationSuggestions.map((suggestion, index) => (
                  <ListGroup.Item key={index} action onClick={() => handleSelectLocation(suggestion)}>
                    {suggestion.display_name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Form.Group controlId="formDescription" className="mt-3">
        <Form.Label>Descripción</Form.Label>
        <Form.Control as="textarea" name="description" value={formData.description} onChange={handleChange} required />
      </Form.Group>

      <Form.Group controlId="formCoverImage" className="mt-3">
        <Form.Label>Imagen de portada</Form.Label>
        <Form.Control type="file" onChange={handleFileChange} accept="image/*" />
        {formData.coverImage && (
          <div className="mt-2">
            <Image
              src={formData.coverImage}
              alt="Vista previa"
              thumbnail
              style={{ maxWidth: '200px', height: 'auto' }}
            />
            <Button variant="danger" size="sm" className="mt-2" onClick={handleRemoveImage}>Eliminar imagen</Button>
          </div>
        )}
      </Form.Group>

      <Row className="mt-3">
        <Col md={6}>
          <Form.Group controlId="formPrice">
            <Form.Label>Precio</Form.Label>
            <Form.Control type="number" name="price" value={formData.price} onChange={handleChange} required />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="formCapacity">
            <Form.Label>Capacidad</Form.Label>
            <Form.Control type="number" name="capacity" value={formData.capacity} onChange={handleChange} required />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col md={6}>
          <Form.Group controlId="formStartDate">
            <Form.Label>Fecha de inicio</Form.Label>
            <Form.Control type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="formEndPurchaseDate">
            <Form.Label>Fecha finalización de compra</Form.Label>
            <Form.Control type="date" name="endPurchaseDate" value={formData.endPurchaseDate} onChange={handleChange} required />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group controlId="formHasMenu" className="mt-3 d-flex align-items-center">
        <Form.Check
          type="checkbox"
          label="¿Tiene menú de comida?"
          name="hasMenu"
          checked={formData.hasMenu}
          onChange={(e) => setFormData({ ...formData, hasMenu: e.target.checked })}
        />
      </Form.Group>

      {formData.hasMenu && (
        <>
          <h5 className="mt-3">Agregar Momentos de Comida</h5>
          <Row>
            <Col md={5}>
              <Form.Group controlId="menuDateTime">
                <Form.Label>Fecha y Hora</Form.Label>
                <Form.Control type="datetime-local" value={newMenuMoment.dateTime} onChange={(e) => setNewMenuMoment({ ...newMenuMoment, dateTime: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group controlId="menuOptions">
                <Form.Label>Menús (separados por coma)</Form.Label>
                <Form.Control type="text" value={newMenuMoment.menuOptions} onChange={(e) => setNewMenuMoment({ ...newMenuMoment, menuOptions: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button onClick={handleAddMenuMoment} className="mt-2">Agregar</Button>
            </Col>
          </Row>
          <ListGroup className="mt-3">
            {formData.menuMoments
              .slice()
              .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
              .map((moment, index) => {
                const localFormatted = DateTime.fromISO(moment.dateTime, { zone: 'utc' })
                  .setZone('America/Argentina/Buenos_Aires')
                  .setLocale('es')
                  .toFormat('cccc dd-MM, HH:mm');

                return (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{localFormatted}</strong> - {moment.menuOptions.join(', ')}
                    </div>
                    <Button variant="danger" size="sm" onClick={() => handleRemoveMenuMoment(index)}>Eliminar</Button>
                  </ListGroup.Item>
                );
              })}
          </ListGroup>
        </>
      )}

      <Button type="submit" className="mt-3" disabled={isImageUploading || isSubmitting}>
        {id ? 'Actualizar' : 'Crear'} Evento
      </Button>

      <Button variant="secondary" className="mt-3 ms-2" onClick={() => navigate('/admin/dashboard')}>
        Cancelar
      </Button>
    </Form>
  );
};

export default EventForm;
