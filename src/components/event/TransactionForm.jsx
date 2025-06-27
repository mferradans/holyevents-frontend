import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
// import { Wallet } from '@mercadopago/sdk-react'; // Eliminado porque ya no usamos el botón oficial
import { DateTime } from 'luxon';
import '../admin/EventForm.css';

const TransactionForm = ({ event, adminPhone }) => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    tel: '',
    selectedMenus: {},
  });

  const [preferenceId, setPreferenceId] = useState(null);
  const [loadingPreference, setLoadingPreference] = useState(false);
  const lastFormHash = useRef(null);

  const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const formatDate = (isoString) => {
    return DateTime.fromISO(isoString, { zone: 'utc' })
      .setZone('America/Argentina/Buenos_Aires')
      .setLocale('es')
      .toFormat('cccc dd-MM, HH:mm');
  };

  const isFormValid = () => {
    if (!formData.name || !formData.lastName || !formData.email || !formData.tel) return false;
    if (event.hasMenu && event.menuMoments.length > 0) {
      return event.menuMoments.every((moment) => !!formData.selectedMenus[moment.dateTime]);
    }
    return true;
  };

  const generateHash = (data) => {
    return JSON.stringify(data);
  };

  useEffect(() => {
    const generatePreference = async () => {
      if (!isFormValid()) {
        setPreferenceId(null);
        lastFormHash.current = null;
        return;
      }

      const currentHash = generateHash(formData);
      if (currentHash === lastFormHash.current) return;

      lastFormHash.current = currentHash;
      setLoadingPreference(true);

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/create_preference`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: event._id,
            price: event.price,
            name: formData.name,
            lastName: formData.lastName,
            email: formData.email,
            tel: formData.tel,
            selectedMenus: formData.selectedMenus,
          }),
        });

        const data = await response.json();
        setPreferenceId(data.id);
      } catch (err) {
        console.error('❌ Error al crear preferencia:', err);
        setPreferenceId(null);
      } finally {
        setLoadingPreference(false);
      }
    };

    generatePreference();
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMenuSelection = (momentDateTime, value) => {
    setFormData(prev => ({
      ...prev,
      selectedMenus: {
        ...prev.selectedMenus,
        [momentDateTime]: value
      }
    }));
  };

  const handleManualSubmit = () => {
    const { name, lastName, email, tel, selectedMenus } = formData;

    const menuText = event.hasMenu && event.menuMoments.length > 0
      ? Object.entries(selectedMenus).map(([key, value]) => {
          const readable = capitalizar(
            DateTime.fromISO(key, { zone: 'utc' })
              .setZone('America/Argentina/Buenos_Aires')
              .setLocale('es')
              .toFormat("cccc dd-MM, HH:mm")
          );
          return `• ${readable}: ${value}`;
        }).join('\n')
      : 'Sin menú';

    const message = encodeURIComponent(
      `Hola, quiero comprar un ticket para el evento "${event.name}" por transferencia o efectivo.\n\n` +
      `Nombre: ${name} ${lastName}\nEmail: ${email}\nTeléfono: ${tel}\n\n` +
      `Menús seleccionados:\n${menuText}`
    );

    window.open(`https://wa.me/${adminPhone}?text=${message}`, '_blank');
  };

  return (
    <div>
      <h2>Compra de ticket:</h2>
      <h4>¡Ticket único e intransferible!</h4>
      <Form>
        <Form.Group controlId="formName">
          <Form.Label>Nombre:</Form.Label>
          <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} disabled={loadingPreference} required />
        </Form.Group>

        <Form.Group controlId="formLastName" className="mt-3">
          <Form.Label>Apellido:</Form.Label>
          <Form.Control type="text" name="lastName" value={formData.lastName} onChange={handleChange} disabled={loadingPreference} required />
        </Form.Group>

        <Form.Group controlId="formEmail" className="mt-3">
          <Form.Label>Email:</Form.Label>
          <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} disabled={loadingPreference} required />
        </Form.Group>

        <Form.Group controlId="formTel" className="mt-3">
          <Form.Label>Teléfono:</Form.Label>
          <Form.Control type="text" name="tel" value={formData.tel} onChange={handleChange} disabled={loadingPreference} required />
        </Form.Group>

        {event.hasMenu && event.menuMoments.length > 0 && (
          <>
            <h5 className="mt-3">Seleccione su menú para cada momento:</h5>
            {event.menuMoments.map((moment, index) => (
              <Form.Group key={index} controlId={`menuSelection-${index}`} className="mt-3">
                <Form.Label>{formatDate(moment.dateTime)}</Form.Label>
                <Form.Control
                  as="select"
                  value={formData.selectedMenus[moment.dateTime] || ''}
                  onChange={(e) => handleMenuSelection(moment.dateTime, e.target.value)}
                  disabled={loadingPreference}
                  required
                >
                  <option value="">Seleccione una opción</option>
                  {moment.menuOptions.map((menu, menuIndex) => (
                    <option key={menuIndex} value={menu}>{menu}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            ))}
          </>
        )}

        {/* Sección personalizada para Mercado Pago */}
        <div className="mt-4">
          <p><strong>Opción 1: Pago Automático con Mercado Pago</strong></p>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            Serás redirigido a Mercado Pago para abonar con tarjeta o saldo. Tu lugar queda reservado automáticamente al realizar el pago.
          </p>

          {loadingPreference ? (
            <div className="text-center py-2">
              <Spinner animation="border" variant="light" />
              <div className="text-muted mt-2">Generando link de pago...</div>
            </div>
          ) : preferenceId && isFormValid() ? (
            <Button
              className="w-100"
              variant="primary"
              onClick={() =>
                window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`
              }
            >
              Pagar con Mercado Pago
            </Button>
          ) : (
            <Button className="w-100" variant="secondary" disabled>
              Completa el formulario para pagar con Mercado Pago
            </Button>
          )}
        </div>

        {/* Sección personalizada para Transferencia */}
        <div className="mt-4">
          <p><strong>Opción 2: Pago Manual por Transferencia o Efectivo</strong></p>
          <p className="text-warning" style={{ fontSize: '0.9rem' }}>
            Al hacer clic se abrirá WhatsApp para enviar tus datos al organizador.
            <strong> Tu lugar NO queda reservado hasta que efectúes el pago manual.</strong>
          </p>

          <Button
            variant={isFormValid() ? 'success' : 'secondary'}
            className="mt-1 w-100"
            disabled={!isFormValid() || loadingPreference}
            onClick={handleManualSubmit}
          >
            Solicitar pago por Transferencia / Efectivo
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default TransactionForm;
