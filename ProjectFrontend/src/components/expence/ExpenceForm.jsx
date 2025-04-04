import axios from "axios";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { toast } from 'react-toastify';
// import "./AddExpenceForm.css"


const ExpenceForm = () => {
  const [categorys, setcategorys] = useState([])
  const [subcategorys, setsubcategorys] = useState([])
  const [accounts, setaccounts] = useState([])
  const [vendors, setvendors] = useState([])
  const [users, setusers] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
  
  // Watch the categoryId field for changes
  const watchedCategoryId = watch("categoryId");

  // Fetch all data on component mount
  useEffect(() => {
    getCategory();
    getAccount();
    getVendor();
    getUser();
  }, []);

  // Effect to fetch subcategories when category changes
  useEffect(() => {
    if (watchedCategoryId) {
      getSubCategoryByCategoryId(watchedCategoryId);
    } else {
      setsubcategorys([]);
    }
  }, [watchedCategoryId]);

  const submithandler = async (data) => {
    setIsSubmitting(true);
    try {
      // Set user ID from localStorage if available
      const userId = localStorage.getItem('id');
      if (userId) {
        data.userId = userId;
      }
      
      // Convert status from boolean to enum value
      data.status = data.status ? 'pending' : 'rejected';
      
      // First, check if the server is available
      try {
        await axios.get("/category");
      } catch (error) {
        if (error.code === "ERR_NETWORK") {
          toast.error("Cannot connect to the server. Please check if the backend is running at http://localhost:3000", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Handle file upload if file is selected
      if (selectedFile) {
        const formData = new FormData();
        
        // Add all form fields to formData
        Object.keys(data).forEach(key => {
          formData.append(key, data[key]);
        });
        
        // Add file to formData
        formData.append('image', selectedFile);
        
        try {
          const res = await axios.post("/expense/addWithFile", formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            timeout: 10000 // 10 second timeout
          });
          
          if (res.status === 200) {
            toast.success("Expense added successfully!", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            navigate("/user/expenses?refresh=true");
          }
        } catch (fileUploadError) {
          console.error("File upload error:", fileUploadError);
          if (fileUploadError.code === "ERR_NETWORK") {
            toast.error("Network error: Cannot connect to the server. Please make sure the backend is running.", {
              position: "top-right",
              autoClose: 5000,
            });
          } else if (fileUploadError.code === "ECONNABORTED") {
            toast.error("Request timed out. The server might be busy or not responding.", {
              position: "top-right",
              autoClose: 5000,
            });
          } else {
            toast.error(`Error uploading file: ${fileUploadError.message}`, {
              position: "top-right",
              autoClose: 5000,
            });
          }
          throw fileUploadError; // Rethrow to be caught by the outer catch block
        }
      } else {
        // No file, just submit the form data
        try {
          const res = await axios.post("/expense/addexpence", data, {
            timeout: 10000 // 10 second timeout
          });
          if (res.status === 200) {
            toast.success("Expense added successfully!", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            navigate("/user/expenses?refresh=true");
          }
        } catch (dataSubmitError) {
          console.error("Data submit error:", dataSubmitError);
          if (dataSubmitError.code === "ERR_NETWORK") {
            toast.error("Network error: Cannot connect to the server. Please make sure the backend is running.", {
              position: "top-right",
              autoClose: 5000,
            });
          } else if (dataSubmitError.code === "ECONNABORTED") {
            toast.error("Request timed out. The server might be busy or not responding.", {
              position: "top-right",
              autoClose: 5000,
            });
          } else {
            toast.error(`Error submitting data: ${dataSubmitError.message}`, {
              position: "top-right",
              autoClose: 5000,
            });
          }
          throw dataSubmitError; // Rethrow to be caught by the outer catch block
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form. Please try again.", {
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

  // Fetch categories once on component mount
  const getCategory = async () => {
    try {
      const res = await axios.get("/category");
      console.log("Category object:", res.data.data);
      setcategorys(res.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  // Fetch subcategories dynamically based on selected category
  const getSubCategoryByCategoryId = async (categoryId) => {
    if (!categoryId) {
      setsubcategorys([]); // Clear subcategories if no category is selected
      return;
    }

    try {
      setIsLoadingSubcategories(true);
      // Reset subcategory selection when category changes
      setValue("subcategoryId", "");
      
      const res = await axios.get(`/subcategory?categoryId=${categoryId}`);
      console.log("Filtered subcategories:", res.data);
      setsubcategorys(res.data.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setsubcategorys([]);
      toast.error("Failed to load subcategories");
    } finally {
      setIsLoadingSubcategories(false);
    }
  };

  const getAccount = async () => {
    try {
      const res = await axios.get("/account");
      console.log("account object", res.data.data)
      setaccounts(res.data.data)
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to load accounts");
    }
  };

  const getVendor = async () => {
    try {
      const res = await axios.get("/vendor");
      console.log("vendor object", res.data.data)
      setvendors(res.data.data)
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error("Failed to load vendors");
    }
  };

  const getUser = async () => {
    try {
      const res = await axios.get("/users");
      console.log("user object", res.data.data)
      setusers(res.data.data)
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const formvalidation = {
    title: {
      required: {
        value: true,
        message: "Title is required"
      }
    },
    vendorId: {
      required: {
        value: true,
        message: "Vendor is required"
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
    },
    amount: {
      required: {
        value: true,
        message: "Amount is required"
      }
    },
    categoryId: {
      required: {
        value: true,
        message: "Category is required"
      }
    },
    subcategoryId: {
      required: {
        value: true,
        message: "Subcategory is required"
      }
    },
    description: {
      required: {
        value: true,
        message: "Description is required"
      }
    }
  }

  return (
    <div className="container-fluid py-4">
      {isSubmitting && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 9999 }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Submitting expense...</p>
          </div>
        </div>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="page-title">Add New Expense</h1>
      </div>
      
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(submithandler)}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Title</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-tag"></i></span>
                  <input 
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`} 
                    placeholder="Enter expense title"
                    {...register("title", formvalidation.title)} 
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
                    {...register("amount", formvalidation.amount)} 
                  />
                </div>
                {errors.amount && (
                  <div className="invalid-feedback d-block">
                    {errors.amount.message}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Category</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-folder"></i></span>
                  <select
                    className={`form-select ${errors.categoryId ? 'is-invalid' : ''}`}
                    {...register("categoryId", formvalidation.categoryId)}
                  >
                    <option value="">Select a category</option>
                    {categorys?.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.categoryId && (
                  <div className="invalid-feedback d-block">
                    {errors.categoryId.message}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Subcategory</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-bookmark"></i></span>
                  <select
                    className={`form-select ${errors.subcategoryId ? 'is-invalid' : ''}`}
                    {...register("subcategoryId", formvalidation.subcategoryId)}
                    disabled={!watchedCategoryId || isLoadingSubcategories}
                  >
                    <option value="">
                      {isLoadingSubcategories 
                        ? "Loading subcategories..." 
                        : !watchedCategoryId 
                          ? "Select a category first" 
                          : subcategorys.length === 0 
                            ? "No subcategories found" 
                            : "Select a subcategory"}
                    </option>
                    {subcategorys?.map((subcategory) => (
                      <option key={subcategory._id} value={subcategory._id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.subcategoryId && (
                  <div className="invalid-feedback d-block">
                    {errors.subcategoryId.message}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Vendor</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-shop"></i></span>
                  <select 
                    className={`form-select ${errors.vendorId ? 'is-invalid' : ''}`}
                    {...register("vendorId", formvalidation.vendorId)}
                  >
                    <option value="">Select a vendor</option>
                    {vendors?.map((vendor) => (
                      <option key={vendor._id} value={vendor._id}>
                        {vendor.title}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.vendorId && (
                  <div className="invalid-feedback d-block">
                    {errors.vendorId.message}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Account</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-wallet2"></i></span>
                  <select 
                    className={`form-select ${errors.accountId ? 'is-invalid' : ''}`}
                    {...register("accountId", formvalidation.accountId)}
                  >
                    <option value="">Select an account</option>
                    {accounts?.map((account) => (
                      <option key={account._id} value={account._id}>
                        {account.title}
                      </option>
                    ))}
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
                  <span className="input-group-text"><i className="bi bi-calendar-date"></i></span>
                  <input 
                    className={`form-control ${errors.transcationDate ? 'is-invalid' : ''}`}
                    type="date" 
                    {...register("transcationDate", formvalidation.transcationDate)} 
                  />
                </div>
                {errors.transcationDate && (
                  <div className="invalid-feedback d-block">
                    {errors.transcationDate.message}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Upload Receipt</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-image"></i></span>
                  <input
                    className="form-control"
                    type="file"
                    accept="image/*"
                    onChange={(event) => setSelectedFile(event.target.files[0])}
                  />
                </div>
                <small className="text-muted">Upload an image of your receipt (optional)</small>
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Description</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-card-text"></i></span>
                  <textarea 
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    rows="3"
                    placeholder="Enter expense details"
                    {...register("description", formvalidation.description)} 
                  />
                </div>
                {errors.description && (
                  <div className="invalid-feedback d-block">
                    {errors.description.message}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Status</label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="statusToggle"
                    {...register("status")}
                    defaultChecked={true}
                  />
                  <label className="form-check-label" htmlFor="statusToggle">
                    Active
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-center mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary px-5"
                style={{
                  minWidth: '200px',
                  height: '45px',
                  fontSize: '1.1rem',
                  boxShadow: '0 2px 8px rgba(84, 105, 212, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(84, 105, 212, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(84, 105, 212, 0.3)';
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i> Save Expense
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenceForm;
