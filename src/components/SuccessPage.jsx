import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Container, Alert } from 'react-bootstrap';
import Confetti from 'react-confetti'; // Solo si decides agregar confeti
import { useWindowSize } from 'react-use'; // Para manejar el tamaño de la ventana

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const queryParams = new URLSearchParams(location.search);
  const transactionId = queryParams.get('transactionId');

  useEffect(() => {
    if (!transactionId) {
      navigate('/');
    }
  }, [transactionId, navigate]);

  const handleDownload = () => {
    window.open(`${API_URL}/download_receipt/${transactionId}`, '_blank');
  };

  return (
    <Container className="text-center mt-5">
      <Confetti width={width} height={height} numberOfPieces={150} />
      <Alert variant="success">
        <h1>¡Pago exitoso!</h1>
        <p>Gracias por tu compra. Descarga este comprobante y preséntalo el día del evento ¡no lo olvides!</p>
      </Alert>
      {transactionId ? (
        <Button variant="success" size="lg" onClick={handleDownload} className="my-3">
          Descargar Comprobante
        </Button>
      ) : (
        <p className="text-danger">⚠️ No se encontró el ID de la transacción.</p>
      )}
    </Container>
  );
};

export default SuccessPage;
