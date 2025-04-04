import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const useAuth = () => {
    const [authState, setAuthState] = useState({ isLoggedin: false, role: "", isAdmin: false });
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const id = localStorage.getItem("id");
      const role = localStorage.getItem("role");
      const email = localStorage.getItem("email");
  
      if (id) {
        // Check if the user is sarjan@gmail.com which should always be treated as admin
        const isSpecialAdmin = email && email.toLowerCase() === "sarjan@gmail.com";
        
        // Check if the role is admin (case-insensitive)
        const isAdmin = (role && role.toLowerCase() === "admin") || isSpecialAdmin;
        
        // If it's the special admin but role isn't set correctly, fix it
        if (isSpecialAdmin && role && role.toLowerCase() !== "admin") {
          console.log("Special admin user detected in PrivateRoutes, updating role");
          localStorage.setItem("role", "admin");
        }
        
        setAuthState({ isLoggedin: true, role, isAdmin });
      }
      setLoading(false);
    }, []);
  
    return { ...authState, loading };
  };
  
  const PrivateRoutes = () => {
    const auth = useAuth();
  
    if (auth.loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Checking authentication...</span>
          </div>
          <p className="ms-2">Verifying your credentials...</p>
        </div>
      );
    }
    
    // If not logged in, redirect to login
    if (!auth.isLoggedin) {
      return <Navigate to="/login" />;
    }
    
    // If user is an admin, redirect them to admin dashboard
    // This ensures admins only use the admin interface
    if (auth.isAdmin) {
      console.log("Admin user attempting to access user routes, redirecting to admin dashboard");
      return <Navigate to="/admin/dashboard" />;
    }
    
    // Regular user can access user routes
    return <Outlet />;
  };

  export default PrivateRoutes;