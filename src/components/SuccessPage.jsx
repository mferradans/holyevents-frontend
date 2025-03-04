import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Container, Alert } from 'react-bootstrap';
import Confetti from 'react-confetti'; // Solo si decides agregar confeti
import { useWindowSize } from 'react-use'; // Para manejar el tamaño de la ventana

const SuccessPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const transactionId = queryParams.get('transactionId');
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  // Obtener el tamaño de la ventana para el confeti
  const { width, height } = useWindowSize();

  const handleDownload = () => {
    window.open(`${API_URL}/download_receipt/${transactionId}`, '_blank');
  };

  return (
    <Container className="text-center mt-5">
      {/* Mostrar confeti solo si se quiere agregar */}
      <Confetti width={width} height={height} numberOfPieces={150} /> {/* Solo si quieres confeti */}

      <Alert variant="success">
        <h1>¡Pago exitoso!</h1>
        <p>Gracias por tu compra. Descarga este comprobante y preséntalo el día del evento ¡no lo olvides!</p>
      </Alert>
      console.log("Transaction ID en SuccessPage:", transactionId);
      {transactionId && (
        <Button variant="success" size="lg" onClick={handleDownload} className="my-3">
          Descargar Comprobante
        </Button>
      )}
    </Container>
  );
};

export default SuccessPage;
