import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminIncomes = () => {
  const [incomes, setIncomes] = useState([]);
  const [filteredIncomes, setFilteredIncomes] = useState([]);
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalIncomeAmount, setTotalIncomeAmount] = useState(0);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    userId: '',
    accountId: '',
    status: '',
    dateRange: '',
    search: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [incomesRes, usersRes, accountsRes] = await Promise.all([
        axios.get('/income/all'),
        axios.get('/users'),
        axios.get('/account')
      ]);
      
      const incomesData = incomesRes.data.data || [];
      const usersData = usersRes.data.data || [];
      const accountsData = accountsRes.data.data || [];
      
      setIncomes(incomesData);
      setFilteredIncomes(incomesData);
      setUsers(usersData);
      setAccounts(accountsData);
      
      // Calculate total of completed incomes
      calculateTotalIncome(incomesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalIncome = (incomeData) => {
    const completedIncomes = incomeData.filter(income => income.status === 'completed');
    const total = completedIncomes.reduce((sum, income) => sum + (income.amount || 0), 0);
    setTotalIncomeAmount(total);
  };

  // Apply filters when filters state changes
  useEffect(() => {
    applyFilters();
  }, [filters, incomes]);

  const applyFilters = () => {
    let result = [...incomes];
    
    if (filters.userId) {
      result = result.filter(income => income.userId?._id === filters.userId);
    }
    
    if (filters.accountId) {
      result = result.filter(income => income.accountId?._id === filters.accountId);
    }
    
    if (filters.status) {
      result = result.filter(income => income.status === filters.status);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(income => 
        (income.title && income.title.toLowerCase().includes(searchLower)) ||
        (income.description && income.description.toLowerCase().includes(searchLower)) ||
        (income.userId?.firstName && income.userId.firstName.toLowerCase().includes(searchLower)) ||
        (income.userId?.lastName && income.userId.lastName.toLowerCase().includes(searchLower)) ||
        (income.userId?.email && income.userId.email.toLowerCase().includes(searchLower)) ||
        (income.accountId?.title && income.accountId.title.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange.split(',');
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end day
        
        result = result.filter(income => {
          const incomeDate = new Date(income.transcationDate);
          return incomeDate >= start && incomeDate <= end;
        });
      }
    }
    
    setFilteredIncomes(result);
    calculateTotalIncome(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleDeleteClick = (income) => {
    setSelectedIncome(income);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedIncome) return;
    
    try {
      await axios.delete(`/income/${selectedIncome._id}`);
      toast.success("Income deleted successfully");
      setShowDeleteModal(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting income:", error);
      toast.error("Failed to delete income");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'badge bg-success';
      case 'pending':
        return 'badge bg-warning';
      case 'rejected':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title mb-0">Income Management</h1>
          <p className="text-muted">Manage all income entries in the system</p>
        </div>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={fetchData}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Total Income</h5>
              <h3 className="mb-0">{formatCurrency(totalIncomeAmount)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Total Entries</h5>
              <h3 className="mb-0">{filteredIncomes.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Average Income</h5>
              <h3 className="mb-0">
                {formatCurrency(
                  filteredIncomes.length > 0 
                    ? totalIncomeAmount / filteredIncomes.filter(i => i.status === 'completed').length 
                    : 0
                )}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Filter Incomes</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 mb-3">
              <label className="form-label">User</label>
              <select 
                className="form-select"
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
              >
                <option value="">All Users</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {`${user.firstName || ''} ${user.lastName || ''}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Account</label>
              <select 
                className="form-select"
                name="accountId"
                value={filters.accountId}
                onChange={handleFilterChange}
              >
                <option value="">All Accounts</option>
                {accounts.map(account => (
                  <option key={account._id} value={account._id}>
                    {account.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Status</label>
              <select 
                className="form-select"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Date Range</label>
              <input 
                type="text" 
                className="form-control"
                name="dateRange"
                value={filters.dateRange}
                onChange={handleFilterChange}
                placeholder="YYYY-MM-DD,YYYY-MM-DD"
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Search</label>
              <input 
                type="text" 
                className="form-control"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by title, description, user, or account"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Income Table */}
      <div className="card">
        <div className="card-header bg-light">
          <h5 className="mb-0">Income History</h5>
        </div>
        <div className="card-body">
          {filteredIncomes.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-cash-coin display-1 text-muted"></i>
              <p className="mt-3">No income entries found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Title</th>
                    <th>Amount</th>
                    <th>Account</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncomes.map((income) => (
                    <tr key={income._id}>
                      <td>
                        {income.userId ? 
                          `${income.userId.firstName || ''} ${income.userId.lastName || ''}` 
                          : 'N/A'}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-cash-stack text-success me-2"></i>
                          {income.title}
                        </div>
                        {income.description && (
                          <small className="text-muted d-block">{income.description}</small>
                        )}
                      </td>
                      <td className="fw-bold">{formatCurrency(income.amount)}</td>
                      <td>{income.accountId?.title || 'N/A'}</td>
                      <td>{formatDate(income.transcationDate)}</td>
                      <td>
                        <span className={getStatusBadgeClass(income.status)}>
                          {income.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <Link 
                            to={`/admin/incomes/${income._id}`} 
                            className="btn btn-sm btn-outline-primary"
                            title="View details"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                            onClick={() => handleDeleteClick(income)}
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
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div className={`modal fade ${showDeleteModal ? 'show' : ''}`} style={{ display: showDeleteModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Deletion</h5>
              <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete the income entry: <strong>{selectedIncome?.title}</strong>?
              <div className="alert alert-warning mt-3">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                This action cannot be undone.
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={confirmDelete}
              >
                Delete Income
              </button>
            </div>
          </div>
        </div>
      </div>
      {showDeleteModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default AdminIncomes; 