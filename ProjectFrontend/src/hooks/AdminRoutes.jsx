import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const useAdminAuth = () => {
  const [authState, setAuthState] = useState({ 
    isLoggedin: false, 
    isAdmin: false,
    loading: true 
  });
  
  useEffect(() => {
    const id = localStorage.getItem("id");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");
    
    if (id) {
      // Check if the user is sarjan@gmail.com which should always be treated as admin
      const isSpecialAdmin = email && email.toLowerCase() === "sarjan@gmail.com";
      
      // Check if the role is admin (case-insensitive)
      const isRoleAdmin = role && role.toLowerCase() === "admin";
      
      setAuthState({ 
        isLoggedin: true, 
        // User is admin if either they have the admin role or are the special admin user
        isAdmin: isRoleAdmin || isSpecialAdmin, 
        loading: false 
      });
      
      // If it's the special admin but role isn't set correctly, fix it in localStorage
      if (isSpecialAdmin && !isRoleAdmin) {
        console.log("Special admin user detected, updating role in localStorage");
        localStorage.setItem("role", "admin");
      }
    } else {
      setAuthState({ 
        isLoggedin: false, 
        isAdmin: false, 
        loading: false 
      });
    }
  }, []);
  
  return authState;
};

const AdminRoutes = () => {
  const { isLoggedin, isAdmin, loading } = useAdminAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Checking admin credentials...</span>
        </div>
        <p className="ms-2">Verifying admin access...</p>
      </div>
    );
  }
  
  if (!isLoggedin) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin) {
    console.log("User is not an admin, redirecting to user dashboard");
    return <Navigate to="/user/dashboard" />;
  }
  
  console.log("Admin access confirmed, loading admin dashboard");
  return <Outlet />;
};

export default AdminRoutes; 