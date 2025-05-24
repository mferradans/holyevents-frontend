import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Wallet } from '@mercadopago/sdk-react';
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

  useEffect(() => {
    const generatePreference = async () => {
      if (isFormValid()) {
        try {
          console.log("📤 Enviando datos para generar preferencia:", {
            name: formData.name,
            lastName: formData.lastName,
            email: formData.email,
            tel: formData.tel,
            selectedMenus: formData.selectedMenus,
          });
          
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/create_preference`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
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
          console.log("✅ Preferencia generada:", data.id);

          const data = await response.json();
          setPreferenceId(data.id);
        } catch (err) {
          console.error('❌ Error al crear preferencia:', err);
          setPreferenceId(null);
        }
      } else {
        setPreferenceId(null);
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
          <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
        </Form.Group>

        <Form.Group controlId="formLastName" className="mt-3">
          <Form.Label>Apellido:</Form.Label>
          <Form.Control type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
        </Form.Group>

        <Form.Group controlId="formEmail" className="mt-3">
          <Form.Label>Email:</Form.Label>
          <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
        </Form.Group>

        <Form.Group controlId="formTel" className="mt-3">
          <Form.Label>Teléfono:</Form.Label>
          <Form.Control type="text" name="tel" value={formData.tel} onChange={handleChange} required />
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

        <div className="mt-4">
        {preferenceId ? (
          <Wallet
            initialization={{ preferenceId }}
            customization={{ texts: { valueProp: 'smart_option' } }}
          />
        ) : (
          <Button className="w-100" variant="secondary" disabled>
            Completa el formulario para pagar con Mercado Pago
          </Button>
        )}

        </div>

        <Button
          variant={isFormValid() ? 'success' : 'secondary'}
          className="mt-3 w-100"
          disabled={!isFormValid()}
          onClick={handleManualSubmit}
        >
          Pagar con Transferencia / Efectivo
        </Button>
      </Form>
    </div>
  );
};

export default TransactionForm;
