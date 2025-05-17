import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import '../admin/EventForm.css';
import { DateTime } from 'luxon'; // ✅ Importamos Luxon

const TransactionForm = ({ event, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    tel: '',
    selectedMenus: {},
  });

  const [isLoading, setIsLoading] = useState(false);

  // ✅ Función para formatear fecha con zona horaria correcta
  const formatDate = (isoString) => {
    return DateTime.fromISO(isoString, { zone: 'utc' }) // usar UTC puro
      .setZone('America/Argentina/Buenos_Aires')         // forzar zona argentina
      .toFormat("cccc dd-MM, HH:mm");                    // Ej: Viernes 18-07, 23:00
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
  };

  const handleMenuSelection = (momentDateTime, value) => {
    const updatedMenus = {
      ...formData.selectedMenus,
      [momentDateTime]: value,
    };

    const updated = {
      ...formData,
      selectedMenus: updatedMenus,
    };

    console.log(`🍽️ Menú seleccionado para ${momentDateTime}: ${value}`);
    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("📦 Enviando al backend:");
    console.log("🧍‍♂️ Nombre:", formData.name);
    console.log("🧍‍♀️ Apellido:", formData.lastName);
    console.log("📧 Email:", formData.email);
    console.log("📱 Tel:", formData.tel);
    console.log("🍴 Menús seleccionados:", formData.selectedMenus);

    try {
      const preferenceId = await onSubmit(formData);
      console.log("✅ preferenceId recibido:", preferenceId);
    } catch (error) {
      console.error("❌ Error al enviar el formulario:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    if (!formData.name || !formData.lastName || !formData.email || !formData.tel) return false;

    if (event.hasMenu && event.menuMoments.length > 0) {
      return event.menuMoments.every((moment) =>
        !!formData.selectedMenus[moment.dateTime]
      );
    }

    return true;
  };

  return (
    <div>
      <h2>Compra de ticket:</h2>
      <h4>¡Ticket único e intranferible!</h4>
      <Form onSubmit={handleSubmit}>
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

        <Button className="mt-3 w-100" variant="primary" type="submit" disabled={!isFormValid() || isLoading}>
          {isLoading ? (
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
          ) : (
            'Continuar al Pago'
          )}
        </Button>

        <Button
          variant="outline-success"
          className="mt-3 w-100"
          disabled={!isFormValid()}
          onClick={() => {
            const { name, lastName, email, tel, selectedMenus } = formData;

            const menuText = event.hasMenu && event.menuMoments.length > 0
              ? Object.entries(selectedMenus).map(([key, value]) => {
                  const readable = DateTime.fromISO(key, { zone: 'utc' })
                    .setZone('America/Argentina/Buenos_Aires')
                    .toFormat("cccc dd-MM, HH:mm");
                  return `• ${readable}: ${value}`;
                }).join('\n')
              : 'Sin menú';

            const message = encodeURIComponent(
              `Hola, quiero comprar un ticket para el evento "${event.name}" por transferencia o efectivo.\n\n` +
              `Nombre: ${name} ${lastName}\nEmail: ${email}\nTeléfono: ${tel}\n\n` +
              `Menús seleccionados:\n${menuText}`
            );

            const phone = "5493534219889";
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
          }}
        >
          Pagar con Transferencia / Efectivo
        </Button>
      </Form>
    </div>
  );
};

export default TransactionForm;
