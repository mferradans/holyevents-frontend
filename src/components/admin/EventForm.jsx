import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance.js';
import { Form, Button, Row, Col, ListGroup, Image } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import './EventForm.css';
import FormData from 'form-data';
import { DateTime } from 'luxon';

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

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

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [newMenuMoment, setNewMenuMoment] = useState({ dateTime: '', menuOptions: '' });
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleLocationChange = async (e) => {
    const value = e.target.value;
    setFormData({ ...formData, location: value });

    if (value.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(value)}&filter=countrycode:ar&lang=es&limit=5&apiKey=${GEOAPIFY_API_KEY}`
      );
      const data = await response.json();
      setLocationSuggestions(data.features);
    } catch (error) {
      console.error('Error al obtener sugerencias de ubicación:', error);
    }
  };

  const handleSelectLocation = (feature) => {
    setFormData({ ...formData, location: feature.properties.formatted });
    setLocationSuggestions([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddMenuMoment = () => {
    if (!newMenuMoment.dateTime || !newMenuMoment.menuOptions) return;

    const dateTimeUTC = DateTime.fromISO(newMenuMoment.dateTime, {
      zone: 'America/Argentina/Buenos_Aires',
    })
      .toUTC()
      .toISO();

    const updatedMoments = [
      ...formData.menuMoments,
      {
        dateTime: dateTimeUTC,
        menuOptions: newMenuMoment.menuOptions.split(',').map((opt) => opt.trim()),
      },
    ];

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
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Error: Solo se permiten imágenes en formato JPEG, JPG o PNG.');
      return;
    }

    if (file.size > maxSize) {
      alert('Error: La imagen es demasiado grande. El tamaño máximo permitido es de 3MB.');
      return;
    }

    const fileData = new FormData();
    fileData.append('coverImage', file);

    try {
      setIsImageUploading(true);
      const response = await axios.post(`${API_URL}/api/events/upload`, fileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFormData({ ...formData, coverImage: response.data.imageUrl, imageRemoved: false });
    } catch (error) {
      console.error('Error al cargar la imagen:', error);
      alert('Hubo un error al subir la imagen. Inténtalo nuevamente.');
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
                {locationSuggestions.map((feature, index) => (
                  <ListGroup.Item key={index} action onClick={() => handleSelectLocation(feature)}>
                    {feature.properties.formatted}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Form.Group>
        </Col>
      </Row>
      {/* ...el resto del formulario permanece igual... */}
    </Form>
  );
};

export default EventForm;
