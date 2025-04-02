import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './product/Product.css';
import '../App.css';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import TransactionForm from './event/TransactionForm';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faUsers } from '@fortawesome/free-solid-svg-icons'; // Importamos iconos

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState(null);
  const [preferenceId, setPreferenceId] = useState(null);
  const [viewAvailable, setViewAvailable] = useState(true); // Estado para alternar entre disponibles y no disponibles
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const eventsPerPage = 3; // Cantidad de eventos por página
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/events`);
      const eventsWithTransactionCount = await Promise.all(response.data.map(async (event) => {
        const transactionResponse = await axios.get(`${API_URL}/api/events/${event._id}/transaction-count`);
        const transactionCount = transactionResponse.data.transactionCount;
        return { ...event, transactionCount };
      }));
      setEvents(eventsWithTransactionCount);
    } catch (error) {
      console.error('Error al obtener los eventos:', error);
    }
  };

  const handleSelectEvent = (event) => {
    navigate(`/event/${event._id}`);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    fetchEvents();
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage(currentPage => currentPage); // Forzar la actualización
    }, 30000); // Actualizar cada 30 segundos para revisar
  
    return () => clearInterval(interval); // Limpiar el intervalo al desmontar
  }, []);

  const getWarningMessage = (event) => {
    const remainingSpots = event.capacity - event.transactionCount;
    const currentDate = new Date();
    const endPurchaseDate = new Date(event.endPurchaseDate);
    const timeDiff = endPurchaseDate - currentDate;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convertir a días
  
    const quarterCapacity = event.capacity / 4;
    const halfCapacity = event.capacity / 2;
  
    let warnings = [];
    let className = '';
  
    // Punto 1: Menos de un cuarto de los cupos (advertencia severa)
    if (remainingSpots <= quarterCapacity) {
      warnings.push({
        type: 'cupos',
        message: '¡Muy pocos cupos disponibles!',
        severity: 'severe'
      });
      className = 'warning-severe'; // Prioridad al rojo
    }
  
    // Punto 2: Menos de la mitad de los cupos (advertencia moderada)
    if (remainingSpots <= halfCapacity && remainingSpots > quarterCapacity) {
      warnings.push({
        type: 'cupos',
        message: '¡Menos de la mitad de cupos disponibles!',
        severity: 'mild'
      });
      if (!className) className = 'warning-mild'; // Solo cambiar si no hay severa
    }
  
    // Punto 3: Menos de 3 semanas para la compra (advertencia moderada)
    if (daysRemaining <= 21 && daysRemaining > 7) {
      warnings.push({
        type: 'cierre',
        message: '¡Menos de 3 semanas para el cierre!',
        severity: 'mild'
      });
      if (!className) className = 'warning-mild'; // Solo cambiar si no hay severa
    }
  
    // Punto 4: Menos de 1 semana para la compra (advertencia severa)
    if (daysRemaining <= 7) {
      warnings.push({
        type: 'cierre',
        message: '¡Menos de 1 semana para el cierre!',
        severity: 'severe'
      });
      className = 'warning-severe'; // Prioridad al rojo
    }
  
    if (warnings.length === 0) return null;
  
    return { warnings, className };
  };
  
  


// Función para bloquear un evento en el backend cuando alcanza su capacidad máxima
const blockEvent = async (eventId) => {
  try {
    await axios.put(`${API_URL}/api/events/${eventId}/block`, {
      status: 'blocked',
    });
    console.log('Evento bloqueado por falta de cupo.');
  } catch (error) {
    console.error('Error al bloquear el evento:', error);
  }
};


const isEventBlocked = (event) => {
  const currentDate = new Date();
  const endPurchaseDate = new Date(event.endPurchaseDate);
  const isSoldOut = event.transactionCount >= event.capacity;
  const isDateExpired = currentDate > endPurchaseDate;

  if (isSoldOut) {
    // Llamar a la función para bloquear el evento por falta de cupo
    blockEvent(event._id);  // Asegúrate de que este método realmente actualiza el estado en el backend
    return { blocked: true, message: 'Evento lleno', status: 'blocked' };
  } else if (isDateExpired) {
    // Bloquear el evento por fecha límite de compra
    blockEvent(event._id);  // Asegúrate de que este método realmente actualiza el estado en el backend
    return { blocked: true, message: 'Plazo de compra finalizado', status: 'blocked' };
  } else {
    return { blocked: false, status: 'available' };
  }
};



const filterEvents = () => {
  const currentDate = new Date();

  if (viewAvailable) {
    // Mostrar solo eventos disponibles
    return events.filter(event => !isEventBlocked(event).blocked);
  } else {
    // Mostrar eventos bloqueados (eventos llenos o por fin de plazo)
    return events.filter(event => {
      const isBlocked = isEventBlocked(event);
      const blockDate = new Date(event.updatedAt); // Tomar la fecha en que fue actualizado a "blocked"
      const sevenDaysLater = new Date(blockDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días después

      // Mostrar el evento solo si han pasado menos de 7 días desde que fue bloqueado
      return isBlocked.blocked && currentDate <= sevenDaysLater;
    });
  }
};




  const filteredEvents = filterEvents();

  // Calcular los eventos de la página actual
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  return (
    <div className="event-page-container">
      <div className="button-group">
        <button
          className={viewAvailable ? 'active' : ''}
          onClick={() => setViewAvailable(true)}
        >
          Eventos disponibles
        </button>
        <button
          className={!viewAvailable ? 'active' : ''}
          onClick={() => setViewAvailable(false)}
        >
          Eventos no disponibles
        </button>
      </div>
  
      {!selectedEvent ? (
        filteredEvents.length > 0 ? ( // Verificar si hay eventos filtrados
          <div className="pagination-container">
            {/* Flecha Izquierda */}
            {currentPage > 1 && (
              <button
                className="prev-arrow"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &#10094; {/* Flecha izquierda */}
              </button>
            )}
  
            <div className="card-product-container">
              {currentEvents.map((event) => {
                const blockStatus = isEventBlocked(event);
                const warningData = getWarningMessage(event);
  
                return (
                  <div
                    key={event._id}
                    className={`card ${blockStatus.blocked ? 'card-blocked' : ''} ${warningData ? warningData.className : ''}`}
                  >
                    <img
                      src={event.coverImage ? event.coverImage: `${API_URL}/uploads/notfound.png`}
                      alt={event.name}
                      style={{ width: '100%' }}
                    />
                    <h3>{event.name}</h3>
  
                    {/* Mostrar iconos de advertencia si hay warning */}
                    {warningData && warningData.warnings && (
                      <div className="warning-icon-wrapper">
                        {warningData.warnings.map((warning, index) => {
                          const isSevere = warning.severity === 'severe';
  
                          // Mostrar icono de calendario para advertencias de cierre de compra
                          if (warning.type === 'cierre') {
                            return (
                              <div key={index} className="warning-icon-container">
                                <FontAwesomeIcon
                                  icon={faCalendarAlt}
                                  className={`warning-icon ${isSevere ? 'warning-severe-icon' : 'warning-mild-icon'}`}
                                />
                                <span className="tooltip-text">{warning.message}</span>
                              </div>
                            );
                          }
  
                          // Mostrar icono de cupos para advertencias de capacidad
                          if (warning.type === 'cupos') {
                            return (
                              <div key={index} className="warning-icon-container">
                                <FontAwesomeIcon
                                  icon={faUsers}
                                  className={`warning-icon ${isSevere ? 'warning-severe-icon' : 'warning-mild-icon'}`}
                                />
                                <span className="tooltip-text">{warning.message}</span>
                              </div>
                            );
                          }
  
                          return null;
                        })}
                      </div>
                    )}
  
                    {/* Solo abreviar la descripción */}
                    <p>{event.description.length > 25 ? `${event.description.substring(0, 25)}...` : event.description}</p>
  
                    {/* Resto de los textos completos */}
                    <p>
                      <strong>Inicio: </strong>
                      {event.startDate
                        ? new Date(event.startDate).toLocaleDateString('en-GB', {
                            timeZone: 'UTC',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : 'Fecha no disponible'}
                    </p>
                    <p><strong>Precio:</strong> ${event.price}</p>
                    <p><strong>Capacidad:</strong> {event.capacity}</p>
                    <p><strong>Ubicación:</strong> {event.location}</p>
                    <p>
                      <strong>Cierre de compra: </strong>
                      {event.endPurchaseDate
                        ? new Date(event.endPurchaseDate).toLocaleDateString('en-GB', {
                            timeZone: 'UTC',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : 'Fecha no disponible'}
                    </p>
                    {blockStatus.blocked && <p className="block-reason"><strong>{blockStatus.reason}</strong></p>}
  
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
  
            {/* Flecha Derecha */}
            {currentPage < Math.ceil(filteredEvents.length / 3) && currentEvents.length === 3
 && ( // Condición para no avanzar si no hay más eventos
              <button
                className="next-arrow"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentEvents.length === 0 || currentPage === Math.ceil(filteredEvents.length / currentEvents.length)}
              >
                &#10095; {/* Flecha derecha */}
              </button>
            )}
          </div>
        ) : (
          <p>No encontramos nada...</p> // Mensaje si no hay eventos
        )
      ) : (
        <div>
          <TransactionForm event={selectedEvent} />
        </div>
      )}
    </div>
  );
  
  
};

export default HomePage;
