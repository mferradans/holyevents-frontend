import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Alert } from 'react-bootstrap';

const VerificationResult = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const transactionId = queryParams.get('transactionId');

  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('Cargando...');
  const [transactionData, setTransactionData] = useState({});
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const verifyTransaction = async () => {
      try {
        const response = await axios.get(`${API_URL}/verify_transaction/${transactionId}`);
        if (response.data.success) {
          setStatus('success');
          setTransactionData(response.data);
          
        } else {
          setStatus('error');
          setMessage('Transacción no encontrada o no válida.');
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


  return (
    <Container className="d-flex mt-5 align-items-center flex-column" style={{ height: '100vh', color: 'white', textAlign: 'center' }}>
      {status === 'success' ? (
        <>
          <Alert variant="success">
            <h2>¡Compra Verificada!</h2>
          </Alert>
          <p>
            Compra válida hecha por <strong>{transactionData.lastName}, {transactionData.name}.</strong> 
          </p>
          {transactionData.menu && transactionData.menu !== 'Sin menú' && (
            <p>Menú seleccionado: <strong>{transactionData.menu}</strong>.</p>
          )}
                    <p>
            Ticket número: <strong>{transactionData.transactionId}</strong> 
          </p>
        </>
      ) : (
        <>
          <Alert variant="danger">
            <h2>Error en la Verificación</h2>
          </Alert>
          <p>{message}</p>
        </>
      )}
    </Container>
  );
};

export default VerificationResult;
