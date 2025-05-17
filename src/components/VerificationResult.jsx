import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Alert, Button } from 'react-bootstrap';
import { DateTime } from 'luxon';
import 'luxon/locale/es';

const VerificationResult = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const transactionId = queryParams.get('transactionId');

  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('Cargando...');
  const [transactionData, setTransactionData] = useState({});
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const verifyTransaction = async () => {
      try {
        const response = await axios.get(`${API_URL}/verify_transaction/${transactionId}`);
        if (response.data.success) {
          setTransactionData(response.data);
          setStatus('success');
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Transacción no válida.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Ocurrió un error inesperado.');
      }
    };

    if (transactionId) {
      verifyTransaction();
    } else {
      setStatus('error');
      setMessage('ID de transacción no proporcionado.');
    }
  }, [transactionId]);

  const formatDate = (isoString) => {
    return DateTime.fromISO(isoString.replace('_t', 'T').replace('_z', 'Z'), { zone: 'utc' })
      .setZone('America/Argentina/Buenos_Aires')
      .setLocale('es')
      .toFormat('cccc dd-MM, HH:mm');
  };

  return (
    <Container className="mt-5 mb-5 d-flex flex-column align-items-center justify-content-start" style={{ minHeight: '80vh', color: 'white' }}>
      {status === 'success' ? (
        <Card className="bg-dark text-white w-100" style={{ maxWidth: '600px' }}>
          <Card.Header className="bg-success text-white text-center">
            <h4>✔ Compra verificada</h4>
          </Card.Header>
          <Card.Body>
            <p><strong>Nombre:</strong> {transactionData.lastName}, {transactionData.name}</p>
            <p><strong>Email:</strong> {transactionData.email}</p>
            <p><strong>Precio total:</strong> ${transactionData.price}</p>
            <p><strong>Fecha de compra:</strong> {formatDate(transactionData.transactionDate)}</p>
            <p><strong>ID del ticket:</strong> {transactionData.transactionId}</p>

            {transactionData.selectedMenus && Object.keys(transactionData.selectedMenus).length > 0 && (
              <>
                <hr />
                <h6>🧾 Menús seleccionados:</h6>
                <ul>
                  {Object.entries(transactionData.selectedMenus).map(([rawDate, menu], index) => (
                    <li key={index}>
                      <strong>{formatDate(rawDate)}:</strong> {menu}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="d-grid mt-4">
              <Button 
                variant="outline-info" 
                onClick={() => navigate(`/admin/event/${transactionData.eventId}/sales?highlight=${transactionData.transactionId}`)}
              >
                Ver esta venta en lista
              </Button>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="danger" className="text-center w-100" style={{ maxWidth: '600px' }}>
          <h4>Error en la verificación</h4>
          <p>{message}</p>
        </Alert>
      )}
    </Container>
  );
};

export default VerificationResult;