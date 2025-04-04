import axios from 'axios';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

export const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const submitHandler = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    const obj = {
      token: token,
      password: data.password
    };

    try {
      axios.defaults.baseURL = "http://localhost:3000";
      
      await axios.post("/user/resetpassword", obj);
      
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      const errorMessage = err.response?.data?.message || "Invalid or expired token. Please request a new password reset.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Resetting password...</p>
          </div>
        </div>
      )}
      <div className="reset-password-card">
        <div className="logo-section">
          <div className="logo"></div>
          <h1>Reset Password</h1>
          <p>Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit(submitHandler)}>
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                {...register("password", { 
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  } 
                })}
                placeholder="Enter new password"
                disabled={loading}
              />
              <span className="eye-icon" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.password && <span className="error-message">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                {...register("confirmPassword", { 
                  required: "Please confirm your password",
                  validate: (value, formValues) => 
                    value === formValues.password || "Passwords do not match"
                })}
                placeholder="Confirm new password"
                disabled={loading}
              />
              <span className="eye-icon" onClick={toggleConfirmPasswordVisibility}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border-sm" style={{display: 'inline-block', marginRight: '8px'}}></span>
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>

          <a href="/login" className="back-link">
            Back to Login
          </a>
        </form>
      </div>

      <ToastContainer position="top-center" />

      <style>{`
        .reset-password-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f5f5f5;
          padding: 20px;
          box-sizing: border-box;
          margin: 0;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .reset-password-card {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .logo-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo {
          width: 60px;
          height: 60px;
          background: #000;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
        }

        .logo-section h1 {
          font-size: 24px;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .logo-section p {
          color: #666;
          font-size: 14px;
          margin-bottom: 0;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          color: #333;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .password-container {
          position: relative;
          width: 100%;
        }

        .password-container input {
          width: 100%;
          padding: 12px 16px;
          padding-right: 40px;
          border: 1px solid #ddd;
          border-radius: 25px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .password-container input:focus {
          outline: none;
          border-color: #000;
        }

        .eye-icon {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #555;
        }

        .error-message {
          color: #dc3545;
          font-size: 12px;
          margin-top: 0.5rem;
          display: block;
        }

        .submit-button {
          width: 100%;
          padding: 12px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 1.5rem;
          transition: background-color 0.3s ease;
        }

        .submit-button:hover {
          background: #333;
        }

        .submit-button:disabled {
          background: #666;
          cursor: not-allowed;
        }
        
        .back-link {
          display: block;
          text-align: center;
          color: #666;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s ease;
        }

        .back-link:hover {
          color: #000;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .loading-spinner {
          text-align: center;
          padding: 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .spinner {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #000;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .spinner-border-sm {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 0.2em solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spin .75s linear infinite;
          vertical-align: text-bottom;
        }
      `}</style>
    </div>
  );
};