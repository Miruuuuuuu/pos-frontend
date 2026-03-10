import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiSearch, FiList, FiGrid } from 'react-icons/fi';
import './Sales.css';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('pos'); // 'pos' or 'history'
  const [applyTax, setApplyTax] = useState(true);

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
    if (product.stockQty <= 0) {
      toast.warning('Product out of stock');
      return;
    }
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

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) return removeFromCart(productId);
    const product = products.find(p => p._id === productId);
    if (product && qty > product.stockQty) {
      toast.warning('Not enough stock');
      return;
    }
    setCart(cart.map(item =>
      item.product === productId
        ? { ...item, quantity: qty, total: qty * item.price }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product !== productId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const tax = applyTax ? subtotal * 0.1 : 0;
    const total = subtotal + tax - discount;
    return { subtotal, tax, total: Math.max(0, total) };
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
      toast.success('Sale completed successfully!');
      setCart([]);
      setSelectedCustomer('');
      setDiscount(0);
      setPaymentMethod('cash');
      setApplyTax(true);
      fetchSales();
      fetchProducts(); // Refresh stock
    } catch (error) {
      toast.error(error.response?.data?.message || 'Sale failed');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const { subtotal, tax, total } = calculateTotals();

  if (viewMode === 'history') {
    return (
      <div className="page pos-history-page">
        <div className="page-header">
          <h1 className="page-title">Sales History</h1>
          <button className="btn btn-primary" onClick={() => setViewMode('pos')}>
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
                {sales.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>No sales found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pos-container">
      <div className="pos-header">
        <h1 className="pos-title">Point of Sale</h1>
        <button className="btn btn-secondary" onClick={() => setViewMode('history')}>
          <FiList style={{ marginRight: '8px' }} /> View History
        </button>
      </div>

      <div className="pos-layout">
        {/* Left Side: Products Grid */}
        <div className="pos-products-section">
          <div className="pos-search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pos-search-input"
            />
          </div>

          <div className="products-grid">
            {filteredProducts.map(product => {
              const stockStatus = product.stockQty <= 0 ? 'out' : product.stockQty <= product.minStockLevel ? 'low' : 'in';
              return (
                <div
                  key={product._id}
                  className={`product-card ${stockStatus === 'out' ? 'disabled' : ''}`}
                  onClick={() => addToCart(product)}
                >
                  <div className="product-image-placeholder">
                    <span>{product.name.charAt(0)}</span>
                  </div>
                  <div className="product-info">
                    <h4 className="product-name">{product.name}</h4>
                    <p className="product-sku">{product.sku}</p>
                    <div className="product-price-row">
                      <span className="product-price">${product.price.toFixed(2)}</span>
                      <span className={`stock-indicator status-${stockStatus}`}>
                        {product.stockQty} left
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Cart Panel */}
        <div className="pos-cart-panel">
          <div className="cart-header">
            <h3>Current Order</h3>
            <span className="cart-count">{cart.reduce((s, i) => s + i.quantity, 0)} Items</span>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <FiGrid className="empty-cart-icon" />
                <p>Select products to add to cart</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product} className="cart-item">
                  <div className="cart-item-details">
                    <h4>{item.productName}</h4>
                    <span className="cart-item-price">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="cart-item-actions">
                    <div className="qty-control">
                      <button onClick={() => updateQuantity(item.product, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product, item.quantity + 1)}>+</button>
                    </div>
                    <span className="cart-item-total">${item.total.toFixed(2)}</span>
                    <button className="remove-btn" onClick={() => removeFromCart(item.product)}>
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-summary">
            <div className="customer-select-group">
              <label>Customer (Optional)</label>
              <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                <option value="">Walk-in Customer</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={applyTax}
                  onChange={(e) => setApplyTax(e.target.checked)}
                  style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                />
                Tax (10%)
              </label>
              <span>${tax.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="summary-row discount">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}

            <div className="payment-options">
              <button
                className={`pay-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >Cash</button>
              <button
                className={`pay-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >Card</button>
              <button
                className={`pay-btn ${paymentMethod === 'mobile' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('mobile')}
              >Mobile</button>
            </div>

            <div className="total-row">
              <span>Total</span>
              <span className="total-amount">${total.toFixed(2)}</span>
            </div>

            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              Checkout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
