import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminNavbar = ({ toggleSidebar, isSidebarCollapsed }) => {
  const location = useLocation();
  
  // Function to get the page title based on the current path
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/users')) return 'Users';
    if (path.includes('/expenses')) {
      if (path.includes('/details')) return 'Expense Details';
      return 'Expenses';
    }
    if (path.includes('/reports')) return 'Reports';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/profile')) return 'My Profile';
    
    return 'Admin Portal';
  };

  return (
    <nav className="app-header">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="d-flex align-items-center">
            <Link 
              to="/admin/dashboard" 
              className="btn btn-sm bg-white text-primary border rounded-circle p-2 me-3 d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px' }}
              title="Home"
            >
              <i className="bi bi-house-door-fill fs-5"></i>
            </Link>
            <h1 className="page-title mb-0">{getPageTitle()}</h1>
          </div>
          <div className="d-flex align-items-center">
            <div className="search-box d-none d-md-block">
              <i className="bi bi-search search-icon"></i>
              <input type="text" className="form-control search-input" placeholder="Search..." />
            </div>
            
            <div className="admin-profile">
              <Link to="/admin/profile" className="profile-link">
                <div className="admin-avatar">
                  <i className="bi bi-person"></i>
                </div>
                <span className="admin-name d-none d-md-inline-block">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar; 