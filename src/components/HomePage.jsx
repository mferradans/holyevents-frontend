import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './product/Product.css';
import '../App.css';
import TransactionForm from './event/TransactionForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faMapMarkerAlt, faMoneyBillWave, faUsers } from '@fortawesome/free-solid-svg-icons';

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewAvailable, setViewAvailable] = useState(true);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const eventsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/events`);
      const eventsWithTransactionCount = await Promise.all(response.data.map(async (event) => {
        const transactionResponse = await axios.get(`${API_URL}/api/events/${event._id}/transaction-count`);
        const transactionCount = transactionResponse.data.transactionCount;
        return { ...event, transactionCount };
      }));
      const sorted = eventsWithTransactionCount.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      setEvents(sorted);
    } catch (error) {
      console.error('Error al obtener los eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    navigate(`/event/${event._id}`);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const isEventBlocked = (event) => {
    const now = new Date();
    return new Date(event.endPurchaseDate) < now || event.transactionCount >= event.capacity;
  };

  const getDaysLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return null;
    return diff === 1 ? 'Falta 1 día' : `Faltan ${diff} días`;
  };

  const filteredEvents = events.filter(event => {
    const isBlocked = isEventBlocked(event);
    return viewAvailable ? !isBlocked : isBlocked;
  });

  const indexOfLast = currentPage * eventsPerPage;
  const indexOfFirst = indexOfLast - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirst, indexOfLast);

  return (
    <div className="event-page-container">
      <div className="button-group">
        <button className={viewAvailable ? 'active' : ''} onClick={() => setViewAvailable(true)}>Eventos disponibles</button>
        <button className={!viewAvailable ? 'active' : ''} onClick={() => setViewAvailable(false)}>Eventos no disponibles</button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
          <div className="text-white text-center">
            <div className="spinner-border text-light" role="status" />
            <p className="mt-3">Cargando eventos...</p>
          </div>
        </div>
      ) : !selectedEvent ? (
        filteredEvents.length > 0 ? (
          <div className="pagination-container">
            {currentPage > 1 && (
              <button className="prev-arrow" onClick={() => setCurrentPage(currentPage - 1)}>&#10094;</button>
            )}

            <div className="card-product-container">
              {currentEvents.map((event) => {
                const isBlocked = isEventBlocked(event);
                const daysLeftText = getDaysLeft(event.endPurchaseDate);

                return (
                  <div key={event._id} className={`card ${isBlocked ? 'card-blocked' : ''}`}>
                    <img src={event.coverImage || `${API_URL}/uploads/notfound.png`} alt={event.name} />
                    <h3>{event.name}</h3>
                    {daysLeftText && <p className="text-warning fw-bold">{daysLeftText}</p>}

                    <div className="info-grid">
                      <div><FontAwesomeIcon icon={faCalendarAlt} /> <span>{new Date(event.startDate).toLocaleDateString()}</span></div>
                      <div><FontAwesomeIcon icon={faMoneyBillWave} /> <span>${event.price}</span></div>
                      <div><FontAwesomeIcon icon={faUsers} /> <span>{event.capacity}</span></div>
                      <div><FontAwesomeIcon icon={faMapMarkerAlt} /> <span>{event.location}</span></div>
                    </div>

                    <button
                      className="button mt-3"
                      onClick={() => handleSelectEvent(event)}
                      disabled={isBlocked}
                      style={{ backgroundColor: isBlocked ? 'gray' : '#007bff' }}
                    >
                      {isBlocked ? 'No disponible' : 'Seleccionar Evento'}
                    </button>
                  </div>
                );
              })}
            </div>

            {currentPage < Math.ceil(filteredEvents.length / eventsPerPage) && (
              <button className="next-arrow" onClick={() => setCurrentPage(currentPage + 1)}>&#10095;</button>
            )}
          </div>
        ) : (
          <p className="text-white">No encontramos nada...</p>
        )
      ) : (
        <TransactionForm event={selectedEvent} />
      )}
    </div>
  );
};

export default HomePage;
