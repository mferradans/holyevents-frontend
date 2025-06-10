import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Alert, Button } from 'react-bootstrap';
import { DateTime } from 'luxon';

const VerificationResult = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const transactionId = queryParams.get('transactionId');

  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('Cargando...');
  const [transactionData, setTransactionData] = useState({});
  const [verified, setVerified] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(null);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL;
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const verifyTransaction = async () => {
      try {
        const response = await axios.get(`${API_URL}/verify_transaction/${transactionId}`);
        if (response.data.success) {
          setTransactionData(response.data);
          setVerified(response.data.verified === true);
          setStatus('success');
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Transacción no válida.');
          setVerified(true); // Si da error porque ya está verificada, lo marcamos igual
          setTransactionData({ transactionId }); // Para que funcione el botón de ver en lista
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

  const handleCheckIn = async () => {
    try {
      const response = await axios.post(`${API_URL}/checkin_transaction/${transactionId}`);
      if (response.data.success) {
        setCheckInStatus('✔ Ingreso validado correctamente.');
        setVerified(true);
      } else {
        setCheckInStatus(response.data.message);
      }
    } catch (error) {
      setCheckInStatus('Error al validar el ingreso.');
    }
  };

  const handleUncheck = async () => {
    try {
      const response = await axios.post(`${API_URL}/unverify_transaction/${transactionId}`);
      if (response.data.success) {
        setCheckInStatus('❌ Venta desmarcada como ingresada.');
        setVerified(false);
      } else {
        setCheckInStatus(response.data.message);
      }
    } catch (error) {
      setCheckInStatus('Error al desverificar la venta.');
    }
  };

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

            {isLoggedIn ? (
              <>
                {!verified && (
                  <div className="d-grid mt-4">
                    <Button style={{ backgroundColor: '#5cff5c', color: 'black' }} onClick={handleCheckIn}>
                      ✅ Marcar ingreso
                    </Button>
                  </div>
                )}

                {verified && (
                  <div className="d-grid gap-2 mt-4">
                    <Button style={{ backgroundColor: '#ffc107', color: 'black' }} onClick={handleUncheck}>
                      ❌ Desverificar venta
                    </Button>
                    <Button 
                      variant="outline-light" 
                      onClick={() => navigate(`/admin/event/${transactionData.eventId}/sales?highlight=${transactionData.transactionId}`)}
                    >
                      Ver esta venta en lista
                    </Button>
                  </div>
                )}

                {checkInStatus && (
                  <Alert variant={verified ? 'success' : 'warning'} className="mt-3">
                    {checkInStatus}
                  </Alert>
                )}
              </>
            ) : (
              <Alert variant="warning" className="mt-4">
                Solo los administradores pueden verificar o modificar ventas.
              </Alert>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="danger" className="text-center w-100" style={{ maxWidth: '600px' }}>
          <h4>Error en la verificación</h4>
          <p>{message}</p>
          {isLoggedIn && (
            <div className="d-grid mt-3">
              <Button 
                variant="outline-light" 
                onClick={() => navigate(`/admin/event/${transactionData.eventId}/sales?highlight=${transactionData.transactionId}`)}
              >
                Ver esta venta en lista
              </Button>
            </div>
          )}
        </Alert>
      )}
    </Container>
  );
};

export default VerificationResult;
