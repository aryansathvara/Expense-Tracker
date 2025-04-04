import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const userId = localStorage.getItem('id');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`/users/${userId}`);
        const userData = response.data.data;
        setUser(userData);
        
        // Set form data from user data
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    // Validate profile update
    if (!formData.firstName.trim()) {
      setMessage({ type: 'error', text: 'First name is required' });
      return false;
    }
    
    if (!formData.lastName.trim()) {
      setMessage({ type: 'error', text: 'Last name is required' });
      return false;
    }
    
    if (!formData.email.trim()) {
      setMessage({ type: 'error', text: 'Email is required' });
      return false;
    }
    
    // Validate password update if attempting to change password
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setMessage({ type: 'error', text: 'Current password is required to update password' });
        return false;
      }
      
      if (formData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
        return false;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        return false;
      }
    }
    
    return true;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSaving(true);
      setMessage({ type: '', text: '' });
      
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      };
      
      // Add password update if changing password
      if (formData.newPassword && formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      const response = await axios.put(`/users/${userId}`, updateData);
      
      if (response.status === 200) {
        setUser(response.data.data);
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        
        // Clear password fields after successful update
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="alert alert-warning" role="alert">
        Unable to load user profile. Please try again later.
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <h1 className="mb-4">Settings</h1>
      
      {message.text && (
        <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'}`} role="alert">
          {message.text}
        </div>
      )}
      
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">Profile Settings</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleProfileUpdate}>
                <div className="mb-3">
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="firstName" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="lastName" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <hr className="my-4" />
                <h6>Change Password</h6>
                
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">Current Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="currentPassword" 
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="newPassword" 
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                  />
                  <div className="form-text">
                    Password must be at least 6 characters long.
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="confirmPassword" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="card mb-4">
            <div className="card-header bg-info text-white">
              <h5 className="card-title mb-0">Account Information</h5>
            </div>
            <div className="card-body">
              <p><strong>User ID:</strong> {user._id}</p>
              <p><strong>Role:</strong> {user.roleId?.name || 'User'}</p>
              <p><strong>Account Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header bg-warning">
              <h5 className="card-title mb-0">Danger Zone</h5>
            </div>
            <div className="card-body">
              <p>These actions are irreversible. Please proceed with caution.</p>
              <button 
                className="btn btn-danger"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    // Handle account deletion
                    alert('Account deletion functionality would be implemented here.');
                  }
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 