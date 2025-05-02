import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import '../admin/EventForm.css';

const TransactionForm = ({ event, onSubmit, formDataExternal }) => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    tel: '',
    selectedMenus: {}, // Almacenar los menús elegidos para cada momento
  });

  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (formDataExternal) {
      formDataExternal(formData);
    }
  }, [formData, formDataExternal]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    formDataExternal && formDataExternal(updated);
  };
  
  const handleMenuSelection = (momentIndex, value) => {
    const updated = {
      ...formData,
      selectedMenus: { ...formData.selectedMenus, [momentIndex]: value }
    };
    setFormData(updated);
    formDataExternal && formDataExternal(updated);
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
  
      </Form>
    </div>
  );
  
  
};

export default TransactionForm;
