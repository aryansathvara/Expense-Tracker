import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const EditExpense = () => {
  const [categorys, setCategorys] = useState([]);
  const [subcategorys, setSubcategorys] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const navigate = useNavigate();
  const { id } = useParams();
  const userId = localStorage.getItem('id');
  
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();

  // Fetch the expense data
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setInitialLoading(true);
        const response = await axios.get(`/expense/getExpenceById/${id}`);
        const expense = response.data.data;
        
        // Check if the expense belongs to the current user
        if (expense.userId && expense.userId._id !== userId) {
          // If not, show error and redirect to expenses list
          toast.error('You do not have permission to edit this expense', {
            position: "top-right",
            autoClose: 3000
          });
          navigate('/user/expenses');
          return;
        }
        
        // If the expense belongs to the user, continue with setting form values
        
        // Populate form with existing data
        Object.keys(expense).forEach((key) => {
          // Skip populating complex objects directly
          if (key !== 'categoryId' && key !== 'subcategoryId' && 
              key !== 'vendorId' && key !== 'accountId' && key !== 'userId') {
            setValue(key, expense[key]);
          }
        });
        
        // Set IDs for select fields
        if (expense.categoryId) {
          setValue('categoryId', typeof expense.categoryId === 'object' ? expense.categoryId._id : expense.categoryId);
          setSelectedCategory(typeof expense.categoryId === 'object' ? expense.categoryId._id : expense.categoryId);
        }
        
        if (expense.subcategoryId) {
          setValue('subcategoryId', typeof expense.subcategoryId === 'object' ? expense.subcategoryId._id : expense.subcategoryId);
        }
        
        if (expense.vendorId) {
          setValue('vendorId', typeof expense.vendorId === 'object' ? expense.vendorId._id : expense.vendorId);
        }
        
        if (expense.accountId) {
          setValue('accountId', typeof expense.accountId === 'object' ? expense.accountId._id : expense.accountId);
        }
        
        // Format date for input
        if (expense.transcationDate) {
          const date = new Date(expense.transcationDate);
          // Format date as YYYY-MM-DD for input field
          const formattedDate = date.toISOString().split('T')[0];
          setValue('transcationDate', formattedDate);
        }
        
        // Set image preview if available
        if (expense.expenceURL) {
          setImagePreview(expense.expenceURL);
        }
        
        setInitialLoading(false);
      } catch (err) {
        console.error('Error fetching expense:', err);
        setError('Failed to load expense data');
        setInitialLoading(false);
      }
    };

    fetchExpense();
  }, [id, setValue, navigate, userId]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/category');
        setCategorys(response.data.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    const fetchAccounts = async () => {
      try {
        const response = await axios.get('/account');
        setAccounts(response.data.data);
      } catch (err) {
        console.error('Error fetching accounts:', err);
      }
    };

    const fetchVendors = async () => {
      try {
        const response = await axios.get('/vendor');
        setVendors(response.data.data);
      } catch (err) {
        console.error('Error fetching vendors:', err);
      }
    };

    fetchCategories();
    fetchAccounts();
    fetchVendors();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedCategory) {
        setSubcategorys([]);
        return;
      }

      try {
        const response = await axios.get(`/subcategory?categoryId=${selectedCategory}`);
        setSubcategorys(response.data.data);
      } catch (err) {
        console.error('Error fetching subcategories:', err);
        setSubcategorys([]);
      }
    };

    fetchSubcategories();
  }, [selectedCategory]);

  const submitHandler = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Set user ID from localStorage if needed
      const userId = localStorage.getItem('id');
      if (userId && !data.userId) {
        data.userId = userId;
      }
      
      // If there's a new file selected, upload it with the form data
      if (selectedFile) {
        const formData = new FormData();
        
        // Add all form fields to formData
        Object.keys(data).forEach(key => {
          formData.append(key, data[key]);
        });
        
        // Add file to formData
        formData.append('image', selectedFile);
        
        const response = await axios.put(`/expense/updateExpence/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.status === 200) {
          toast.success("Expense updated successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          navigate('/expence/myexpence');
        }
      } else {
        // No new file, just update the form data
        const response = await axios.put(`/expense/updateExpence/${id}`, data);
        
        if (response.status === 200) {
          toast.success("Expense updated successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          navigate('/expence/myexpence');
        }
      }
    } catch (err) {
      console.error('Error updating expense:', err);
      toast.error("Failed to update expense. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formValidation = {
    title: {
      required: {
        value: true,
        message: 'Title is required'
      }
    },
    vendorId: {
      required: {
        value: true,
        message: 'Vendor is required'
      }
    },
    accountId: {
      required: {
        value: true,
        message: 'Account is required'
      }
    },
    transcationDate: {
      required: {
        value: true,
        message: 'Transaction Date is required'
      }
    },
    amount: {
      required: {
        value: true,
        message: 'Amount is required'
      }
    },
    categoryId: {
      required: {
        value: true,
        message: 'Category is required'
      }
    },
    subcategoryId: {
      required: {
        value: true,
        message: 'Subcategory is required'
      }
    },
    description: {
      required: {
        value: true,
        message: 'Description is required'
      }
    }
  };

  // Add a formatCurrency function for display if needed
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  if (initialLoading) {
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
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4 w-100" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4">Edit Expense</h2>

        <form onSubmit={handleSubmit(submitHandler)}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input className="form-control" {...register('title', formValidation.title)} />
            <span className="text-danger">
              {errors.title?.message}
            </span>
          </div>

          <div className="mb-3">
            <label className="form-label">Select Category</label>
            <select
              className="form-control"
              {...register('categoryId', formValidation.categoryId)}
              onChange={(e) => {
                const categoryId = e.target.value;
                setSelectedCategory(categoryId);
              }}
            >
              <option value="">Select</option>
              {categorys.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <span className="text-danger">
              {errors.categoryId?.message}
            </span>
          </div>

          <div className="mb-3">
            <label className="form-label">Select Subcategory</label>
            <select
              className="form-control"
              {...register('subcategoryId', formValidation.subcategoryId)}
              disabled={!selectedCategory}
            >
              <option value="">Select</option>
              {subcategorys.map((subcategory) => (
                <option key={subcategory._id} value={subcategory._id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
            <span className="text-danger">
              {errors.subcategoryId?.message}
            </span>
          </div>

          <div className="mb-3">
            <label className="form-label">Select Vendor</label>
            <select
              className="form-control"
              {...register('vendorId', formValidation.vendorId)}
            >
              <option value="">Select</option>
              {vendors.map((vendor) => (
                <option key={vendor._id} value={vendor._id}>
                  {vendor.title}
                </option>
              ))}
            </select>
            <span className="text-danger">
              {errors.vendorId?.message}
            </span>
          </div>

          <div className="mb-3">
            <label className="form-label">Select Account</label>
            <select
              className="form-control"
              {...register('accountId', formValidation.accountId)}
            >
              <option value="">Select</option>
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account.title}
                </option>
              ))}
            </select>
            <span className="text-danger">
              {errors.accountId?.message}
            </span>
          </div>

          <div className="mb-3">
            <label className="form-label">Amount</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              {...register('amount', formValidation.amount)}
            />
            <span className="text-danger">
              {errors.amount?.message}
            </span>
          </div>

          <div className="mb-3">
            <label className="form-label">Transaction Date</label>
            <input
              type="date"
              className="form-control"
              {...register('transcationDate', formValidation.transcationDate)}
            />
            <span className="text-danger">
              {errors.transcationDate?.message}
            </span>
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="3"
              {...register('description', formValidation.description)}
            />
            <span className="text-danger">
              {errors.description?.message}
            </span>
          </div>

          <div className="mb-3">
            <label className="form-label">Status</label>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="statusCheck"
                {...register('status')}
              />
              <label className="form-check-label" htmlFor="statusCheck">
                Active
              </label>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Upload Receipt (Image)</label>
            {imagePreview && (
              <div className="mb-2">
                <p>Current Receipt:</p>
                <img
                  src={imagePreview}
                  alt="Current Receipt"
                  className="img-thumbnail"
                  style={{ maxHeight: '150px' }}
                />
              </div>
            )}
            <input
              className="form-control"
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <small className="form-text text-muted">
              Upload a new image only if you want to change the current receipt.
            </small>
          </div>

          <div className="d-flex justify-content-between mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/expence/myexpence')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Updating...
                </>
              ) : (
                'Update Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpense; 