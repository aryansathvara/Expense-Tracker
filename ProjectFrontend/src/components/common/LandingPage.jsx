import React from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/landingPage.css";
// Remove unnecessary CSS imports from landing folder
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="landing-page" style={{ overflow: 'hidden', width: '100%', maxWidth: '100vw' }}>
      {/* Hero Section */}
      <header className="hero" style={{ 
        background: 'linear-gradient(135deg, #5469d4 0%, #1a237e 100%)',
        color: 'white',
        padding: '0',
        position: 'relative',
        overflow: 'hidden',
        width: '100%'
      }}>
        <div className="background-pattern" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url("/hero-bg.svg")',
          backgroundSize: 'cover',
          opacity: 0.1,
          zIndex: 0
        }}></div>
        
        <nav className="navbar navbar-expand-lg" style={{ padding: '20px 0', position: 'relative', zIndex: 2 }}>
          <div className="container">
            <Link to="/" className="navbar-brand d-flex align-items-center">
              <i className="bi bi-wallet2 me-2" style={{ fontSize: '1.5rem' }}></i>
              <span className="fw-bold" style={{ fontSize: '1.4rem' }}>Expense Tracker</span>
            </Link>
            
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            
            <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a className="nav-link text-white" href="#features">Features</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white" href="#how-it-works">How It Works</a>
                </li>
                <li className="nav-item ms-lg-3">
                  <Link to="/login" className="btn btn-light rounded-pill px-4">Log In</Link>
                </li>
                <li className="nav-item ms-lg-2">
                  <Link to="/signup" className="btn btn-outline-light rounded-pill px-4">Sign Up</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        
        <div className="container py-5" style={{ position: 'relative', zIndex: 1 }}>
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h1 className="display-4 fw-bold mb-3">Take Control of Your Finances</h1>
              <p className="lead mb-4 opacity-75">Track expenses, manage budgets, and gain financial clarity with our easy-to-use expense tracking solution.</p>
              <div className="d-flex gap-3">
                <Link to="/signup" className="btn btn-light btn-lg rounded-pill px-4">
                  Get Started — It's Free
                </Link>
                <a href="#how-it-works" className="btn btn-outline-light btn-lg rounded-pill px-4">
                  Learn More
                </a>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-image text-center position-relative">
                <img 
                  src="/expense-illustration.svg" 
                  alt="Expense Tracker Dashboard" 
                  className="img-fluid"
                  style={{ 
                    maxWidth: '95%',
                    maxHeight: '520px', 
                    boxShadow: '0 20px 30px rgba(0, 0, 0, 0.25)',
                    border: '8px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '16px',
                    transform: 'perspective(1000px) rotateY(-5deg)',
                    transition: 'all 0.5s ease'
                  }}
                />

                {/* Mobile mockup with expense app */}
                <img 
                  src="/mobile-expense.svg" 
                  alt="Expense Tracker Mobile App" 
                  className="img-fluid position-absolute"
                  style={{ 
                    maxHeight: '280px',
                    right: '-5%',
                    bottom: '0%',
                    transform: 'rotate(10deg)',
                    borderRadius: '24px',
                    border: '8px solid white',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                    zIndex: 3
                  }}
                />

                <div className="position-absolute" style={{
                  bottom: '-20px',
                  right: '10%',
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                  maxWidth: '200px',
                  textAlign: 'left',
                  zIndex: 2
                }}>
                  <h5 className="text-primary mb-1" style={{ fontSize: '16px' }}>Track Your Budget</h5>
                  <p className="mb-0 text-muted" style={{ fontSize: '14px' }}>Manage expenses efficiently</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-5">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Powerful Features</h2>
            <p className="lead text-muted">Everything you need to manage your expenses effectively</p>
          </div>
          
          <div className="row g-4">
            {/* Feature 1 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon bg-primary bg-opacity-10 text-primary rounded-circle mb-3 mx-auto" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-graph-up" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                  <h5 className="card-title">Expense Tracking</h5>
                  <p className="card-text text-muted">Record and categorize your expenses in real-time. Know exactly where your money is going.</p>
                </div>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon bg-success bg-opacity-10 text-success rounded-circle mb-3 mx-auto" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-bar-chart" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                  <h5 className="card-title">Insightful Reports</h5>
                  <p className="card-text text-muted">Get visual breakdowns of your spending patterns with intuitive charts and reports.</p>
                </div>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="feature-icon bg-warning bg-opacity-10 text-warning rounded-circle mb-3 mx-auto" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-shield-check" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                  <h5 className="card-title">Secure Storage</h5>
                  <p className="card-text text-muted">Your financial data is encrypted and securely stored. Access it anytime, from any device.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold">How It Works</h2>
            <p className="lead text-muted">Start tracking your expenses in three simple steps</p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="text-center">
                <div className="step-number rounded-circle bg-primary text-white mx-auto mb-3" style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>1</div>
                <h5>Create an Account</h5>
                <p className="text-muted">Sign up for free and set up your profile with basic information.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <div className="step-number rounded-circle bg-primary text-white mx-auto mb-3" style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>2</div>
                <h5>Add Your Expenses</h5>
                <p className="text-muted">Record expenses with details like amount, category, and date.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <div className="step-number rounded-circle bg-primary text-white mx-auto mb-3" style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>3</div>
                <h5>Gain Financial Insights</h5>
                <p className="text-muted">View reports and analytics to better understand your spending habits.</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-5">
            <Link to="/signup" className="btn btn-primary btn-lg rounded-pill px-4" onClick={(e) => {
              e.preventDefault();
              window.location.href = '/signup';
            }}>
              Start Tracking Now
            </Link>
                      </div>
                    </div>
      </section>
    </div>
  );
};

export default LandingPage;
