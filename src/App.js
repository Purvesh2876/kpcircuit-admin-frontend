import logo from './logo.svg';
import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Order from './Pages/Order';
import User from './Pages/User';
import Products from './Pages/Products';
import OrdersPage from './Pages/Order';
import Category from './Pages/Category';
import ProtectedRoute from './components/ProtectedRoute';
import NoLogin from './components/NoLogin';
import SubCategoryAdmin from './Pages/subCategory';
// import ProductDetails from './Pages/ProductDetails/index.js';
// import Collection from './Pages/Collection/index.js';

function App() {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const handleLogin = (status) => {
    setLoggedIn(status);
  };

  return (
    <Router>
      <div>
        <Header />

        <Routes>
          <Route path="/" element={<NoLogin><Login onLogin={handleLogin} /></NoLogin>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          {/* <Route path="/orders" element={<Order />} /> */}
          <Route path="/users" element={<ProtectedRoute><User /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/category" element={<ProtectedRoute><Category /></ProtectedRoute>} />
          <Route path="/subcategory" element={<ProtectedRoute><SubCategoryAdmin /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          {/* <Route path="/productdetails/:productId" element={<ProductDetails />} /> */}
          {/* <Route path="/collection" element={<Collection />} /> */}
        </Routes>

      </div>
    </Router>
  );
}

export default App;
