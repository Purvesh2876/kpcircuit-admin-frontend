// // AdminDashboard.js
// import React, { useEffect, useState } from 'react';
// import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber } from '@chakra-ui/react';
// import { Link } from 'react-router-dom';
// import { fetchDashboardStats } from '../actions/apiActions';

// const AdminDashboard = () => {
//   const [data, setData] = useState(null);
//   const fetchData = async () => {
//     try {
//       const response = await fetchDashboardStats();
//       setData(response.data);
//       console.log('Dashboard data:', response);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   }

//   useEffect(() => {
//     fetchData();
//   }, []);

//   return (
//     <Box p={4}>
//       <Heading mb={4}>Admin Dashboard</Heading>

//       <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
//         <Stat>
//           <StatLabel>Categories</StatLabel>
//           <StatNumber>{data?.categories}</StatNumber>
//         </Stat>

//         <Stat>
//           <StatLabel>SubCategories</StatLabel>
//           <StatNumber>{data?.subCategories}</StatNumber>
//         </Stat>

//         <Stat>
//           <StatLabel>Products</StatLabel>
//           <StatNumber>{data?.products}</StatNumber>
//         </Stat>

//         <Stat>
//           <StatLabel>Users</StatLabel>
//           <StatNumber>{data?.users}</StatNumber>
//         </Stat>
//       </SimpleGrid>

//       <Box mt={6}>
//         <Heading size="md">Quick Actions</Heading>
//         <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mt={4}>
//           <Link to="/category" fontSize="lg" p={4} borderWidth="1px" borderRadius="md" boxShadow="sm">
//             Manage Categories
//           </Link>

//           <Link to="/products" fontSize="lg" p={4} borderWidth="1px" borderRadius="md" boxShadow="sm">
//             Manage Products
//           </Link>

//           <Link to="/users" fontSize="lg" p={4} borderWidth="1px" borderRadius="md" boxShadow="sm">
//             Manage Users
//           </Link>

//           <Link to="/orders" fontSize="lg" p={4} borderWidth="1px" borderRadius="md" boxShadow="sm">
//             View Orders
//           </Link>
//         </SimpleGrid>
//       </Box>
//     </Box>
//   );
// };

// export default AdminDashboard;

// src/Pages/Dashboard.js

import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Flex,
  Icon,
  Spinner,
  useColorModeValue
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiBox,
  FiLayers,
  FiShoppingCart,
  FiAlertCircle,
  FiPackage
} from 'react-icons/fi';
import { fetchDashboardStats } from '../actions/apiActions';


// =======================
// Reusable Stat Card
// =======================
const StatCard = ({ title, value, icon, accent }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      bg={cardBg}
      p={6}
      borderRadius="2xl"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
      transition="all 0.3s ease"
      _hover={{
        transform: "translateY(-6px)",
        boxShadow: "lg"
      }}
    >
      <Flex justify="space-between" align="center">
        <Box>
          <Text fontSize="sm" color="gray.500">
            {title}
          </Text>
          <Heading size="lg" mt={2}>
            {value ?? 0}
          </Heading>
        </Box>

        <Flex
          align="center"
          justify="center"
          w="52px"
          h="52px"
          borderRadius="full"
          bg={`${accent}.100`}
        >
          <Icon as={icon} boxSize={6} color={`${accent}.500`} />
        </Flex>
      </Flex>
    </Box>
  );
};


// =======================
// Main Dashboard
// =======================
const Dashboard = () => {
  const [data, setData] = useState(null);

  // ✅ Hooks must always be at top
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const quickCardBg = useColorModeValue("white", "gray.800");
  const quickBorder = useColorModeValue("gray.200", "gray.700");

  const fetchData = async () => {
    try {
      const response = await fetchDashboardStats();
      setData(response.data);
      console.log("Dashboard Data:", response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box p={8} bg={pageBg} minH="100vh">
      <Heading mb={8}>Admin Dashboard</Heading>

      {/* ================= Loader ================= */}
      {!data ? (
        <Flex h="60vh" justify="center" align="center">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          {/* ================= Stats Grid ================= */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <StatCard title="Users" value={data.users} icon={FiUsers} accent="blue" />
            <StatCard title="Products" value={data.products} icon={FiBox} accent="purple" />
            <StatCard title="Categories" value={data.categories} icon={FiLayers} accent="green" />
            <StatCard title="Sub Categories" value={data.subCategories} icon={FiLayers} accent="teal" />
            <StatCard title="Total Orders" value={data.totalOrders} icon={FiShoppingCart} accent="orange" />
            <StatCard title="Pending Orders" value={data.pendingOrders} icon={FiAlertCircle} accent="red" />
            <StatCard title="Out Of Stock" value={data.outOfStock} icon={FiPackage} accent="pink" />
          </SimpleGrid>

          {/* ================= Quick Actions ================= */}
          <Box mt={14}>
            <Heading size="md" mb={6}>
              Quick Actions
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              {[
                { label: "Manage Categories", path: "/category" },
                { label: "Manage Products", path: "/products" },
                { label: "Manage Users", path: "/users" },
                { label: "View Orders", path: "/orders" }
              ].map((item, index) => (
                <Link key={index} to={item.path}>
                  <Box
                    p={6}
                    bg={quickCardBg}
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor={quickBorder}
                    boxShadow="sm"
                    transition="all 0.3s ease"
                    _hover={{
                      bg: "black",
                      color: "white",
                      transform: "translateY(-5px)",
                      boxShadow: "lg"
                    }}
                  >
                    <Text fontWeight="medium">{item.label}</Text>
                  </Box>
                </Link>
              ))}
            </SimpleGrid>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Dashboard;