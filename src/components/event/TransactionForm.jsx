import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import '../admin/EventForm.css';
import { DateTime } from 'luxon';
import { Wallet } from '@mercadopago/sdk-react';

const TransactionForm = ({ event, onSubmit, adminPhone }) => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    tel: '',
    selectedMenus: {},
  });

  const [isLoading, setIsLoading] = useState(false);
  const [preferenceId, setPreferenceId] = useState(null);

  const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const formatDate = (isoString) => {
    return DateTime.fromISO(isoString, { zone: 'utc' })
      .setZone('America/Argentina/Buenos_Aires')
      .setLocale('es')
      .toFormat("cccc dd-MM, HH:mm");
  };

  const isFormValid = () => {
    if (!formData.name || !formData.lastName || !formData.email || !formData.tel) return false;
    if (event.hasMenu && event.menuMoments.length > 0) {
      return event.menuMoments.every(moment => !!formData.selectedMenus[moment.dateTime]);
    }
    return true;
  };

  useEffect(() => {
    const generatePreference = async () => {
      if (isFormValid() && !preferenceId) {
        setIsLoading(true);
        try {
          const id = await onSubmit(formData);
          if (id) setPreferenceId(id);
        } catch (err) {
          console.error("❌ Error al generar preferenceId:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    generatePreference();
  }, [formData]); // ⚠️ Se ejecuta cada vez que cambia el form

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMenuSelection = (dateTime, value) => {
    setFormData(prev => ({
      ...prev,
      selectedMenus: {
        ...prev.selectedMenus,
        [dateTime]: value,
      }
    }));
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
                <Form.Label>{capitalizar(formatDate(moment.dateTime))}</Form.Label>
                <Form.Control
                  as="select"
                  value={formData.selectedMenus[moment.dateTime] || ''}
                  onChange={(e) => handleMenuSelection(moment.dateTime, e.target.value)}
                  required
                >
                  <option value="">Seleccione una opción</option>
                  {moment.menuOptions.map((menu, idx) => (
                    <option key={idx} value={menu}>{menu}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            ))}
          </>
        )}

        <Button
          variant="outline-success"
          className="mt-4 w-100"
          disabled={!isFormValid()}
          onClick={() => {
            const { name, lastName, email, tel, selectedMenus } = formData;

            const menuText = event.hasMenu && event.menuMoments.length > 0
              ? Object.entries(selectedMenus).map(([key, value]) => {
                  const readable = capitalizar(DateTime.fromISO(key, { zone: 'utc' })
                    .setZone('America/Argentina/Buenos_Aires')
                    .setLocale('es')
                    .toFormat("cccc dd-MM, HH:mm"));
                  return `• ${readable}: ${value}`;
                }).join('\n')
              : 'Sin menú';

            const message = encodeURIComponent(
              `Hola, quiero comprar un ticket para el evento "${event.name}" por transferencia o efectivo.\n\n` +
              `Nombre: ${name} ${lastName}\nEmail: ${email}\nTeléfono: ${tel}\n\n` +
              `Menús seleccionados:\n${menuText}`
            );

            window.open(`https://wa.me/${adminPhone}?text=${message}`, '_blank');
          }}
        >
          Pagar con Transferencia / Efectivo
        </Button>

        <div className="mt-3 w-100 text-center">
          {preferenceId ? (
            <Wallet initialization={{ preferenceId }} customization={{ visual: 'disabled' }} />
          ) : (
            <Button variant="secondary" disabled className="w-100">
              Generando botón de Mercado Pago...
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default TransactionForm;
