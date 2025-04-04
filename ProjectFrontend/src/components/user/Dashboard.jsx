import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Add this helper function to safely get status at component level
const getSafeStatus = (statusValue) => {
  if (typeof statusValue === 'object' && statusValue !== null) {
    console.log('Converting object status to string:', statusValue);
    // If it's an object with enum property, use that
    if (statusValue.enum) {
      return Array.isArray(statusValue.enum) && statusValue.enum.length > 0 
        ? statusValue.enum[0] 
        : 'pending';
    }
    // Fallback to string representation
    return String(statusValue) || 'pending';
  }
  return statusValue || 'pending';
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalExpenseAmount: 0,
    totalIncomeAmount: 0,
    balance: 0,
    categories: []
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [recentIncomes, setRecentIncomes] = useState([]);
  const userId = localStorage.getItem('id');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Set the base URL for API calls
        axios.defaults.baseURL = 'http://localhost:3000';
        
        // Fetch expense and income data in parallel
        const [expenseResponse, incomeResponse] = await Promise.all([
          axios.get('/expense/expence'),
          axios.get(`/income?userId=${userId}`)
        ]);
        
        // Process expense data
        const userExpenses = expenseResponse.data.data.filter(expense => 
          expense.userId && expense.userId._id === userId
        );
        
        // Calculate expense statistics
        const totalExpenses = userExpenses.length;
        const totalExpenseAmount = userExpenses.reduce((sum, expense) => 
          sum + (expense.amount || 0), 0
        );
        
        // Process income data
        const userIncomes = incomeResponse.data.data || [];
        
        // Debug income data to find objects with enum
        console.log('Debugging income data:');
        userIncomes.forEach((income, index) => {
          Object.entries(income).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null && 'enum' in value) {
              console.error(`Found enum object in income[${index}].${key}:`, value);
            }
          });
        });
        
        // Add specialized check for income status
        userIncomes.forEach((income, index) => {
          if (typeof income.status === 'object') {
            console.error(`Income ${index} has an object as status:`, income.status);
            // Fix the status property to be a string
            income.status = income.status.toString() || 'pending';
          }
        });
        
        // Update the completed incomes filter
        const completedIncomes = userIncomes.filter(income => getSafeStatus(income.status) === 'completed');
        
        // Calculate income statistics (only count completed incomes)
        const totalIncomeAmount = completedIncomes.reduce((sum, income) => 
          sum + (income.amount || 0), 0
        );
        
        // Calculate balance
        const balance = totalIncomeAmount - totalExpenseAmount;
        
        // Group expenses by category
        const categoriesMap = {};
        userExpenses.forEach(expense => {
          const categoryName = expense.categoryId?.name || 'Uncategorized';
          if (!categoriesMap[categoryName]) {
            categoriesMap[categoryName] = {
              name: categoryName,
              count: 0,
              amount: 0
            };
          }
          categoriesMap[categoryName].count += 1;
          categoriesMap[categoryName].amount += (expense.amount || 0);
        });
        
        // Convert to array and sort by amount
        const categories = Object.values(categoriesMap).sort((a, b) => b.amount - a.amount);
        
        setStats({
          totalExpenses,
          totalExpenseAmount,
          totalIncomeAmount,
          balance,
          categories
        });
        
        // Get recent 5 expenses
        const sortedExpenses = [...userExpenses].sort((a, b) => 
          new Date(b.createdAt || b.transcationDate) - new Date(a.createdAt || a.transcationDate)
        ).slice(0, 5);
        
        setRecentExpenses(sortedExpenses);
        
        // Get recent 5 incomes
        const sortedIncomes = [...userIncomes].sort((a, b) => 
          new Date(b.createdAt || b.transcationDate) - new Date(a.createdAt || a.transcationDate)
        ).slice(0, 5);
        
        setRecentIncomes(sortedIncomes);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  const formatCurrency = (amount) => {
    // Check if amount is a valid number
    if (typeof amount === 'object') {
      console.error('Invalid amount type received:', amount);
      return 'N/A';
    }
    
    // Ensure amount is a number before formatting
    const numAmount = Number(amount) || 0;
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(numAmount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to get random category color
  const getCategoryColor = (categoryName) => {
    // A map of predefined colors for common categories
    const colorMap = {
      'Groceries': '#4CAF50',
      'Food': '#FF9800',
      'Transportation': '#2196F3',
      'Entertainment': '#9C27B0',
      'Shopping': '#F44336',
      'Utilities': '#607D8B',
      'Rent': '#795548',
      'Health': '#00BCD4',
      'Education': '#3F51B5',
      'Travel': '#009688',
      'household': '#8BC34A'
    };
    
    // Return predefined color or a default blue
    return colorMap[categoryName] || '#5469d4';
  };

  // Add this debug function
  const safeRender = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') {
      console.error('Attempted to render object directly:', value);
      return JSON.stringify(value);
    }
    return value;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <div className="spinner-border" style={{ color: '#5469d4' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="container-fluid p-0">
        <div className="row g-0">
          <div className="col-12 px-4 py-4">
            {/* Statistics Cards */}
            <div className="row g-4 mb-4">
              <div className="col-md-3">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="stat-card">
                      <div className="stat-icon" style={{ backgroundColor: 'rgba(84, 105, 212, 0.1)', color: '#5469d4' }}>
                        <i className="bi bi-receipt"></i>
                      </div>
                      <div>
                        <h6 className="stat-title">TOTAL EXPENSES</h6>
                        <h3 className="stat-value">{formatCurrency(stats.totalExpenseAmount)}</h3>
                        <small className="text-muted">{stats.totalExpenses} transactions</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="stat-card">
                      <div className="stat-icon" style={{ backgroundColor: 'rgba(10, 136, 82, 0.1)', color: '#0A8852' }}>
                        <i className="bi bi-cash-stack"></i>
                      </div>
                      <div>
                        <h6 className="stat-title">TOTAL INCOME</h6>
                        <h3 className="stat-value">{formatCurrency(stats.totalIncomeAmount)}</h3>
                        <small className="text-muted">
                          <Link to="/user/income" className="text-decoration-none">
                            View All Income
                          </Link>
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="stat-card">
                      <div className="stat-icon" style={{ 
                        backgroundColor: stats.balance >= 0 ? 'rgba(10, 136, 82, 0.1)' : 'rgba(244, 67, 54, 0.1)', 
                        color: stats.balance >= 0 ? '#0A8852' : '#F44336' 
                      }}>
                        <i className={`bi ${stats.balance >= 0 ? 'bi-wallet2' : 'bi-wallet'}`}></i>
                      </div>
                      <div>
                        <h6 className="stat-title">BALANCE</h6>
                        <h3 className="stat-value" style={{
                          color: stats.balance >= 0 ? '#0A8852' : '#F44336'
                        }}>
                          {formatCurrency(stats.balance)}
                        </h3>
                        <small className={`text-${stats.balance >= 0 ? 'success' : 'danger'}`}>
                          {stats.balance >= 0 ? 'Surplus' : 'Deficit'}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="stat-card">
                      <div className="stat-icon" style={{ backgroundColor: 'rgba(255, 186, 8, 0.1)', color: '#FFBA08' }}>
                        <i className="bi bi-tag"></i>
                      </div>
                      <div>
                        <h6 className="stat-title">CATEGORIES</h6>
                        <h3 className="stat-value">{stats.categories.length}</h3>
                        <small className="text-muted">Expense categories</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex flex-wrap gap-2">
                      <Link to="/user/add-expense" className="btn btn-primary">
                        <i className="bi bi-plus-circle me-2"></i>Add Expense
                      </Link>
                      <Link to="/user/add-income" className="btn btn-success">
                        <i className="bi bi-plus-circle me-2"></i>Add Income
                      </Link>
                      <Link to="/user/expenses" className="btn btn-outline-primary">
                        <i className="bi bi-list me-2"></i>View Expenses
                      </Link>
                      <Link to="/user/income" className="btn btn-outline-success">
                        <i className="bi bi-list me-2"></i>View Income
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Category Breakdown and Recent Expenses */}
            <div className="row g-4">
              <div className="col-lg-6">
                <div className="card h-100">
                  <div className="card-header">
                    <h5 className="card-title">Expense by Category</h5>
                  </div>
                  <div className="card-body">
                    {stats.categories.length === 0 ? (
                      <div className="empty-state">
                        <i className="bi bi-pie-chart empty-icon"></i>
                        <p className="empty-text">No category data available</p>
                        <Link to="/user/add-expense" className="btn btn-success rounded-pill px-4">
                          <i className="bi bi-plus-circle me-2"></i>Add Your First Expense
                        </Link>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>CATEGORY</th>
                              <th className="text-center">COUNT</th>
                              <th className="text-end">AMOUNT</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.categories.map((category, index) => (
                              <tr key={index}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <span 
                                      className="category-icon" 
                                      style={{ backgroundColor: getCategoryColor(category.name) }}
                                    ></span>
                                    <span>{safeRender(category.name)}</span>
                                  </div>
                                </td>
                                <td className="text-center">{safeRender(category.count)}</td>
                                <td className="text-end amount">{formatCurrency(category.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="col-lg-6">
                <div className="card h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="card-title">Recent Expenses</h5>
                    <Link to="/user/expenses" className="btn btn-sm btn-outline-primary">
                      <i className="bi bi-eye me-1"></i> View All
                    </Link>
                  </div>
                  <div className="card-body">
                    {recentExpenses.length === 0 ? (
                      <div className="empty-state">
                        <i className="bi bi-receipt empty-icon"></i>
                        <p className="empty-text">No recent expenses</p>
                        <Link to="/user/add-expense" className="btn btn-primary rounded-pill px-4">
                          <i className="bi bi-plus-circle me-2"></i>Add Expense
                        </Link>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>TITLE</th>
                              <th>CATEGORY</th>
                              <th>DATE</th>
                              <th className="text-end">AMOUNT</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentExpenses.map((expense) => (
                              <tr key={expense._id}>
                                <td>
                                  <Link to={`/user/expense-details/${expense._id}`} className="expense-link">
                                    {safeRender(expense.title)}
                                  </Link>
                                </td>
                                <td>
                                  <span 
                                    className="badge"
                                    style={{ 
                                      backgroundColor: getCategoryColor(expense.categoryId?.name || 'Uncategorized'),
                                      color: 'white'
                                    }}
                                  >
                                    {safeRender(expense.categoryId?.name) || 'Uncategorized'}
                                  </span>
                                </td>
                                <td>{formatDate(expense.transcationDate || expense.createdAt)}</td>
                                <td className="text-end amount">{formatCurrency(expense.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Income */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="card-title">Recent Income</h5>
                    <Link to="/user/income" className="btn btn-sm btn-outline-success">
                      <i className="bi bi-eye me-1"></i> View All
                    </Link>
                  </div>
                  <div className="card-body">
                    {recentIncomes.length === 0 ? (
                      <div className="empty-state">
                        <i className="bi bi-cash-coin empty-icon text-success"></i>
                        <p className="empty-text">No recent income entries</p>
                        <Link to="/user/add-income" className="btn btn-success rounded-pill px-4">
                          <i className="bi bi-plus-circle me-2"></i>Add Income
                        </Link>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>TITLE</th>
                              <th>ACCOUNT</th>
                              <th>DATE</th>
                              <th>STATUS</th>
                              <th className="text-end">AMOUNT</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentIncomes.map((income) => (
                              <tr key={income._id}>
                                <td>
                                  <Link to={`/user/income/${income._id}`} className="expense-link">
                                    {safeRender(income.title)}
                                  </Link>
                                </td>
                                <td>{safeRender(income.accountId?.title) || 'N/A'}</td>
                                <td>{formatDate(income.transcationDate || income.createdAt)}</td>
                                <td>
                                  <span className={`badge ${
                                    getSafeStatus(income.status) === 'completed' ? 'bg-success' : 
                                    getSafeStatus(income.status) === 'pending' ? 'bg-warning' : 'bg-danger'
                                  }`}>
                                    {safeRender(getSafeStatus(income.status))}
                                  </span>
                                </td>
                                <td className="text-end amount">{formatCurrency(income.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 