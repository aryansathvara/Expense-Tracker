import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const IncomeDetails = () => {
  const [income, setIncome] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchIncomeDetails();
  }, [id]);

  const fetchIncomeDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/income/${id}`);
      
      if (response.status === 200) {
        setIncome(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching income details:', error);
      toast.error('Failed to load income details');
      navigate('/user/income');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIncome = async () => {
    if (!window.confirm('Are you sure you want to delete this income?')) {
      return;
    }
    
    try {
      const response = await axios.delete(`/income/${id}`);
      
      if (response.status === 200) {
        toast.success('Income deleted successfully');
        navigate('/user/income');
      }
    } catch (error) {
      console.error('Error deleting income:', error);
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
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
          <p className="mt-2">Loading income details...</p>
        </div>
      </div>
    );
  }

  if (!income) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Income not found or has been deleted.
        </div>
        <Link to="/user/income" className="btn btn-primary">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Income List
        </Link>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">Income Details</h1>
        <Link to="/user/income" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Income List
        </Link>
      </div>

      <div className="card">
        <div className="card-header bg-success text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">{income.title}</h5>
            <span className={getStatusBadgeClass(income.status)}>
              {income.status}
            </span>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-4">
                <h5 className="text-muted mb-2">Amount</h5>
                <h2 className="mb-0">{formatCurrency(income.amount)}</h2>
              </div>
              
              <div className="mb-4">
                <h5 className="text-muted mb-2">Account</h5>
                <p className="mb-0">{income.accountId?.title || 'N/A'}</p>
              </div>
              
              <div className="mb-4">
                <h5 className="text-muted mb-2">Transaction Date</h5>
                <p className="mb-0">{formatDate(income.transcationDate)}</p>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="mb-4">
                <h5 className="text-muted mb-2">Description</h5>
                <p className="mb-0">{income.description || 'No description provided'}</p>
              </div>
              
              <div className="mb-4">
                <h5 className="text-muted mb-2">Added On</h5>
                <p className="mb-0">{formatDate(income.createdAt)}</p>
              </div>
              
              <div className="mb-4">
                <h5 className="text-muted mb-2">Last Updated</h5>
                <p className="mb-0">{formatDate(income.updatedAt)}</p>
              </div>
            </div>
          </div>
          
          <hr className="my-4" />
          
          <div className="d-flex gap-2">
            <Link 
              to={`/user/edit-income/${income._id}`}
              className="btn btn-warning"
            >
              <i className="bi bi-pencil me-2"></i>
              Edit Income
            </Link>
            <button 
              className="btn btn-danger"
              onClick={handleDeleteIncome}
            >
              <i className="bi bi-trash me-2"></i>
              Delete Income
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeDetails; 