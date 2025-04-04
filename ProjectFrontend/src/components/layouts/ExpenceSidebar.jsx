import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { EXpenceNavbar } from "./EXpenceNavbar";

export const ExpenceSidebar = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <EXpenceNavbar toggleSidebar={toggleSidebar} />
      <aside
        className={`app-sidebar bg-body-secondary shadow ${isSidebarOpen ? "open" : "d-none"}`}
        data-bs-theme="dark"
      >
        <div className="sidebar-brand">
          <a href="./index.html" className="brand-link">
            <img
              src="/assets/img/expence.png"
              className="brand-image opacity-75 shadow"
            />
            <span className="brand-text fw-light">Expense Management</span>
          </a> 
        </div> 

        <div className="text-center my-2">
          <small className="text-light">
            <i className="bi bi-shield-lock me-1"></i>
            Viewing your expenses only
          </small>
        </div>

        <div
          className=""
          data-overlayscrollbars-viewport="scrollbarHidden overflowXHidden overflowYScroll"
          tabIndex={-1}
          style={{
            marginRight: "-16px",
            marginBottom: "-16px",
            marginLeft: 0,
            top: "-8px",
            right: "auto",
            left: "-8px",
            width: "calc(100% + 16px)",
            padding: 8,
          }}
        >
          <nav className="mt-2">
            <ul
              className="nav sidebar-menu flex-column"
              data-lte-toggle="treeview"
              role="menu"
              data-accordion="false"
            >
              <li className="nav-item menu-open">
                <Link to="expense-management" className="nav-link active">
                  <i className="nav-icon bi bi-house-door"></i>
                  <p>
                    Expense Overview
                    <i className="nav-arrow bi bi-chevron-right" />
                  </p>
                </Link>
              </li>

              <li className="nav-item">
                <Link to="expenceform" className="nav-link">
                  <i className="nav-icon bi bi-plus-circle"></i>
                  <p>
                    Add Expense
                    <i className="nav-arrow bi bi-chevron-right" />
                  </p>
                </Link>
              </li>

              <li className="nav-item">
                <Link to="myexpence" className="nav-link">
                  <i className="nav-icon bi bi-list-ul"></i>
                  <p>
                    View Expenses
                    <i className="nav-arrow bi bi-chevron-right" />
                  </p>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      <main className="app-main">
        <Outlet></Outlet>
      </main>
    </>
  );
};
