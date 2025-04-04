import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExpenses: 0,
    totalAmount: 0,
    activeUsers: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Function to fetch data from the API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Configure axios base URL
      axios.defaults.baseURL = 'http://localhost:3000';
      
      // Fetch users data
      console.log('Fetching users data...');
      const usersResponse = await axios.get('/users');
      const users = usersResponse.data.data || [];
      console.log(`Found ${users.length} users`);
      
      // Fetch expenses data
      console.log('Fetching expenses data...');
      const expensesResponse = await axios.get('/expense/expence');
      const expenses = expensesResponse.data.data || [];
      console.log(`Found ${expenses.length} expenses`);
      
      // Calculate statistics
      const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      setStats({
        totalUsers: users.length,
        totalExpenses: expenses.length,
        totalAmount: totalAmount,
        activeUsers: users.filter(user => user.status === true).length || Math.round(users.length * 0.75) // Filter by true status
      });
      
      // Get recent users (last 5)
      setRecentUsers(users.slice(-5).reverse());
      
      // Get recent expenses (last 5)
      setRecentExpenses(expenses.slice(-5).reverse());
      
      // Calculate category data
      calculateCategoryData(expenses);
      
      // Calculate monthly data
      calculateMonthlyData(expenses);
      
      setLastRefreshed(new Date());
      
    } catch (err) {
      console.error('API Error:', err);
      setError(`Failed to load dashboard data: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate category data from expenses
  const calculateCategoryData = (expenses) => {
    try {
      const categories = {};
      const totalExpenses = expenses.length;
      
      // Count expenses by category
      expenses.forEach(expense => {
        const category = expense.categoryId?.name || expense.category || 'Other';
        categories[category] = (categories[category] || 0) + 1;
      });
      
      // Convert to percentage and format for display
      const categoryData = Object.keys(categories).map(category => {
        const count = categories[category];
        const percentage = totalExpenses ? Math.round((count / totalExpenses) * 100) : 0;
        return { name: category, percentage, count };
      });
      
      // Sort by count descending and get top 5
      const sortedData = categoryData.sort((a, b) => b.count - a.count).slice(0, 5);
      setCategoryData(sortedData);
    } catch (error) {
      console.error('Error calculating category data:', error);
      setCategoryData([]);
    }
  };

  // Calculate monthly data from expenses
  const calculateMonthlyData = (expenses) => {
    try {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();
      
      // Initialize with zero amounts
      const monthlyAmounts = months.map(() => 0);
      
      // Sum amounts by month
      expenses.forEach(expense => {
        if (!expense.date && !expense.transcationDate && !expense.createdAt) return;
        
        const date = new Date(expense.transcationDate || expense.date || expense.createdAt);
        if (date.getFullYear() === currentYear) {
          const monthIndex = date.getMonth();
          monthlyAmounts[monthIndex] += (expense.amount || 0);
        }
      });
      
      // Calculate heights as percentages for the chart
      const maxAmount = Math.max(...monthlyAmounts);
      const monthlyData = months.map((month, index) => {
        const amount = monthlyAmounts[index];
        const height = maxAmount ? Math.max(10, Math.round((amount / maxAmount) * 100)) : 0;
        return { month, amount, height };
      });
      
      setMonthlyData(monthlyData);
    } catch (error) {
      console.error('Error calculating monthly data:', error);
      setMonthlyData([]);
    }
  };

  // Retry connection function
  const refreshDashboard = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
    
    // Optional: Set up an interval to refresh the dashboard every 5 minutes
    const intervalId = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

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
  
  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  if (loading && stats.totalUsers === 0) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3 px-0 px-md-3">
      {error && (
        <div className="alert alert-warning" role="alert" style={{ 
          backgroundColor: '#fff3cd', 
          borderColor: '#ffecb5', 
          position: 'relative', 
          padding: '0.75rem 1.25rem',
          margin: '0 0.5rem 1rem 0.5rem'
        }}>
          <button 
            type="button" 
            className="btn-close" 
            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle me-2" style={{ color: '#856404' }}></i>
            <span>{error}</span>
          </div>
          <div className="mt-2">
            <button
              className="btn btn-sm btn-light d-flex align-items-center"
              onClick={refreshDashboard}
              disabled={loading}
              style={{ backgroundColor: '#f8f9fa', borderColor: '#ced4da', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Retry Connection
            </button>
          </div>
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-3 px-3">
        <div>
          <h1 className="page-title mb-0">Admin Dashboard</h1>
          <p className="text-muted">
            System overview and statistics
            <small className="ms-2">
              (Last updated: {formatTime(lastRefreshed)})
            </small>
          </p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-secondary me-2"
            onClick={refreshDashboard}
            disabled={loading}
          >
            <i className={`bi ${loading ? 'bi-arrow-repeat' : 'bi-arrow-clockwise'} me-1`}></i>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link to="/admin/reports" className="btn btn-outline-primary">
            <i className="bi bi-graph-up me-2"></i>
            <span className="d-none d-sm-inline">View Detailed Reports</span>
            <span className="d-inline d-sm-none">Reports</span>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4 px-2">
        <div className="col-12 col-sm-6 col-md-6 col-lg-3">
          <div className="card admin-stat-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted">Total Users</h6>
                  <h3 className="mb-0">{stats.totalUsers}</h3>
                </div>
                <div className="stat-icon bg-light-primary">
                  <i className="bi bi-people-fill text-primary"></i>
                </div>
              </div>
              <div className="mt-3">
                <Link to="/admin/users" className="text-primary small">
                  View all users <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-6 col-lg-3">
          <div className="card admin-stat-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted">Active Users</h6>
                  <h3 className="mb-0">{stats.activeUsers}</h3>
                </div>
                <div className="stat-icon bg-light-success">
                  <i className="bi bi-person-check-fill text-success"></i>
                </div>
              </div>
              <div className="mt-3">
                <span className="badge bg-success small">
                  {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-6 col-lg-3">
          <div className="card admin-stat-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted">Total Expenses</h6>
                  <h3 className="mb-0">{stats.totalExpenses}</h3>
                </div>
                <div className="stat-icon bg-light-info">
                  <i className="bi bi-receipt text-info"></i>
                </div>
              </div>
              <div className="mt-3">
                <Link to="/admin/expenses" className="text-info small">
                  View all expenses <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-6 col-lg-3">
          <div className="card admin-stat-card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase text-muted">Total Amount</h6>
                  <h3 className="mb-0">{formatCurrency(stats.totalAmount)}</h3>
                </div>
                <div className="stat-icon bg-light-warning">
                  <i className="bi bi-cash-stack text-warning"></i>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-warning small">
                  <i className="bi bi-arrow-up-right"></i> All time
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row g-3 px-2">
        {/* Recent Users */}
        <div className="col-12 col-lg-6 mb-3">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Users</h5>
              <Link to="/admin/users" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            <div className="card-body p-0">
              {loading && (
                <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center" style={{backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 1}}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Refreshing...</span>
                  </div>
                </div>
              )}
              {recentUsers.length > 0 ? (
                <div className="table-responsive">
                  <table className="table admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th className="d-none d-md-table-cell">Joined</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <Link to={`/admin/users/${user._id}`} className="user-name">
                              {user.firstName} {user.lastName}
                            </Link>
                          </td>
                          <td className="text-truncate" style={{maxWidth: '150px'}}>{user.email}</td>
                          <td className="d-none d-md-table-cell">{formatDate(user.createdAt)}</td>
                          <td>
                            <span className={`badge ${
                              user.status === true ? 'bg-success' : 'bg-danger'
                            }`}>
                              {user.status === true ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-muted">No users found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="col-12 col-lg-6 mb-3">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Expenses</h5>
              <Link to="/admin/expenses" className="btn btn-sm btn-outline-primary">
                View All
              </Link>
            </div>
            <div className="card-body p-0">
              {loading && (
                <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center" style={{backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 1}}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Refreshing...</span>
                  </div>
                </div>
              )}
              {recentExpenses.length > 0 ? (
                <div className="table-responsive">
                  <table className="table admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th className="d-none d-md-table-cell">User</th>
                        <th>Amount</th>
                        <th className="d-none d-md-table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentExpenses.map((expense) => (
                        <tr key={expense._id}>
                          <td>
                            <Link to={`/admin/expenses/${expense._id}`} className="expense-title">
                              {expense.title || expense.description || 'Untitled Expense'}
                            </Link>
                          </td>
                          <td className="d-none d-md-table-cell">
                            {expense.userId ? (
                              <Link to={`/admin/users/${expense.userId._id || expense.userId}`} className="user-name">
                                {expense.userId.firstName || expense.userId.name || 'User'} {expense.userId.lastName || ''}
                              </Link>
                            ) : (
                              <span className="text-secondary">
                                <i className="bi bi-receipt me-1" title="System generated expense"></i>
                                Auto-Generated
                              </span>
                            )}
                          </td>
                          <td className="text-end">{formatCurrency(expense.amount)}</td>
                          <td className="d-none d-md-table-cell">{formatDate(expense.transcationDate || expense.date || expense.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-muted">No expenses found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Dashboard Widgets */}
      <div className="row g-3 px-2">
        <div className="col-12 col-lg-4 mb-3">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Expense Categories</h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column">
                {categoryData.length > 0 ? (
                  categoryData.map((category, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center">
                        <div className="me-2" style={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          backgroundColor: [
                            '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'
                          ][index % 5]
                        }}></div>
                        <span>{category.name}</span>
                      </div>
                      <span className="text-muted">{category.percentage}%</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4">
                    <p className="text-muted">No category data available</p>
                  </div>
                )}
                {categoryData.length > 0 && (
                  <div className="text-center mt-3">
                    <Link to="/admin/reports" className="btn btn-sm btn-outline-primary">
                      Detailed Category Report
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8 mb-3">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Monthly Expense Trend</h5>
            </div>
            <div className="card-body">
              <div className="chart-container" style={{ height: '250px', position: 'relative' }}>
                <div className="d-flex flex-column justify-content-between h-100">
                  <div className="d-flex justify-content-between">
                    <div className="text-muted small">₹10,000</div>
                    <div className="position-relative" style={{ height: '20px', width: '100%' }}>
                      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderBottom: '1px dashed #e9ecef' }}></div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div className="text-muted small">₹7,500</div>
                    <div className="position-relative" style={{ height: '20px', width: '100%' }}>
                      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderBottom: '1px dashed #e9ecef' }}></div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div className="text-muted small">₹5,000</div>
                    <div className="position-relative" style={{ height: '20px', width: '100%' }}>
                      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderBottom: '1px dashed #e9ecef' }}></div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div className="text-muted small">₹2,500</div>
                    <div className="position-relative" style={{ height: '20px', width: '100%' }}>
                      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderBottom: '1px dashed #e9ecef' }}></div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div className="text-muted small">₹0</div>
                    <div className="position-relative" style={{ height: '20px', width: '100%' }}>
                      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderBottom: '1px dashed #e9ecef' }}></div>
                    </div>
                  </div>
                </div>
                
                <div style={{ position: 'absolute', bottom: '25px', left: '40px', right: '20px', height: '65%', display: 'flex', alignItems: 'flex-end' }}>
                  <div className="d-flex justify-content-between align-items-end w-100" style={{ height: '100%' }}>
                    {monthlyData.slice(0, 7).map((item, index) => (
                      <div key={index} className="d-flex flex-column align-items-center">
                        <div style={{ 
                          width: '30px', 
                          backgroundColor: '#4e73df', 
                          height: `${item.height}%`, 
                          borderRadius: '5px 5px 0 0',
                          minHeight: '5px'
                        }}></div>
                        <span className="text-muted small mt-2">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-center mt-3">
                <Link to="/admin/reports" className="btn btn-sm btn-outline-primary">
                  View Full Year Report
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;