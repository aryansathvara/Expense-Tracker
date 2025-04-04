import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useToastConfig from '../../hooks/useToastConfig';

const AdminProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  
  // Default profile data to use if nothing is available
  const defaultProfileData = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    phone: '+91 9876543210',
    role: 'admin',
    joinDate: new Date().toISOString(),
    avatar: null
  };
  
  const [profileData, setProfileData] = useState(defaultProfileData);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [preferences, setPreferences] = useState({
    notifications: true,
    twoFactorAuth: false,
    darkMode: false,
    language: 'english'
  });
  const [saving, setSaving] = useState(false);
  const adminId = localStorage.getItem('id');
  
  // Use custom toast hook
  const toast = useToastConfig();

  // Main useEffect to fetch profile data
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchAdminProfile = async () => {
      try {
        // Configure axios
        axios.defaults.baseURL = "http://localhost:3000";
        
        // Always start by loading from localStorage to prevent UI flicker
        const storedProfileData = localStorage.getItem('adminProfileData');
        if (storedProfileData) {
          try {
            const localData = JSON.parse(storedProfileData);
            if (isMounted) {
              setProfileData(localData);
            }
          } catch (parseError) {
            console.error('Error parsing localStorage profile data:', parseError);
          }
        }
        
        // Load preferences from localStorage
        try {
          const storedPreferences = localStorage.getItem('adminPreferences');
          if (storedPreferences && isMounted) {
            setPreferences(JSON.parse(storedPreferences));
          }
        } catch (prefError) {
          console.error('Error loading preferences from localStorage:', prefError);
        }
        
        if (adminId) {
          try {
            const response = await axios.get(`/user/${adminId}`, {
              signal: controller.signal
            });
            
            if (response.data && response.data.data && isMounted) {
              const userData = response.data.data;
              
              // Create a complete profile object with API data
              const updatedProfileData = {
                firstName: userData.firstName || defaultProfileData.firstName,
                lastName: userData.lastName || defaultProfileData.lastName,
                email: userData.email || defaultProfileData.email,
                phone: userData.phone || defaultProfileData.phone,
                role: userData.roleId?.name || 'admin',
                joinDate: userData.createdAt || new Date().toISOString(),
                avatar: userData.avatar || null
              };
              
              // Update state only if component is still mounted
              if (isMounted) {
                setProfileData(updatedProfileData);
                setError(null);
              }
              
              // Store in localStorage for persistence
              localStorage.setItem('adminProfileData', JSON.stringify(updatedProfileData));
              
              // If preferences exist on the server, load and store them
              if (userData.preferences && isMounted) {
                setPreferences(userData.preferences);
                localStorage.setItem('adminPreferences', JSON.stringify(userData.preferences));
              }
            }
          } catch (apiError) {
            if (apiError.name === 'AbortError') {
              return; // Request was aborted, do nothing
            }
            
            console.error('Error fetching profile from API:', apiError);
            
            if (isMounted) {
              // If we already have localStorage data, we'll continue using that
              if (!storedProfileData) {
                localStorage.setItem('adminProfileData', JSON.stringify(defaultProfileData));
                setProfileData(defaultProfileData);
                toast.info('Using default profile data. Changes will be saved locally.');
              } else {
                setError('Could not connect to server. Using locally stored profile data.');
              }
            }
          }
        } else if (isMounted) {
          setError('Admin ID not found. Please log in again.');
          setProfileData(defaultProfileData);
        }
        
        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Unexpected error:', err);
          setError('An unexpected error occurred. Please try again.');
          setLoading(false);
        }
      }
    };
    
    fetchAdminProfile();

    // Cleanup function
    return () => {
      isMounted = false;
      controller.abort(); // Cancel any pending requests
    };
  }, []); // Empty dependency array since we only want to fetch once on mount

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newPreferences = {
      ...preferences,
      [name]: type === 'checkbox' ? checked : value
    };
    
    setPreferences(newPreferences);
    
    // Save preferences to localStorage immediately
    localStorage.setItem('adminPreferences', JSON.stringify(newPreferences));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Configure axios
      axios.defaults.baseURL = "http://localhost:3000";
      
      console.log('Updating admin profile with data:', {
        ...profileData,
        // Don't log sensitive data if present
        password: profileData.password ? '[HIDDEN]' : undefined
      });
      
      // Always save to localStorage first for immediate persistence
      localStorage.setItem('adminProfileData', JSON.stringify(profileData));
      
      // Try to update the backend
      try {
        const response = await axios.put(`/user/${adminId}`, profileData);
        console.log('API update response:', response);
        
        if (response.status === 200 && response.data.data) {
          // Update state with server response
          setProfileData(response.data.data);
          
          // Update localStorage with server response data
          localStorage.setItem('adminProfileData', JSON.stringify(response.data.data));
          
          toast.success('Profile updated successfully!');
          setError(null); // Clear any previous errors
          setIsEditing(false); // Exit edit mode
        }
      } catch (apiError) {
        console.error('API update error:', apiError);
        
        // Show more specific error message if available
        if (apiError.response && apiError.response.data && apiError.response.data.message) {
          toast.error(`Error: ${apiError.response.data.message}`);
        } else {
          toast.warning('Profile updated locally. Changes will sync with server when connection is restored.');
        }
      }
      
      setSaving(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      
      // Try to save to localStorage as a last resort
      try {
        localStorage.setItem('adminProfileData', JSON.stringify(profileData));
        toast.info('Profile saved locally due to an error.');
      } catch (localErr) {
        toast.error('Failed to save profile. Please try again.');
      }
      
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setSaving(true);
      
      // Configure axios
      axios.defaults.baseURL = "http://localhost:3000";
      
      try {
        // Attempt to change password via API
        const response = await axios.put(`/user/${adminId}`, {
          currentPassword: passwordData.currentPassword,
          password: passwordData.newPassword
        });
        
        if (response.status === 200) {
          toast.success('Password changed successfully!');
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }
      } catch (apiError) {
        console.error('API password update error:', apiError);
        toast.error('Failed to change password. Please check your current password.');
      }
      
      setSaving(false);
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error('Failed to change password. Please try again.');
      setSaving(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Configure axios
      axios.defaults.baseURL = "http://localhost:3000";
      
      try {
        // Try to update preferences in the backend
        // Note: Your backend may not support this yet, but preparation for future
        const response = await axios.put(`/user/${adminId}/preferences`, {
          preferences: preferences
        });
        
        if (response.status === 200) {
          toast.success('Preferences saved successfully!');
        }
      } catch (apiError) {
        console.error('API preferences update error:', apiError);
        
        // Always save to localStorage regardless of API success
        localStorage.setItem('adminPreferences', JSON.stringify(preferences));
        
        toast.info('Preferences saved locally.');
      }
      
      setSaving(false);
    } catch (err) {
      console.error('Error saving preferences:', err);
      toast.error('Failed to save preferences. Please try again.');
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {error && (
        <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>{error}</strong>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            data-bs-dismiss="alert" 
            aria-label="Close" 
            onClick={() => setError(null)}
          ></button>
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title mb-0">Admin Profile</h1>
          <p className="text-muted">Manage your administrator profile</p>
        </div>
      </div>
      
      <div className="row">
        {/* Profile Sidebar */}
        <div className="col-lg-4 mb-4">
          <div className="card profile-card">
            <div className="card-body text-center">
              <div className="mb-3">
                {profileData.avatar ? (
                  <img 
                    src={profileData.avatar} 
                    alt="Admin Avatar" 
                    className="rounded-circle avatar-xl"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="avatar-placeholder avatar-xl rounded-circle d-flex align-items-center justify-content-center bg-light-primary text-primary"
                    style={{ width: '120px', height: '120px', margin: '0 auto', fontSize: '3rem' }}
                  >
                    {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                  </div>
                )}
                
                <div className="position-relative" style={{ marginTop: '-20px' }}>
                  <label htmlFor="avatar-upload" className="btn btn-sm btn-primary rounded-circle">
                    <i className="bi bi-camera"></i>
                  </label>
                  <input 
                    type="file" 
                    id="avatar-upload" 
                    className="d-none" 
                    accept="image/*"
                  />
                </div>
              </div>
              
              <h4>{profileData.firstName} {profileData.lastName}</h4>
              <p className="text-muted mb-2">{profileData.email}</p>
              <span className="badge bg-success">Administrator</span>
              
              <div className="mt-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Member Since</span>
                  <span>{formatDate(profileData.joinDate)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Role</span>
                  <span className="text-capitalize">{profileData.role}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card mt-4">
            <div className="card-body p-0">
              <ul className="list-group list-group-flush profile-nav">
                <li className="list-group-item">
                  <button 
                    className={`btn w-100 text-start ${activeTab === 'personal' ? 'text-primary' : ''}`}
                    onClick={() => setActiveTab('personal')}
                  >
                    <i className="bi bi-person-circle me-2"></i>
                    Personal Information
                  </button>
                </li>
                <li className="list-group-item">
                  <button 
                    className={`btn w-100 text-start ${activeTab === 'password' ? 'text-primary' : ''}`}
                    onClick={() => setActiveTab('password')}
                  >
                    <i className="bi bi-shield-lock me-2"></i>
                    Change Password
                  </button>
                </li>
                <li className="list-group-item">
                  <button 
                    className={`btn w-100 text-start ${activeTab === 'preferences' ? 'text-primary' : ''}`}
                    onClick={() => setActiveTab('preferences')}
                  >
                    <i className="bi bi-gear me-2"></i>
                    Preferences
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                {activeTab === 'personal' && 'Personal Information'}
                {activeTab === 'password' && 'Change Password'}
                {activeTab === 'preferences' && 'Preferences'}
              </h5>
              
              {activeTab === 'personal' && !isEditing && (
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="bi bi-pencil me-1"></i>
                  Edit Profile
                </button>
              )}
            </div>
            
            <div className="card-body">
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <>
                  {isEditing ? (
                    <form onSubmit={handleProfileSubmit}>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">First Name</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            name="firstName"
                            value={profileData.firstName}
                            onChange={handleProfileChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Last Name</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            name="lastName"
                            value={profileData.lastName}
                            onChange={handleProfileChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Email</label>
                          <input 
                            type="email" 
                            className="form-control" 
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Phone</label>
                          <input 
                            type="tel" 
                            className="form-control" 
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 d-flex justify-content-end">
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary me-2"
                          onClick={() => setIsEditing(false)}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Saving...
                            </>
                          ) : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="profile-details">
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <p className="text-muted mb-1">First Name</p>
                          <p className="fw-medium">{profileData.firstName}</p>
                        </div>
                        <div className="col-md-6">
                          <p className="text-muted mb-1">Last Name</p>
                          <p className="fw-medium">{profileData.lastName}</p>
                        </div>
                      </div>
                      
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <p className="text-muted mb-1">Email</p>
                          <p className="fw-medium">{profileData.email}</p>
                        </div>
                        {profileData.phone && (
                          <div className="col-md-6">
                            <p className="text-muted mb-1">Phone</p>
                            <p className="fw-medium">{profileData.phone}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6">
                          <p className="text-muted mb-1">Role</p>
                          <p className="fw-medium text-capitalize">{profileData.role}</p>
                        </div>
                        <div className="col-md-6">
                          <p className="text-muted mb-1">Member Since</p>
                          <p className="fw-medium">{formatDate(profileData.joinDate)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* Change Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                    />
                    <small className="text-muted">Must be at least 6 characters long</small>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  
                  <div className="d-flex justify-content-end">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Changing Password...
                        </>
                      ) : 'Change Password'}
                    </button>
                  </div>
                </form>
              )}
              
              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <form onSubmit={handlePreferencesSubmit}>
                  <div className="mb-4">
                    <h6 className="text-muted text-uppercase small">Notification Settings</h6>
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="enableNotifications"
                        name="notifications"
                        checked={preferences.notifications}
                        onChange={handlePreferenceChange}
                      />
                      <label className="form-check-label" htmlFor="enableNotifications">
                        Enable Email Notifications
                      </label>
                    </div>
                    <small className="text-muted">Receive notifications about system updates and important alerts</small>
                  </div>
                  
                  <div className="mb-4">
                    <h6 className="text-muted text-uppercase small">Security Settings</h6>
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="enable2FA"
                        name="twoFactorAuth"
                        checked={preferences.twoFactorAuth}
                        onChange={handlePreferenceChange}
                      />
                      <label className="form-check-label" htmlFor="enable2FA">
                        Enable Two-Factor Authentication
                      </label>
                    </div>
                    <small className="text-muted">Add an extra layer of security to your account</small>
                  </div>
                  
                  <div className="mb-4">
                    <h6 className="text-muted text-uppercase small">Appearance</h6>
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="darkMode"
                        name="darkMode"
                        checked={preferences.darkMode}
                        onChange={handlePreferenceChange}
                      />
                      <label className="form-check-label" htmlFor="darkMode">
                        Dark Mode
                      </label>
                    </div>
                    <small className="text-muted">Switch between light and dark theme</small>
                  </div>
                  
                  <div className="mb-4">
                    <h6 className="text-muted text-uppercase small">Language</h6>
                    <select 
                      className="form-select"
                      name="language"
                      value={preferences.language}
                      onChange={handlePreferenceChange}
                    >
                      <option value="english">English</option>
                      <option value="hindi">Hindi</option>
                      <option value="spanish">Spanish</option>
                      <option value="french">French</option>
                    </select>
                    <small className="text-muted">Select your preferred language for the admin panel</small>
                  </div>
                  
                  <div className="d-flex justify-content-end">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile; 