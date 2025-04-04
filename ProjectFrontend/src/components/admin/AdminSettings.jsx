import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useToastConfig from '../../hooks/useToastConfig';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    general: {
    siteName: 'Expense Tracker',
    siteDescription: 'Manage and track your expenses efficiently',
    dateFormat: 'MM/DD/YYYY',
      currency: 'INR'
    },
    registration: {
    allowUserRegistration: true,
      requireEmailVerification: true
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState(null);
  
  // Use custom toast hook
  const toast = useToastConfig();

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        // Fetch settings code would go here
        // const response = await axios.get('/admin/settings');
        // setSettings(response.data);
        
        // For now, just using default settings
        setLoading(false);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings. Please try again.');
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  // Handle form submission
  const handleSubmit = async (e, settingsType) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare data to send
      const dataToSend = settings[settingsType];
      
      // Would make API call here in production
      // await axios.put(`/admin/settings/${settingsType}`, dataToSend);
      
      // For demo, just show success message
      toast.success(`${settingsType.charAt(0).toUpperCase() + settingsType.slice(1)} settings updated successfully!`);
      setLoading(false);
    } catch (err) {
      console.error(`Error updating ${settingsType} settings:`, err);
      toast.error(`Failed to update ${settingsType} settings. Please try again.`);
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (settingsType, field, value) => {
    setSettings({
      ...settings,
      [settingsType]: {
        ...settings[settingsType],
        [field]: value
      }
    });
  };

  // Handle checkbox change
  const handleCheckboxChange = (settingsType, field) => {
    setSettings({
      ...settings,
      [settingsType]: {
        ...settings[settingsType],
        [field]: !settings[settingsType][field]
      }
    });
  };

  // Define settings menu items
  const menuItems = [
    { id: 'general', icon: 'gear', label: 'General' },
    { id: 'email', icon: 'envelope', label: 'Email' },
    { id: 'security', icon: 'shield-lock', label: 'Security' },
    { id: 'backup', icon: 'cloud-arrow-up', label: 'Backup & Restore' }
  ];

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title mb-0">System Settings</h1>
          <p className="text-muted">Configure application settings</p>
        </div>
      </div>
      
      <div className="row">
        {/* Settings Menu */}
        <div className="col-md-3 mb-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Settings Menu</h5>
            </div>
            <div className="list-group list-group-flush">
              {menuItems.map(item => (
              <button
                  key={item.id}
                  type="button"
                  className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <i className={`bi bi-${item.icon} me-2`}></i>
                  {item.label}
              </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Settings Content */}
        <div className="col-md-9">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                {menuItems.find(item => item.id === activeTab)?.label} Settings
              </h5>
            </div>
            <div className="card-body">
              {activeTab === 'general' && (
                <form onSubmit={(e) => handleSubmit(e, 'general')}>
                  <div className="mb-3">
                    <label htmlFor="siteName" className="form-label">Site Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="siteName"
                      value={settings.general.siteName}
                      onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                      placeholder="Your application name"
                    />
                    <small className="text-muted">Name of your application as it appears to users</small>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="siteDescription" className="form-label">Site Description</label>
                    <textarea
                      className="form-control"
                      id="siteDescription"
                      value={settings.general.siteDescription}
                      onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="defaultCurrency" className="form-label">Default Currency</label>
                      <select
                        className="form-select"
                        id="defaultCurrency"
                        value={settings.general.currency}
                        onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                      >
                        <option value="INR">Indian Rupee (₹)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="GBP">British Pound (£)</option>
                      </select>
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="dateFormat" className="form-label">Date Format</label>
                      <select
                        className="form-select"
                        id="dateFormat"
                        value={settings.general.dateFormat}
                        onChange={(e) => handleInputChange('general', 'dateFormat', e.target.value)}
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                  
                  <hr className="my-4" />
                  
                  <h5>Registration Settings</h5>
                  
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="allowUserRegistration"
                      checked={settings.registration.allowUserRegistration}
                      onChange={() => handleCheckboxChange('registration', 'allowUserRegistration')}
                    />
                    <label className="form-check-label" htmlFor="allowUserRegistration">Allow User Registration</label>
                    <div className="form-text">If disabled, only admins can create new accounts</div>
                  </div>
                  
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="requireEmailVerification"
                      checked={settings.registration.requireEmailVerification}
                      onChange={() => handleCheckboxChange('registration', 'requireEmailVerification')}
                    />
                    <label className="form-check-label" htmlFor="requireEmailVerification">Require Email Verification</label>
                    <div className="form-text">Require email verification for new user accounts</div>
                  </div>
                  
                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
              
              {activeTab === 'email' && (
                <div className="text-center py-5">
                  <i className="bi bi-envelope-paper fs-1 text-muted mb-3"></i>
                  <h4>Email Settings</h4>
                  <p className="text-muted">Email configuration is not available in this demo.</p>
                  </div>
              )}
              
              {activeTab === 'security' && (
                <div className="text-center py-5">
                  <i className="bi bi-shield-lock fs-1 text-muted mb-3"></i>
                  <h4>Security Settings</h4>
                  <p className="text-muted">Security configuration is not available in this demo.</p>
                  </div>
              )}
              
              {activeTab === 'backup' && (
                <div className="text-center py-5">
                  <i className="bi bi-cloud-arrow-up fs-1 text-muted mb-3"></i>
                  <h4>Backup & Restore</h4>
                  <p className="text-muted">Backup functionality is not available in this demo.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 