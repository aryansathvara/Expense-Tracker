import axios from "axios";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { toast } from 'react-toastify';

const IncomeForm = () => {
  const [accounts, setAccounts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      title: "",
      amount: "",
      accountId: "",
      transcationDate: new Date().toISOString().split('T')[0],
      description: "",
      status: "pending"
    }
  });

  // Fetch accounts on component mount
  useEffect(() => {
    getAccounts();
  }, []);

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
      
      // First, check if the server is available
      try {
        await axios.get("/account");
      } catch (error) {
        if (error.code === "ERR_NETWORK") {
          toast.error("Cannot connect to the server. Please check if the backend is running at http://localhost:3000");
          setIsSubmitting(false);
          return;
        }
      }
      
      // Submit the income data
      try {
        const res = await axios.post("/addincome", data, {
          timeout: 10000 // 10 second timeout
        });
        
        if (res.status === 201) {
          toast.success("Income added successfully!");
          reset(); // Reset form fields
          navigate("/user/income"); // Navigate to income list
        }
      } catch (submitError) {
        console.error("Data submit error:", submitError);
        if (submitError.code === "ERR_NETWORK") {
          toast.error("Network error: Cannot connect to the server. Please make sure the backend is running.");
        } else if (submitError.code === "ECONNABORTED") {
          toast.error("Request timed out. The server might be busy or not responding.");
        } else {
          toast.error(`Error submitting data: ${submitError.response?.data?.message || submitError.message}`);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch accounts
  const getAccounts = async () => {
    try {
      const res = await axios.get("/account");
      console.log("Accounts:", res.data.data);
      setAccounts(res.data.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to load accounts");
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

  return (
    <div className="container-fluid py-4">
      {isSubmitting && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 9999 }}>
          <div className="text-center">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Adding income...</p>
          </div>
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">Add New Income</h1>
        <Link to="/user/income" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>View Income List
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
                <div className="form-check">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="status"
                    {...register("status")}
                    onChange={(e) => {
                      const value = e.target.checked ? "completed" : "pending";
                      reset({ ...register, status: value });
                    }}
                  />
                  <label className="form-check-label" htmlFor="status">
                    Mark as Completed
                  </label>
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
                    Adding...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Income
                  </>
                )}
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={() => reset()}
              >
                <i className="bi bi-arrow-counterclockwise me-2"></i>
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IncomeForm; 