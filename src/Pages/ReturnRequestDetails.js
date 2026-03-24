import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { 
    useToast, 
    Center, 
    Spinner, 
    Text, 
    Container, 
    VStack, 
    Flex, 
    Heading, 
    Badge, 
    SimpleGrid, 
    Divider, 
    HStack, 
    Image, 
    Box, 
    Button 
} from "@chakra-ui/react";
import { getReturnRequestDetails, updateReturnRequestStatus, processReturnRequest, processRefund, createReplacementOrder } from "../actions/apiActions";

const ReturnRequestDetails = () => {
    const { id } = useParams();
    const toast = useToast();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchRequest = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getReturnRequestDetails(id);
            if (res.success) {
                setRequest(res.data);
            } else {
                setError(res.message || "Failed to fetch request details.");
            }
        } catch (err) {
            setError("Failed to fetch request details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchRequest();
    }, [fetchRequest]);

    const handleStatusUpdate = async (newStatus) => {
        setIsUpdating(true);
        try {
            const res = await updateReturnRequestStatus(id, newStatus);
            if (res.success) {
                toast({
                    title: "Status Updated",
                    description: `Request status has been updated to ${newStatus}.`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                fetchRequest(); // Refetch data
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            toast({
                title: "Update Failed",
                description: err.message || "Could not update the status.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleProcessReturn = async () => {
        setIsUpdating(true);
        try {
            const res = await processReturnRequest(id);
            if (res.success) {
                toast({
                    title: "Return Processed",
                    description: "The return has been marked as received and stock updated.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                fetchRequest(); // Refetch data
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            toast({
                title: "Processing Failed",
                description: err.message || "Could not process the return.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleProcessRefund = async () => {
        setIsUpdating(true);
        try {
            const res = await processRefund(id);
            if (res.success) {
                toast({
                    title: "Refund Processed",
                    description: "The refund has been processed and the request is complete.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                fetchRequest(); // Refetch data
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            toast({
                title: "Refund Failed",
                description: err.message || "Could not process the refund.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCreateReplacement = async () => {
        setIsUpdating(true);
        try {
            const res = await createReplacementOrder(id);
            if (res.success) {
                toast({
                    title: "Replacement Created",
                    description: res.message || "A new replacement order has been created.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                fetchRequest(); // Refetch data
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            toast({
                title: "Replacement Failed",
                description: err.message || "Could not create the replacement order.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const statusColor = (status) => {
        switch (status) {
            case "REQUESTED": return "yellow";
            case "APPROVED": return "blue";
            case "PICKED": return "orange";
            case "RECEIVED": return "purple";
            case "COMPLETED": return "green";
            case "REJECTED": return "red";
            default: return "gray";
        }
    };

    if (loading) return <Center h="80vh"><Spinner size="xl" /></Center>;
    if (error) return <Center h="80vh"><Text color="red.500">{error}</Text></Center>;
    if (!request) return null;

    return (
        <Box maxW="100%">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
                <Box>
                    <Heading size="lg" fontWeight="bold" letterSpacing="tight" mb={1}>Return Request Details</Heading>
                    <Text color="gray.500" fontSize="sm">Manage this specific return request and update its status</Text>
                </Box>
                <Badge fontSize="sm" px={3} py={1} borderRadius="full" colorScheme={statusColor(request.status)}>
                    {request.status}
                </Badge>
            </Box>

            <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.200">
                        <VStack align="stretch" spacing={4}>
                            <Heading size="xs" color="gray.500" letterSpacing="wider" textTransform="uppercase">User & Order</Heading>
                            <Box>
                                <Text fontSize="sm" color="gray.500">User</Text>
                                <Text fontWeight="medium">{request.user?.name} ({request.user?.email})</Text>
                            </Box>
                            <Box>
                                <Text fontSize="sm" color="gray.500">Order ID</Text>
                                <Text fontWeight="medium" fontFamily="monospace">{request.order?.orderId}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="sm" color="gray.500">Request Date</Text>
                                <Text fontWeight="medium">{new Date(request.createdAt).toLocaleString("en-IN")}</Text>
                            </Box>
                        </VStack>
                    </Box>
                    <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.200">
                        <VStack align="stretch" spacing={4}>
                            <Heading size="xs" color="gray.500" letterSpacing="wider" textTransform="uppercase">Request Details</Heading>
                            <Box>
                                <Text fontSize="sm" color="gray.500">Type</Text>
                                <Text fontWeight="medium">{request.type}</Text>
                            </Box>
                            <Box>
                                <Text fontSize="sm" color="gray.500">Reason</Text>
                                <Text fontWeight="medium">{request.reason}</Text>
                            </Box>
                        </VStack>
                    </Box>
                </SimpleGrid>

                <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.200">
                    <Heading size="md" mb={6} fontWeight="semibold">Items in Request</Heading>
                    <VStack spacing={4} align="stretch">
                        {request.items.map((item, index) => (
                            <HStack key={index} justify="space-between" p={3} borderWidth="1px" borderColor="gray.100" borderRadius="md" bg="gray.50">
                                <HStack spacing={4}>
                                    <Image src={item.product?.images?.[0] ? `/uploads/${item.product.images[0]}` : "https://via.placeholder.com/80"} boxSize="50px" objectFit="cover" borderRadius="md" />
                                    <VStack align="start" spacing={0}>
                                        <Text fontWeight="medium" color="black">{item.product?.name}</Text>
                                        <Text fontSize="sm" color="gray.500">Qty: {item.quantity}</Text>
                                    </VStack>
                                </HStack>
                            </HStack>
                        ))}
                    </VStack>
                </Box>

                <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.200">
                    <Heading size="md" mb={4} fontWeight="semibold">Actions</Heading>
                    <HStack spacing={3}>
                        {request.status === 'REQUESTED' && (
                            <>
                                <Button colorScheme="blue" bg="black" color="white" _hover={{ bg: "gray.800" }} onClick={() => handleStatusUpdate('APPROVED')} isLoading={isUpdating}>Approve</Button>
                                <Button variant="outline" borderColor="red.200" color="red.500" _hover={{ bg: "red.50" }} onClick={() => handleStatusUpdate('REJECTED')} isLoading={isUpdating}>Reject</Button>
                            </>
                        )}
                        {request.status === 'APPROVED' && (
                            <Button colorScheme="orange" onClick={() => handleStatusUpdate('PICKED')} isLoading={isUpdating}>Mark as Picked</Button>
                        )}
                        {request.status === 'PICKED' && (
                            <Button colorScheme="purple" onClick={handleProcessReturn} isLoading={isUpdating}>Mark as Received</Button>
                        )}
                        {request.status === 'RECEIVED' && request.type === 'REFUND' && (
                            <Button colorScheme="teal" onClick={handleProcessRefund} isLoading={isUpdating}>Process Refund</Button>
                        )}
                        {request.status === 'RECEIVED' && request.type === 'REPLACEMENT' && (
                            <Button colorScheme="cyan" onClick={handleCreateReplacement} isLoading={isUpdating}>Create Replacement</Button>
                        )}
                    </HStack>
                </Box>
            </VStack>
        </Box>
    );
};

export default ReturnRequestDetails;
