import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  Heading,
  Spinner,
  Container,
  Center,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  Divider,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import {
  getAdminAllOrders,
  updateOrderStatus,
} from "../actions/apiActions";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 10,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  const loadOrders = async (page = 1) => {
    setLoading(true);

    try {
      const filters = {
        search: search || undefined,
        paymentStatus: paymentStatus || undefined,
        // startDate: startDate || undefined,
        // endDate: endDate || undefined,
      };

      const { data } = await getAdminAllOrders(page, 10, filters);

      if (data.success) {
        setOrders(data.orders);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(1);
  }, [paymentStatus]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, { status: newStatus });
      loadOrders(pagination.currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "placed":
        return "gray";
      case "packed":
        return "orange";
      case "shipped":
        return "blue";
      case "delivered":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Container maxW="container.xl" py={10}>
      <Heading mb={6}>Admin Order Management</Heading>

      <HStack mb={4}>
        <InputGroup maxW="250px">
          <InputLeftElement children={<SearchIcon />} />
          <Input
            placeholder="Search by Order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadOrders(1)}
          />
        </InputGroup>

        <Button size="sm" onClick={() => loadOrders(1)}>
          Search
        </Button>
        <Select
          size="sm"
          maxW="180px"
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value);
          }}
        >
          <option value="">All Payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </Select>
      </HStack>

      {loading ? (
        <Center h="40vh">
          <Spinner size="xl" />
        </Center>
      ) : (
        <Box borderWidth="1px" borderRadius="lg" overflowX="auto">
          <Table size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th>Order ID</Th>
                <Th>Customer</Th>
                <Th>Products</Th>
                <Th>Total</Th>
                <Th>Payment</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {orders.map((order) => (
                <Tr key={order._id}>
                  <Td>
                    <Text fontWeight="bold">{order.orderId}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(order.createdAt).toLocaleString("en-IN")}
                    </Text>
                  </Td>

                  <Td>
                    <Text fontWeight="bold">
                      {order.shippingInfo?.name}
                    </Text>
                    <Text fontSize="xs">
                      {order.shippingInfo?.mobile}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {order.user?.email}
                    </Text>
                  </Td>

                  <Td>
                    {order.items.map((item, i) => (
                      <Text key={i} fontSize="xs">
                        {item.product?.name} (x{item.quantity})
                      </Text>
                    ))}
                  </Td>

                  <Td fontWeight="bold">
                    ₹{order.totalAmount}
                  </Td>

                  <Td>
                    <Badge
                      colorScheme={
                        order.paymentStatus === "paid"
                          ? "green"
                          : "red"
                      }
                    >
                      {order.paymentStatus.toUpperCase()}
                    </Badge>
                  </Td>

                  <Td>
                    <Select
                      size="xs"
                      value={order.orderStatus}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                    >
                      <option value="placed">Placed</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>
                  </Td>

                  <Td>
                    <Button
                      size="xs"
                      onClick={() => {
                        setSelectedOrder(order);
                        onOpen();
                      }}
                    >
                      View
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Pagination */}
      <HStack justify="center" mt={6}>
        <Button
          size="sm"
          onClick={() =>
            loadOrders(pagination.currentPage - 1)
          }
          isDisabled={pagination.currentPage === 1}
        >
          Prev
        </Button>

        <Text fontSize="sm">
          Page {pagination.currentPage} of {pagination.totalPages}
        </Text>

        <Button
          size="sm"
          onClick={() =>
            loadOrders(pagination.currentPage + 1)
          }
          isDisabled={
            pagination.currentPage === pagination.totalPages
          }
        >
          Next
        </Button>
      </HStack>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Order Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedOrder && (
              <VStack align="stretch" spacing={4}>
                <Text fontWeight="bold">Shipping Info</Text>
                <Box>
                  <Text>{selectedOrder.shippingInfo.name}</Text>
                  <Text>
                    {selectedOrder.shippingInfo.address},{" "}
                    {selectedOrder.shippingInfo.city}
                  </Text>
                  <Text>
                    Pincode: {selectedOrder.shippingInfo.pincode}
                  </Text>
                  <Text>
                    Mobile: {selectedOrder.shippingInfo.mobile}
                  </Text>
                </Box>

                <Divider />

                <Text fontWeight="bold">Items</Text>
                {selectedOrder.items.map((item, i) => (
                  <Text key={i}>
                    {item.product?.name} - Qty {item.quantity}
                  </Text>
                ))}

                <Divider />

                <Text fontWeight="bold">
                  Total: ₹{selectedOrder.totalAmount}
                </Text>
                <Box>
                  <Text fontWeight="bold" mb={3}>Status History</Text>

                  {selectedOrder.statusHistory?.map((entry, index) => (
                    <HStack
                      key={index}
                      justify="space-between"
                      fontSize="xs"
                      py={2}
                      borderBottom="1px solid"
                      borderColor="gray.100"
                    >
                      <VStack align="start" spacing={0}>
                        <Badge colorScheme="blue">
                          {entry.status.toUpperCase()}
                        </Badge>
                        <Text fontSize="10px" color="gray.500">
                          By: {entry.updatedBy || "system"}
                        </Text>
                      </VStack>

                      <Text color="gray.500">
                        {new Date(entry.timestamp).toLocaleString("en-IN")}
                      </Text>
                    </HStack>
                  ))}
                </Box>

              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdminOrders;
