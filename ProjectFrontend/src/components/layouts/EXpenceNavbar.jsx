import React from "react";
import { Link, useNavigate } from "react-router-dom";

export const EXpenceNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('id');
    localStorage.removeItem('role');
    navigate('/login');
  };
  
  const handleToggle = (e) => {
    e.preventDefault();
    if (toggleSidebar) {
      toggleSidebar();
    }
  };
  
  return (
    <nav className="app-header navbar navbar-expand bg-body">
      {/*begin::Container*/}
      <div className="container-fluid">
        <ul className="navbar-nav">
          <li className="nav-item">
            <button
              className="btn btn-light nav-link"
              style={{
                color: "#333",
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onClick={handleToggle}
              title="Toggle Sidebar"
            >
              <i className="bi bi-list" style={{ fontSize: "1.5rem" }}></i>
            </button>
          </li>
          <li className="nav-item">
            <Link to="/user/dashboard" className="nav-link" style={{ 
              fontWeight: "500", 
              color: "#333",
              padding: "8px 15px"
            }}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/user/settings" className="nav-link" style={{ 
              fontWeight: "500", 
              color: "#333",
              padding: "8px 15px"
            }}>
              Contact
            </Link>
          </li>
        </ul>

        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <a
              className="nav-link"
              data-widget="navbar-search"
              href="#"
              role="button"
            >
              <i className="bi bi-search" />
            </a>
          </li>

          <li className="nav-item">
            <button className="btn btn-danger" onClick={handleLogout}>LOGOUT</button>
          </li>
        </ul>
      </div>
    </nav>
  );
};
