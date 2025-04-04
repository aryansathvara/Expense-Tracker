import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useToastConfig from '../../hooks/useToastConfig';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newSubcategory, setNewSubcategory] = useState({ name: '', description: '', categoryId: '' });
  
  // Use custom toast hook
  const toast = useToastConfig();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoryResponse = await axios.get('/category');
        setCategories(categoryResponse.data.data);
        
        // Fetch subcategories
        const subcategoryResponse = await axios.get('/subcategory');
        setSubcategories(subcategoryResponse.data.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
        setLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/category', newCategory);
      setCategories([...categories, response.data.data]);
      setNewCategory({ name: '', description: '' });
    } catch (err) {
      console.error('Error adding category:', err);
      setLoading(false);
    }
  };

  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/subcategory', newSubcategory);
      setSubcategories([...subcategories, response.data.data]);
      setNewSubcategory({ name: '', description: '', categoryId: '' });
    } catch (err) {
      console.error('Error adding subcategory:', err);
      setLoading(false);
    }
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
      <h1 className="mb-4">Category Management</h1>
      
      <div className="row">
        {/* Categories Section */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">Categories</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleCategorySubmit} className="mb-4">
                <div className="mb-3">
                  <label htmlFor="categoryName" className="form-label">Category Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="categoryName" 
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="categoryDescription" className="form-label">Description</label>
                  <textarea 
                    className="form-control" 
                    id="categoryDescription" 
                    rows="2"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Add Category</button>
              </form>
              
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="text-center">No categories found</td>
                      </tr>
                    ) : (
                      categories.map((category) => (
                        <tr key={category._id}>
                          <td>{category.name}</td>
                          <td>{category.description || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Subcategories Section */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h5 className="card-title mb-0">Subcategories</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubcategorySubmit} className="mb-4">
                <div className="mb-3">
                  <label htmlFor="parentCategory" className="form-label">Parent Category</label>
                  <select 
                    className="form-select" 
                    id="parentCategory"
                    value={newSubcategory.categoryId}
                    onChange={(e) => setNewSubcategory({...newSubcategory, categoryId: e.target.value})}
                    required
                  >
                    <option value="">Select Parent Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="subcategoryName" className="form-label">Subcategory Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="subcategoryName" 
                    value={newSubcategory.name}
                    onChange={(e) => setNewSubcategory({...newSubcategory, name: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="subcategoryDescription" className="form-label">Description</label>
                  <textarea 
                    className="form-control" 
                    id="subcategoryDescription" 
                    rows="2"
                    value={newSubcategory.description}
                    onChange={(e) => setNewSubcategory({...newSubcategory, description: e.target.value})}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-success">Add Subcategory</button>
              </form>
              
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Parent Category</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subcategories.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center">No subcategories found</td>
                      </tr>
                    ) : (
                      subcategories.map((subcategory) => {
                        const parentCategory = categories.find(
                          cat => cat._id === (typeof subcategory.categoryId === 'object' 
                            ? subcategory.categoryId._id 
                            : subcategory.categoryId)
                        );
                        
                        return (
                          <tr key={subcategory._id}>
                            <td>{subcategory.name}</td>
                            <td>{parentCategory ? parentCategory.name : 'N/A'}</td>
                            <td>{subcategory.description || 'N/A'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories; 