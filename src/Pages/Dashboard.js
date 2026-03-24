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
  return (
    <Box
      bg="white"
      p={6}
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      transition="all 0.2s ease"
      _hover={{
        borderColor: "gray.300",
        boxShadow: "sm"
      }}
    >
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="gray.500" mb={1}>
            {title}
          </Text>
          <Heading size="xl" fontWeight="bold" letterSpacing="tight" color="black">
            {value ?? 0}
          </Heading>
        </Box>

        <Flex
          align="center"
          justify="center"
          w="40px"
          h="40px"
          borderRadius="md"
          bg="gray.50"
          border="1px solid"
          borderColor="gray.100"
        >
          <Icon as={icon} boxSize={5} color="black" />
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
    <Box maxW="100%">
      <Box mb={6}>
        <Heading size="lg" fontWeight="bold" letterSpacing="tight" mb={1}>Dashboard</Heading>
        <Text color="gray.500" fontSize="sm">Overview of your system operations</Text>
      </Box>

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
          <Box mt={10}>
            <Heading size="md" mb={4} fontWeight="semibold" color="gray.800">
              Quick Actions
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              {[
                { label: "Manage Categories", path: "/category" },
                { label: "Manage Products", path: "/products" },
                { label: "Manage Users", path: "/users" },
                { label: "View Orders", path: "/orders" }
              ].map((item, index) => (
                <Link key={index} to={item.path}>
                  <Box
                    p={5}
                    bg="white"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    transition="all 0.2s ease"
                    _hover={{
                      bg: "gray.50",
                      borderColor: "gray.300",
                    }}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Text fontWeight="medium" color="gray.700">{item.label}</Text>
                    <Text color="gray.400">→</Text>
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