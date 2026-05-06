import React, { useEffect, useState, useRef } from "react";
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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
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
  
  // 🚀 Disclosure for Confirmation
  const { 
    isOpen: isConfirmOpen, 
    onOpen: onConfirmOpen, 
    onClose: onConfirmClose 
  } = useDisclosure();
  
  const [pendingStatus, setPendingStatus] = useState({ id: null, status: "", isPaid: false, customerName: "", amount: 0, orderId: "" });
  const cancelRef = useRef();
  const toast = useToast();

  const loadOrders = async (page = 1) => {
    setLoading(true);

    try {
      const filters = {
        search: search || undefined,
        paymentStatus: paymentStatus || undefined,
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
    // If status is cancelled, we MUST ask for confirmation
    if (newStatus === "cancelled") {
      const orderToCancel = orders.find(o => o._id === id);
      setPendingStatus({
        id,
        status: newStatus,
        isPaid: orderToCancel?.paymentStatus === "paid",
        customerName: orderToCancel?.shippingInfo?.name || "Customer",
        amount: orderToCancel?.totalAmount || 0,
        orderId: orderToCancel?.orderId || "",
      });
      onConfirmOpen();
      return;
    }

    try {
      await updateOrderStatus(id, { status: newStatus });
      loadOrders(pagination.currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmStatusUpdate = async () => {
    try {
      const { data } = await updateOrderStatus(pendingStatus.id, { status: pendingStatus.status });
      onConfirmClose();
      loadOrders(pagination.currentPage);

      if (pendingStatus.isPaid) {
        if (data.refundInitiated) {
          toast({
            title: "Order cancelled & refund initiated",
            description: `₹${pendingStatus.amount} refund has been sent to ${pendingStatus.customerName}. It will reflect in 5–7 business days.`,
            status: "success",
            duration: 6000,
            isClosable: true,
          });
        } else if (data.refundError) {
          toast({
            title: "Order cancelled — refund failed",
            description: `Refund for ₹${pendingStatus.amount} could not be processed automatically. Please refund manually via Razorpay Dashboard. Error: ${data.refundError}`,
            status: "error",
            duration: 10000,
            isClosable: true,
          });
        }
      } else {
        toast({
          title: "Order cancelled",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to cancel order",
        description: "Something went wrong. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "payment confirmed":
        return "orange";
      case "accepted":
        return "blue";
      case "in transit":
        return "purple";
      case "delivered":
        return "green";
      case "cancelled":
        return "red";
      case "refunded":
        return "pink";
      case "returned":
        return "teal";
      case "replaced":
        return "yellow";
      default:
        return "gray";
    }
  };

  return (
    <Box maxW="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading size="lg" fontWeight="bold" letterSpacing="tight" mb={1}>Orders</Heading>
          <Text color="gray.500" fontSize="sm">Track and manage customer orders</Text>
        </Box>
        <HStack spacing={3}>
          <InputGroup maxW="250px">
            <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.400" />} />
            <Input
              bg="white"
              placeholder="Search by Order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadOrders(1)}
              borderRadius="md"
              borderColor="gray.300"
            />
          </InputGroup>
          <Select
            bg="white"
            maxW="150px"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            borderRadius="md"
            borderColor="gray.300"
          >
            <option value="">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </Select>
          <Button variant="outline" borderColor="gray.300" color="gray.600" bg="white" onClick={() => loadOrders(1)}>
            Search
          </Button>
        </HStack>
      </Box>

      {/* 🚀 Confirmation Dialog */}
      <AlertDialog
        isOpen={isConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={onConfirmClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Cancel Order
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack align="stretch" spacing={3}>
                <Box p={3} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="gray.500">Customer</Text>
                    <Text fontSize="sm" fontWeight="semibold">{pendingStatus.customerName}</Text>
                  </HStack>
                  <HStack justify="space-between" mt={1}>
                    <Text fontSize="xs" color="gray.500">Order ID</Text>
                    <Text fontSize="sm" fontWeight="semibold">{pendingStatus.orderId}</Text>
                  </HStack>
                  {pendingStatus.isPaid && (
                    <HStack justify="space-between" mt={1}>
                      <Text fontSize="xs" color="gray.500">Refund Amount</Text>
                      <Text fontSize="sm" fontWeight="bold" color="green.600">₹{pendingStatus.amount}</Text>
                    </HStack>
                  )}
                </Box>

                <Text fontSize="sm" color="gray.700">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </Text>

                {pendingStatus.isPaid && (
                  <Box p={3} bg="orange.50" borderRadius="md" borderLeft="4px solid" borderColor="orange.400">
                    <Text color="orange.800" fontWeight="bold" fontSize="sm" mb={1}>
                      Paid Order — Refund will be initiated
                    </Text>
                    <Text color="orange.700" fontSize="xs">
                      A Razorpay refund of ₹{pendingStatus.amount} will be automatically sent to {pendingStatus.customerName}. Stock will also be restocked.
                    </Text>
                  </Box>
                )}
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onConfirmClose} variant="outline">
                Keep Order
              </Button>
              <Button colorScheme="red" onClick={confirmStatusUpdate} ml={3}>
                {pendingStatus.isPaid ? "Cancel & Refund ₹" + pendingStatus.amount : "Cancel Order"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {loading ? (
        <Center h="40vh">
          <Spinner size="xl" />
        </Center>
      ) : (
        <Box bg="white" p={0} borderRadius="lg" borderWidth="1px" borderColor="gray.200" overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="md">
              <Thead bg="gray.50">
                <Tr>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Order ID</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Customer</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Products</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Total</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Payment</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Status</Th>
                  <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" textAlign="right">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
              {orders.map((order) => (
                <Tr key={order._id} _hover={{ bg: "gray.50" }}>
                  <Td>
                    <Text fontWeight="medium" color="black">{order.orderId}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </Text>
                  </Td>

                  <Td>
                    <Text fontWeight="medium" color="black">
                      {order.shippingInfo?.name}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {order.shippingInfo?.mobile}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {order.user?.email}
                    </Text>
                  </Td>

                  <Td color="gray.600">
                    {order.items.map((item, i) => (
                      <Text key={i} fontSize="xs">
                        {item.product?.name} <Text as="span" color="gray.400">(x{item.quantity})</Text>
                      </Text>
                    ))}
                  </Td>

                  <Td fontWeight="medium" color="black">
                    ₹{order.totalAmount}
                  </Td>

                  <Td>
                    <Badge
                      borderRadius="full"
                      px="2"
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
                    <VStack align="start" spacing={2}>
                      <Badge
                        borderRadius="full"
                        px={2}
                        colorScheme={statusColor(order.orderStatus)}
                      >
                        {order.orderStatus.toUpperCase()}
                      </Badge>
                      <Select
                        size="sm"
                        width="140px"
                        borderColor="gray.200"
                        bg="white"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) handleStatusChange(order._id, e.target.value);
                        }}
                        placeholder="Change status..."
                      >
                        <option value="accepted">Accepted</option>
                        <option value="in transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                        <option value="returned">Returned</option>
                        <option value="replaced">Replaced</option>
                      </Select>
                    </VStack>
                  </Td>

                  <Td textAlign="right">
                    <Button
                      size="sm"
                      variant="outline"
                      borderColor="gray.300"
                      color="gray.600"
                      _hover={{ bg: "gray.50" }}
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
        </Box>
      )}

      {/* Pagination */}
      <HStack justify="space-between" mt={4} px={1}>
        <Button
          size="sm"
          variant="outline"
          borderColor="gray.300"
          onClick={() =>
            loadOrders(pagination.currentPage - 1)
          }
          isDisabled={pagination.currentPage === 1}
        >
          Prev
        </Button>

        <Text fontSize="sm" color="gray.500">
          Page {pagination.currentPage} of {pagination.totalPages}
        </Text>

        <Button
          size="sm"
          variant="outline"
          borderColor="gray.300"
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

                <Text fontWeight="bold" mb={3}>Status History</Text>
                <Box>
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
    </Box>
  );
};

export default AdminOrders;
