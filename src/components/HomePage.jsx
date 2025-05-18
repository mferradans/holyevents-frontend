import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './product/Product.css';
import '../App.css';
import TransactionForm from './event/TransactionForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUsers, faClock, faMapMarkerAlt, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { DateTime } from 'luxon';

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
      const eventsWithTransactionCount = await Promise.all(
        response.data.map(async (event) => {
          const transactionResponse = await axios.get(`${API_URL}/api/events/${event._id}/transaction-count`);
          const transactionCount = transactionResponse.data.transactionCount;
          return { ...event, transactionCount };
        })
      );

      const sortedEvents = eventsWithTransactionCount.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      setEvents(sortedEvents);
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

  const getWarningMessage = (event) => {
    const now = DateTime.now().setZone('America/Argentina/Buenos_Aires');
    const endPurchase = DateTime.fromISO(event.endPurchaseDate).setZone('America/Argentina/Buenos_Aires');
    const daysRemaining = Math.ceil(endPurchase.diff(now, 'days').days);

    const remainingSpots = event.capacity - event.transactionCount;
    const quarterCapacity = event.capacity / 4;
    const halfCapacity = event.capacity / 2;

    const warnings = [];
    let className = '';

    if (remainingSpots <= quarterCapacity) {
      warnings.push({ type: 'cupos', message: '¡Muy pocos cupos disponibles!', severity: 'severe' });
      className = 'warning-severe';
    } else if (remainingSpots <= halfCapacity) {
      warnings.push({ type: 'cupos', message: '¡Menos de la mitad de cupos disponibles!', severity: 'mild' });
      if (!className) className = 'warning-mild';
    }

    if (daysRemaining <= 7) {
      warnings.push({ type: 'cierre', message: '¡Menos de 1 semana para el cierre!', severity: 'severe' });
      className = 'warning-severe';
    } else if (daysRemaining <= 21) {
      warnings.push({ type: 'cierre', message: '¡Menos de 3 semanas para el cierre!', severity: 'mild' });
      if (!className) className = 'warning-mild';
    }

    return warnings.length > 0 ? { warnings, className, daysRemaining } : null;
  };

  const blockEvent = async (eventId) => {
    try {
      await axios.put(`${API_URL}/api/events/${eventId}/block`, { status: 'blocked' });
    } catch (error) {
      console.error('Error al bloquear el evento:', error);
    }
  };

  const isEventBlocked = (event) => {
    const now = DateTime.now().setZone('America/Argentina/Buenos_Aires');
    const endPurchase = DateTime.fromISO(event.endPurchaseDate).setZone('America/Argentina/Buenos_Aires');
    const isSoldOut = event.transactionCount >= event.capacity;
    const isDateExpired = now > endPurchase;

    if (isSoldOut || isDateExpired) {
      blockEvent(event._id);
      return { blocked: true, message: isSoldOut ? 'Evento lleno' : 'Plazo de compra finalizado' };
    }
    return { blocked: false };
  };

  const filterEvents = () => {
    const now = DateTime.now().setZone('America/Argentina/Buenos_Aires');
    return events.filter((event) => {
      const blocked = isEventBlocked(event);
      const blockTime = DateTime.fromISO(event.updatedAt).setZone('America/Argentina/Buenos_Aires');
      const sevenDaysLater = blockTime.plus({ days: 7 });
      return viewAvailable ? !blocked.blocked : blocked.blocked && now <= sevenDaysLater;
    });
  };

  const filteredEvents = filterEvents();
  const indexOfLastEvent = currentPage * eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfLastEvent - eventsPerPage, indexOfLastEvent);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <div className="text-white text-center">
          <div className="spinner-border text-light" role="status" />
          <p className="mt-3">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-page-container">
      <div className="button-group">
        <button className={viewAvailable ? 'active' : ''} onClick={() => setViewAvailable(true)}>Eventos disponibles</button>
        <button className={!viewAvailable ? 'active' : ''} onClick={() => setViewAvailable(false)}>Eventos no disponibles</button>
      </div>

      {!selectedEvent ? (
        filteredEvents.length > 0 ? (
          <div className="pagination-container">
            {currentPage > 1 && (
              <button className="prev-arrow" onClick={() => setCurrentPage(currentPage - 1)}>&#10094;</button>
            )}

            <div className="card-product-container">
              {currentEvents.map((event) => {
                const blockStatus = isEventBlocked(event);
                const warningData = getWarningMessage(event);
                const locationParts = event.location.split(',').slice(-2).join(', ');

                return (
                  <div key={event._id} className={`card ${blockStatus.blocked ? 'card-blocked' : ''} ${warningData ? warningData.className : ''}`}>
                    <img src={event.coverImage || `${API_URL}/uploads/notfound.png`} alt={event.name} />
                    <h3>{event.name}</h3>

                    {warningData && (
                      <div className="warning-icon-wrapper">
                        {warningData.warnings.map((warning, i) => (
                          <div key={i} className="warning-icon-container">
                            <FontAwesomeIcon
                              icon={warning.type === 'cierre' ? faCalendarAlt : faUsers}
                              className={`warning-icon pulse ${warning.severity === 'severe' ? 'warning-severe-icon' : 'warning-mild-icon'}`}
                            />
                            <span className="tooltip-text">{warning.message}</span>
                          </div>
                        ))}
                        <p className="text-white mt-1">
                          <strong>Faltan:</strong> {warningData.daysRemaining} {warningData.daysRemaining === 1 ? 'día' : 'días'} para que cierre la venta
                        </p>
                      </div>
                    )}

                    <div className="d-flex justify-content-between flex-wrap text-white icon-info-wrapper mt-2">
                      <div className="info-icon tooltip-wrapper">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span className="tooltip-text">Inicio del evento</span>
                        <p>{DateTime.fromISO(event.startDate).setZone('America/Argentina/Buenos_Aires').toFormat('dd/MM/yyyy')}</p>
                      </div>

                      <div className="info-icon tooltip-wrapper">
                        <FontAwesomeIcon icon={faDollarSign} />
                        <span className="tooltip-text">Precio</span>
                        <p>${event.price}</p>
                      </div>

                      <div className="info-icon tooltip-wrapper">
                        <FontAwesomeIcon icon={faUsers} />
                        <span className="tooltip-text">Capacidad</span>
                        <p>{event.capacity}</p>
                      </div>

                      <div className="info-icon tooltip-wrapper">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <span className="tooltip-text">Ubicación</span>
                        <p>{locationParts}</p>
                      </div>
                    </div>

                    <p className="text-white mt-2">
                      <strong>Cierre de compra:</strong> {DateTime.fromISO(event.endPurchaseDate).setZone('America/Argentina/Buenos_Aires').toFormat('dd/MM/yyyy')}
                    </p>

                    {blockStatus.blocked && <p className="block-reason"><strong>{blockStatus.message}</strong></p>}

                    <button
                      className="button"
                      onClick={() => handleSelectEvent(event)}
                      disabled={blockStatus.blocked}
                      style={{ backgroundColor: blockStatus.blocked ? 'gray' : '#007bff', cursor: blockStatus.blocked ? 'not-allowed' : 'pointer' }}
                    >
                      {blockStatus.blocked ? blockStatus.message : 'Seleccionar Evento'}
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
          <p className="text-white text-center">No encontramos nada...</p>
        )
      ) : (
        <TransactionForm event={selectedEvent} />
      )}
    </div>
  );
};

export default HomePage;
