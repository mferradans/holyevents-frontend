import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import '../admin/EventForm.css';

const TransactionForm = ({ event, onSubmit, preferenceId, setPreferenceId }) => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    tel: '',
    selectedMenus: {}, // Almacenar los menús elegidos para cada momento
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMenuSelection = (momentIndex, value) => {
    setFormData((prevData) => ({
      ...prevData,
      selectedMenus: { ...prevData.selectedMenus, [momentIndex]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const preferenceId = await onSubmit(formData);
      if (setPreferenceId) {
        setPreferenceId(preferenceId); // ✅ vuelve a activar el Wallet
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const isFormValid = () => {
    if (!formData.name || !formData.lastName || !formData.email || !formData.tel) return false;
    if (event.hasMenu && event.menuMoments.length > 0) {
      return event.menuMoments.every((_, index) => !!formData.selectedMenus[index]);
    }
    return true;
  };
  
  return (
    <div>
      <h2>Compra de ticket:</h2>
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
                <Form.Label>{new Date(moment.dateTime).toLocaleString()}</Form.Label>
                <Form.Control
                  as="select"
                  value={formData.selectedMenus[index] || ''}
                  onChange={(e) => handleMenuSelection(index, e.target.value)}
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
  
        {/* Botón Mercado Pago */}
        <Button className="mt-3 w-100" variant="primary" type="submit" disabled={!isFormValid() || isLoading}>
          {isLoading ? (
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
          ) : (
            'Continuar al Pago'
          )}
        </Button>
  
        {/* Botón WhatsApp */}
        <Button
          variant="outline-success"
          className="mt-3 w-100"
          disabled={!isFormValid()}
          onClick={() => {
            const { name, lastName, email, tel, selectedMenus } = formData;
  
            const menuText = event.hasMenu && event.menuMoments.length > 0
              ? Object.entries(selectedMenus).map(([key, value]) =>
                  `• ${new Date(event.menuMoments[key].dateTime).toLocaleString()}: ${value}`
                ).join('\n')
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
