import axios from "axios";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link, useParams } from "react-router-dom";
import { toast } from 'react-toastify';

const EditIncome = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm();

  // Fetch income details and accounts on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch income details and accounts in parallel
        const [incomeResponse, accountsResponse] = await Promise.all([
          axios.get(`/income/${id}`),
          axios.get("/account")
        ]);
        
        const incomeData = incomeResponse.data.data;
        const accountsData = accountsResponse.data.data;
        
        setAccounts(accountsData);
        
        // Populate the form with income data
        setValue("title", incomeData.title);
        setValue("amount", incomeData.amount);
        setValue("accountId", incomeData.accountId?._id);
        setValue("transcationDate", new Date(incomeData.transcationDate).toISOString().split('T')[0]);
        setValue("description", incomeData.description);
        setValue("status", incomeData.status);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load income details. Please try again.");
        navigate("/user/income");
      }
    };
    
    fetchData();
  }, [id, setValue, navigate]);

  const submitHandler = async (data) => {
    setIsSubmitting(true);
    try {
      // Set user ID from localStorage if available
      const userId = localStorage.getItem('id');
      if (userId) {
        data.userId = userId;
      } else {
        toast.error("User not authenticated. Please log in again.");
        navigate("/login");
        return;
      }
      
      // Parse amount to ensure it's a number
      data.amount = parseFloat(data.amount);
      
      // Update the income data
      const response = await axios.put(`/income/${id}`, data);
      
      if (response.status === 200) {
        toast.success("Income updated successfully!");
        navigate("/user/income");
      }
    } catch (error) {
      console.error("Error updating income:", error);
      toast.error(error.response?.data?.message || "Failed to update income. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form validation rules
  const formValidation = {
    title: {
      required: {
        value: true,
        message: "Title is required"
      }
    },
    amount: {
      required: {
        value: true,
        message: "Amount is required"
      },
      pattern: {
        value: /^[0-9]+(\.[0-9]{1,2})?$/,
        message: "Enter a valid amount (numbers only, up to 2 decimal places)"
      },
      min: {
        value: 0.01,
        message: "Amount must be greater than 0"
      }
    },
    accountId: {
      required: {
        value: true,
        message: "Account is required"
      }
    },
    transcationDate: {
      required: {
        value: true,
        message: "Transaction Date is required"
      }
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading income data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {isSubmitting && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 9999 }}>
          <div className="text-center">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Updating income...</p>
          </div>
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">Edit Income</h1>
        <Link to="/user/income" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>Back to Income List
        </Link>
      </div>
      
      <div className="card">
        <div className="card-header bg-success text-white">
          <h5 className="card-title mb-0">Income Details</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit(submitHandler)}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Title</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-tag"></i></span>
                  <input 
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`} 
                    placeholder="Enter income title"
                    {...register("title", formValidation.title)} 
                  />
                </div>
                {errors.title && (
                  <div className="invalid-feedback d-block">
                    {errors.title.message}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Amount</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-currency-dollar"></i></span>
                  <input 
                    type="number" 
                    step="0.01" 
                    className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                    placeholder="0.00"
                    {...register("amount", formValidation.amount)} 
                  />
                </div>
                {errors.amount && (
                  <div className="invalid-feedback d-block">
                    {errors.amount.message}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Account</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-bank"></i></span>
                  <select 
                    className={`form-select ${errors.accountId ? 'is-invalid' : ''}`}
                    {...register("accountId", formValidation.accountId)}
                  >
                    <option value="">Select an account</option>
                    {accounts && accounts.length > 0 ? (
                      accounts.map((account) => (
                        <option key={account._id} value={account._id}>
                          {account.title}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No accounts found</option>
                    )}
                  </select>
                </div>
                {errors.accountId && (
                  <div className="invalid-feedback d-block">
                    {errors.accountId.message}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Transaction Date</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-calendar"></i></span>
                  <input 
                    type="date" 
                    className={`form-control ${errors.transcationDate ? 'is-invalid' : ''}`}
                    {...register("transcationDate", formValidation.transcationDate)} 
                  />
                </div>
                {errors.transcationDate && (
                  <div className="invalid-feedback d-block">
                    {errors.transcationDate.message}
                  </div>
                )}
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Description</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-text-paragraph"></i></span>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    placeholder="Enter additional details about this income"
                    {...register("description")}
                  ></textarea>
                </div>
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">Status</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-check-circle"></i></span>
                  <select 
                    className="form-select"
                    {...register("status")}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="d-flex gap-2">
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Update Income
                  </>
                )}
              </button>
              <Link 
                to="/user/income" 
                className="btn btn-outline-secondary"
              >
                <i className="bi bi-x-circle me-2"></i>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditIncome; 