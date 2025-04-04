import axios from "axios";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import useToastConfig from '../../hooks/useToastConfig';
import "../../assets/login.css";

export const Login = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [networkStatus, setNetworkStatus] = useState({ checking: true, connected: false });

  // Use custom toast hook
  const toast = useToastConfig();

  // Check backend connection on component mount
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        // Try a simple endpoint that's guaranteed to exist instead of health
        await axios.get("http://localhost:3000/users", { timeout: 3000 });
        setNetworkStatus({ checking: false, connected: true });
      } catch (error) {
        console.log("Backend connection check error:", error.message);
        // Any response (even 404) means server is running
        if (error.response) {
          // If we get any response, server is up
          setNetworkStatus({ checking: false, connected: true });
        } else if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
          // Only if we get a network error, server is down
          setNetworkStatus({ checking: false, connected: false });
          toast.error("Cannot connect to the backend server. Please make sure it's running.");
        } else {
          // Any other error, server is probably up
          setNetworkStatus({ checking: false, connected: true });
        }
      }
    };

    checkBackendConnection();
    
    // Add cleanup to prevent memory leaks
    return () => {
      // Cancel any pending requests
      const controller = new AbortController();
      controller.abort();
    };
  }, []);  // Remove toast from dependency array to prevent re-running

  const submitHandler = async (data) => {
    setLoading(true);
    setLoginError("");
    
    try {
      console.log("Attempting login with email:", data.email);
      
      // Log request in detail before sending
      console.log("Login request:", {
        url: "http://localhost:3000/user/login",
        method: "POST",
        data: { email: data.email, password: "***" }
      });
      
      const res = await axios.post("http://localhost:3000/user/login", {
        email: data.email,
        password: data.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 8000 // 8 seconds timeout
      });
      
      // Log response in detail
      console.log("Login response status:", res.status);
      console.log("Login response data:", res.data ? {
        message: res.data.message,
        hasData: !!res.data.data,
        userData: res.data.data ? {
          id: res.data.data._id,
          email: res.data.data.email,
          name: `${res.data.data.firstName} ${res.data.data.lastName}`,
          role: res.data.data.roleId?.name || "user"
        } : null
      } : "No data");
      
      if (res.status === 201 && res.data && res.data.data) {
        // Get user role from response
        const userRole = res.data.data.roleId?.name || "user";
        
        // Store user data in localStorage
        localStorage.setItem("id", res.data.data._id);
        localStorage.setItem("role", userRole);
        localStorage.setItem("email", res.data.data.email || "");
        localStorage.setItem("name", `${res.data.data.firstName} ${res.data.data.lastName}` || "");
        
        // Also store last login time
        localStorage.setItem("lastLogin", new Date().toString());
        
        // Log user details for debugging
        console.log(`User logged in: ${res.data.data.email} with role: ${userRole}`);
        
        // Special handling for known admin email
        if (data.email.toLowerCase() === "sarjan@gmail.com") {
          console.log("Admin user detected: sarjan@gmail.com");
          localStorage.setItem("role", "admin");
          navigate("/admin/dashboard");
          toast.success(`Welcome back, ${res.data.data.firstName}! Redirecting to admin dashboard.`);
          return;
        }

        // Show success toast notification
        toast.success(`Welcome back, ${res.data.data.firstName}!`);

        // Redirect based on user role - case insensitive check
        if (userRole && userRole.toLowerCase() === "admin") {
          console.log("Redirecting to admin dashboard");
          navigate("/admin/dashboard");
        } else {
          console.log("Redirecting to user dashboard");
          navigate("/user/dashboard");
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle network errors specially
      if (error.code === "ERR_NETWORK") {
        setLoginError("Cannot connect to the server. Please make sure the backend is running at http://localhost:3000");
        setNetworkStatus({ checking: false, connected: false });
      } else {
        // Extract error message from response if available
        let errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Login failed. Please check your credentials.";
        
        // Add email to error message if it's an email not found error
        if (errorMessage.includes("No account found")) {
          errorMessage = `No account found for email "${data.email}". Please check your email or sign up.`;
        }
        
        setLoginError(errorMessage);
        // Show error toast notification
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Logging in...</p>
          </div>
        </div>
      )}
      <div className="login-card">
        <div className="brand">
          <div className="brand-logo"></div>
          <h1>LOGIN</h1>
          <p>Enter your credentials to access your account</p>
        </div>
        
        {!networkStatus.connected && !networkStatus.checking && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Cannot connect to the backend server. Please make sure it's running.
          </div>
        )}
        
        {loginError && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-circle-fill me-2"></i>
            {loginError}
          </div>
        )}
        
        <form onSubmit={handleSubmit(submitHandler)}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address format"
                }
              })}
              placeholder="Enter email"
            />
            {errors.email && (
              <div className="invalid-feedback">
                {errors.email.message}
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
              placeholder="Enter password"
            />
            {errors.password && (
              <div className="invalid-feedback">
                {errors.password.message}
              </div>
            )}
          </div>
          <div className="remember-forgot">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember Me</label>
            </div>
            <Link to="/forgotpassword" className="forgot-password">
              Forgot Password?
            </Link>
          </div>
          <button type="submit" className="login-btn" disabled={loading || !networkStatus.connected}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        <div className="social-login">
          <p>Or login with</p>
          <div className="social-buttons">
            <div className="social-btn">G</div>
            <div className="social-btn">F</div>
          </div>
        </div>
        <div className="signup-link">
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
