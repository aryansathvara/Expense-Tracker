import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import useToastConfig from "../../hooks/useToastConfig";

// Changed to a default export for consistency
const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const userId = localStorage.getItem("id");
  const navigate = useNavigate();
  
  // Use custom toast hook
  const toast = useToastConfig();

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        
        // Create axios instance with correct URL and configuration
        const instance = axios.create({
          baseURL: 'http://localhost:3000',
          timeout: 15000, // Increased timeout
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log("Attempting to fetch expenses for user ID:", userId);
        
        // Make the API call with better error handling
        const response = await instance.get('/expense/expence');
        console.log("API Response:", response.data);
        
        if (response.data && response.data.data) {
          // Filter expenses to show only those belonging to this user
          const userExpenses = response.data.data.filter(expense => 
            expense.userId && expense.userId._id === userId
          );
          console.log(`Found ${userExpenses.length} expenses for this user`);
          
          // Sort expenses by date (newest first)
          userExpenses.sort((a, b) => {
            const dateA = new Date(a.transcationDate || a.createdAt);
            const dateB = new Date(b.transcationDate || b.createdAt);
            return dateB - dateA;
          });
          
          setExpenses(userExpenses);
          
          // Remove toast notification
          // toast.success(`Loaded ${userExpenses.length} expenses for this user`);
        } else {
          // Handle case where data is missing or in wrong format
          console.warn("Invalid response format:", response.data);
          setError("Received invalid data format from server");
          setExpenses([]);
        }
      } catch (err) {
        console.error("Error fetching expenses:", err);
        
        // More specific error message based on the error type
        let errorMessage = "Failed to load expenses. Please try again.";
        
        if (err.code === "ERR_NETWORK") {
          errorMessage = "Network error. Please check your connection.";
        } else if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage = err.response.data.message || `Server error: ${err.response.status}`;
        }
        
        setError(errorMessage);
        // Remove toast notification
        // toast.error(errorMessage);
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExpenses();
  }, [userId]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount || 0);
    } catch (e) {
      return '₹0.00';
    }
  };

  // Handle delete expense
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        setActionLoading(id);
        
        // Make sure the base URL is set
        axios.defaults.baseURL = 'http://localhost:3000';
        
        // Call the correct API endpoint with proper error handling
        const deleteResponse = await axios.delete(`/expense/expence/${id}`);
        
        if (deleteResponse.status === 200) {
          // Success message
          toast.success("Expense deleted successfully!");
          
          // Remove the deleted expense from state
          setExpenses(prevExpenses => prevExpenses.filter(expense => expense._id !== id));
        } else {
          throw new Error("Failed to delete expense");
        }
      } catch (err) {
        console.error("Error deleting expense:", err);
        toast.error(`Failed to delete expense: ${err.message || "Unknown error"}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Function to handle viewing expense details
  const handleViewDetails = (expense) => {
    navigate(`/user/expense-details/${expense._id}`);
  };
  
  // Function to retry fetching data
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchExpenses();
  };

  if (loading) {
    return (
      <div className="container mt-5 pt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your expenses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 pt-5">
        <div className="alert alert-danger">
          <h5>Error Loading Data</h5>
          <p>{error}</p>
          <div className="mt-3">
            <button 
              className="btn btn-primary" 
              onClick={handleRetry}
            >
              <i className="bi bi-arrow-clockwise me-1"></i> Try Again
            </button>
            <Link to="/user/dashboard" className="btn btn-outline-secondary ms-2">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 px-4">
              <h5 className="card-title mb-0 fw-bold">My Expenses</h5>
            </div>
            <div className="card-body p-0">
              {expenses.length === 0 ? (
                <div className="alert alert-info rounded-0 mb-0 text-center">
                  <i className="bi bi-info-circle me-2 fs-4"></i>
                  <p className="mb-2">You haven't added any expenses yet.</p>
                  <Link to="/user/add-expense" className="btn btn-success rounded-pill">
                    <i className="bi bi-plus-circle me-1"></i> Add Your First Expense
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>TITLE</th>
                        <th>CATEGORY</th>
                        <th>AMOUNT</th>
                        <th>DATE</th>
                        <th className="text-center">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense, index) => (
                        <tr key={expense._id || `expense-${index}`}>
                          <td>{expense.title || 'Shopping'}</td>
                          <td>{expense.categoryId?.name || 'household'}</td>
                          <td>{formatCurrency(expense.amount)}</td>
                          <td>{formatDate(expense.transcationDate || expense.createdAt)}</td>
                          <td className="text-center">
                            <button
                              onClick={() => handleViewDetails(expense)}
                              className="btn btn-view"
                            >
                              <i className="bi bi-eye me-1"></i> View
                            </button>
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
      </div>
    </div>
  );
};

export default Expense;