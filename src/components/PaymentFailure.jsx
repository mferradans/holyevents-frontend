import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Alert } from 'react-bootstrap';

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <Container className="text-center mt-5">
      <Alert variant="danger">
        <h1>¡Pago fallido!</h1>
        <p>Lo sentimos, ha ocurrido un problema con tu transacción. Intenta nuevamente.</p>
      </Alert>

      <Button variant="danger" size="lg" className="my-3" onClick={() => navigate('/')}>
        Volver al inicio
      </Button>

    </Container>
  );
};

export default PaymentFailure;
