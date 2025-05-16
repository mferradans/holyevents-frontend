import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance.js';
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
import './EventStatistics.css';

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
            return `Transacciones: ${event.transactionCount} | Ingreso: $${event.totalIncome}`;
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
        ticks: { color: '#ffffff' },
      },
      y: {
        ticks: { color: '#ffffff' },
      },
    },
  };

  return (
    <Container fluid className="statistics-container text-white">
      <div className="top-cards">
        <Card className="bg-primary mb-3 small-card">
          <Card.Body>
            <Card.Title className="text-white">Total de Ventas</Card.Title>
            <Card.Text className="text-white">{totalTransactions}</Card.Text>
          </Card.Body>
        </Card>

        <Card className="bg-success mb-3 small-card">
          <Card.Body>
            <Card.Title className="text-white">Ganancia Total</Card.Title>
            <Card.Text className="text-white">${totalIncome}</Card.Text>
          </Card.Body>
        </Card>
      </div>

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
