import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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

const Reports = () => {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('monthly');
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10)
  });
  const [totalBalance, setTotalBalance] = useState(0);
  const userId = localStorage.getItem('id');
  const toast = useToastConfig();
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch expenses and incomes in parallel
        const [expensesResponse, incomesResponse] = await Promise.all([
          axios.get('/expense/expence'),
          axios.get(`/income?userId=${userId}`)
        ]);
        
        // Filter expenses for the current user only
        const userExpenses = expensesResponse.data.data.filter(expense => 
          expense.userId && expense.userId._id === userId
        );
        
        // Filter completed incomes only
        const userIncomes = incomesResponse.data.data.filter(income => 
          income.status === 'completed'
        );
        
        setExpenses(userExpenses);
        setIncomes(userIncomes);
        
        // Calculate total balance
        const totalExpenses = userExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const totalIncomes = userIncomes.reduce((sum, income) => sum + (income.amount || 0), 0);
        const balance = totalIncomes - totalExpenses;
        setTotalBalance(balance);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

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

      // Filter by date range if custom report
      if (reportType === 'custom') {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59); // Include the entire end date

        filteredExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.createdAt || expense.transcationDate);
          return expenseDate >= startDate && expenseDate <= endDate;
        });

        filteredIncomes = incomes.filter(income => {
          const incomeDate = new Date(income.createdAt || income.transcationDate);
          return incomeDate >= startDate && incomeDate <= endDate;
        });

        reportTitle = `Financial Report: ${dateRange.startDate} to ${dateRange.endDate}`;
      } else if (reportType === 'monthly') {
        // Current month report
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        filteredExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.createdAt || expense.transcationDate);
          return (
            expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear
          );
        });

        filteredIncomes = incomes.filter(income => {
          const incomeDate = new Date(income.createdAt || income.transcationDate);
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
          const expenseDate = new Date(expense.createdAt || expense.transcationDate);
          return expenseDate.getFullYear() === currentYear;
        });

        filteredIncomes = incomes.filter(income => {
          const incomeDate = new Date(income.createdAt || income.transcationDate);
          return incomeDate.getFullYear() === currentYear;
        });

        reportTitle = `Yearly Financial Report: ${currentYear}`;
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

      // Calculate total income amount
      totalIncomeAmount = filteredIncomes.reduce((sum, income) => sum + (income.amount || 0), 0);
      
      // Calculate remaining balance
      const reportBalance = totalIncomeAmount - totalExpenseAmount;
      
      setReportData({
        title: reportTitle,
        totalExpenses: filteredExpenses.length,
        totalExpenseAmount,
        totalIncomes: filteredIncomes.length,
        totalIncomeAmount,
        balance: reportBalance,
        groupedByCategory,
        filteredExpenses,
        filteredIncomes
      });

        toast.success('Report generated successfully');
    } catch (err) {
      console.error('Error generating report:', err);
      toast.error('Failed to generate report');
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

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>{error}</div>
        </div>
        <button 
          className="btn btn-outline-primary" 
          onClick={() => window.location.reload()}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="page-title mb-0">Financial Reports</h1>
          <p className="text-muted">Generate detailed reports of your income and expenses</p>
        </div>
      </div>
      
      <div className="card mb-4 shadow-sm border-0">
        <div className="card-header bg-primary text-white">
          <h5 className="card-title mb-0">Generate Report</h5>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4 mb-3">
              <label className="form-label fw-bold">Report Type</label>
              <select 
                className="form-select" 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="monthly">Monthly Report</option>
                <option value="yearly">Yearly Report</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>
            
            {reportType === 'custom' && (
              <>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Start Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">End Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                  />
                </div>
              </>
            )}
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={generateReport}
          >
            <i className="bi bi-bar-chart-fill me-2"></i>
            Generate Report
          </button>
        </div>
      </div>
      
      {reportData && (
        <div>
          <div className="card shadow-sm border-0" id="report-content" ref={reportRef}>
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-primary">
                <i className="bi bi-file-earmark-text me-2"></i>
                {reportData.title}
              </h5>
              <button className="btn btn-sm btn-primary" onClick={generatePDF}>
                <i className="bi bi-download me-2"></i>
                Download PDF
            </button>
          </div>
          <div className="card-body">
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center mb-2">
                        <div className="stats-icon bg-danger-subtle rounded-circle p-2 me-3">
                          <i className="bi bi-cash-stack text-danger fs-4"></i>
                        </div>
                        <div>
                          <h6 className="card-subtitle text-muted mb-1">Total Expenses</h6>
                          <h3 className="card-title text-danger mb-0">{formatCurrency(reportData.totalExpenseAmount)}</h3>
                        </div>
                      </div>
                      <div className="text-muted small mt-2">
                        <i className="bi bi-receipt me-1"></i>
                        {reportData.totalExpenses} transactions
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center mb-2">
                        <div className="stats-icon bg-success-subtle rounded-circle p-2 me-3">
                          <i className="bi bi-wallet2 text-success fs-4"></i>
                        </div>
                        <div>
                          <h6 className="card-subtitle text-muted mb-1">Total Income</h6>
                          <h3 className="card-title text-success mb-0">{formatCurrency(reportData.totalIncomeAmount)}</h3>
                        </div>
                      </div>
                      <div className="text-muted small mt-2">
                        <i className="bi bi-graph-up-arrow me-1"></i>
                        {reportData.totalIncomes} transactions
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center mb-2">
                        <div className={`stats-icon bg-${reportData.balance >= 0 ? 'primary' : 'danger'}-subtle rounded-circle p-2 me-3`}>
                          <i className={`bi bi-${reportData.balance >= 0 ? 'piggy-bank' : 'exclamation-triangle'} text-${reportData.balance >= 0 ? 'primary' : 'danger'} fs-4`}></i>
                        </div>
                        <div>
                          <h6 className="card-subtitle text-muted mb-1">Balance</h6>
                          <h3 className={`card-title text-${reportData.balance >= 0 ? 'primary' : 'danger'} mb-0`}>
                            {formatCurrency(reportData.balance)}
                          </h3>
                        </div>
                      </div>
                      <div className="text-muted small mt-2">
                        <i className={`bi bi-${reportData.balance >= 0 ? 'arrow-up-circle' : 'arrow-down-circle'} me-1`}></i>
                        {reportData.balance >= 0 ? "Surplus" : "Deficit"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white border-0">
                      <h5 className="mb-0">
                        <i className="bi bi-pie-chart me-2 text-primary"></i>
                        Expense Distribution
                      </h5>
                    </div>
                    <div className="card-body pt-0" style={{ height: '330px' }}>
                      {Object.keys(reportData.groupedByCategory).length === 0 ? (
                        <div className="d-flex justify-content-center align-items-center h-100">
                          <div className="text-center text-muted">
                            <i className="bi bi-bar-chart-steps fs-1"></i>
                            <p className="mt-2">No expense data available</p>
                          </div>
                        </div>
                      ) : (
                        <Pie 
                          data={{
                            labels: Object.keys(reportData.groupedByCategory),
                            datasets: [
                              {
                                data: Object.values(reportData.groupedByCategory).map(cat => cat.amount),
                                backgroundColor: [
                                  '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
                                  '#FF9F40', '#8AC140', '#C14076', '#3D90A3', '#A33D8A'
                                ],
                                borderWidth: 1
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'right',
                                labels: {
                                  boxWidth: 12,
                                  padding: 15
                                }
                              }
                            }
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white border-0">
                      <h5 className="mb-0">
                        <i className="bi bi-bar-chart me-2 text-primary"></i>
                        Income vs Expense
                      </h5>
                    </div>
                    <div className="card-body pt-0" style={{ height: '330px' }}>
                      {(reportData.totalIncomeAmount === 0 && reportData.totalExpenseAmount === 0) ? (
                        <div className="d-flex justify-content-center align-items-center h-100">
                          <div className="text-center text-muted">
                            <i className="bi bi-bar-chart-steps fs-1"></i>
                            <p className="mt-2">No financial data available</p>
                          </div>
                        </div>
                      ) : (
                        <Bar
                          data={{
                            labels: ['Financial Summary'],
                            datasets: [
                              {
                                label: 'Income',
                                data: [reportData.totalIncomeAmount],
                                backgroundColor: 'rgba(28, 200, 138, 0.6)',
                                borderColor: 'rgba(28, 200, 138, 1)',
                                borderWidth: 1
                              },
                              {
                                label: 'Expense',
                                data: [reportData.totalExpenseAmount],
                                backgroundColor: 'rgba(231, 74, 59, 0.6)',
                                borderColor: 'rgba(231, 74, 59, 1)',
                                borderWidth: 1
                              },
                              {
                                label: 'Balance',
                                data: [Math.max(0, reportData.balance)],
                                backgroundColor: 'rgba(78, 115, 223, 0.6)',
                                borderColor: 'rgba(78, 115, 223, 1)',
                                borderWidth: 1
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                grid: {
                                  drawBorder: false
                                }
                              },
                              x: {
                                grid: {
                                  display: false
                                }
                              }
                            },
                            plugins: {
                              legend: {
                                position: 'top'
                              }
                            }
                          }}
                        />
                      )}
                    </div>
                </div>
              </div>
            </div>
            
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    <i className="bi bi-list-columns me-2 text-primary"></i>
                    Expense Breakdown by Category
                  </h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                  <tr>
                    <th>Category</th>
                          <th className="text-center">Count</th>
                          <th className="text-end">Amount</th>
                          <th className="text-end">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                        {Object.keys(reportData.groupedByCategory).length === 0 ? (
                    <tr>
                            <td colSpan="4" className="text-center py-4">No data available</td>
                    </tr>
                  ) : (
                          Object.entries(reportData.groupedByCategory).map(([category, data], index) => (
                      <tr key={category}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div 
                                    className="category-dot me-2" 
                                    style={{ 
                                      width: '10px', 
                                      height: '10px', 
                                      borderRadius: '50%', 
                                      backgroundColor: [
                                        '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
                                        '#FF9F40', '#8AC140', '#C14076', '#3D90A3', '#A33D8A'
                                      ][index % 10] 
                                    }}
                                  ></div>
                                  {category}
                                </div>
                              </td>
                              <td className="text-center">{data.count}</td>
                              <td className="text-end">{formatCurrency(data.amount)}</td>
                              <td className="text-end">
                                {reportData.totalExpenseAmount ? 
                                  `${((data.amount / reportData.totalExpenseAmount) * 100).toFixed(2)}%` : 
                            '0%'
                          }
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                      <tfoot className="table-light fw-bold">
                        <tr>
                          <td>Total</td>
                          <td className="text-center">{reportData.totalExpenses}</td>
                          <td className="text-end">{formatCurrency(reportData.totalExpenseAmount)}</td>
                          <td className="text-end">100%</td>
                        </tr>
                      </tfoot>
              </table>
                  </div>
                </div>
            </div>
            
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-receipt me-2 text-primary"></i>
                    Detailed Expense List
                  </h5>
                  <span className="badge bg-primary rounded-pill">
                    {reportData.filteredExpenses.length} items
                  </span>
                </div>
                <div className="card-body">
            <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                          <th className="text-end">Amount</th>
                    <th>Date</th>
                    <th>Vendor</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.filteredExpenses.length === 0 ? (
                    <tr>
                            <td colSpan="5" className="text-center py-4">
                              <i className="bi bi-inbox fs-1 d-block mb-2 text-muted"></i>
                              No expenses found for this period
                            </td>
                    </tr>
                  ) : (
                    reportData.filteredExpenses.map((expense) => (
                      <tr key={expense._id}>
                        <td>{expense.title}</td>
                              <td>
                                <span className="badge bg-light text-dark">
                                  {expense.categoryId?.name || 'Uncategorized'}
                                </span>
                              </td>
                              <td className="text-end fw-bold">{formatCurrency(expense.amount)}</td>
                        <td>{formatDate(expense.transcationDate)}</td>
                        <td>{expense.vendorId?.title || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports; 