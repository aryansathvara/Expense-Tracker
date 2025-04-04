import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const Expence = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('id');
  const location = useLocation();

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      axios.defaults.baseURL = 'http://localhost:3000';
      const response = await axios.get('/expense/expence');
      
      if (response.data && response.data.data) {
        const userExpenses = response.data.data.filter(expense => 
          expense.userId && expense.userId._id === userId
        );
        
        console.log('Fetched expenses:', userExpenses);
        setExpenses(userExpenses);
        setLoading(false);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses. Please check your connection and try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [userId]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('refresh') === 'true') {
      fetchExpenses();
    }
  }, [location.search]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {expenses.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No expenses found.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id}>
                  <td>{expense.title}</td>
                  <td>{expense.categoryId?.name || 'N/A'}</td>
                  <td>{formatCurrency(expense.amount)}</td>
                  <td>{formatDate(expense.transcationDate)}</td>
                  <td>
                    <span className={`badge ${expense.status ? 'bg-success' : 'bg-danger'}`}>
                      {expense.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Expence;
