import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user',
    status: 'active'
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate phone (optional field)
    if (formData.phone && !/^\+?[0-9\s-]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data for API
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        role: formData.role,
        status: formData.status
      };
      
      // Make API call
      await axios.post('/auth/register', userData);
      
      toast.success('User created successfully!');
      navigate('/admin/users');
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Handle specific error messages from API
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create user. Please try again.');
      }
      
      // If API is unavailable, show a demo success (for development purposes)
      if (!error.response) {
        toast.info('Using demo mode. User would be created in production.');
        setTimeout(() => {
          navigate('/admin/users');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title mb-0">Add New User</h1>
          <p className="text-muted">Create a new user account</p>
        </div>
        <div>
          <Link to="/admin/users" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Users
          </Link>
        </div>
      </div>
      
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="firstName" className="form-label">First Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
                {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
              </div>
              
              <div className="col-md-6">
                <label htmlFor="lastName" className="form-label">Last Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
                {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="email" className="form-label">Email <span className="text-danger">*</span></label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              
              <div className="col-md-6">
                <label htmlFor="phone" className="form-label">Phone</label>
                <input
                  type="tel"
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number (optional)"
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="password" className="form-label">Password <span className="text-danger">*</span></label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                <div className="form-text text-muted">Password must be at least 6 characters</div>
              </div>
              
              <div className="col-md-6">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password <span className="text-danger">*</span></label>
                <input
                  type="password"
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                />
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              </div>
            </div>
            
            <div className="row mb-4">
              <div className="col-md-6">
                <label htmlFor="role" className="form-label">User Role</label>
                <select
                  className="form-select"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">Regular User</option>
                  <option value="admin">Administrator</option>
                </select>
                <div className="form-text text-muted">
                  Admins have full access to all features and settings
                </div>
              </div>
              
              <div className="col-md-6">
                <label htmlFor="status" className="form-label">Account Status</label>
                <select
                  className="form-select"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="form-text text-muted">
                  Inactive accounts cannot log in to the system
                </div>
              </div>
            </div>
            
            <div className="border-top pt-3 d-flex justify-content-between">
              <Link to="/admin/users" className="btn btn-outline-secondary">
                Cancel
              </Link>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating User...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus-fill me-2"></i>
                    Create User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="card mt-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Information</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6><i className="bi bi-shield-lock me-2 text-primary"></i>Password Requirements</h6>
              <ul className="small text-muted">
                <li>Minimum 6 characters in length</li>
                <li>For better security, use a mix of letters, numbers, and symbols</li>
                <li>Avoid using easily guessable information</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6><i className="bi bi-info-circle me-2 text-primary"></i>Account Creation Notes</h6>
              <ul className="small text-muted">
                <li>New users will receive a welcome email with login instructions</li>
                <li>User accounts can be edited or deactivated later</li>
                <li>Admins can reset passwords for users if needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser; 