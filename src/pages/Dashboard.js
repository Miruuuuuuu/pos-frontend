import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDollarSign, FiShoppingCart, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/reports/dashboard');
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>
            <FiDollarSign color="#2563eb" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Today's Sales</p>
            <h3 className="stat-value">${stats?.todaySales?.total?.toFixed(2) || '0.00'}</h3>
            <p className="stat-meta">{stats?.todaySales?.count || 0} orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dcfce7' }}>
            <FiShoppingCart color="#10b981" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Orders</p>
            <h3 className="stat-value">{stats?.todaySales?.count || 0}</h3>
            <p className="stat-meta">Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7' }}>
            <FiAlertTriangle color="#f59e0b" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Low Stock Items</p>
            <h3 className="stat-value">{stats?.lowStockProducts || 0}</h3>
            <p className="stat-meta">Need attention</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e0e7ff' }}>
            <FiTrendingUp color="#6366f1" />
          </div>
          <div className="stat-content">
            <p className="stat-label">Avg Order Value</p>
            <h3 className="stat-value">
              ${stats?.todaySales?.count > 0 
                ? (stats.todaySales.total / stats.todaySales.count).toFixed(2) 
                : '0.00'}
            </h3>
            <p className="stat-meta">Per order</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Top Selling Products</h3>
          {stats?.topProducts?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalQty" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No sales data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
