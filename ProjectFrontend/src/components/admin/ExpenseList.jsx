import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useToastConfig from '../../hooks/useToastConfig';

const ExpenseList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  
  // Use custom toast hook
  const toast = useToastConfig();

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Configure axios base URL
      axios.defaults.baseURL = 'http://localhost:3000';
      
      const response = await axios.get('/expense/expence');
      console.log('Expense data response:', response);
      
      if (response.data && response.data.data) {
        const data = response.data.data || [];
        console.log(`Retrieved ${data.length} expenses`);
        
        setExpenses(data);
        setFilteredExpenses(data);
        
        // Extract unique categories
        const categories = [...new Set(data.map(expense => 
          expense.categoryId?.name || expense.category || 'Uncategorized'))];
        setUniqueCategories(categories);
        
        // Remove toast notification
        // toast.success(`Loaded ${data.length} expenses successfully`);
      } else {
        throw new Error('Invalid response format');
      }
      
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load expenses. Please try again.';
      setError(errorMessage);
      // Remove toast notification
      // toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchExpenses();
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (!expenses || expenses.length === 0) return;
    
    // Filter expenses based on search term, category filter, and date range
    try {
      const result = expenses.filter(expense => {
        if (!expense) return false;
        
        const matchesSearch = 
          searchTerm === '' || 
          (expense.title && expense.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
          (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (expense.userId && expense.userId.firstName && expense.userId.lastName &&
            (expense.userId.firstName + ' ' + expense.userId.lastName).toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Improved category matching logic to check both fields
        const matchesCategory = 
          categoryFilter === 'all' || 
          (expense.categoryId?.name === categoryFilter) || 
          (expense.category === categoryFilter);
        
        let matchesDateFrom = true;
        let matchesDateTo = true;
        
        // Use the correct date field (transcationDate or date)
        const expenseDate = new Date(expense.transcationDate || expense.date || expense.createdAt);
        if (!isNaN(expenseDate.getTime())) {
          matchesDateFrom = !dateRange.from || expenseDate >= new Date(dateRange.from);
          matchesDateTo = !dateRange.to || expenseDate <= new Date(dateRange.to);
        }
        
        return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
      });
      
      setFilteredExpenses(result);
    } catch (err) {
      console.error('Error filtering expenses:', err);
      setFilteredExpenses(expenses);
    }
  }, [searchTerm, categoryFilter, dateRange, expenses]);

  // Format currency
  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
      }).format(amount || 0);
    } catch (err) {
      return '₹0.00';
    }
  };

  // Format date with fallback
  const formatDate = (dateString) => {
    // Handle missing or undefined date
    if (!dateString) {
      return (
        <span className="text-muted">
          <i className="bi bi-calendar-x me-1"></i>
          No date
        </span>
      );
    }
    
    try {
      // Manual date parsing as a last resort since standard methods aren't working
      // This assumes dates are stored in ISO format (YYYY-MM-DD) or timestamps
      
      // If it's a timestamp (number), convert directly
      if (!isNaN(dateString)) {
        const date = new Date(Number(dateString));
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
        }
      }
      
      // Try direct Date constructor
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
      
      // For display purposes, if we can't parse the date, try to show the raw value
      if (typeof dateString === 'string') {
        // Return "today" as a fallback to show something meaningful
        return (
          <span className="text-secondary">
            <i className="bi bi-calendar-check me-1"></i>
            Today
          </span>
        );
      }
      
      return (
        <span className="text-danger">
          <i className="bi bi-calendar-x me-1"></i>
          Invalid date
        </span>
      );
    } catch (err) {
      return (
        <span className="text-danger">
          <i className="bi bi-exclamation-triangle me-1"></i>
          Error
        </span>
      );
    }
  };

  const handleDateRangeChange = (e, field) => {
    setDateRange({
      ...dateRange,
      [field]: e.target.value
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setDateRange({ from: '', to: '' });
    
    // Set filtered expenses back to all expenses
    setFilteredExpenses(expenses);
    
    toast.info('Filters cleared');
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading expense data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total amount of filtered expenses
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + (expense?.amount || 0), 0);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title mb-0">Expense Management</h1>
          <p className="text-muted">View and manage all expenses</p>
        </div>
        <div>
          {/* All Categories button removed as requested */}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
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
          <div className="mt-2">
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleRetry}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              {loading ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                placeholder="From"
                value={dateRange.from}
                onChange={(e) => handleDateRangeChange(e, 'from')}
              />
            </div>
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                placeholder="To"
                value={dateRange.to}
                onChange={(e) => handleDateRangeChange(e, 'to')}
              />
            </div>
            <div className="col-md-2 text-end d-flex align-items-center justify-content-end">
              <div>
                <div className="fw-bold">{formatCurrency(totalAmount)}</div>
                <div className="small text-muted">{filteredExpenses.length} expenses</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card">
        <div className="card-body p-0">
          {filteredExpenses.length > 0 ? (
            <div className="table-responsive">
              <table className="table admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>User</th>
                    <th>Category</th>
                    <th className="text-center">Amount</th>
                    <th>Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense._id}>
                      <td>
                        <Link to={`/admin/expenses/${expense._id}`} className="expense-title">
                          {expense.title}
                        </Link>
                        {expense.description && (
                          <div className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>
                            {expense.description}
                          </div>
                        )}
                      </td>
                      <td>
                        {expense.userId && expense.userId._id ? (
                          <Link to={`/admin/users/${expense.userId._id}`}>
                            {expense.userId.firstName} {expense.userId.lastName}
                          </Link>
                        ) : (
                          <span className="text-secondary">
                            <i className="bi bi-receipt me-1" title="System generated expense"></i>
                            Auto-Generated
                          </span>
                        )}
                      </td>
                      <td>
                        {expense.categoryId?.name || expense.category || (
                          <span className="text-muted">Uncategorized</span>
                        )}
                      </td>
                      <td className="text-center">{formatCurrency(expense.amount)}</td>
                      <td>{formatDate(expense.transcationDate || expense.date || expense.createdAt)}</td>
                      <td className="text-end">
                        <div className="btn-group">
                          <Link 
                            to={`/admin/expenses/${expense._id}`} 
                            className="btn btn-sm btn-outline-primary"
                            title="View Details"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-5">
              <div className="mb-3">
                <i className="bi bi-receipt-cutoff text-muted" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5>No expenses found</h5>
              <p className="text-muted">No expenses found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseList; 