import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    fetchSales();
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchSales = async () => {
    try {
      const { data } = await axios.get('/api/sales');
      setSales(data);
    } catch (error) {
      toast.error('Failed to fetch sales');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products');
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await axios.get('/api/customers');
      setCustomers(data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.product === product._id);
    if (existing) {
      setCart(cart.map(item => 
        item.product === product._id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        product: product._id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        discount: 0,
        total: product.price
      }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product !== productId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax - discount;
    return { subtotal, tax, total };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const { subtotal, tax, total } = calculateTotals();
      await axios.post('/api/sales', {
        customer: selectedCustomer || null,
        items: cart,
        subtotal,
        tax,
        discount,
        totalAmount: total,
        paymentMethod
      });
      toast.success('Sale completed!');
      setCart([]);
      setSelectedCustomer('');
      setDiscount(0);
      setShowModal(false);
      fetchSales();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Sale failed');
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Sales</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> New Sale
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale._id}>
                  <td>{sale.invoiceNumber}</td>
                  <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                  <td>{sale.customer?.name || 'Walk-in'}</td>
                  <td>{sale.items.length}</td>
                  <td>${sale.totalAmount.toFixed(2)}</td>
                  <td>{sale.paymentMethod}</td>
                  <td><span className="badge badge-success">{sale.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2 className="modal-title">New Sale</h2>
              <button onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h3 style={{ marginBottom: '12px' }}>Products</h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {products.map(product => (
                    <div key={product._id} style={{ padding: '8px', borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }} onClick={() => addToCart(product)}>
                      <div style={{ fontWeight: '500' }}>{product.name}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>${product.price} - Stock: {product.stockQty}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ marginBottom: '12px' }}>Cart</h3>
                {cart.map(item => (
                  <div key={item.product} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
                    <div>
                      <div>{item.productName}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>{item.quantity} × ${item.price}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>${item.total.toFixed(2)}</span>
                      <button className="btn btn-danger" style={{ padding: '4px 8px' }} onClick={() => removeFromCart(item.product)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Customer (Optional)</label>
                    <select className="form-input" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                      <option value="">Walk-in Customer</option>
                      {customers.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select className="form-input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="mobile">Mobile Payment</option>
                    </select>
                  </div>

                  <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '12px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Tax (10%):</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '18px', fontWeight: '600' }}>
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <button className="btn btn-success btn-block" onClick={handleCheckout}>
                      Complete Sale
                    </button>
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

export default Sales;
