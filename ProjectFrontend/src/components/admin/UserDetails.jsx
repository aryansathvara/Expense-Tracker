import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useToastConfig from '../../hooks/useToastConfig';

const UserDetails = () => {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  // Use custom toast hook
  const toast = useToastConfig();

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Configure axios base URL
      axios.defaults.baseURL = 'http://localhost:3000';
      
      console.log(`Fetching user details for ID: ${id}`);
      // Updated endpoint to match your backend route
      const userResponse = await axios.get(`/user/${id}`);
      console.log('User API Response:', userResponse);
      
      if (userResponse.data && userResponse.data.data) {
        setUser(userResponse.data.data);
      } else {
        throw new Error('Invalid user data format');
      }
      
      // Try to fetch user expenses - using the correct endpoint from your backend
      try {
        console.log(`Fetching expenses for user ID: ${id}`);
        // This is the correct endpoint based on your backend code
        const expensesResponse = await axios.get(`/expense/getExpencebyuserid/${id}`);
        console.log('Expenses API Response:', expensesResponse);
        
        if (expensesResponse.data && expensesResponse.data.data) {
          const expenseData = expensesResponse.data.data || [];
          console.log(`Found ${expenseData.length} expenses for this user`);
          setExpenses(expenseData);
        } else {
          console.warn('No expenses found or invalid format');
          setExpenses([]);
        }
      } catch (expenseError) {
        console.error('Error fetching user expenses:', expenseError);
        setExpenses([]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(`Failed to load user details: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchUserData();
  };

  useEffect(() => {
    fetchUserData();
  }, [id]);

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

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0.00';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get full name
  const getFullName = (user) => {
    if (!user) return 'Auto-Generated';
    
    let name = '';
    if (user.firstName) name += user.firstName;
    if (user.lastName) name += name ? ` ${user.lastName}` : user.lastName;
    
    return name || user.email || 'Auto-Generated';
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <h4 className="alert-heading">Error Loading User</h4>
          <p>{error}</p>
          <hr />
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-secondary" 
              onClick={handleRetry}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Try Again
            </button>
            <Link to="/admin/users" className="btn btn-primary">
              <i className="bi bi-arrow-left me-1"></i>
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <h4 className="alert-heading">User Not Found</h4>
          <p>The requested user could not be found.</p>
          <hr />
          <Link to="/admin/users" className="btn btn-primary">
            <i className="bi bi-arrow-left me-1"></i>
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* User Details Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="admin-page-title mb-0">User Profile</h1>
          <p className="text-muted">Details for {getFullName(user)}</p>
        </div>
        <div>
          <Link to="/admin/users" className="btn btn-outline-secondary me-2">
            <i className="bi bi-arrow-left me-1"></i>
            Back
          </Link>
          <Link to={`/admin/users/edit/${id}`} className="btn btn-primary">
            <i className="bi bi-pencil me-1"></i>
            Edit User
          </Link>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="row">
        <div className="col-lg-4">
          <div className="card admin-card shadow-sm mb-4">
            <div className="card-body text-center p-4">
              <div className="avatar-wrapper mb-3">
                <div className="avatar-placeholder">
                  {user.firstName?.charAt(0) || user.email?.charAt(0) || '?'}
                </div>
              </div>
              <h3 className="mb-1">{getFullName(user)}</h3>
              <p className="text-muted mb-3">{user.email}</p>
              
              <div className="d-flex justify-content-center mb-3">
                <span className={`badge ${
                  user.status === 'active' ? 'bg-success' : 
                  user.status === 'pending' ? 'bg-warning' : 'bg-secondary'
                } px-3 py-2`}>
                  {user.status || 'inactive'}
                </span>
              </div>
              
              <div className="mb-3">
                <p className="mb-1 text-muted">Role</p>
                <h6>{user.roleId?.name || 'Standard User'}</h6>
              </div>
              
              <div className="mb-3">
                <p className="mb-1 text-muted">Member Since</p>
                <h6>{formatDate(user.createdAt)}</h6>
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="card admin-card shadow-sm mb-4">
            <div className="card-header">
              <h5 className="mb-0">Contact Information</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <p className="text-muted mb-1">Email Address</p>
                <h6>{user.email}</h6>
              </div>
              <div className="mb-3">
                <p className="text-muted mb-1">Phone Number</p>
                <h6>{user.phoneNumber || 'Not provided'}</h6>
              </div>
              <div className="mb-0">
                <p className="text-muted mb-1">Address</p>
                <h6>{user.address || 'Not provided'}</h6>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-8">
          {/* Account Activity */}
          <div className="card admin-card shadow-sm mb-4">
            <div className="card-header">
              <h5 className="mb-0">Account Activity</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="border rounded p-3 text-center">
                    <h2 className="text-primary mb-1">{expenses.length}</h2>
                    <p className="text-muted mb-0">Total Expenses</p>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="border rounded p-3 text-center">
                    <h2 className="text-success mb-1">
                      {formatCurrency(
                        expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
                      )}
                    </h2>
                    <p className="text-muted mb-0">Total Amount</p>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="border rounded p-3 text-center">
                    <h2 className="text-info mb-1">
                      {formatDate(user.lastLogin || user.updatedAt)}
                    </h2>
                    <p className="text-muted mb-0">Last Activity</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* User Expenses */}
          <div className="card admin-card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Expenses</h5>
              <span className="badge bg-primary">{expenses.length} Total</span>
            </div>
            <div className="card-body p-0">
              {expenses.length > 0 ? (
                <div className="table-responsive">
                  <table className="table admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.slice(0, 5).map((expense) => (
                        <tr key={expense._id}>
                          <td>{expense.title || expense.description || 'Untitled'}</td>
                          <td>
                            <span className="badge bg-info">
                              {expense.categoryId?.name || 'Uncategorized'}
                            </span>
                          </td>
                          <td>{formatDate(expense.transcationDate || expense.date || expense.createdAt)}</td>
                          <td>{formatCurrency(expense.amount)}</td>
                          <td>
                            <Link 
                              to={`/admin/expenses/${expense._id}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              <i className="bi bi-eye"></i>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-4">
                  <i className="bi bi-receipt text-muted" style={{ fontSize: '2rem' }}></i>
                  <p className="text-muted mt-2">No expenses found for this user.</p>
                </div>
              )}
              
              {expenses.length > 5 && (
                <div className="card-footer text-center">
                  <Link to={`/admin/expenses?userId=${id}`} className="btn btn-link">
                    View All Expenses <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails; 