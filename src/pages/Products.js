import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', price: '', costPrice: '', stockQty: '', minStockLevel: ''
  });

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`/api/products?search=${search}`);
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, formData);
        toast.success('Product updated');
      } else {
        await axios.post('/api/products', formData);
        toast.success('Product created');
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', sku: '', category: '', price: '', costPrice: '', stockQty: '', minStockLevel: '' });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Product
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: '16px' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>${product.price}</td>
                  <td>{product.stockQty}</td>
                  <td>
                    <span className={`badge ${product.stockQty <= product.minStockLevel ? 'badge-warning' : 'badge-success'}`}>
                      {product.stockQty <= product.minStockLevel ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-primary" style={{ marginRight: '8px', padding: '6px 12px' }} onClick={() => handleEdit(product)}>
                      <FiEdit />
                    </button>
                    <button className="btn btn-danger" style={{ padding: '6px 12px' }} onClick={() => handleDelete(product._id)}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">SKU</label>
                <input className="form-input" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-input" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Price</label>
                <input type="number" step="0.01" className="form-input" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input type="number" className="form-input" value={formData.stockQty} onChange={(e) => setFormData({...formData, stockQty: e.target.value})} required />
              </div>
              <button type="submit" className="btn btn-primary btn-block">
                {editingProduct ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
