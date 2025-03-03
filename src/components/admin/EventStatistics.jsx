import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Container, Card } from 'react-bootstrap';
import './EventStatistics.css'; // Archivo CSS personalizado

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EventStatistics = () => {
  const [stats, setStats] = useState([]);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token'); // Obtener el token JWT
        const response = await axios.get(`${API_URL}/api/transactions/stats`, {
          headers: {
            Authorization: `Bearer ${token}`, // Enviar el token en las cabeceras
          },
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error al obtener las estadísticas:', error);
      }
    };

    fetchStats();
  }, []);

  // Calcular la cantidad total de transacciones y la ganancia total
  const totalTransactions = stats.reduce((acc, event) => acc + event.transactionCount, 0);
  const totalIncome = stats.reduce((acc, event) => acc + event.totalIncome, 0);

  // Preparar los datos para el gráfico de barras
  const data = {
    labels: stats.map(event => event._id), // Nombres de los eventos
    datasets: [
      {
        label: 'Transacciones',
        data: stats.map(event => event.transactionCount), // Transacciones por evento
        backgroundColor: 'rgba(54, 162, 235, 0.6)', // Color de las barras
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)', // Color al pasar el mouse
        hoverBorderColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const event = stats[tooltipItem.dataIndex];
            return `Transacciones: ${event.transactionCount} | Ingreso Total: $${event.totalIncome}`;
          },
        },
      },
      title: {
        display: true,
        text: 'Ventas por Evento',
      },
    },
  };

  return (
    <Container fluid className="statistics-container">
      {/* Sección superior: total de transacciones y ganancia total */}
      <div className="top-cards">
        <Card className="text-white bg-primary mb-3 small-card">
          <Card.Body>
            <Card.Title>Total de Ventas</Card.Title>
            <Card.Text>{totalTransactions}</Card.Text>
          </Card.Body>
        </Card>

        <Card className="text-white bg-success mb-3 small-card">
          <Card.Body>
            <Card.Title>Ganancia Total</Card.Title>
            <Card.Text>${totalIncome}</Card.Text>
          </Card.Body>
        </Card>
      </div>

      {/* Gráfico de barras y lista de eventos */}
      <div className="main-content">
        <Card className="graph-card mb-3">
          <Card.Body>
            <Bar data={data} options={options} />
          </Card.Body>
        </Card>

        <Card className="list-card mb-3 text-white bg-dark">
          <Card.Body>
            <h5>Lista de Eventos</h5>
            <ul className="list-unstyled">
              {stats.map((event) => (
                <li key={event._id} className="mb-2 event-item">
                  <strong>{event._id}</strong> <br />
                  Transacciones: {event.transactionCount} <br />
                  Ganancia Total: ${event.totalIncome}
                </li>
              ))}
            </ul>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default EventStatistics;
