import React from 'react'

export default function EventCard() {
  return (
    <div>EventCard</div>
  )
}
/*
import React from 'react';
import './EventCard.css';

const EventCard = ({ event, onSelect }) => {
  return (
    <div className="event-card">
      <h3>{event.name}</h3>
      <p>{event.description}</p>
      <p><strong>Preciio:</strong> ${event.price}</p>
      <p><strong>Fecha:</strong> {event.date}</p>
      <p><strong>Lugar:</strong> {event.location}</p>
      <button onClick={() => onSelect(event)}>Seleccionar Evento</button>
    </div>
  );
};
*/