import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Reports = () => {
  const [salesReport, setSalesReport] = useState([]);
  const [productReport, setProductReport] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      const [salesRes, productsRes] = await Promise.all([
        axios.get(`/api/reports/sales?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        axios.get('/api/reports/products')
      ]);
      setSalesReport(salesRes.data);
      setProductReport(productsRes.data);
    } catch (error) {
      toast.error('Failed to fetch reports');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px' }}>Date Range</h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-input"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-input"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '16px' }}>Sales Trend</h3>
        {salesReport.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesReport}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalSales" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No sales data available for the selected period</p>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Product Performance</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Total Quantity Sold</th>
                <th>Total Revenue</th>
                <th>Avg Price</th>
              </tr>
            </thead>
            <tbody>
              {productReport.slice(0, 10).map((product, index) => (
                <tr key={index}>
                  <td>{product.productName}</td>
                  <td>{product.totalQuantity}</td>
                  <td>${product.totalRevenue.toFixed(2)}</td>
                  <td>${product.avgPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
