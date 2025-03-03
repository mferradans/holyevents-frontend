import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import "./Navbar.css"; // Archivo CSS mejorado

function BasicExample() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  return (
    <Navbar expand="lg" className="custom-navbar" variant="dark">
      <Container>
        {/* Logo con animación */}
        <Navbar.Brand as={Link} to="/" className="navbar-logo">
          <img src="/holyeventsw.png" alt="HolyEvents Logo" className="logo-img" />
          HolyEvents
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
  
          <Nav>
            {isLoggedIn ? (
              <Nav.Link as={Link} to="/admin/dashboard" className="nav-button">
                Dashboard
              </Nav.Link>
            ) : (
              <Nav.Link as={Link} to="/admin/login" className="nav-button">
                Login
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default BasicExample;
