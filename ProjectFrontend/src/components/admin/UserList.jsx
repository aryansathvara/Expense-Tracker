import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useToastConfig from '../../hooks/useToastConfig';

const UserList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Use custom toast hook
  const toast = useToastConfig();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Configure axios base URL
      axios.defaults.baseURL = 'http://localhost:3000';
      
      console.log('Fetching users from API...');
      // Use the correct API endpoint from your backend
      const response = await axios.get('/users');
      console.log('API Response:', response);
      
      if (response.data && response.data.data) {
        const data = response.data.data || [];
        console.log(`Found ${data.length} users`);
        setUsers(data);
        setFilteredUsers(data);
        setLastRefreshed(new Date());
      } else {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format');
      }
    } catch (apiError) {
      console.error('Error fetching users:', apiError);
      const errorMessage = apiError.response?.data?.message || 'Failed to load users. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = () => {
    fetchUsers();
  };

  const retryConnection = () => {
    setError(null);
    setLoading(true);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
    
    // Set up interval to refresh users every 5 minutes (optional)
    const intervalId = setInterval(() => {
      fetchUsers();
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    // Filter users based on search term and status filter
    const result = users.filter(user => {
      const matchesSearch = 
        searchTerm === '' || 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Handle status filtering with boolean values
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'true' && user.status === true) || 
        (statusFilter === 'false' && user.status === false);
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredUsers(result);
  }, [searchTerm, statusFilter, users]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Invalid Date';
    }
  };

  // Format time for last refreshed
  const formatTime = (date) => {
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {error && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <span>{error}</span>
          </div>
          <div className="mt-2">
            <button
              className="btn btn-sm btn-light d-flex align-items-center"
              onClick={retryConnection}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Retry Connection
            </button>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="admin-page-title mb-0">User Management</h1>
          <p className="text-muted">
            View and manage all users
            <small className="ms-2">
              (Last updated: {formatTime(lastRefreshed)})
            </small>
          </p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-secondary me-2"
            onClick={refreshUsers}
            disabled={loading}
          >
            <i className={`bi ${loading ? 'bi-arrow-repeat' : 'bi-arrow-clockwise'} me-1`}></i>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link to="/admin/users/add" className="btn btn-primary">
            <i className="bi bi-person-plus me-2"></i>
            Add New User
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="col-md-3 text-end">
              <span className="badge bg-secondary">Total: {filteredUsers.length} users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card admin-card shadow-sm">
        <div className="card-body p-0">
          {loading && (
            <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center" style={{backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 1}}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Refreshing...</span>
              </div>
            </div>
          )}
          {filteredUsers.length > 0 ? (
            <div className="table-responsive">
              <table className="table admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <Link to={`/admin/users/${user._id}`} className="user-name">
                          {user.firstName} {user.lastName}
                        </Link>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className="badge bg-info">
                          {user.roleId?.name || 'User'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          user.status === true ? 'bg-success' : 'bg-danger'
                        }`}>
                          {user.status === true ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td className="text-end">
                        <div className="btn-group">
                          <Link 
                            to={`/admin/users/${user._id}`} 
                            className="btn btn-sm btn-outline-primary"
                            title="View User Details"
                            aria-label="View user details"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                          <Link 
                            to={`/admin/users/edit/${user._id}`} 
                            className="btn btn-sm btn-outline-info"
                            title="Edit User"
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-muted">No users found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList; 