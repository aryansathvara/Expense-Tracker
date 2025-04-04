import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ExpenseManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenseStats, setExpenseStats] = useState({
    total: 0,
    recent: []
  });
  const userId = localStorage.getItem('id');

  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/expense/expence');
        
        // Filter expenses for the current user only
        const userExpenses = response.data.data.filter(expense => 
          expense.userId && expense.userId._id === userId
        );
        
        // Sort by date and get recent 3
        const recentExpenses = [...userExpenses]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
        
        setExpenseStats({
          total: userExpenses.length,
          recent: recentExpenses
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching expense data:', err);
        setError('Unable to load expense data. Please try again later.');
        setLoading(false);
      }
    };

    fetchExpenseData();
  }, [userId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <h1 className="mb-4">Expense Management</h1>
      
      {error && (
        <div className="alert alert-warning mb-4">
          {error}
        </div>
      )}
      
      {/* Quick Action Buttons */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-3">
                <Link to="/user/add-expense" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Add New Expense
                </Link>
                <Link to="/user/expenses" className="btn btn-success">
                  <i className="bi bi-table me-2"></i>
                  View All Expenses
                </Link>
                <Link to="/user/reports" className="btn btn-info">
                  <i className="bi bi-bar-chart me-2"></i>
                  Generate Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Expense Management Info */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">About Expense Management</h5>
            </div>
            <div className="card-body">
              <p>Welcome to the Expense Management section. Here you can:</p>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Add new expenses with details like amount, category, and receipts</li>
                <li className="list-group-item">View and filter all your expenses</li>
                <li className="list-group-item">Edit existing expense information</li>
                <li className="list-group-item">Generate reports to analyze spending patterns</li>
              </ul>
              <p className="mt-3">Use the quick action buttons above to get started!</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Tips for Effective Expense Tracking</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <strong>Categorize properly</strong> - Using the right categories helps in generating meaningful reports
                </li>
                <li className="list-group-item">
                  <strong>Add receipts</strong> - Upload images of receipts for better record-keeping
                </li>
                <li className="list-group-item">
                  <strong>Regular updates</strong> - Add expenses as they occur to maintain accurate records
                </li>
                <li className="list-group-item">
                  <strong>Review reports</strong> - Regularly check reports to understand spending patterns
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseManagement; 