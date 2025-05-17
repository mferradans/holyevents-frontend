// SuccessPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Container, Alert, Spinner } from 'react-bootstrap';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const queryParams = new URLSearchParams(location.search);
  const [transactionId, setTransactionId] = useState(null);
  const [loading, setLoading] = useState(false); // 👈 nuevo estado

  useEffect(() => {
    const transactionIdParam = queryParams.get('transactionId');
    const paymentIdParam = queryParams.get('payment_id');

    console.log("🔎 URL Search Params:", location.search);
    console.log("🔍 transactionId:", transactionIdParam);
    console.log("🔍 payment_id:", paymentIdParam);

    if (transactionIdParam) {
      console.log("✅ transactionId directo desde la URL");
      setTransactionId(transactionIdParam);
      return;
    }

    if (paymentIdParam) {
      console.log("⌛ Esperando 6 segundos antes de buscar transacción con paymentId:", paymentIdParam);
      setLoading(true);
      setTimeout(() => {
        fetchTransaction(paymentIdParam);
      }, 6000);
      return;
    }

    console.warn("❌ No hay transactionId ni payment_id en la URL");
    navigate('/');
  }, [location.search]);

  const fetchTransaction = async (paymentId) => {
    try {
      const res = await fetch(`${API_URL}/get_transaction?paymentId=${paymentId}`);
      const data = await res.json();
      if (data && data._id) {
        console.log("✅ Transacción encontrada:", data._id);
        setTransactionId(data._id);
      } else {
        console.warn("⚠️ Transacción no encontrada en el backend");
        navigate('/');
      }
    } catch (err) {
      console.error("❌ Error al buscar transacción:", err);
      navigate('/');
    } finally {
      setLoading(false); // ✅ desactivar loading
    }
  };

  const handleDownload = () => {
    if (!transactionId) return;
    window.open(`${API_URL}/download_receipt/${transactionId}`, '_blank');
  };

  return (
    <Container className="text-center mt-5">
      <Confetti width={width} height={height} numberOfPieces={150} />
      <Alert variant="success">
        <h1>¡Pago exitoso!</h1>
        <p>Gracias por tu compra. Descarga este comprobante y preséntalo el día del evento ¡no lo olvides!</p>
      </Alert>

      {loading ? (
        <div className="my-4">
          <Spinner animation="border" role="status" variant="success">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-3">Cargando tu comprobante...</p>
        </div>
      ) : transactionId ? (
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
