import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Spinner, Container, Row, Col } from 'react-bootstrap';

const AddManualSalePage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    tel: '',
    selectedMenus: {}
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvent(res.data);
      } catch (error) {
        console.error("❌ Error al obtener el evento:", error);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    console.log("📥 Cambio de input:", name, "→", value);
  };

  const handleMenuSelection = (momentDateTime, value) => {
    const updated = {
      ...formData,
      selectedMenus: {
        ...formData.selectedMenus,
        [momentDateTime]: value
      }
    };
    setFormData(updated);
    console.log("📥 Selección de menú:", momentDateTime, "→", value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      ...formData,
      metadataType: 'manual',
      eventId
    };

    console.log("📤 Enviando venta manual:", payload);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/events/${eventId}/manual-sale`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("✅ Venta manual guardada correctamente.");
      navigate(`/admin/events/${eventId}/sales`);
    } catch (error) {
      console.error("❌ Error al guardar la venta manual:", error.response?.data || error.message);
      alert("Error al guardar la venta manual.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!event) return <div className="text-white">Cargando evento...</div>;

  return (
    <Container className="text-white mt-4">
      <h2>Registrar Venta Manual: {event.name}</h2>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mt-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mt-3">
              <Form.Label>Apellido</Form.Label>
              <Form.Control type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mt-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mt-3">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control type="text" name="tel" value={formData.tel} onChange={handleChange} required />
        </Form.Group>

        {event.hasMenu && event.menuMoments.length > 0 && (
          <>
            <h5 className="mt-4">Seleccionar Menús:</h5>
            {event.menuMoments.map((moment, index) => (
              <Form.Group key={index} className="mt-2">
                <Form.Label>{new Date(moment.dateTime).toLocaleString()}</Form.Label>
                <Form.Select
                  value={formData.selectedMenus[moment.dateTime] || ''}
                  onChange={(e) => handleMenuSelection(moment.dateTime, e.target.value)}
                  required
                >
                  <option value="">Seleccionar menú</option>
                  {moment.menuOptions.map((option, i) => (
                    <option key={i} value={option}>{option}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            ))}
          </>
        )}

        <Button variant="success" type="submit" className="mt-4" disabled={isLoading}>
          {isLoading ? <Spinner animation="border" size="sm" /> : 'Guardar Venta Manual'}
        </Button>
      </Form>
    </Container>
  );
};

export default AddManualSalePage;
