import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminIncomeDetails = () => {
  const [income, setIncome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
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
        setNewStatus(response.data.data.status);
      }
    } catch (error) {
      console.error('Error fetching income details:', error);
      toast.error('Failed to load income details');
      navigate('/admin/incomes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleStatusClick = () => {
    setShowStatusModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(`/income/${id}`);
      
      if (response.status === 200) {
        toast.success('Income deleted successfully');
        navigate('/admin/incomes');
      }
    } catch (error) {
      console.error('Error deleting income:', error);
      toast.error('Failed to delete income');
    }
  };

  const confirmStatusChange = async () => {
    try {
      const response = await axios.put(`/income/${id}`, {
        status: newStatus
      });
      
      if (response.status === 200) {
        toast.success('Income status updated successfully');
        setShowStatusModal(false);
        fetchIncomeDetails();
      }
    } catch (error) {
      console.error('Error updating income status:', error);
      toast.error('Failed to update income status');
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
        <Link to="/admin/incomes" className="btn btn-primary">
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
        <Link to="/admin/incomes" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Income List
        </Link>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
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
                    <h5 className="text-muted mb-2">User</h5>
                    <p className="mb-0">
                      {income.userId ? (
                        <Link to={`/admin/users/${income.userId._id}`}>
                          {`${income.userId.firstName || ''} ${income.userId.lastName || ''}`} ({income.userId.email})
                        </Link>
                      ) : (
                        'N/A'
                      )}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-muted mb-2">Account</h5>
                    <p className="mb-0">{income.accountId?.title || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-4">
                    <h5 className="text-muted mb-2">Transaction Date</h5>
                    <p className="mb-0">{formatDate(income.transcationDate)}</p>
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
              
              <div className="mb-4">
                <h5 className="text-muted mb-2">Description</h5>
                <p className="mb-0">{income.description || 'No description provided'}</p>
              </div>
              
              <hr className="my-4" />
              
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-warning"
                  onClick={handleStatusClick}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Change Status
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={handleDeleteClick}
                >
                  <i className="bi bi-trash me-2"></i>
                  Delete Income
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Income Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-outline-primary"
                  onClick={handleStatusClick}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Change Status
                </button>
                <button 
                  className="btn btn-outline-danger"
                  onClick={handleDeleteClick}
                >
                  <i className="bi bi-trash me-2"></i>
                  Delete Income
                </button>
                <Link 
                  to="/admin/incomes" 
                  className="btn btn-outline-secondary"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Income List
                </Link>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">Status History</h5>
            </div>
            <div className="card-body">
              <p className="text-muted">Current status: <span className={getStatusBadgeClass(income.status)}>{income.status}</span></p>
              <p className="text-muted">Last updated: {formatDate(income.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div className={`modal fade ${showDeleteModal ? 'show' : ''}`} style={{ display: showDeleteModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Deletion</h5>
              <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete the income entry: <strong>{income?.title}</strong>?
              <div className="alert alert-warning mt-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                This action cannot be undone.
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={confirmDelete}
              >
                Delete Income
              </button>
            </div>
          </div>
        </div>
      </div>
      {showDeleteModal && <div className="modal-backdrop fade show"></div>}

      {/* Status Change Modal */}
      <div className={`modal fade ${showStatusModal ? 'show' : ''}`} style={{ display: showStatusModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Change Income Status</h5>
              <button type="button" className="btn-close" onClick={() => setShowStatusModal(false)}></button>
            </div>
            <div className="modal-body">
              <p>Update status for income: <strong>{income?.title}</strong></p>
              <div className="mb-3">
                <label className="form-label">Status</label>
                <select 
                  className="form-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={confirmStatusChange}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
      {showStatusModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default AdminIncomeDetails; 