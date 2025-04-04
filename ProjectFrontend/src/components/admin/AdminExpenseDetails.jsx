import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useToastConfig from '../../hooks/useToastConfig';

const AdminExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    approve: false,
    reject: false,
    print: false
  });
  
  // Use the custom toast hook
  const toast = useToastConfig();

  // Function to fetch expense data
  const fetchExpenseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Configure axios base URL
      axios.defaults.baseURL = 'http://localhost:3000';
      
      console.log(`Fetching expense details for ID: ${id}`);
      const response = await axios.get(`/expense/getExpenceById/${id}`);
      console.log('Expense API Response:', response);
      
      if (response.data && response.data.data) {
        const expenseData = response.data.data;
        
        // Populate references if they exist
        const populatedExpense = {
          ...expenseData,
          paymentMethod: expenseData.paymentMethod || 'Cash', // Default to Cash if not specified
          vendor: expenseData.vendorId?.title || 'N/A',
          category: expenseData.categoryId?.name || 'Uncategorized',
          subcategory: expenseData.subcategoryId?.name || 'N/A',
          invoiceNumber: expenseData.invoiceNumber || 'N/A',
          taxAmount: expenseData.taxAmount || 0,
          currency: expenseData.currency || 'INR'
        };
        
        setExpense(populatedExpense);
        
        // Fetch user details if available
        if (expenseData.userId) {
          try {
            const userId = typeof expenseData.userId === 'object' ? expenseData.userId._id : expenseData.userId;
            const userResponse = await axios.get(`/auth/user/${userId}`);
            
            if (userResponse.data && userResponse.data.data) {
              setUserDetails(userResponse.data.data);
            }
          } catch (userError) {
            console.error('Error fetching user details:', userError);
          }
        }
      } else {
        throw new Error('Invalid expense data format');
      }
    } catch (error) {
      console.error('Error fetching expense data:', error);
      setError(`Failed to load expense details: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseData();
  }, [id]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchExpenseData();
  };

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

  // Format date
  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      return 'Invalid date';
    }
  };

  // Format time
  const formatTime = (dateString) => {
    try {
      const options = { hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleTimeString(undefined, options);
    } catch (err) {
      return 'Invalid time';
    }
  };

  // Handle approve expense
  const handleApprove = async () => {
    // Prevent multiple rapid calls
    if (actionLoading.approve) return;
    
    try {
      setActionLoading(prev => ({ ...prev, approve: true }));
      
      // Support both boolean and string status values
      const statusValue = typeof expense.status === 'boolean' ? true : 'approved';
      
      await axios.put(`/expense/updateExpenceStatus/${id}`, { status: statusValue });
      
      // Update local state
      setExpense(prev => ({
        ...prev,
        status: statusValue,
        updatedAt: new Date().toISOString()
      }));
      
      // Remove toast notification
      // toast.success('Expense has been approved successfully');
    } catch (err) {
      console.error('Error approving expense:', err);
      // Remove toast notification
      // toast.error('Failed to approve expense. Please try again.');
    } finally {
      // Add small delay before enabling button again
      setTimeout(() => {
        setActionLoading(prev => ({ ...prev, approve: false }));
      }, 500);
    }
  };

  // Handle reject expense
  const handleReject = async () => {
    // Prevent multiple rapid calls
    if (actionLoading.reject) return;
    
    try {
      setActionLoading(prev => ({ ...prev, reject: true }));
      
      // Support both boolean and string status values
      const statusValue = typeof expense.status === 'boolean' ? false : 'rejected';
      
      await axios.put(`/expense/updateExpenceStatus/${id}`, { status: statusValue });
      
      // Update local state
      setExpense(prev => ({
        ...prev,
        status: statusValue,
        updatedAt: new Date().toISOString()
      }));
      
      // Remove toast notification
      // toast.success('Expense has been rejected successfully');
    } catch (err) {
      console.error('Error rejecting expense:', err);
      // Remove toast notification
      // toast.error('Failed to reject expense. Please try again.');
    } finally {
      // Add small delay before enabling button again
      setTimeout(() => {
        setActionLoading(prev => ({ ...prev, reject: false }));
      }, 500);
    }
  };

  // Handle print details
  const handlePrint = () => {
    setActionLoading(prev => ({ ...prev, print: true }));
    
    // Create a printable version
    const printContent = document.getElementById('expense-details-content');
    const originalContent = document.body.innerHTML;
    
    // Set print styles
    const printStyles = `
      <style>
        body { font-family: Arial, sans-serif; color: #000; background: #fff; }
        .print-header { text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #ddd; }
        .print-section { margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
        .print-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .print-label { font-weight: normal; color: #666; }
        .print-value { font-weight: bold; }
        .print-title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .print-subtitle { font-size: 14px; color: #666; margin-bottom: 20px; }
        .print-footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; }
        @media print {
          body { margin: 20mm; }
          button { display: none !important; }
        }
      </style>
    `;
    
    // Create print content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Expense Details: ${expense.title || 'Expense'} - ${expense._id}</title>
          ${printStyles}
        </head>
        <body>
          <div class="print-header">
            <div class="print-title">Expense Details</div>
            <div class="print-subtitle">Generated on ${formatDate(new Date())} at ${formatTime(new Date())}</div>
          </div>
          
          <div class="print-section">
            <h3>Expense Summary</h3>
            <div class="print-row">
              <span class="print-label">Expense ID:</span>
              <span class="print-value">${expense._id}</span>
            </div>
            <div class="print-row">
              <span class="print-label">Title:</span>
              <span class="print-value">${expense.title || 'N/A'}</span>
            </div>
            <div class="print-row">
              <span class="print-label">Amount:</span>
              <span class="print-value">${formatCurrency(expense.amount)}</span>
            </div>
            <div class="print-row">
              <span class="print-label">Category:</span>
              <span class="print-value">${expense.category || 'Uncategorized'}</span>
            </div>
            <div class="print-row">
              <span class="print-label">Status:</span>
              <span class="print-value">${expense.status || 'N/A'}</span>
            </div>
            <div class="print-row">
              <span class="print-label">Date:</span>
              <span class="print-value">${formatDate(expense.date || expense.createdAt)}</span>
            </div>
          </div>
          
          ${expense.description ? `
          <div class="print-section">
            <h3>Description</h3>
            <p>${expense.description}</p>
          </div>
          ` : ''}
          
          ${expense.userId ? `
          <div class="print-section">
            <h3>User Information</h3>
            <div class="print-row">
              <span class="print-label">Name:</span>
              <span class="print-value">${expense.userId.firstName} ${expense.userId.lastName}</span>
            </div>
            <div class="print-row">
              <span class="print-label">Email:</span>
              <span class="print-value">${expense.userId.email}</span>
            </div>
            <div class="print-row">
              <span class="print-label">User ID:</span>
              <span class="print-value">${expense.userId._id}</span>
            </div>
            ${expense.userId.phone ? `
            <div class="print-row">
              <span class="print-label">Phone:</span>
              <span class="print-value">${expense.userId.phone}</span>
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <div class="print-section">
            <h3>Additional Details</h3>
            <div class="print-row">
              <span class="print-label">Payment Method:</span>
              <span class="print-value">${expense.paymentMethod || 'N/A'}</span>
            </div>
            <div class="print-row">
              <span class="print-label">Vendor/Merchant:</span>
              <span class="print-value">${expense.vendor || expense.vendorId?.name || 'N/A'}</span>
            </div>
            <div class="print-row">
              <span class="print-label">Invoice #:</span>
              <span class="print-value">${expense.invoiceNumber || 'N/A'}</span>
            </div>
          </div>
          
          <div class="print-footer">
            <p>This is a computer-generated document. No signature is required.</p>
            <p>Expense Tracker System - Generated on ${formatDate(new Date())}</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Slight delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = function() {
        printWindow.close();
        setActionLoading(prev => ({ ...prev, print: false }));
      };
    }, 500);
  };

  // Handle adding comments
  const [newComment, setNewComment] = useState('');
  
  const handleAddComment = async () => {
    if (!newComment.trim()) {
      // Remove toast notification
      // toast.warning('Please enter a comment');
      return;
    }
    
    try {
      const response = await axios.post(`/expense/addComment/${id}`, {
        text: newComment,
        user: 'Admin'
      });
      
      // Update local state
      const updatedComments = [...(expense.comments || []), {
        user: 'Admin',
        text: newComment,
        timestamp: new Date().toISOString()
      }];
      
      setExpense(prev => ({
        ...prev,
        comments: updatedComments,
        updatedAt: new Date().toISOString()
      }));
      
      setNewComment('');
      // Remove toast notification
      // toast.success('Comment added successfully');
    } catch (err) {
      console.error('Error adding comment:', err);
      // Remove toast notification
      // toast.error('Failed to add comment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="admin-expense-header">
          <h2 className="admin-page-title">Expense Details</h2>
          <Link to="/admin/expenses" className="btn btn-outline-primary">
            <i className="bi bi-arrow-left me-2"></i>Back to Expenses
          </Link>
        </div>
        <div className="card admin-card shadow-sm">
          <div className="card-body text-center">
            <div className="spinner-border text-primary my-5" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading expense details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="admin-expense-header">
          <h2 className="admin-page-title">Expense Details</h2>
          <Link to="/admin/expenses" className="btn btn-outline-primary">
            <i className="bi bi-arrow-left me-2"></i>Back to Expenses
          </Link>
        </div>
        <div className="card admin-card shadow-sm">
          <div className="card-body text-center">
            <div className="text-danger mb-4">
              <i className="bi bi-exclamation-triangle fs-1"></i>
            </div>
            <h5 className="text-danger">{error}</h5>
            <button 
              className="btn btn-primary mt-3" 
              onClick={handleRetry}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="admin-expense-header">
        <h2 className="admin-page-title">Expense Details</h2>
        <Link to="/admin/expenses" className="btn btn-outline-primary">
          <i className="bi bi-arrow-left me-2"></i>Back to Expenses
        </Link>
      </div>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title mb-0">Expense Details</h1>
          <p className="text-muted">View expense information</p>
        </div>
        <div>
          <Link to="/admin/expenses" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Expenses
          </Link>
        </div>
      </div>
      
      {expense ? (
        <>
          {/* Expense Summary Card */}
          <div className="card admin-card shadow-sm mb-4">
            <div className="card-header">
              <h5 className="mb-0">Expense Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                <div></div>
                <span className={`badge ${
                  expense.status === 'approved' || expense.status === true ? 'bg-success' : 
                  expense.status === 'pending' ? 'bg-warning' : 
                  expense.status === 'rejected' || expense.status === false ? 'bg-danger' : 'bg-secondary'
                }`}>
                  {typeof expense.status === 'string' 
                    ? expense.status.toUpperCase() 
                    : expense.status === true 
                      ? 'APPROVED' 
                      : expense.status === false 
                        ? 'REJECTED' 
                        : 'UNKNOWN'}
                </span>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <p className="text-muted mb-1">Expense ID</p>
                  <p className="fw-bold mb-3">{expense._id}</p>
                  
                  <p className="text-muted mb-1">Amount</p>
                  <h3 className="fw-bold text-primary mb-3">
                    {formatCurrency(expense.amount)}
                  </h3>
                  
                  <p className="text-muted mb-1">Category</p>
                  <p className="fw-bold mb-3">{expense.category || 'N/A'}</p>
                </div>
                
                <div className="col-md-6">
                  <p className="text-muted mb-1">Date Submitted</p>
                  <p className="fw-bold mb-3">{formatDate(expense.date || expense.createdAt)}</p>
                  
                  <p className="text-muted mb-1">Time</p>
                  <p className="fw-bold mb-3">{formatTime(expense.date || expense.createdAt)}</p>
                  
                  <p className="text-muted mb-1">Description</p>
                  <p className="mb-3">{expense.description || 'No description provided'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* User Information */}
          <div className="card admin-card shadow-sm mb-4">
            <div className="card-header">
              <h5 className="mb-0">User Information</h5>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="admin-avatar me-3 bg-secondary">
                  <i className="bi bi-person text-white"></i>
                </div>
                <div>
                  <h5 className="mb-1">{expense.userId?.firstName} {expense.userId?.lastName || 'Auto-Generated'}</h5>
                  <p className="text-muted mb-0">{expense.userId?.email || 'No email provided'}</p>
                </div>
              </div>
              <div className="mt-3">
                <span className="badge bg-info">
                  {expense.userId?.role || 'User'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Additional Details */}
          <div className="card admin-card shadow-sm mb-4">
            <div className="card-header">
              <h5 className="mb-0">Additional Details</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <p className="text-muted mb-1">Payment Method</p>
                  <p className="fw-bold mb-3">{expense.paymentMethod}</p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted mb-1">Vendor</p>
                  <p className="fw-bold mb-3">{expense.vendor}</p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted mb-1">Category</p>
                  <p className="fw-bold mb-3">{expense.category}</p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted mb-1">Subcategory</p>
                  <p className="fw-bold mb-3">{expense.subcategory}</p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted mb-1">Invoice Number</p>
                  <p className="fw-bold mb-3">{expense.invoiceNumber}</p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted mb-1">Tax Amount</p>
                  <p className="fw-bold mb-3">
                    {expense.taxAmount ? formatCurrency(expense.taxAmount) : 'N/A'}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted mb-1">Currency</p>
                  <p className="fw-bold mb-3">{expense.currency}</p>
                </div>
                <div className="col-md-6">
                  <p className="text-muted mb-1">Transaction Date</p>
                  <p className="fw-bold mb-3">{formatDate(expense.transcationDate || expense.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="card admin-card shadow-sm mb-4">
            <div className="card-header">
              <h5 className="mb-0">Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-flex gap-2 mb-4">
                <button 
                  className="btn btn-success"
                  onClick={handleApprove}
                  disabled={expense.status === 'approved' || expense.status === true || actionLoading.approve}
                >
                  {actionLoading.approve ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...</>
                  ) : (
                    <><i className="bi bi-check-circle me-2"></i>Approve Expense</>
                  )}
                </button>
                
                <button 
                  className="btn btn-danger"
                  onClick={handleReject}
                  disabled={expense.status === 'rejected' || expense.status === false || actionLoading.reject}
                >
                  {actionLoading.reject ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...</>
                  ) : (
                    <><i className="bi bi-x-circle me-2"></i>Reject Expense</>
                  )}
                </button>
                
                <button 
                  className="btn btn-secondary"
                  onClick={handlePrint}
                  disabled={actionLoading.print}
                >
                  {actionLoading.print ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Preparing...</>
                  ) : (
                    <><i className="bi bi-printer me-2"></i>Print Details</>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Comments Section */}
          <div className="card admin-card shadow-sm mb-4">
            <div className="card-header">
              <h5 className="mb-0">Comments</h5>
            </div>
            <div className="card-body">
              {expense.comments && expense.comments.length > 0 ? (
                <div className="comments-list mb-4">
                  {expense.comments.map((comment, index) => (
                    <div key={index} className="comment-item p-3 mb-2 border-bottom">
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold">{comment.user}</span>
                        <small className="text-muted">{formatDate(comment.timestamp)} at {formatTime(comment.timestamp)}</small>
                      </div>
                      <p className="mb-0 mt-2">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-4">No comments yet</p>
              )}
              
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button 
                  className="btn btn-primary" 
                  type="button"
                  onClick={handleAddComment}
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Expense not found. It may have been deleted or you don't have permission to view it.
          <div className="mt-3">
            <Link to="/admin/expenses" className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              Back to All Expenses
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExpenseDetails; 