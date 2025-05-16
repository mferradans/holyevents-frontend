import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Container, Card } from 'react-bootstrap';
import './EventStatistics.css'; // CSS que ya tenés

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EventStatistics = () => {
  const [stats, setStats] = useState([]);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/transactions/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error al obtener las estadísticas:', error);
      }
    };

    fetchStats();
  }, []);

  const totalTransactions = stats.reduce((acc, event) => acc + event.transactionCount, 0);
  const totalIncome = stats.reduce((acc, event) => acc + event.totalIncome, 0);

  const data = {
    labels: stats.map(event => event._id),
    datasets: [
      {
        label: 'Transacciones',
        data: stats.map(event => event.transactionCount),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(75, 192, 192, 0.8)',
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
        color: '#ffffff',
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff',
        },
      },
      y: {
        ticks: {
          color: '#ffffff',
        },
      },
    },
  };

  return (
    <Container fluid className="statistics-container text-white">
      {/* Cards superiores */}
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

      {/* Contenido principal con gráfico y lista */}
      <div className="main-content">
        <Card className="graph-card mb-3 bg-dark text-white">
          <Card.Body style={{ overflowX: 'auto' }}>
            <Bar data={data} options={options} />
          </Card.Body>
        </Card>

        <Card className="list-card mb-3 bg-secondary text-white">
          <Card.Body>
            <h5 className="mb-3">Lista de Eventos</h5>
            <ul className="list-unstyled">
              {stats.map((event) => (
                <li key={event._id} className="mb-3 event-item">
                  <strong>{event._id}</strong><br />
                  Transacciones: {event.transactionCount}<br />
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
