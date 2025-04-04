import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

export const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [fallbackLinks, setFallbackLinks] = useState([]);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      axios.defaults.baseURL = "http://localhost:3000";
      
      const response = await axios.post('/user/forgotpassword', { email: data.email });
      
      if (response.status === 200) {
        toast.success('Password reset link sent to your email');
        
        // Store the reset links for direct access
        if (response.data) {
          if (response.data.resetLink) {
            setResetLink(response.data.resetLink);
          }
          if (response.data.fallbackLinks && Array.isArray(response.data.fallbackLinks)) {
            setFallbackLinks(response.data.fallbackLinks);
          }
        }
        
        data.email = '';
      }
    } catch (err) {
      console.error('Error details:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send reset link. Please try again later.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to directly navigate to reset password page
  const handleDirectAccess = (link) => {
    try {
      // Extract the token from the URL
      const tokenPart = link.split('/resetpassword/')[1];
      if (tokenPart) {
        navigate(`/resetpassword/${tokenPart}`);
      } else {
        toast.error('Invalid reset link format');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Failed to navigate to reset page');
    }
  };

  return (
    <div className="forgot-password-container">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Sending reset link...</p>
          </div>
        </div>
      )}
      <div className="forgot-password-card">
        <div className="logo-section">
          <div className="logo"></div>
          <h1>FORGOT PASSWORD</h1>
          <p>Enter your email to receive a password reset link</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              placeholder="Enter your email"
              disabled={loading}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border-sm" style={{display: 'inline-block', marginRight: '8px'}}></span>
                Sending...
              </>
            ) : 'Send Reset Link'}
          </button>

          {(resetLink || fallbackLinks.length > 0) && (
            <div className="direct-reset-section">
              <h3 className="reset-header">Reset Your Password</h3>
              <p className="info-text">Click the button below to go directly to the password reset page:</p>
              
              {resetLink && (
                <button 
                  type="button"
                  onClick={() => handleDirectAccess(resetLink)}
                  className="direct-reset-button"
                >
                  Go to Reset Password Page
                </button>
              )}
              
              {fallbackLinks.length > 0 && (
                <div className="fallback-links">
                  <p className="fallback-info">
                    If the main button doesn't work, try one of these alternatives:
                  </p>
                  <div className="fallback-buttons">
                    {fallbackLinks.map((link, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDirectAccess(link)}
                        className="fallback-button"
                      >
                        Alternative {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Link to="/login" className="back-link">
            Back to Login
          </Link>
        </form>
      </div>

      <ToastContainer position="top-center" />

      <style>{`
        .forgot-password-container {
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

        .forgot-password-card {
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

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 25px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #000;
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

        .direct-reset-section {
          margin: 1.5rem 0;
          padding: 1rem;
          background-color: #f0f9ff;
          border: 1px solid #cfe2ff;
          border-radius: 10px;
        }
        
        .reset-header {
          font-size: 18px;
          font-weight: 600;
          color: #0c63e4;
          margin-bottom: 10px;
          text-align: center;
        }

        .info-text {
          margin-bottom: 1rem;
          font-size: 14px;
          color: #0d6efd;
          text-align: center;
        }

        .direct-reset-button {
          width: 100%;
          padding: 10px;
          background: #0d6efd;
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          margin-bottom: 1rem;
        }

        .direct-reset-button:hover {
          background: #0a58ca;
        }
        
        .fallback-links {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px dashed #cfe2ff;
        }
        
        .fallback-info {
          font-size: 13px;
          color: #6c757d;
          margin-bottom: 10px;
          text-align: center;
        }
        
        .fallback-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        
        .fallback-button {
          padding: 8px 12px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        
        .fallback-button:hover {
          background: #5a6268;
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
      `}</style>
    </div>
  );
};