
import "./App.css";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Search,
  Bell,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://50.17.98.50";

function App() {
  const [active, setActive] = useState("Dashboard");
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [userResponse, productResponse, orderResponse] =
        await Promise.all([
          fetch(`${API_URL}/users`),
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/orders`),
        ]);

      if (!userResponse.ok || !productResponse.ok || !orderResponse.ok) {
        throw new Error("Unable to load data from backend");
      }

      const [userData, productData, orderData] = await Promise.all([
        userResponse.json(),
        productResponse.json(),
        orderResponse.json(),
      ]);

      setUsers(userData);
      setProducts(productData);
      setOrders(orderData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function apiRequest(path, method, body) {
    try {
      const response = await fetch(`${API_URL}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "API request failed");
      }

      await loadData();
      alert("Operation successful!");
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  function addUser() {
    const name = prompt("Enter user name:");
    if (!name) return;

    const email = prompt("Enter user email:");
    if (!email) return;

    apiRequest("/users", "POST", { name, email });
  }

  function editUser(user) {
    const name = prompt("Enter new name:", user.name);
    if (!name) return;

    const email = prompt("Enter new email:", user.email);
    if (!email) return;

    apiRequest(`/users/${user.id}`, "PUT", { name, email });
  }

  function deleteUser(id) {
    if (confirm("Are you sure you want to delete this user?")) {
      apiRequest(`/users/${id}`, "DELETE");
    }
  }

  function addProduct() {
    const name = prompt("Enter product name:");
    if (!name) return;

    const price = Number(prompt("Enter product price:"));
    if (!Number.isFinite(price) || price <= 0) return alert("Enter a valid price");

    const stock = Number(prompt("Enter stock quantity:"));
    if (!Number.isInteger(stock) || stock < 0) return alert("Enter valid stock");

    apiRequest("/products", "POST", { name, price, stock });
  }

  function editProduct(product) {
    const name = prompt("Enter new product name:", product.name);
    if (!name) return;

    const price = Number(prompt("Enter new price:", product.price));
    if (!Number.isFinite(price) || price <= 0) return alert("Enter a valid price");

    const stock = Number(prompt("Enter new stock:", product.stock));
    if (!Number.isInteger(stock) || stock < 0) return alert("Enter valid stock");

    apiRequest(`/products/${product.id}`, "PUT", { name, price, stock });
  }

  function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
      apiRequest(`/products/${id}`, "DELETE");
    }
  }

  function addOrder() {
    const user_id = Number(prompt("Enter user ID:"));
    if (!Number.isInteger(user_id) || user_id <= 0) return alert("Enter a valid user ID");

    const product_id = Number(prompt("Enter product ID:"));
    if (!Number.isInteger(product_id) || product_id <= 0) return alert("Enter a valid product ID");

    const quantity = Number(prompt("Enter quantity:"));
    if (!Number.isInteger(quantity) || quantity <= 0) return alert("Enter a valid quantity");

    apiRequest("/orders", "POST", { user_id, product_id, quantity });
  }

  function editOrder(order) {
    const user_id = Number(prompt("Enter user ID:", order.user_id));
    if (!Number.isInteger(user_id) || user_id <= 0) return alert("Enter a valid user ID");

    const product_id = Number(prompt("Enter product ID:", order.product_id));
    if (!Number.isInteger(product_id) || product_id <= 0) return alert("Enter a valid product ID");

    const quantity = Number(prompt("Enter quantity:", order.quantity));
    if (!Number.isInteger(quantity) || quantity <= 0) return alert("Enter a valid quantity");

    apiRequest(`/orders/${order.id}`, "PUT", {
      user_id,
      product_id,
      quantity,
    });
  }

  function deleteOrder(id) {
    if (confirm("Are you sure you want to delete this order?")) {
      apiRequest(`/orders/${id}`, "DELETE");
    }
  }

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Users", icon: Users },
    { name: "Products", icon: Package },
    { name: "Orders", icon: ShoppingCart },
  ];

  function renderTable() {
    if (active === "Users") {
      return (
        <section className="panel recent">
          <div className="page-heading">
            <div>
              <h3>Users Management</h3>
              <p className="muted">Manage all registered users</p>
            </div>
            <button className="action-button" onClick={addUser}>
              <Plus size={17} /> Add User
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <button className="icon-button" onClick={() => editUser(user)} title="Edit">
                      <Pencil size={17} />
                    </button>
                    <button className="icon-button delete" onClick={() => deleteUser(user.id)} title="Delete">
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan="4">No users found</td></tr>
              )}
            </tbody>
          </table>
        </section>
      );
    }

    if (active === "Products") {
      return (
        <section className="panel recent">
          <div className="page-heading">
            <div>
              <h3>Products Management</h3>
              <p className="muted">Manage your products and stock</p>
            </div>
            <button className="action-button" onClick={addProduct}>
              <Plus size={17} /> Add Product
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>₹{product.price}</td>
                  <td>{product.stock}</td>
                  <td>
                    <button className="icon-button" onClick={() => editProduct(product)} title="Edit">
                      <Pencil size={17} />
                    </button>
                    <button className="icon-button delete" onClick={() => deleteProduct(product.id)} title="Delete">
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="5">No products found</td></tr>
              )}
            </tbody>
          </table>
        </section>
      );
    }

    if (active === "Orders") {
      return (
        <section className="panel recent">
          <div className="page-heading">
            <div>
              <h3>Orders Management</h3>
              <p className="muted">Manage customer orders</p>
            </div>
            <button className="action-button" onClick={addOrder}>
              <Plus size={17} /> Add Order
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User ID</th>
                <th>Product ID</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.user_id}</td>
                  <td>{order.product_id}</td>
                  <td>{order.quantity}</td>
                  <td>₹{order.total_price}</td>
                  <td>
                    <button className="icon-button" onClick={() => editOrder(order)} title="Edit">
                      <Pencil size={17} />
                    </button>
                    <button className="icon-button delete" onClick={() => deleteOrder(order.id)} title="Delete">
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan="6">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </section>
      );
    }

    return null;
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Micro<span>Admin</span></h2>
        <p className="menu-title">MENU</p>

        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              className={active === item.name ? "menu-item active" : "menu-item"}
              onClick={() => setActive(item.name)}
            >
              <Icon size={19} />
              {item.name}
            </button>
          );
        })}

        <div className="sidebar-bottom">Microservices Admin v1.0</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h2>{active}</h2>
            <p>Welcome to your administration panel</p>
          </div>
          <div className="top-actions">
            <Search size={20} />
            <Bell size={20} />
            <div className="avatar">Y</div>
          </div>
        </header>

        {error && <div className="panel">API Error: {error}</div>}

        {active === "Dashboard" ? (
          <>
            <section className="welcome">
              <div>
                <h1>Welcome Back 👋</h1>
                <p>Manage your users, products and orders.</p>
              </div>
              <button className="action-button" onClick={loadData}>
                <RefreshCw size={17} /> Refresh
              </button>
            </section>

            <section className="stats">
              <div className="stat-card">
                <div className="stat-icon blue"><Users /></div>
                <p>Total Users</p>
                <h2>{users.length}</h2>
              </div>
              <div className="stat-card">
                <div className="stat-icon purple"><Package /></div>
                <p>Total Products</p>
                <h2>{products.length}</h2>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange"><ShoppingCart /></div>
                <p>Total Orders</p>
                <h2>{orders.length}</h2>
              </div>
            </section>

            <section className="content-grid">
              <div className="panel">
                <h3>Application Overview</h3>
                <p className="muted">Your microservices dashboard</p>
                <div className="overview">
                  <div><span>Users Service</span><b className="online">● API</b></div>
                  <div><span>Products Service</span><b className="online">● API</b></div>
                  <div><span>Orders Service</span><b className="online">● API</b></div>
                </div>
              </div>
              <div className="panel">
                <h3>Quick Summary</h3>
                <p className="muted">Live data from your backend</p>
                <div className="summary-number">{loading ? "..." : "Ready"}</div>
                <p>{users.length + products.length + orders.length} total records loaded</p>
              </div>
            </section>
          </>
        ) : (
          renderTable()
        )}
      </main>
    </div>
  );
}

export default App;
