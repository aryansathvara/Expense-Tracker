import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useToastConfig from '../../hooks/useToastConfig';

const AdminCategories = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  
  // Use custom toast hook
  const toast = useToastConfig();
  
  // Fetch categories from the backend
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Configure axios base URL
      axios.defaults.baseURL = 'http://localhost:3000';
      
      // This is a placeholder - your actual endpoint may differ
      // You'll need to create this endpoint on your backend
      const response = await axios.get('/expense/categories');
      
      if (response.data && response.data.data) {
        setCategories(response.data.data);
      } else {
        // If no categories endpoint exists yet, use sample data
        setCategories([
          { _id: '1', name: 'Food', description: 'Food and dining expenses', count: 15 },
          { _id: '2', name: 'Travel', description: 'Transportation and travel costs', count: 8 },
          { _id: '3', name: 'Utilities', description: 'Utility bills and services', count: 5 },
          { _id: '4', name: 'Entertainment', description: 'Movies, events, and leisure activities', count: 7 },
          { _id: '5', name: 'Shopping', description: 'Retail purchases and shopping', count: 12 }
        ]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Using placeholder data.');
      
      // Fallback to sample data
      setCategories([
        { _id: '1', name: 'Food', description: 'Food and dining expenses', count: 15 },
        { _id: '2', name: 'Travel', description: 'Transportation and travel costs', count: 8 },
        { _id: '3', name: 'Utilities', description: 'Utility bills and services', count: 5 },
        { _id: '4', name: 'Entertainment', description: 'Movies, events, and leisure activities', count: 7 },
        { _id: '5', name: 'Shopping', description: 'Retail purchases and shopping', count: 12 }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission for adding a new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      return;
    }
    
    try {
      // This is a placeholder - your actual endpoint may differ
      // await axios.post('/expense/categories', newCategory);
      
      // For now, just add to the local state
      const newId = Math.random().toString(36).substring(2, 9);
      setCategories(prev => [...prev, { 
        _id: newId, 
        name: newCategory.name, 
        description: newCategory.description,
        count: 0
      }]);
      
      setNewCategory({ name: '', description: '' });
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };
  
  // Handle category deletion
  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        // This is a placeholder - your actual endpoint may differ
        // await axios.delete(`/expense/categories/${id}`);
        
        // For now, just remove from the local state
        setCategories(prev => prev.filter(category => category._id !== id));
      } catch (err) {
        console.error('Error deleting category:', err);
      }
    }
  };
  
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title mb-0">Categories Management</h1>
          <p className="text-muted">Manage expense categories</p>
        </div>
        <div>
          <Link to="/admin/expenses" className="btn btn-outline-primary">
            <i className="bi bi-receipt me-2"></i>
            Back to Expenses
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert">
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
        </div>
      )}
      
      {/* Add New Category Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Add New Category</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleAddCategory}>
            <div className="row g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Category Name"
                  name="name"
                  value={newCategory.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Description (optional)"
                  name="description"
                  value={newCategory.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-2">
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Add
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Categories List */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Existing Categories</h5>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading categories...</p>
            </div>
          ) : categories.length > 0 ? (
            <div className="table-responsive">
              <table className="table admin-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th className="text-center">Expenses</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id}>
                      <td>{category.name}</td>
                      <td>{category.description || 'No description'}</td>
                      <td className="text-center">
                        <span className="badge bg-info">{category.count || 0}</span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group">
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteCategory(category._id)}
                            title="Delete Category"
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
          ) : (
            <div className="text-center p-4">
              <p className="text-muted">No categories found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories; 