import React, { useEffect } from 'react';
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

  useEffect(() => {
    console.log("✅ SuccessPage cargado");
    console.log("🌍 URL actual:", window.location.href);
    console.log("🔍 Query Params:", location.search);
    console.log("🆔 Transaction ID obtenido:", transactionId);
    console.log("🔗 API_URL:", API_URL);
  }, [location.search, transactionId]);

  const handleDownload = () => {
    if (!transactionId) {
      console.error("❌ Error: No hay transactionId, no se puede descargar el comprobante.");
      return;
    }

    const receiptUrl = `${API_URL}/download_receipt/${transactionId}`;
    console.log("📥 Intentando descargar desde:", receiptUrl);
    
    window.open(receiptUrl, '_blank');
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
        <Alert variant="danger">
          <p>❌ No se pudo obtener el ID de la transacción. Por favor, contacta con soporte.</p>
        </Alert>
      )}
    </Container>
  );
};

export default SuccessPage;
