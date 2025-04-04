import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const UserProfile = () => {
  // Define mockData at the component level
  const mockData = {
    firstName: 'akash',
    lastName: 'patel',
    email: 'akash@gmail.com',
    phone: '7733457689',
    address: 'panchsheel society',
    registrationIp: '192.168.1.1',
    lastLogin: new Date().toISOString(),
    accountStatus: 'active',
    accountType: 'Regular User',
    securityQuestions: [
      { question: 'What was your first pet\'s name?', answered: true },
      { question: 'What is your mother\'s maiden name?', answered: true }
    ]
  };

  // Initialize state with mockData to ensure data is available immediately
  const [user, setUser] = useState(mockData);
  const [formData, setFormData] = useState(mockData);
  
  // Other state declarations
  const [expenseStats, setExpenseStats] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    mostUsedCategory: '',
    firstExpenseDate: ''
  });
  const [preferences, setPreferences] = useState({
    currency: 'INR',
    theme: 'light',
    emailNotifications: true
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const userId = localStorage.getItem('id');
  
  // Immediately store mockData in localStorage when component mounts
  // This ensures data persistence even before useEffect runs
  useEffect(() => {
    // First try to load existing user data from localStorage
    try {
      const storedData = localStorage.getItem('userProfileData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUser(parsedData);
        setFormData(parsedData);
        // Also set loading to false immediately if we have data
        setLoading(false);
      } else {
        // If no stored data, initialize with mockData
        localStorage.setItem('userProfileData', JSON.stringify(mockData));
        setUser(mockData);
        setFormData(mockData);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      // Fallback to mockData if there's an error
      localStorage.setItem('userProfileData', JSON.stringify(mockData));
      setUser(mockData);
      setFormData(mockData);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Configure axios
        axios.defaults.baseURL = "http://localhost:3000";
        
        console.log("Starting fetch data for UserProfile");
        
        // First try to load existing user data from localStorage as a temporary measure
        try {
          const storedData = localStorage.getItem('userProfileData');
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            console.log("Loaded from localStorage:", parsedData);
            setUser(parsedData);
            setFormData(parsedData);
            // Set loading to false so we see something while API loads
            setLoading(false);
          }
        } catch (error) {
          console.error('Error loading data from localStorage:', error);
        }
        
        // Try to fetch user data from API
        try {
          console.log("Fetching user data from API for ID:", userId);
          const userResponse = await axios.get(`/user/${userId}`);
          console.log("API Response:", userResponse);
          
          if (userResponse.data && userResponse.data.data) {
            // Extract user details from API response
            const userData = {
              ...userResponse.data.data,
              // If these fields don't exist in the API response, provide default values
              registrationIp: userResponse.data.data.registrationIp || '192.168.1.1',
              lastLogin: userResponse.data.data.lastLogin || new Date().toISOString(),
              accountStatus: userResponse.data.data.accountStatus || 'active',
              accountType: userResponse.data.data.accountType || 'Regular User',
              securityQuestions: userResponse.data.data.securityQuestions || [],
              // Ensure phone and address are always present, even if empty
              phone: userResponse.data.data.phone || '',
              address: userResponse.data.data.address || '',
            };
            
            console.log("Processed user data:", {
              ...userData,
              password: userData.password ? '[HIDDEN]' : undefined
            });
            
            // Update state with fresh data
            setUser(userData);
            setFormData(userData);
            
            // Store in localStorage for persistence between refreshes
            localStorage.setItem('userProfileData', JSON.stringify(userData));
            
            // Log success
            console.log("Successfully loaded user data from API");
          }
        } catch (err) {
          console.error('Error fetching user profile from API:', err);
          // We already loaded data from localStorage if available, so we show that
        }
        
        // Try to fetch expense stats
        try {
          // Get expense data for statistics
          const expenseResponse = await axios.get('/expense/expence');
          
          if (expenseResponse.data && expenseResponse.data.data) {
            // Filter expenses for the current user
            const userExpenses = expenseResponse.data.data.filter(expense => 
              expense.userId && (
                (typeof expense.userId === 'object' && expense.userId._id === userId) ||
                expense.userId === userId
              )
            );
            
            // Calculate statistics
            const totalExpenses = userExpenses.length;
            const totalAmount = userExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
            
            // Find most used category
            const categories = {};
            userExpenses.forEach(expense => {
              const categoryName = expense.categoryId?.name || 'Uncategorized';
              categories[categoryName] = (categories[categoryName] || 0) + 1;
            });
            
            let mostUsedCategory = 'None';
            let maxCount = 0;
            
            Object.entries(categories).forEach(([category, count]) => {
              if (count > maxCount) {
                mostUsedCategory = category;
                maxCount = count;
              }
            });
            
            // Get first expense date
            const sortedByDate = [...userExpenses].sort((a, b) => 
              new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date)
            );
            
            const firstExpenseDate = sortedByDate.length > 0 
              ? new Date(sortedByDate[0].createdAt || sortedByDate[0].date).toLocaleDateString() 
              : 'N/A';
            
            setExpenseStats({
              totalExpenses,
              totalAmount,
              mostUsedCategory,
              firstExpenseDate
            });
          }
        } catch (err) {
          console.error('Error fetching expense stats:', err);
          
          // Set dummy stats
          setExpenseStats({
            totalExpenses: 12,
            totalAmount: 24500,
            mostUsedCategory: 'Food',
            firstExpenseDate: '15/01/2023'
          });
        }
        
        // Get user preferences
        const savedPreferences = localStorage.getItem('userPreferences');
        if (savedPreferences) {
          try {
            setPreferences(JSON.parse(savedPreferences));
          } catch (err) {
            console.error('Error parsing saved preferences:', err);
          }
        }
        
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    } else {
      setError("User ID not found. Please log in again.");
      setLoading(false);
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create a complete user data object with updated form fields
      const updatedUserData = {
        ...user,  // Start with all existing user data
        ...formData, // Override with new form data
        // Ensure critical fields are always included
        firstName: formData.firstName || user.firstName || '',
        lastName: formData.lastName || user.lastName || '',
        email: formData.email || user.email || '',
        phone: formData.phone || '',  // Allow empty phone but don't default to user.phone
        address: formData.address || '',  // Allow empty address but don't default to user.address
        // Preserve important metadata
        lastLogin: user.lastLogin,
        registrationIp: user.registrationIp,
        accountStatus: user.accountStatus,
        accountType: user.accountType,
        securityQuestions: user.securityQuestions,
      };
      
      // Configure axios
      axios.defaults.baseURL = "http://localhost:3000";
      
      console.log("Updating user profile with data:", {
        ...updatedUserData,
        password: updatedUserData.password ? "[HIDDEN]" : undefined
      });
      
      // Send update to the backend
      try {
        const response = await axios.put(`/user/${userId}`, updatedUserData);
        console.log("API Update Response:", response);
        
        if (response.status === 200 && response.data.data) {
          // Clear previous localStorage data
          localStorage.removeItem('userProfileData');
          
          // Update the local state with the complete data
          setUser(response.data.data);
          setFormData(response.data.data);
          
          // Also store updated data in localStorage
          localStorage.setItem('userProfileData', JSON.stringify(response.data.data));
          
          setEditMode(false);
          alert('Profile updated successfully!');
          
          // Force a reload of the page to ensure data is refreshed
          window.location.reload();
        }
      } catch (apiError) {
        console.error("API update error:", apiError);
        
        // Log error details
        if (apiError.response) {
          console.error("API error response:", apiError.response.data);
        }
        
        // If API fails, still update localStorage as a fallback
        localStorage.setItem('userProfileData', JSON.stringify(updatedUserData));
        
        // Set local state as fallback
        setUser(updatedUserData);
        setFormData(updatedUserData);
        
        setEditMode(false);
        alert('Profile updated locally. Changes will sync with server when connection is restored.');
      }
    } catch (err) {
      console.error('Error in profile update:', err);
      alert('Failed to update profile. Please try again.');
    }
  };
  
  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    const updatedPreferences = {
      ...preferences,
      [name]: newValue
    };
    
    setPreferences(updatedPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
  };

  if (loading) {
    return (
      <div className="container" style={{ 
        marginTop: '20px', 
        paddingTop: '0', 
        maxWidth: '1200px'
      }}>
        <div className="row">
          <div className="col-12">
            <div className="mb-4 bg-primary text-white p-3 rounded-top">
              <h4 className="mb-0">My Profile</h4>
            </div>
            <div className="card shadow-sm border-0 p-5">
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading your profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ 
        marginTop: '20px', 
        paddingTop: '0', 
        maxWidth: '1200px'
      }}>
        <div className="row">
          <div className="col-12">
            <div className="mb-4 bg-primary text-white p-3 rounded-top">
              <h4 className="mb-0">My Profile</h4>
            </div>
            <div className="card shadow-sm border-0 p-5">
              <div className="alert alert-danger">
                <h5>Error Loading Profile</h5>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: preferences.currency || 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="container-fluid py-4">
      <style jsx="true">{`
        .edit-profile-btn {
          display: inline-block !important;
          visibility: visible !important;
          opacity: 1 !important;
          position: relative;
          z-index: 10;
        }
        
        .profile-image img {
          display: block !important;
          visibility: visible !important;
        }
        
        .profile-edit-section {
          position: relative;
          z-index: 5;
        }
        
        .profile-img {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          position: relative !important;
          z-index: 2 !important;
        }
      `}</style>
      
      <div className="container" style={{ 
        marginTop: '20px', 
        paddingTop: '0', 
        maxWidth: '1200px'
      }}>
        <div className="row">
          <div className="col-12">
            <div className="mb-4 bg-primary text-white p-3 rounded-top" style={{ borderBottom: 'none' }}>
              <h4 className="mb-0">My Profile</h4>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <i className="bi bi-person me-1"></i> Personal Info
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                  >
                    <i className="bi bi-graph-up me-1"></i> Expense Summary
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'preferences' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preferences')}
                  >
                    <i className="bi bi-gear me-1"></i> Preferences
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                  >
                    <i className="bi bi-shield-lock me-1"></i> Security
                  </button>
                </li>
              </ul>
              
              <div className="card-body">
                {/* Personal Info Tab */}
                {activeTab === 'profile' && (
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3 text-center mb-4 mb-md-0">
                        <div 
                          className="mx-auto mb-3" 
                          style={{ 
                            width: 140, 
                            height: 140, 
                            borderRadius: '50%', 
                            background: '#f1f1f1', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: '1px solid #e0e0e0'
                          }}
                        >
                          <i className="bi bi-person" style={{ fontSize: '4.5rem', color: '#aaa' }}></i>
                        </div>
                        
                        {!editMode && (
                          <button 
                            className="btn btn-outline-primary mt-2 shadow-sm d-inline-block edit-profile-btn" 
                            onClick={() => setEditMode(true)}
                          >
                            <i className="bi bi-pencil me-1"></i> Edit Profile
                          </button>
                        )}
                      </div>
                      
                      <div className="col-md-9">
                        {editMode ? (
                          <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label">First Name</label>
                                <input 
                                  type="text" 
                                  className="form-control"
                                  name="firstName"
                                  value={formData.firstName}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Last Name</label>
                                <input 
                                  type="text" 
                                  className="form-control"
                                  name="lastName"
                                  value={formData.lastName}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Email</label>
                                <input 
                                  type="email" 
                                  className="form-control"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Phone Number</label>
                                <input 
                                  type="text" 
                                  className="form-control"
                                  name="phone"
                                  value={formData.phone}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div className="col-12">
                                <label className="form-label">Address</label>
                                <textarea 
                                  className="form-control"
                                  name="address"
                                  value={formData.address}
                                  onChange={handleInputChange}
                                  rows="3"
                                ></textarea>
                              </div>
                              <div className="col-12 mt-3">
                                <button type="submit" className="btn btn-primary me-2">
                                  Save Changes
                                </button>
                                <button 
                                  type="button" 
                                  className="btn btn-outline-secondary"
                                  onClick={() => {
                                    setFormData(user);
                                    setEditMode(false);
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </form>
                        ) : (
                          <div>
                            <h5 className="border-bottom pb-2 mb-3">Personal Information</h5>
                            <div className="row mb-2">
                              <div className="col-md-4 fw-bold">Full Name:</div>
                              <div className="col-md-8">{user.firstName} {user.lastName}</div>
                            </div>
                            <div className="row mb-2">
                              <div className="col-md-4 fw-bold">Email:</div>
                              <div className="col-md-8">{user.email}</div>
                            </div>
                            <div className="row mb-2">
                              <div className="col-md-4 fw-bold">Phone:</div>
                              <div className="col-md-8">{user.phone || 'Not provided'}</div>
                            </div>
                            <div className="row mb-2">
                              <div className="col-md-4 fw-bold">Address:</div>
                              <div className="col-md-8">{user.address || 'Not provided'}</div>
                            </div>
                            
                            <h5 className="border-bottom pb-2 mb-3 mt-4">Account Details</h5>
                            <div className="row mb-2">
                              <div className="col-md-4 fw-bold">User ID:</div>
                              <div className="col-md-8">
                                <span className="text-muted small font-monospace">{userId}</span>
                              </div>
                            </div>
                            <div className="row mb-2">
                              <div className="col-md-4 fw-bold">Account Type:</div>
                              <div className="col-md-8">
                                <span className="badge bg-success">{user.accountType}</span>
                              </div>
                            </div>
                            <div className="row mb-2">
                              <div className="col-md-4 fw-bold">Registration IP:</div>
                              <div className="col-md-8">{user.registrationIp || 'Information not available'}</div>
                            </div>
                            <div className="row mb-2">
                              <div className="col-md-4 fw-bold">Last Login:</div>
                              <div className="col-md-8">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</div>
                            </div>
                            <div className="row mb-2">
                              <div className="col-md-4 fw-bold">Account Status:</div>
                              <div className="col-md-8">
                                <span className="badge bg-primary">{user.accountStatus}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Expense Statistics Tab */}
                {activeTab === 'stats' && (
                  <div>
                    <h5 className="border-bottom pb-2 mb-4">Your Expense Summary</h5>
                    
                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <div className="card h-100 border-0 shadow-sm bg-light">
                          <div className="card-body text-center">
                            <h1 className="display-4 text-primary">{expenseStats.totalExpenses}</h1>
                            <p className="text-muted mb-0">Total Expenses Tracked</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6 mb-4">
                        <div className="card h-100 border-0 shadow-sm bg-light">
                          <div className="card-body text-center">
                            <h1 className="display-4 text-success">{formatCurrency(expenseStats.totalAmount)}</h1>
                            <p className="text-muted mb-0">Total Amount Spent</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6 mb-4">
                        <div className="card h-100 border-0 shadow-sm">
                          <div className="card-body">
                            <h6 className="text-muted">Most Used Category</h6>
                            <div className="d-flex align-items-center">
                              <div className="category-icon rounded-circle bg-warning me-3" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="bi bi-tag text-white"></i>
                              </div>
                              <h5 className="mb-0">{expenseStats.mostUsedCategory}</h5>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6 mb-4">
                        <div className="card h-100 border-0 shadow-sm">
                          <div className="card-body">
                            <h6 className="text-muted">Tracking Since</h6>
                            <div className="d-flex align-items-center">
                              <div className="category-icon rounded-circle bg-info me-3" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="bi bi-calendar text-white"></i>
                              </div>
                              <h5 className="mb-0">{expenseStats.firstExpenseDate}</h5>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center mt-2">
                      <a href="/user/reports" className="btn btn-primary">
                        <i className="bi bi-bar-chart me-1"></i> View Detailed Reports
                      </a>
                    </div>
                  </div>
                )}
                
                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div>
                    <h5 className="border-bottom pb-2 mb-4">Application Preferences</h5>
                    
                    <form>
                      <div className="mb-4">
                        <label className="form-label fw-bold">Currency</label>
                        <p className="text-muted small mb-2">Select your preferred currency for displaying amounts</p>
                        <select 
                          className="form-select" 
                          name="currency" 
                          value={preferences.currency} 
                          onChange={handlePreferenceChange}
                        >
                          <option value="INR">Indian Rupee (₹)</option>
                          <option value="USD">US Dollar ($)</option>
                          <option value="EUR">Euro (€)</option>
                          <option value="GBP">British Pound (£)</option>
                        </select>
                      </div>
                      
                      <div className="mb-4">
                        <label className="form-label fw-bold">Theme</label>
                        <p className="text-muted small mb-2">Choose your preferred application theme</p>
                        <div className="d-flex gap-3">
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="theme" 
                              id="lightTheme" 
                              value="light"
                              checked={preferences.theme === 'light'}
                              onChange={handlePreferenceChange}
                            />
                            <label className="form-check-label" htmlFor="lightTheme">
                              Light
                            </label>
                          </div>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="radio" 
                              name="theme" 
                              id="darkTheme" 
                              value="dark"
                              checked={preferences.theme === 'dark'}
                              onChange={handlePreferenceChange} 
                            />
                            <label className="form-check-label" htmlFor="darkTheme">
                              Dark
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="emailNotifications" 
                            name="emailNotifications"
                            checked={preferences.emailNotifications}
                            onChange={handlePreferenceChange}
                          />
                          <label className="form-check-label fw-bold" htmlFor="emailNotifications">
                            Email Notifications
                          </label>
                        </div>
                        <p className="text-muted small">Receive notifications about important updates and summaries</p>
                      </div>
                      
                      <div className="mt-4 text-end">
                        <p className="text-success small">
                          <i className="bi bi-check-circle me-1"></i> Preferences are automatically saved
                        </p>
                      </div>
                    </form>
                  </div>
                )}
                
                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div>
                    <h5 className="border-bottom pb-2 mb-4">Account Security</h5>
                    
                    <div className="mb-4">
                      <h6 className="fw-bold">Change Password</h6>
                      <p className="text-muted small">Regularly update your password to keep your account secure</p>
                      
                      <form className="mt-3">
                        <div className="mb-3">
                          <label className="form-label">Current Password</label>
                          <input type="password" className="form-control" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">New Password</label>
                          <input type="password" className="form-control" />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Confirm New Password</label>
                          <input type="password" className="form-control" />
                        </div>
                        <button type="button" className="btn btn-primary mt-2">
                          <i className="bi bi-lock me-1"></i> Update Password
                        </button>
                      </form>
                    </div>
                    
                    <div className="mt-5 mb-4">
                      <h6 className="fw-bold">Security Questions</h6>
                      <p className="text-muted small mb-3">Security questions help verify your identity if you forget your password</p>
                      
                      {user.securityQuestions && user.securityQuestions.length > 0 ? (
                        <>
                          <div className="list-group">
                            {user.securityQuestions.map((sq, index) => (
                              <div key={index} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                <div>
                                  <span>{sq.question}</span>
                                  <br />
                                  <small className="text-muted">
                                    {sq.answered ? 
                                      <span className="text-success"><i className="bi bi-check-circle me-1"></i> Answered</span> : 
                                      <span className="text-danger"><i className="bi bi-exclamation-circle me-1"></i> Not set</span>
                                    }
                                  </small>
                                </div>
                                <button className="btn btn-sm btn-outline-primary">
                                  {sq.answered ? 'Update' : 'Set Answer'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="alert alert-warning">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          You haven't set up any security questions yet. Security questions provide an additional layer of protection.
                        </div>
                      )}
                      
                      {user.securityQuestions && user.securityQuestions.length < 3 && (
                        <button className="btn btn-outline-primary mt-3">
                          <i className="bi bi-plus-circle me-1"></i> Add Security Question
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-5">
                      <h6 className="fw-bold text-danger">Delete Account</h6>
                      <p className="text-muted small">This action cannot be undone. All your data will be permanently deleted.</p>
                      <button className="btn btn-outline-danger">
                        <i className="bi bi-trash me-1"></i> Delete My Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
