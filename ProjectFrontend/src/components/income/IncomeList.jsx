import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const IncomeList = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    fetchIncome();
  }, []);

  const fetchIncome = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get userId from localStorage
      const userId = localStorage.getItem('id');
      
      if (!userId) {
        throw new Error('User not authenticated. Please log in.');
      }
      
      // Fetch incomes for current user
      const response = await axios.get(`/income?userId=${userId}`);
      
      if (response.status === 200) {
        setIncomes(response.data.data);
        
        // Calculate total income (excluding rejected ones)
        const completedIncomes = response.data.data.filter(
          income => getSafeStatus(income.status) === 'completed'
        );
        
        const total = completedIncomes.reduce(
          (sum, income) => sum + (income.amount || 0), 
          0
        );
        
        setTotalIncome(total);
      }
    } catch (err) {
      console.error('Error fetching income:', err);
      setError(err.message || 'Failed to load income data');
      toast.error(err.message || 'Failed to load income data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIncome = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income?')) {
      return;
    }
    
    try {
      const response = await axios.delete(`/income/${id}`);
      
      if (response.status === 200) {
        toast.success('Income deleted successfully');
        fetchIncome(); // Refresh the list
      }
    } catch (err) {
      console.error('Error deleting income:', err);
      toast.error('Failed to delete income');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Add a helper function to safely get status
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

  const getStatusBadgeClass = (status) => {
    const safeStatus = getSafeStatus(status);
    switch (safeStatus) {
      case 'completed':
        return 'badge bg-success';
      case 'pending':
        return 'badge bg-warning';
      case 'rejected':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading income data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title mb-0">Income List</h1>
          <p className="text-muted">Manage your income entries</p>
        </div>
        <div>
          <Link to="/user/add-income" className="btn btn-success">
            <i className="bi bi-plus-circle me-2"></i>
            Add New Income
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Income Summary</h5>
            <button 
              className="btn btn-sm btn-outline-primary" 
              onClick={fetchIncome}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Income</h5>
                  <h3 className="mb-0">{formatCurrency(totalIncome)}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <h5 className="card-title">Income Entries</h5>
                  <h3 className="mb-0">{incomes.length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h5 className="card-title">Average Income</h5>
                  <h3 className="mb-0">
                    {formatCurrency(totalIncome / (incomes.filter(i => getSafeStatus(i.status) === 'completed').length || 1))}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-light">
          <h5 className="mb-0">Income History</h5>
        </div>
        <div className="card-body">
          {incomes.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-cash-coin display-1 text-muted"></i>
              <p className="mt-3">No income entries found</p>
              <Link to="/user/add-income" className="btn btn-success">
                <i className="bi bi-plus-circle me-2"></i>
                Add Your First Income
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Amount</th>
                    <th>Account</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((income) => (
                    <tr key={income._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-cash-stack text-success me-2"></i>
                          {income.title}
                        </div>
                        {income.description && (
                          <small className="text-muted d-block">{income.description}</small>
                        )}
                      </td>
                      <td className="fw-bold">{formatCurrency(income.amount)}</td>
                      <td>{income.accountId?.title || 'N/A'}</td>
                      <td>{formatDate(income.transcationDate)}</td>
                      <td>
                        <span className={getStatusBadgeClass(income.status)}>
                          {getSafeStatus(income.status)}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <Link 
                            to={`/user/income/${income._id}`} 
                            className="btn btn-sm btn-outline-primary"
                            title="View details"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                          <Link 
                            to={`/user/edit-income/${income._id}`} 
                            className="btn btn-sm btn-outline-secondary"
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                            onClick={() => handleDeleteIncome(income._id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncomeList; 