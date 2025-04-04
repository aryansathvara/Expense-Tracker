import { useState, useEffect } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { UserSidebar } from "./components/layouts/UserSidebar";
import { UserProfile } from "./components/user/UserProfile";
import Dashboard from "./components/user/Dashboard";
import Reports from "./components/user/Reports";
import Settings from "./components/user/Settings";
import { Login } from "./components/common/Login";
import { Signup } from "./components/common/Signup";
import { ExpenceSidebar } from "./components/layouts/ExpenceSidebar";
import Expense from "./components/user/Expense";
import ExpenceForm from "./components/expence/ExpenceForm";
import ExpenseDetails from "./components/expence/ExpenseDetails";
import EditExpense from "./components/expence/EditExpense";
import ExpenseManagement from "./components/expence/ExpenseManagement";
import ContactPage from "./components/user/ContactPage";

// Import new Income components
import IncomeForm from "./components/income/IncomeForm";
import IncomeList from "./components/income/IncomeList";
import EditIncome from "./components/income/EditIncome";
import IncomeDetails from "./components/income/IncomeDetails";

import axios from "axios";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Add global axios interceptor
import { toast } from 'react-toastify';

// Admin components
import AdminSidebar from "./components/layouts/AdminSidebar";
import AdminDashboard from "./components/admin/AdminDashboard";
import UserList from "./components/admin/UserList";
import UserDetails from "./components/admin/UserDetails";
import AddUser from "./components/admin/AddUser";
import EditUser from "./components/admin/EditUser";
import ExpenseList from "./components/admin/ExpenseList";
import AdminExpenseDetails from "./components/admin/AdminExpenseDetails";
import AdminReports from "./components/admin/AdminReports";
import AdminSettings from "./components/admin/AdminSettings";
import AdminProfile from "./components/admin/AdminProfile";
import AdminCategories from "./components/admin/AdminCategories";
import AdminIncomes from "./components/admin/incomes/AdminIncomes";
import AdminIncomeDetails from "./components/admin/incomes/AdminIncomeDetails";

// Import Bootstrap CSS (make sure it's before your custom CSS)
import 'bootstrap/dist/css/bootstrap.min.css';
import "./assets/adminlte.css";
import "./assets/adminlte.min.css";
// Import Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css';
// Import your custom CSS after all other CSS imports
import "./index.css";


import { ResetPassword } from "./components/common/ResetPassword";
import { ForgotPassword } from "./components/common/ForgotPassword";
import PrivateRoutes from "./hooks/PrivateRoutes";
import AdminRoutes from "./hooks/AdminRoutes";
import LandingPage from "./components/common/LandingPage";

// Add global styles to remove any extra whitespace
const globalStyles = {
  body: {
    margin: 0,
    padding: 0,
    overflowX: 'hidden',
    boxSizing: 'border-box'
  },
  html: {
    margin: 0,
    padding: 0,
    overflowX: 'hidden',
    boxSizing: 'border-box'
  }
};

function App() {
  useEffect(() => {
    // Apply global styles
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflowX = 'hidden';
    
    // Add border-box to ensure consistent sizing
    document.body.style.boxSizing = 'border-box';
    
    // Set default axios base URL
    axios.defaults.baseURL = "http://localhost:3000";
    
    // Add global axios interceptors for error handling
    axios.interceptors.response.use(
      response => response,
      error => {
        if (error.code === 'ERR_NETWORK') {
          toast.error('Network error: Cannot connect to the server. Please make sure the backend is running at http://localhost:3000', { 
            toastId: 'network-error',
            autoClose: false 
          });
        }
        return Promise.reject(error);
      }
    );
    
    // Add console log to verify correct base URL
    console.log('Axios base URL set to:', axios.defaults.baseURL);
    
    // Check if mobile and add class accordingly
    const checkIfMobile = () => {
      if (window.innerWidth < 992) {
        document.body.classList.add('mobile-view');
      } else {
        document.body.classList.remove('mobile-view');
      }
    };
    
    // Initial check
    checkIfMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/signup") {
      // For login/signup pages, remove all classes
      document.body.className = ""; 
    } else {
      // For other pages, set classes but preserve mobile-view if it exists
      const isMobile = document.body.classList.contains('mobile-view');
      document.body.className = "layout-fixed sidebar-expand-lg bg-body-tertiary sidebar-open app-loaded";
      if (isMobile) {
        document.body.classList.add('mobile-view');
      }
    }
  }, [location.pathname]);

  // Add a function to check if user is admin sarjan@gmail.com
  const checkSpecialAdminRoute = () => {
    const email = localStorage.getItem("email");
    const isSpecialAdmin = email && email.toLowerCase() === "sarjan@gmail.com";
    
    if (isSpecialAdmin) {
      // Ensure role is set correctly
      localStorage.setItem("role", "admin");
      console.log("Special admin detected, redirecting to admin dashboard");
      return <Navigate to="/admin/dashboard" />;
    }
    return null;
  };

  return (
    <div
      className={
        location.pathname === "/login" || location.pathname === "/signup"
          ? ""
          : "app-wrapper"
      }
    >
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={1}
        enableMultiContainer={false}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotpassword" element={<ForgotPassword/>} />
        <Route path="/resetpassword/:token" element={<ResetPassword/>} />
        
        {/* User Routes - Regular users only, admins are redirected to admin dashboard */}
        <Route element={<PrivateRoutes />}>
          <Route element={<UserSidebar />}>
            <Route path="/user/dashboard" element={<Dashboard />} />
            <Route path="/user/profile" element={<UserProfile />} />
            <Route path="/user/contact" element={<ContactPage />} />
            <Route path="/user/expense-management" element={<ExpenseManagement />} />
            <Route path="/user/expense-form" element={<ExpenceForm />} />
            <Route path="/user/add-expense" element={<ExpenceForm />} />
            <Route path="/user/expenses" element={<Expense />} />
            <Route path="/user/expense-details/:id" element={<ExpenseDetails />} />
            <Route path="/user/edit-expense/:id" element={<EditExpense />} />
            <Route path="/user/reports" element={<Reports />} />
            <Route path="/user/settings" element={<Settings />} />
            
            {/* Income routes */}
            <Route path="/user/income" element={<IncomeList />} />
            <Route path="/user/add-income" element={<IncomeForm />} />
            <Route path="/user/edit-income/:id" element={<EditIncome />} />
            <Route path="/user/income/:id" element={<IncomeDetails />} />
          </Route>
          <Route element={<ExpenceSidebar />}>
            {/* Add routes for the expense sidebar here */}
          </Route>
        </Route>
        
        {/* Admin Routes - Admin users only */}
        <Route element={<AdminRoutes />}>
          <Route element={<AdminSidebar />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserList />} />
            <Route path="/admin/users/:id" element={<UserDetails />} />
            <Route path="/admin/users/add" element={<AddUser />} />
            <Route path="/admin/users/edit/:id" element={<EditUser />} />
            <Route path="/admin/expenses" element={<ExpenseList />} />
            <Route path="/admin/expenses/:id" element={<AdminExpenseDetails />} />
            <Route path="/admin/incomes" element={<AdminIncomes />} />
            <Route path="/admin/incomes/:id" element={<AdminIncomeDetails />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
