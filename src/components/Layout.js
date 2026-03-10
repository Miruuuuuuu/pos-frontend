import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiPackage, FiShoppingCart, FiUsers, FiBarChart2, FiSettings, FiLogOut, FiMenu, FiMoon, FiSun } from 'react-icons/fi';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`layout ${collapsed ? 'collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          {!collapsed && <h2>Abdullah Mir <br /><span>Technologies</span></h2>}
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setCollapsed(!collapsed)}>
              <FiMenu />
            </button>
          </div>
        </div>
        {!collapsed && (
          <div className="user-info">
            <p className="user-name">{user?.name}</p>
            <p className="user-role">{user?.role}</p>
          </div>
        )}

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FiHome /> {!collapsed && <span>Dashboard</span>}
          </NavLink>
          <NavLink to="/sales" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FiShoppingCart /> {!collapsed && <span>POS / Billing</span>}
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FiPackage /> {!collapsed && <span>Products</span>}
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FiUsers /> {!collapsed && <span>Customers</span>}
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FiBarChart2 /> {!collapsed && <span>Reports</span>}
          </NavLink>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <FiSettings /> {!collapsed && <span>Settings</span>}
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDark ? <FiSun /> : <FiMoon />}
            {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut /> {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
