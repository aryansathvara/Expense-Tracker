import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useToastConfig from '../../hooks/useToastConfig';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, 
  Tooltip, Legend, ArcElement } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminReports = () => {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10)
  });
  const [filterOptions, setFilterOptions] = useState({
    userId: 'all',
    category: 'all'
  });
  const [reportData, setReportData] = useState(null);
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('expense');
  const [chartData, setChartData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const reportRef = useRef(null);
  
  // Use custom toast hook
  const toast = useToastConfig();

  // Function to fetch data from the API
  const fetchData = async () => {
    try {
      setLoading(true);
      
      try {
        // Fetch all expenses
        const expensesResponse = await axios.get('/expense/expence');
        const expensesData = expensesResponse.data.data || [];
        setExpenses(expensesData);
        
        // Fetch all incomes
        const incomesResponse = await axios.get('/income/all');
        const incomesData = incomesResponse.data.data || [];
        setIncomes(incomesData);
        
        // Fetch categories using the dedicated function, but silently
        await fetchCategories();
        
        // Fetch users using the dedicated function
        await fetchUsers();
        
        setError(null); // Clear any previous errors
        setUsingSampleData(false);
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        // Check if this is not the first attempt, use sample data
        if (retryCount > 0) {
          setSampleData();
          setUsingSampleData(true);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Unexpected error:', err);
      setSampleData();
      setUsingSampleData(true);
      setLoading(false);
    }
  };

  // Specifically fetch just the users list
  const fetchUsers = async () => {
    try {
      const usersResponse = await axios.get('/users');
      const usersData = usersResponse.data.data || [];
      console.log('Fetched users:', usersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Specifically fetch and update categories from expenses
  const fetchCategories = async () => {
    try {
      // First try to get categories from expenses in the database
      try {
        const expensesResponse = await axios.get('/expense/expence');
        const expensesData = expensesResponse.data.data || [];
        
        // Extract unique categories from expenses
        const categories = [...new Set(expensesData.map(expense => 
          expense.categoryId?.name || 'Uncategorized'
        ))];
        
        console.log('Extracted categories:', categories);
        setUniqueCategories(categories);
        
        if (categories.length === 0) {
          // If no categories found in expenses, try to get them directly from the category endpoint
          try {
            const categoriesResponse = await axios.get('/category');
            const categoriesData = categoriesResponse.data.data || [];
            const directCategories = categoriesData.map(cat => cat.name);
            
            if (directCategories.length > 0) {
              console.log('Fetched categories directly:', directCategories);
              setUniqueCategories(directCategories);
            }
          } catch (categoryError) {
            console.error('Could not fetch categories directly:', categoryError);
            // Continue with empty categories list
          }
        }
      } catch (expenseError) {
        console.error('Error fetching expenses for categories:', expenseError);
        toast.error('Failed to load expenses for category extraction');
        
        // Try to get categories directly
        try {
          const categoriesResponse = await axios.get('/category');
          const categoriesData = categoriesResponse.data.data || [];
          const directCategories = categoriesData.map(cat => cat.name);
          
          console.log('Fetched categories directly after expense error:', directCategories);
          setUniqueCategories(directCategories);
          
        } catch (categoryError) {
          console.error('Error fetching categories directly:', categoryError);
          toast.error('Failed to load categories. Using sample categories.');
          
          // Set sample categories as last resort
          const sampleCategories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Office'];
          setUniqueCategories(sampleCategories);
        }
      }
    } catch (error) {
      console.error('Unexpected error in fetchCategories:', error);
      toast.error('An unexpected error occurred while fetching categories');
      
      // Set sample categories as fallback
      const sampleCategories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Office'];
      setUniqueCategories(sampleCategories);
    }
  };

  // Retry connection function
  const retryConnection = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setLoading(true);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [retryCount]);

  useEffect(() => {
    if (reportData) {
      prepareChartData();
    }
  }, [reportData]);

  const prepareChartData = () => {
    if (!reportData) return;

    // Prepare category data for pie chart
    const categoryLabels = Object.keys(reportData.groupedByCategory);
    const categoryData = categoryLabels.map(category => reportData.groupedByCategory[category].amount);
    const categoryColors = generateColors(categoryLabels.length);

    // Prepare data for bar chart comparison
    const comparisonLabels = ["Income", "Expenses", "Balance"];
    const comparisonData = [
      reportData.totalIncomeAmount,
      reportData.totalExpenseAmount,
      reportData.balance
    ];
    const comparisonColors = ['#4CAF50', '#f44336', reportData.balance >= 0 ? '#2196F3' : '#FF9800'];

    setChartData({
      categoryPieChart: {
        labels: categoryLabels,
        datasets: [{
          data: categoryData,
          backgroundColor: categoryColors,
          borderColor: categoryColors.map(color => color),
          borderWidth: 1
        }]
      },
      comparisonBarChart: {
        labels: comparisonLabels,
        datasets: [{
          label: 'Amount (₹)',
          data: comparisonData,
          backgroundColor: comparisonColors,
          borderColor: comparisonColors,
          borderWidth: 1
        }]
      }
    });
  };

  // Function to generate random colors for the pie chart
  const generateColors = (count) => {
    const predefinedColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#8AC249', '#EA526F', '#23BFAA', '#5D69B1',
      '#52BCA3', '#99C945', '#CC61B0', '#24796C', '#DAA51B'
    ];
    
    if (count <= predefinedColors.length) {
      return predefinedColors.slice(0, count);
    }
    
    // If we need more colors than predefined, generate random ones
    const colors = [...predefinedColors];
    for (let i = predefinedColors.length; i < count; i++) {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      colors.push(`rgb(${r}, ${g}, ${b})`);
    }
    
    return colors;
  };

  const setSampleData = () => {
    // Sample expenses
    const sampleExpenses = Array.from({ length: 50 }, (_, index) => ({
      _id: `expense-${index + 1}`,
      title: `Expense ${index + 1}`,
      amount: Math.floor(Math.random() * 5000) + 500,
      categoryId: {
        _id: `cat-${(index % 5) + 1}`,
        name: ['Food', 'Transport', 'Utilities', 'Entertainment', 'Office'][index % 5]
      },
      subcategoryId: {
        _id: `subcat-${(index % 3) + 1}`,
        name: ['Lunch', 'Dinner', 'Snacks'][index % 3]
      },
      transcationDate: new Date(2023, Math.floor(index / 5), Math.floor(Math.random() * 28) + 1).toISOString(),
      userId: {
        _id: `user-${(index % 10) + 1}`,
        firstName: `User`,
        lastName: `${(index % 10) + 1}`,
        email: `user${(index % 10) + 1}@example.com`
      },
      vendorId: {
        _id: `vendor-${(index % 7) + 1}`,
        title: `Vendor ${(index % 7) + 1}`
      },
      description: `Sample expense description ${index + 1}`
    }));
    
    setExpenses(sampleExpenses);
    
    // Sample users
    const sampleUsers = Array.from({ length: 10 }, (_, index) => ({
      _id: `user-${index + 1}`,
      firstName: `User`,
      lastName: `${index + 1}`,
      email: `user${index + 1}@example.com`,
      status: index < 7 ? 'active' : (index === 7 ? 'pending' : 'inactive')
    }));
    
    setUsers(sampleUsers);
    
    // Extract unique categories
    const categories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Office'];
    setUniqueCategories(categories);
    
    console.log('Using sample data for demonstration purposes');
  };

  const generatePDF = async () => {
    if (!reportRef.current) {
      toast.error("Report content not found");
      return;
    }

    toast.info("Generating PDF, please wait...");
    
    try {
      const content = reportRef.current;
      const canvas = await html2canvas(content, {
        scale: 1,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4', true);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      
      pdf.setFontSize(16);
      pdf.text(reportData.title, pdfWidth / 2, 20, { align: 'center' });
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${reportData.title.replace(/\s+/g, '_')}.pdf`);
      
      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const generateReport = () => {
    if (expenses.length === 0) {
      toast.warning('No expense data available to generate report');
      return;
    }

    try {
      let filteredExpenses = [...expenses];
      let filteredIncomes = [...incomes];
      let reportTitle = '';
      let groupedByCategory = {};
      let totalExpenseAmount = 0;
      let totalIncomeAmount = 0;

      // Apply date filters based on report type
      if (reportType === 'custom') {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59); // Include the entire end date

        filteredExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.transcationDate || expense.createdAt);
          return expenseDate >= startDate && expenseDate <= endDate;
        });

        filteredIncomes = incomes.filter(income => {
          const incomeDate = new Date(income.transcationDate || income.createdAt);
          return incomeDate >= startDate && incomeDate <= endDate;
        });

        reportTitle = `Financial Report: ${dateRange.startDate} to ${dateRange.endDate}`;
      } else if (reportType === 'monthly') {
        // Current month report
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        filteredExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.transcationDate || expense.createdAt);
          return (
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear
          );
        });

        filteredIncomes = incomes.filter(income => {
          const incomeDate = new Date(income.transcationDate || income.createdAt);
          return (
            incomeDate.getMonth() === currentMonth &&
            incomeDate.getFullYear() === currentYear
          );
        });

        reportTitle = `Monthly Financial Report: ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`;
      } else if (reportType === 'yearly') {
        // Current year report
        const currentYear = new Date().getFullYear();

        filteredExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.transcationDate || expense.createdAt);
          return expenseDate.getFullYear() === currentYear;
        });

        filteredIncomes = incomes.filter(income => {
          const incomeDate = new Date(income.transcationDate || income.createdAt);
          return incomeDate.getFullYear() === currentYear;
        });

        reportTitle = `Yearly Financial Report: ${currentYear}`;
      } else if (reportType === 'quarterly') {
        // Current quarter report
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const currentQuarter = Math.floor(currentMonth / 3);
        const quarterStartMonth = currentQuarter * 3;
        const quarterEndMonth = quarterStartMonth + 2;
        
        filteredExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.transcationDate || expense.createdAt);
          const month = expenseDate.getMonth();
          return (
            expenseDate.getFullYear() === currentYear &&
            month >= quarterStartMonth && 
            month <= quarterEndMonth
          );
        });

        filteredIncomes = incomes.filter(income => {
          const incomeDate = new Date(income.transcationDate || income.createdAt);
          const month = incomeDate.getMonth();
          return (
            incomeDate.getFullYear() === currentYear &&
            month >= quarterStartMonth && 
            month <= quarterEndMonth
          );
        });

        reportTitle = `Quarterly Financial Report: Q${currentQuarter + 1} ${currentYear}`;
      }

      // Apply user filter
      if (filterOptions.userId !== 'all') {
        filteredExpenses = filteredExpenses.filter(expense => 
          expense.userId && expense.userId._id === filterOptions.userId
        );
        filteredIncomes = filteredIncomes.filter(income => 
          income.userId && income.userId._id === filterOptions.userId
        );
      }

      // Apply category filter
      if (filterOptions.category !== 'all') {
        filteredExpenses = filteredExpenses.filter(expense => 
          expense.categoryId && expense.categoryId.name === filterOptions.category
        );
      }

      // Group expenses by category
      filteredExpenses.forEach(expense => {
        const categoryName = expense.categoryId?.name || 'Uncategorized';
        totalExpenseAmount += expense.amount || 0;
        
        if (!groupedByCategory[categoryName]) {
          groupedByCategory[categoryName] = {
            count: 0,
            amount: 0
          };
        }
        
        groupedByCategory[categoryName].count += 1;
        groupedByCategory[categoryName].amount += expense.amount || 0;
      });

      // Group by user
      const groupedByUser = {};
      filteredExpenses.forEach(expense => {
        if (!expense.userId) return;
        
        const userId = expense.userId._id;
        const userName = `${expense.userId.firstName} ${expense.userId.lastName}`;
        
        if (!groupedByUser[userId]) {
          groupedByUser[userId] = {
            userId,
            userName,
            count: 0,
            amount: 0
          };
        }
        
        groupedByUser[userId].count += 1;
        groupedByUser[userId].amount += (expense.amount || 0);
      });

      // Calculate total income amount
      totalIncomeAmount = filteredIncomes.reduce((sum, income) => sum + (income.amount || 0), 0);
      
      // Calculate balance
      const reportBalance = totalIncomeAmount - totalExpenseAmount;
      
      // Set report data
      setReportData({
        title: reportTitle,
        totalExpenses: filteredExpenses.length,
        totalExpenseAmount,
        totalIncomes: filteredIncomes.length,
        totalIncomeAmount,
        balance: reportBalance,
        groupedByCategory,
        groupedByUser,
        filteredExpenses,
        filteredIncomes
      });
      
      toast.success('Report generated successfully');
    } catch (err) {
      console.error('Error generating report:', err);
      toast.error(`Could not generate report: ${err.message || 'Unknown error'}`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const exportToCsv = () => {
    if (!reportData || !reportData.filteredExpenses.length) {
      alert('No data to export');
      return;
    }

    // Create CSV header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Title,User,Category,Subcategory,Amount,Date,Vendor,Description\n";

    // Add rows
    reportData.filteredExpenses.forEach(expense => {
      const row = [
        expense.title || 'N/A',
        expense.userId ? `${expense.userId.firstName} ${expense.userId.lastName}` : 'N/A',
        expense.categoryId?.name || 'N/A',
        expense.subcategoryId?.name || 'N/A',
        expense.amount || 0,
        formatDate(expense.transcationDate || expense.createdAt),
        expense.vendorId?.title || 'N/A',
        `"${(expense.description || 'N/A').replace(/"/g, '""')}"`
      ];
      csvContent += row.join(",") + "\n";
    });

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportData.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading financial data...</h5>
        </div>
      </div>
    );
  }

  if (error && !reportData) {
    return (
      <div className="alert alert-danger d-flex align-items-center m-4" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        <div>
          <strong>Error:</strong> {error}
          <button 
            className="btn btn-outline-danger btn-sm ms-3"
            onClick={() => {
              setRetryCount(prev => prev + 1);
              setError(null);
            }}
          >
            <i className="bi bi-arrow-clockwise me-1"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid pb-5">
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <h4 className="mb-0">
            <i className="bi bi-bar-chart-fill me-2 text-primary"></i>
            Admin Financial Reports
            {usingSampleData && (
              <span className="badge bg-warning ms-2">Demo Mode</span>
            )}
          </h4>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <label className="form-label">Report Type</label>
              <select 
                className="form-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>
            
            {reportType === 'custom' && (
              <>
                <div className="col-md-3">
                  <label className="form-label">Start Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">End Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                  />
                </div>
              </>
            )}
            
            <div className="col-md-3">
              <label className="form-label">User</label>
              <select 
                className="form-select"
                value={filterOptions.userId}
                onChange={(e) => setFilterOptions({...filterOptions, userId: e.target.value})}
              >
                <option value="all">All Users</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={filterOptions.category}
                onChange={(e) => setFilterOptions({...filterOptions, category: e.target.value})}
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3 d-flex align-items-end">
              <button 
                className="btn btn-primary"
                onClick={generateReport}
              >
                <i className="bi bi-filter me-1"></i>
                Generate Report
              </button>
            </div>
          </div>
          
          {reportData && (
            <div ref={reportRef} className="report-container">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">{reportData.title}</h4>
                <div>
                  <button 
                    className="btn btn-success me-2"
                    onClick={generatePDF}
                  >
                    <i className="bi bi-file-earmark-pdf me-1"></i>
                    Export PDF
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={exportToCsv}
                  >
                    <i className="bi bi-filetype-csv me-1"></i>
                    Export CSV
                  </button>
                </div>
              </div>
              
              <div className="row mb-4">
                <div className="col-lg-4 mb-3">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-uppercase text-muted">Total Expenses</h6>
                          <h3 className="mb-0">{formatCurrency(reportData.totalExpenseAmount)}</h3>
                          <small className="text-muted">from {reportData.totalExpenses} transactions</small>
                        </div>
                        <div className="stat-icon bg-light-danger">
                          <i className="bi bi-credit-card text-danger"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-4 mb-3">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-uppercase text-muted">Total Income</h6>
                          <h3 className="mb-0">{formatCurrency(reportData.totalIncomeAmount)}</h3>
                          <small className="text-muted">from {reportData.totalIncomes} transactions</small>
                        </div>
                        <div className="stat-icon bg-light-success">
                          <i className="bi bi-cash-stack text-success"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-4 mb-3">
                  <div className={`card h-100 border-0 shadow-sm ${reportData.balance >= 0 ? 'border-start border-success border-5' : 'border-start border-danger border-5'}`}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="text-uppercase text-muted">Balance</h6>
                          <h3 className={`mb-0 ${reportData.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                            {formatCurrency(reportData.balance)}
                          </h3>
                          <small className={`${reportData.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                            {reportData.balance >= 0 ? 'Surplus' : 'Deficit'}
                          </small>
                        </div>
                        <div className={`stat-icon ${reportData.balance >= 0 ? 'bg-light-success' : 'bg-light-danger'}`}>
                          <i className={`bi ${reportData.balance >= 0 ? 'bi-graph-up-arrow text-success' : 'bi-graph-down-arrow text-danger'}`}></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row mb-4">
                {chartData && (
                  <>
                    <div className="col-lg-6 mb-3">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3">
                          <h5 className="mb-0">Expense Distribution</h5>
                        </div>
                        <div className="card-body d-flex flex-column justify-content-center">
                          {Object.keys(reportData.groupedByCategory).length > 0 ? (
                            <div className="chart-container">
                              <Pie 
                                data={chartData.categoryPieChart}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: true,
                                  plugins: {
                                    legend: {
                                      position: 'right',
                                      labels: {
                                        boxWidth: 15
                                      }
                                    },
                                    tooltip: {
                                      callbacks: {
                                        label: function(context) {
                                          const label = context.label || '';
                                          const value = context.raw || 0;
                                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                          const percentage = Math.round((value / total) * 100);
                                          return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                                        }
                                      }
                                    }
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="text-center text-muted py-5">
                              <i className="bi bi-bar-chart-line fs-2"></i>
                              <p className="mt-2">No expense data to display for this period.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-lg-6 mb-3">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3">
                          <h5 className="mb-0">Income vs Expense</h5>
                        </div>
                        <div className="card-body d-flex flex-column justify-content-center">
                          {reportData.totalExpenses > 0 || reportData.totalIncomes > 0 ? (
                            <div className="chart-container">
                              <Bar 
                                data={chartData.comparisonBarChart}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: true,
                                  plugins: {
                                    legend: {
                                      display: false
                                    },
                                    tooltip: {
                                      callbacks: {
                                        label: function(context) {
                                          return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                                        }
                                      }
                                    }
                                  },
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      grid: {
                                        display: true,
                                        drawBorder: false
                                      }
                                    },
                                    x: {
                                      grid: {
                                        display: false,
                                        drawBorder: false
                                      }
                                    }
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="text-center text-muted py-5">
                              <i className="bi bi-bar-chart-line fs-2"></i>
                              <p className="mt-2">No financial data to display for this period.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="row">
                <div className="col-lg-12 mb-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Expense Breakdown by Category</h5>
                      <span className="badge bg-primary">{Object.keys(reportData.groupedByCategory).length} Categories</span>
                    </div>
                    <div className="card-body">
                      {Object.keys(reportData.groupedByCategory).length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>Category</th>
                                <th>Count</th>
                                <th>Amount</th>
                                <th>% of Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(reportData.groupedByCategory).map(([category, data], index) => (
                                <tr key={category}>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <span 
                                        className="category-dot" 
                                        style={{ 
                                          backgroundColor: chartData?.categoryPieChart.datasets[0].backgroundColor[index],
                                          width: '12px',
                                          height: '12px',
                                          borderRadius: '50%',
                                          display: 'inline-block',
                                          marginRight: '8px'
                                        }}
                                      ></span>
                                      {category}
                                    </div>
                                  </td>
                                  <td>{data.count}</td>
                                  <td>{formatCurrency(data.amount)}</td>
                                  <td>
                                    {reportData.totalExpenseAmount ? 
                                      `${((data.amount / reportData.totalExpenseAmount) * 100).toFixed(2)}%` : 
                                      '0%'
                                    }
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="table-light">
                              <tr>
                                <th>Total</th>
                                <th>{reportData.totalExpenses}</th>
                                <th>{formatCurrency(reportData.totalExpenseAmount)}</th>
                                <th>100%</th>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-muted py-5">
                          <i className="bi bi-table fs-2"></i>
                          <p className="mt-2">No expense data to display for this period.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-12 mb-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Detailed Expense List</h5>
                      <span className="badge bg-primary">{reportData.filteredExpenses.length} Expenses</span>
                    </div>
                    <div className="card-body">
                      {reportData.filteredExpenses.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-hover align-middle">
                            <thead className="table-light">
                              <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>User</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Vendor</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reportData.filteredExpenses.map(expense => (
                                <tr key={expense._id}>
                                  <td>{expense.title}</td>
                                  <td>{expense.categoryId?.name || 'Uncategorized'}</td>
                                  <td>
                                    {expense.userId ? 
                                      `${expense.userId.firstName} ${expense.userId.lastName}` : 
                                      'Unknown'
                                    }
                                  </td>
                                  <td>{formatCurrency(expense.amount)}</td>
                                  <td>{formatDate(expense.transcationDate || expense.createdAt)}</td>
                                  <td>{expense.vendor || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-muted py-5">
                          <i className="bi bi-table fs-2"></i>
                          <p className="mt-2">No expense data to display for this period.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports; 