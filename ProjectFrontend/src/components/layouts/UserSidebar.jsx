import React, { useState, useEffect } from 'react'
import UserNavbar from './UserNavbar'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'

export const UserSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expenseMenuOpen, setExpenseMenuOpen] = useState(location.pathname.includes('/user/expense'));
  const [incomeMenuOpen, setIncomeMenuOpen] = useState(location.pathname.includes('/user/income'));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
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
            <i className="bi bi-wallet2"></i>
            <span className="brand-text">User Panel</span>
          </div>
          <button className="menu-toggle" onClick={toggleSidebar}>
            <i className="bi bi-list"></i>
          </button>
        </div>

        <div className="sidebar-info">
          <i className="bi bi-shield-lock"></i>
          <span>Viewing your expenses only</span>
        </div>

        <nav className="sidebar-menu">
          <ul className="nav-list">
            <li className="nav-item">
              <Link 
                to="/user/dashboard" 
                className={`nav-link ${location.pathname === '/user/dashboard' ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <i className="bi bi-speedometer2"></i>
                <span>Dashboard</span>
              </Link>
            </li>
            
            <li className="nav-item">
              <Link 
                to="/user/profile" 
                className={`nav-link ${location.pathname === '/user/profile' ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <i className="bi bi-person"></i>
                <span>My Profile</span>
              </Link>
            </li>
            
            <li className={`nav-item ${expenseMenuOpen ? 'menu-open' : ''}`}>
              <a href="#" 
                 className={`nav-link ${location.pathname.includes('/user/expense') ? 'active' : ''}`}
                 onClick={(e) => {
                   e.preventDefault();
                   setExpenseMenuOpen(!expenseMenuOpen);
                 }}
              >
                <i className="bi bi-cash-coin"></i>
                <span>
                  Expense Management
                  <i className="bi bi-chevron-right submenu-arrow"></i>
                </span>
              </a>
              <ul className="submenu">
                <li>
                  <Link 
                    to="/user/expense-management" 
                    className={`nav-link ${location.pathname === '/user/expense-management' ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <i className="bi bi-house"></i>
                    <span>Expense Overview</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/user/expenses" 
                    className={`nav-link ${location.pathname === '/user/expenses' ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <i className="bi bi-list-ul"></i>
                    <span>View All Expenses</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/user/add-expense" 
                    className={`nav-link ${location.pathname === '/user/add-expense' ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <i className="bi bi-plus-circle"></i>
                    <span>Add New Expense</span>
                  </Link>
                </li>
              </ul>
            </li>
            
            <li className={`nav-item ${incomeMenuOpen ? 'menu-open' : ''}`}>
              <a href="#" 
                 className={`nav-link ${location.pathname.includes('/user/income') ? 'active' : ''}`}
                 onClick={(e) => {
                   e.preventDefault();
                   setIncomeMenuOpen(!incomeMenuOpen);
                 }}
              >
                <i className="bi bi-cash-coin"></i>
                <span>
                  Income Management
                  <i className="bi bi-chevron-right submenu-arrow"></i>
                </span>
              </a>
              <ul className="submenu">
                <li>
                  <Link 
                    to="/user/income" 
                    className={`nav-link ${location.pathname === '/user/income' ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <i className="bi bi-list-ul"></i>
                    <span>View All Income</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/user/add-income" 
                    className={`nav-link ${location.pathname === '/user/add-income' ? 'active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <i className="bi bi-plus-circle"></i>
                    <span>Add New Income</span>
                  </Link>
                </li>
              </ul>
            </li>
            
            <li className="nav-item">
              <Link 
                to="/user/reports" 
                className={`nav-link ${location.pathname === '/user/reports' ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <i className="bi bi-bar-chart"></i>
                <span>Reports</span>
              </Link>
            </li>
            
            <li className="nav-item">
              <Link 
                to="/user/contact" 
                className={`nav-link ${location.pathname === '/user/contact' ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <i className="bi bi-envelope"></i>
                <span>Contact Us</span>
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
            scrollbar-width: none;  /* Firefox */
            -ms-overflow-style: none;  /* IE and Edge */
          }

          .app-sidebar::-webkit-scrollbar {
            display: none;  /* Chrome, Safari, Opera */
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

          .submenu {
            list-style: none;
            padding: 0;
            margin: 0;
            display: none;
            background: rgba(0,0,0,0.1);
          }

          .menu-open > .submenu {
            display: block;
          }

          .submenu .nav-link {
            padding-left: 3.75rem;
          }

          .submenu-arrow {
            margin-left: auto;
            font-size: 0.875rem;
            transition: transform 0.3s ease;
          }

          .menu-open .submenu-arrow {
            transform: rotate(90deg);
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
        `}</style>
      </aside>
      
      {/* Floating menu button when sidebar is collapsed */}
      {sidebarCollapsed && (
        <button className="floating-menu-btn" onClick={toggleSidebar}>
          <i className="bi bi-list"></i>
        </button>
      )}
      
      {!sidebarCollapsed && isMobile && (
        <div className="admin-backdrop show" onClick={toggleSidebar}></div>
      )}
      
      <UserNavbar toggleSidebar={toggleSidebar} isSidebarCollapsed={sidebarCollapsed} />
      <main className={`app-main ${!sidebarCollapsed ? 'sidebar-open' : ''}`}>
        <div className="container-fluid py-3">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
