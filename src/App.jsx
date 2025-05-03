import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TransactionForm from './components/event/TransactionForm';
import SuccessPage from './components/SuccessPage'; 
import PaymentFailure from './components/PaymentFailure'; 
import PaymentPending from './components/PaymentPending'; 
import { initMercadoPago } from '@mercadopago/sdk-react';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import HomePage from './components/HomePage'; 
import PrivateRoute from './components/PrivateRoute'; 
import EventPage from './components/event/EventPage'; 
import EventStatistics from './components/admin/EventStatistics';
import EventForm from './components/admin/EventForm'; // Asegúrate de importar EventForm
import './App.css';  
import Navbar from './components/Navbar'; 
import VerificationResult from './components/VerificationResult';
import EventSales from './components/admin/EventSales'; // Asegúrate de importar el componente
import AddManualSalePage from './components/admin/AddManualSalePage';

function App() {
  // Inicializar Mercado Pago
  initMercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY, { locale: 'es-AR' });

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/event/:id" element={<EventPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/statistics" element={<PrivateRoute><EventStatistics /></PrivateRoute>} />
        <Route path="/admin/event/create" element={<PrivateRoute><EventForm /></PrivateRoute>} /> {/* Ruta para crear */}
        <Route path="/admin/event/edit/:id" element={<PrivateRoute><EventForm /></PrivateRoute>} /> {/* Ruta para editar */}
        <Route path="/payment_success" element={<SuccessPage />} />  {/* opcional */}
  <Route path="/success" element={<SuccessPage />} />           {/* NECESARIA */}        
  <Route path="/payment_failure" element={<PaymentFailure />} />
        <Route path="/payment_pending" element={<PaymentPending />} />
        <Route path="/verification_result" element={<VerificationResult />} />
        <Route path="/admin/event/:eventId/sales" element={<EventSales />} />
        <Route path="/admin/events/:eventId/add-manual-sale" element={<AddManualSalePage />} />


      </Routes>
    </Router>
  );
}

export default App;
