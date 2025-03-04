import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Container, Alert } from 'react-bootstrap';
import Confetti from 'react-confetti'; // Solo si decides agregar confeti
import { useWindowSize } from 'react-use'; // Para manejar el tamaño de la ventana

const SuccessPage = () => {
  console.log("✅ SuccessPage cargado");

  const location = useLocation();
  console.log("🌍 URL actual:", location.href);

  const queryParams = new URLSearchParams(location.search);
  console.log("🔍 Query Params:", location.search);

  const transactionId = queryParams.get('transactionId');
  console.log("🆔 Transaction ID obtenido:", transactionId);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  // Obtener el tamaño de la ventana para el confeti
  const { width, height } = useWindowSize();

  const handleDownload = () => {
    if (!transactionId) {
      console.error("❌ Error: No se recibió transactionId en la URL.");
      return;
    }
    console.log(`📥 Intentando descargar comprobante desde: ${API_URL}/download_receipt/${transactionId}`);
    window.open(`${API_URL}/download_receipt/${transactionId}`, '_blank');
  };

  return (
    <Container className="text-center mt-5">
      {/* Mostrar confeti solo si se quiere agregar */}
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
