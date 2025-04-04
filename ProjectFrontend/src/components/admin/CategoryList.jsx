import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // In a real app, we would fetch from API
        // For now, use sample data
        setSampleCategories();
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Using sample data instead.');
        setSampleCategories();
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const setSampleCategories = () => {
    const sampleCategories = [
      {
        id: 1,
        name: 'Food & Dining',
        description: 'Restaurants, groceries, and food delivery',
        count: 42,
        totalSpent: 24500.75,
        color: '#4e73df',
        icon: 'bi-cart4'
      },
      {
        id: 2,
        name: 'Transportation',
        description: 'Public transit, fuel, and vehicle maintenance',
        count: 36,
        totalSpent: 18750.50,
        color: '#1cc88a',
        icon: 'bi-car-front'
      },
      {
        id: 3,
        name: 'Housing',
        description: 'Rent, mortgage, and home maintenance',
        count: 15,
        totalSpent: 95000.00,
        color: '#36b9cc',
        icon: 'bi-house'
      },
      {
        id: 4,
        name: 'Entertainment',
        description: 'Movies, events, and subscriptions',
        count: 28,
        totalSpent: 12300.25,
        color: '#f6c23e',
        icon: 'bi-film'
      },
      {
        id: 5,
        name: 'Shopping',
        description: 'Clothing, electronics, and personal items',
        count: 37,
        totalSpent: 32450.60,
        color: '#e74a3b',
        icon: 'bi-bag'
      },
      {
        id: 6,
        name: 'Utilities',
        description: 'Electricity, water, internet, and phone',
        count: 24,
        totalSpent: 15800.30,
        color: '#6f42c1',
        icon: 'bi-lightning'
      }
    ];
    
    setCategories(sampleCategories);
  };

  // Format currency in Indian Rupees (₹)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title mb-0">Expense Categories</h1>
          <p className="text-muted">Manage expense categories</p>
        </div>
        <div>
          <button className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Add Category
          </button>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-warning mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Categories Grid */}
      <div className="row">
        {categories.map(category => (
          <div key={category.id} className="col-md-4 mb-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div 
                    className="category-icon me-3" 
                    style={{ 
                      backgroundColor: `${category.color}25`, 
                      color: category.color,
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}
                  >
                    <i className={`bi ${category.icon}`}></i>
                  </div>
                  <div>
                    <h5 className="mb-0">{category.name}</h5>
                    <p className="text-muted small mb-0">{category.count} expenses</p>
                  </div>
                </div>
                <p className="text-muted small mb-3">{category.description}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small">Total Spent</span>
                    <div className="fw-bold">{formatCurrency(category.totalSpent)}</div>
                  </div>
                  <div>
                    <button className="btn btn-sm btn-outline-primary me-2">
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger">
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-5">
          <div className="mb-3">
            <i className="bi bi-tags text-muted" style={{ fontSize: '3rem' }}></i>
          </div>
          <h5>No Categories Found</h5>
          <p className="text-muted">There are no expense categories defined yet.</p>
          <button className="btn btn-primary mt-2">
            <i className="bi bi-plus-circle me-2"></i>
            Add Your First Category
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryList; 