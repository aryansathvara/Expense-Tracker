import React, { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import useToastConfig from '../../hooks/useToastConfig';
import "../../assets/login.css";

export const Signup = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Use custom toast hook
  const toast = useToastConfig();

  const submitHandler = async (data) => {
    try {
      setLoading(true);
      setApiError(null);
      
      // Format data to match backend expectations
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        age: parseInt(data.age),
        status: true, // Set status to true as required by backend
        roleId: "67c6825059581189a5ac0444" // Use the role ID format expected by the backend
      };
      
      console.log("Attempting signup with:", {
        ...userData,
        password: "[HIDDEN]" // Don't log the actual password
      });
      
      // Ensure baseURL is set correctly
      axios.defaults.baseURL = "http://localhost:3000";

      // Add request tracing headers
      const headers = {
        'Content-Type': 'application/json',
        'X-Request-Source': 'signup-component'
      };
      
      try {
        const res = await axios.post("/user", userData, { headers });
        console.log("Signup response:", res);
        
        if (res.status === 201 || res.status === 200) {
          toast.success("Account created successfully! Please login.");
          navigate("/login");
          return;
        }
      } catch (apiError) {
        console.error("Signup failed:", apiError);
        
        // Log more details about the error
        if (apiError.response) {
          console.error("Error response data:", apiError.response.data);
          console.error("Error response status:", apiError.response.status);
          console.error("Error response headers:", apiError.response.headers);
        } else if (apiError.request) {
          console.error("No response received, request details:", apiError.request);
        }
        
        // Show error
        throw apiError;
      }
    } catch (error) {
      console.error("Signup error:", error);
      
      // Extract error message
      let errorMessage;
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else {
        errorMessage = "Signup failed. Please check your information and try again.";
      }
      
      setApiError(errorMessage);
      toast.error(errorMessage);
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
            <p>Creating your account...</p>
          </div>
        </div>
      )}
      <div className="login-card">
        <div className="brand">
          <div className="brand-logo"></div>
          <h1>CREATE ACCOUNT</h1>
          <p>Sign up to get started</p>
        </div>
        {apiError && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {apiError}
          </div>
        )}
        <form onSubmit={handleSubmit(submitHandler)}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input 
              type="text" 
              id="firstName" 
              {...register("firstName", { required: "First name is required" })} 
              placeholder="Enter first name" 
            />
            {errors.firstName && <span className="error">{errors.firstName.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input 
              type="text" 
              id="lastName" 
              {...register("lastName", { required: "Last name is required" })} 
              placeholder="Enter last name" 
            />
            {errors.lastName && <span className="error">{errors.lastName.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })} 
              placeholder="Enter email" 
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              {...register("password", { 
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })} 
              placeholder="Enter password" 
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input 
              type="number" 
              id="age" 
              {...register("age", { 
                required: "Age is required",
                min: {
                  value: 18,
                  message: "You must be at least 18 years old"
                }
              })} 
              placeholder="Enter age" 
            />
            {errors.age && <span className="error">{errors.age.message}</span>}
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border-sm" role="status" aria-hidden="true"></span>
                <span className="ms-2">Creating Account...</span>
              </>
            ) : 'Sign Up'}
          </button>
        </form>
        <div className="social-login">
          <p>Or sign up with</p>
          <div className="social-buttons">
            <div className="social-btn">G</div>
            <div className="social-btn">F</div>
          </div>
        </div>
        <div className="signup-link">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
