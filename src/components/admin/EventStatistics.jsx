import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Container, Card, Row, Col } from 'react-bootstrap';

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
  const averageIncome = totalTransactions > 0 ? (totalIncome / totalTransactions).toFixed(2) : 0;

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
      },
    },
  };

  return (
    <Container className="my-4">
      <h2 className="text-white text-center mb-4">Estadísticas de Eventos</h2>

      <Row className="g-3 text-white mb-4">
        <Col xs={12} md={4}>
          <Card className="bg-primary h-100">
            <Card.Body>
              <Card.Title>Total de Ventas</Card.Title>
              <Card.Text className="fs-4">{totalTransactions}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="bg-success h-100">
            <Card.Body>
              <Card.Title>Ganancia Total</Card.Title>
              <Card.Text className="fs-4">${totalIncome}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="bg-info text-dark h-100">
            <Card.Body>
              <Card.Title>Ingreso Promedio</Card.Title>
              <Card.Text className="fs-4">${averageIncome}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xs={12}>
          <Card className="bg-dark text-white">
            <Card.Body style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: '500px' }}>
                <Bar data={data} options={options} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <Card className="bg-secondary text-white">
            <Card.Body>
              <h5 className="mb-3">Resumen por Evento</h5>
              <ul className="list-unstyled">
                {stats.map((event) => (
                  <li key={event._id} className="mb-3 border-bottom pb-2">
                    <strong>{event._id}</strong><br />
                    Transacciones: {event.transactionCount}<br />
                    Ganancia Total: ${event.totalIncome}
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EventStatistics;
