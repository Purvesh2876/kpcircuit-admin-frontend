import logo from './logo.svg';
import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Flex, Box } from '@chakra-ui/react';
import Header from './components/header';
import Sidebar from './components/Sidebar';
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
import ReturnRequests from './Pages/ReturnRequests.js';
import ReturnRequestDetails from './Pages/ReturnRequestDetails.js';
// import ProductDetails from './Pages/ProductDetails/index.js';
// import Collection from './Pages/Collection/index.js';

function App() {
  const [isLoggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogin = (status) => {
    setLoggedIn(status);
  };

  return (
    <Router basename="/admin">
      <Flex h="100vh" w="100%" overflow="hidden">

        {/* SIDEBAR (Visible only when logged in) */}
        {isLoggedIn && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}

        {/* MAIN CONTENT AREA */}
        <Box flex="1" minW="0" display="flex" flexDirection="column">

          {/* HEADER (Visible only when logged in) */}
          {isLoggedIn && <Header />}

          {/* PAGE ROUTES */}
          <Box flex="1" overflowY="auto" p={isLoggedIn ? 6 : 0}>
            <Routes>
              <Route path="/" element={<NoLogin><Login onLogin={handleLogin} /></NoLogin>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><User /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/category" element={<ProtectedRoute><Category /></ProtectedRoute>} />
              <Route path="/subcategory" element={<ProtectedRoute><SubCategoryAdmin /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/returns" element={<ProtectedRoute><ReturnRequests /></ProtectedRoute>} />
              <Route path="/returns/:id" element={<ProtectedRoute><ReturnRequestDetails /></ProtectedRoute>} />
            </Routes>
          </Box>
        </Box>
      </Flex>
    </Router>
  );
}

export default App;
