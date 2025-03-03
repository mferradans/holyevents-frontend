import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Alert } from 'react-bootstrap';

const PaymentPending = () => {
  const navigate = useNavigate();

  return (
    <Container className="text-center mt-5">
      <Alert variant="warning">
        <h1>Pago pendiente</h1>
        <p>Tu transacción está en proceso. Esto puede tardar unos minutos. Si no se soluciona vuelve a intentar.</p>
      </Alert>

      <Button variant="primary" size="lg" onClick={() => navigate('/')}>
        Volver al inicio
      </Button>
    </Container>
  );
};

export default PaymentPending;
