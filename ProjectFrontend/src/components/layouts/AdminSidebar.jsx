import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import useToastConfig from '../../hooks/useToastConfig';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expenseMenuOpen, setExpenseMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Use custom toast hook
  const toast = useToastConfig();

  // Check if screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('id');
    localStorage.removeItem('role');
    
    // Show success toast notification
    toast.success('Logged out successfully');
    
    // Redirect to login page
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Automatically close sidebar when clicking a link on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  return (
    <div className="app-wrapper">
      <aside className={`app-sidebar ${!sidebarCollapsed ? 'show' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-container">
            <i className="bi bi-grid"></i>
            <span className="brand-text">Admin Panel</span>
          </div>
          <button className="menu-toggle" onClick={toggleSidebar}>
            <i className="bi bi-list"></i>
          </button>
        </div>

        <div className="sidebar-info">
          <i className="bi bi-shield-lock"></i>
          <span>Admin Management Area</span>
        </div>

        <nav className="sidebar-menu">
          <ul className="nav-list">
            <li className="nav-item">
              <Link 
                to="/admin/dashboard" 
                className={`nav-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <i className="bi bi-speedometer2"></i>
                <span>Dashboard</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                to="/admin/users" 
                className={`nav-link ${location.pathname.includes('/admin/users') ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <i className="bi bi-people"></i>
                <span>Users</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                to="/admin/expenses" 
                className={`nav-link ${location.pathname.includes('/admin/expenses') ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <i className="bi bi-cash-coin"></i>
                <span>Expenses</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                to="/admin/incomes" 
                className={`nav-link ${location.pathname.includes('/admin/incomes') ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <i className="bi bi-cash-stack"></i>
                <span>Incomes</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                to="/admin/reports" 
                className={`nav-link ${location.pathname === '/admin/reports' ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <i className="bi bi-bar-chart"></i>
                <span>Reports</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link 
                to="/admin/profile" 
                className={`nav-link ${location.pathname === '/admin/profile' ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <i className="bi bi-person"></i>
                <span>My Profile</span>
              </Link>
            </li>

            <li className="nav-item logout">
              <a 
                href="#" 
                className="nav-link"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Logout</span>
              </a>
            </li>
          </ul>
        </nav>

        <style>{`
          .app-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            width: 250px;
            background: #1a2035;
            transition: all 0.3s ease;
            transform: translateX(-100%);
            z-index: 1040;
            color: white;
            overflow-y: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .app-sidebar::-webkit-scrollbar {
            display: none;
          }

          .app-sidebar.show {
            transform: translateX(0);
          }

          .sidebar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1.5rem;
            background: #1a2035;
            color: white;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }

          .brand-container {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .brand-container i {
            font-size: 1.25rem;
            color: rgba(255,255,255,0.8);
          }

          .brand-text {
            font-size: 1.25rem;
            font-weight: 500;
            color: white;
          }

          .menu-toggle {
            background: transparent;
            border: none;
            color: rgba(255,255,255,0.8);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            width: 32px;
            height: 32px;
            border-radius: 4px;
          }

          .menu-toggle:hover {
            background: rgba(255,255,255,0.1);
            color: white;
          }

          .menu-toggle:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(255,255,255,0.2);
          }

          .menu-toggle i {
            transition: transform 0.3s ease;
          }

          .app-sidebar.show .menu-toggle i {
            transform: rotate(180deg);
          }

          .sidebar-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            color: rgba(255,255,255,0.6);
            font-size: 0.875rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }

          .nav-list {
            list-style: none;
            padding: 1rem 0;
            margin: 0;
          }

          .nav-item {
            margin: 0.25rem 0;
          }

          .nav-link {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1.5rem;
            color: rgba(255,255,255,0.7);
            text-decoration: none;
            transition: all 0.3s ease;
            font-size: 0.9375rem;
          }

          .nav-link:hover {
            background: rgba(255,255,255,0.05);
            color: white;
          }

          .nav-link.active {
            background: rgba(255,255,255,0.1);
            color: white;
          }

          .nav-link i {
            font-size: 1.25rem;
            width: 1.5rem;
            text-align: center;
          }

          .logout {
            margin-top: 2rem;
            border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 0.5rem;
          }

          .logout .nav-link {
            color: #ff6b6b;
          }

          .logout .nav-link:hover {
            background: rgba(255,99,99,0.1);
          }

          .floating-menu-btn {
            position: fixed;
            top: 1rem;
            left: 1rem;
            z-index: 1050;
            background: #1a2035;
            border: none;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          }

          .floating-menu-btn:hover {
            background: #2a3142;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          }

          .floating-menu-btn:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(255,255,255,0.2), 0 2px 5px rgba(0,0,0,0.2);
          }

          .floating-menu-btn i {
            font-size: 1.5rem;
          }

          .app-main {
            margin-left: 0;
            transition: margin-left 0.3s ease;
            padding: 1rem;
            padding-top: 4rem;
          }

          .app-main.sidebar-open {
            margin-left: 250px;
          }

          @media (max-width: 991.98px) {
            .app-main.sidebar-open {
              margin-left: 0;
            }
          }

          .admin-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 1030;
            display: none;
          }

          .admin-backdrop.show {
            display: block;
          }
        `}</style>
      </aside>
      
      <AdminNavbar toggleSidebar={toggleSidebar} isSidebarCollapsed={sidebarCollapsed} />
      
      {/* Floating menu button when sidebar is collapsed */}
      {sidebarCollapsed && (
        <button className="floating-menu-btn" onClick={toggleSidebar}>
          <i className="bi bi-list"></i>
        </button>
      )}
      
      {!sidebarCollapsed && isMobile && (
        <div className="admin-backdrop show" onClick={toggleSidebar}></div>
      )}
      
      <main className={`app-main ${!sidebarCollapsed ? 'sidebar-open' : ''}`}>
        <div className="container-fluid admin-container py-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminSidebar; 