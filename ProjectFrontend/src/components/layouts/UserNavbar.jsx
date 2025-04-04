import React from "react";
import { Link, useLocation } from "react-router-dom";

const UserNavbar = ({ toggleSidebar, isSidebarCollapsed }) => {
  const location = useLocation();
  
  // Function to get the page title based on the current path
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/profile')) return 'My Profile';
    if (path.includes('/expense-management')) return 'Expense Management';
    if (path.includes('/expense-details')) return 'Expense Details';
    if (path.includes('/expenses')) return 'My Expenses';
    if (path.includes('/add-expense')) return 'Add New Expense';
    if (path.includes('/reports')) return 'Reports';
    if (path.includes('/contact')) return 'Contact';
    
    return 'Expense Tracker';
  };

  return (
    <nav className="app-header">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="d-flex align-items-center">
            <button 
              className="d-lg-none btn btn-sm rounded-circle me-2 border-0 d-flex align-items-center justify-content-center"
              onClick={toggleSidebar}
              style={{ width: '36px', height: '36px', background: 'rgba(84, 105, 212, 0.1)' }}
            >
              <i className={`bi bi-${isSidebarCollapsed ? 'list' : 'x'}`}></i>
            </button>
            <Link 
              to="/user/dashboard" 
              className="btn btn-sm bg-white text-primary border rounded-circle p-2 me-3 d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px' }}
              title="Home"
            >
              <i className="bi bi-house-door-fill fs-5"></i>
            </Link>
            <h1 className="page-title mb-0">{getPageTitle()}</h1>
          </div>
          
          <div className="d-flex align-items-center navbar-actions">
            <div className="dropdown">
              <a 
                className="d-flex align-items-center text-decoration-none dropdown-toggle"
                href="#"
                id="userDropdown"
                role="button" 
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div className="d-flex align-items-center">
                  <div className="avatar me-2 d-flex align-items-center justify-content-center" style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(84, 105, 212, 0.1)',
                    color: '#5469d4'
                  }}>
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <span className="d-none d-md-inline text-dark">My Account</span>
                </div>
              </a>
              <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userDropdown">
                <li>
                  <Link className="dropdown-item d-flex align-items-center" to="/user/profile">
                    <i className="bi bi-person me-2"></i>
                    <span>Profile</span>
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a 
                    className="dropdown-item text-danger d-flex align-items-center" 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      localStorage.removeItem('id');
                      localStorage.removeItem('role');
                      window.location.href = '/login';
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    <span>Logout</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
