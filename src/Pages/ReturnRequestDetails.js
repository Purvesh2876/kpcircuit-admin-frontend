import React, { useState, useEffect, useCallback, useRef } from "react";
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
    Button,
    useDisclosure,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    RadioGroup,
    Radio,
    Stack,
} from "@chakra-ui/react";
import { getReturnRequestDetails, updateReturnRequestStatus, processReturnRequest, processRefund, createReplacementOrder, processWaivedRefund } from "../actions/apiActions";

const ReturnRequestDetails = () => {
    const { id } = useParams();
    const toast = useToast();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Refund confirmation dialog
    const { isOpen: isRefundOpen, onOpen: onRefundOpen, onClose: onRefundClose } = useDisclosure();
    const cancelRef = useRef();

    // Waived refund confirmation dialog
    const { isOpen: isWaivedOpen, onOpen: onWaivedOpen, onClose: onWaivedClose } = useDisclosure();
    const waivedCancelRef = useRef();

    // Condition modal (Good / Damaged per item before marking received)
    const { isOpen: isConditionOpen, onOpen: onConditionOpen, onClose: onConditionClose } = useDisclosure();
    const [itemConditions, setItemConditions] = useState({});

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

    // Initialise conditions to GOOD when modal opens
    const openConditionModal = () => {
        const initial = {};
        request.items.forEach(item => {
            initial[item.product._id] = "GOOD";
        });
        setItemConditions(initial);
        onConditionOpen();
    };

    const handleStatusUpdate = async (newStatus) => {
        setIsUpdating(true);
        try {
            const res = await updateReturnRequestStatus(id, newStatus);
            if (res.success) {
                toast({ title: "Status Updated", description: `Request updated to ${newStatus}.`, status: "success", duration: 4000, isClosable: true });
                fetchRequest();
            } else throw new Error(res.message);
        } catch (err) {
            toast({ title: "Update Failed", description: err.message || "Could not update the status.", status: "error", duration: 4000, isClosable: true });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleProcessReturn = async () => {
        onConditionClose();
        setIsUpdating(true);
        const conditions = Object.entries(itemConditions).map(([product, condition]) => ({ product, condition }));
        try {
            const res = await processReturnRequest(id, conditions);
            if (res.success) {
                toast({ title: "Return Processed", description: "Return marked as received. Stock updated based on item conditions.", status: "success", duration: 5000, isClosable: true });
                fetchRequest();
            } else throw new Error(res.message);
        } catch (err) {
            toast({ title: "Processing Failed", description: err.message || "Could not process the return.", status: "error", duration: 5000, isClosable: true });
        } finally {
            setIsUpdating(false);
        }
    };

    // Calculate refund amount from items (priceAtOrder × quantity)
    const calcRefundAmount = () => {
        if (!request?.order?.items) return null;
        let total = 0;
        for (const returnItem of request.items) {
            const orderItem = request.order.items.find(
                i => i.product?.toString() === returnItem.product?._id?.toString()
            );
            if (orderItem) total += (orderItem.priceAtOrder || 0) * returnItem.quantity;
        }
        return total > 0 ? total : null;
    };

    const confirmRefund = async () => {
        onRefundClose();
        setIsUpdating(true);
        try {
            const res = await processRefund(id);
            if (res.success) {
                toast({ title: "Refund Processed", description: res.message, status: "success", duration: 5000, isClosable: true });
                fetchRequest();
            } else throw new Error(res.message);
        } catch (err) {
            toast({ title: "Refund Failed", description: err.message || "Could not process the refund.", status: "error", duration: 5000, isClosable: true });
        } finally {
            setIsUpdating(false);
        }
    };

    const confirmWaivedRefund = async () => {
        onWaivedClose();
        setIsUpdating(true);
        try {
            const res = await processWaivedRefund(id);
            if (res.success) {
                toast({ title: "Refund Processed", description: res.message, status: "success", duration: 5000, isClosable: true });
                fetchRequest();
            } else throw new Error(res.message);
        } catch (err) {
            toast({ title: "Refund Failed", description: err.message || "Could not process waived refund.", status: "error", duration: 5000, isClosable: true });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCreateReplacement = async () => {
        setIsUpdating(true);
        try {
            const res = await createReplacementOrder(id);
            if (res.success) {
                toast({ title: "Replacement Created", description: res.message || "Replacement order created.", status: "success", duration: 5000, isClosable: true });
                fetchRequest();
            } else throw new Error(res.message);
        } catch (err) {
            toast({ title: "Replacement Failed", description: err.message || "Could not create the replacement order.", status: "error", duration: 5000, isClosable: true });
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

    const refundAmount = calcRefundAmount();

    return (
        <Box maxW="100%">
            {/* Refund Confirmation Dialog */}
            <AlertDialog isOpen={isRefundOpen} leastDestructiveRef={cancelRef} onClose={onRefundClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">Process Refund</AlertDialogHeader>
                        <AlertDialogBody>
                            <VStack align="stretch" spacing={3}>
                                {refundAmount && (
                                    <Box p={3} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.500">Refund Amount</Text>
                                            <Text fontWeight="bold" color="green.600" fontSize="lg">₹{refundAmount}</Text>
                                        </HStack>
                                        <Text fontSize="xs" color="gray.400" mt={1}>Based on price at time of order</Text>
                                    </Box>
                                )}
                                <Text fontSize="sm">This will initiate a Razorpay refund and send a confirmation email to the customer.</Text>
                            </VStack>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onRefundClose} variant="outline">Cancel</Button>
                            <Button colorScheme="teal" onClick={confirmRefund} ml={3}>
                                Confirm Refund {refundAmount ? `₹${refundAmount}` : ""}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            {/* Waived Refund Confirmation Dialog */}
            <AlertDialog isOpen={isWaivedOpen} leastDestructiveRef={waivedCancelRef} onClose={onWaivedClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">Refund Without Collection</AlertDialogHeader>
                        <AlertDialogBody>
                            <VStack align="stretch" spacing={3}>
                                {refundAmount && (
                                    <Box p={3} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.500">Refund Amount</Text>
                                            <Text fontWeight="bold" color="green.600" fontSize="lg">₹{refundAmount}</Text>
                                        </HStack>
                                        <Text fontSize="xs" color="gray.400" mt={1}>Based on price at time of order</Text>
                                    </Box>
                                )}
                                <Box p={3} bg="orange.50" borderRadius="md" borderLeft="4px solid" borderColor="orange.400">
                                    <Text color="orange.800" fontWeight="bold" fontSize="sm" mb={1}>Collection Waived</Text>
                                    <Text color="orange.700" fontSize="xs">
                                        The product will NOT be collected. Customer keeps the item. Refund will be processed immediately. This is typically used for low-value items where collection cost exceeds product value.
                                    </Text>
                                </Box>
                            </VStack>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={waivedCancelRef} onClick={onWaivedClose} variant="outline">Cancel</Button>
                            <Button colorScheme="orange" onClick={confirmWaivedRefund} ml={3}>
                                Refund {refundAmount ? `₹${refundAmount}` : ""} & Waive Collection
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            {/* Condition Modal — per item when marking as received */}
            <Modal isOpen={isConditionOpen} onClose={onConditionClose} size="md">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Item Condition on Return</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack align="stretch" spacing={4}>
                            <Text fontSize="sm" color="gray.500">
                                Select the condition of each returned item. Damaged items will be logged for audit but will not be added back to stock.
                            </Text>
                            {request.items.map((item, index) => (
                                <Box key={index} p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200">
                                    <HStack spacing={3} mb={3}>
                                        <Image
                                            src={item.product?.images?.[0] ? `/uploads/${item.product.images[0]}` : ""}
                                            boxSize="40px"
                                            objectFit="cover"
                                            borderRadius="md"
                                            fallbackSrc=""
                                        />
                                        <Box>
                                            <Text fontWeight="medium" fontSize="sm">{item.product?.name}</Text>
                                            <Text fontSize="xs" color="gray.500">Qty: {item.quantity}</Text>
                                        </Box>
                                    </HStack>
                                    <RadioGroup
                                        value={itemConditions[item.product._id] || "GOOD"}
                                        onChange={(val) => setItemConditions(prev => ({ ...prev, [item.product._id]: val }))}
                                    >
                                        <Stack direction="row" spacing={4}>
                                            <Radio value="GOOD" colorScheme="green">
                                                <Text fontSize="sm">Good — add to stock</Text>
                                            </Radio>
                                            <Radio value="DAMAGED" colorScheme="red">
                                                <Text fontSize="sm">Damaged — log only</Text>
                                            </Radio>
                                        </Stack>
                                    </RadioGroup>
                                </Box>
                            ))}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="outline" mr={3} onClick={onConditionClose}>Cancel</Button>
                        <Button colorScheme="purple" onClick={handleProcessReturn} isLoading={isUpdating}>
                            Mark as Received
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

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
                            {refundAmount && (
                                <Box>
                                    <Text fontSize="sm" color="gray.500">Refund Amount</Text>
                                    <Text fontWeight="bold" color="green.600">₹{refundAmount}</Text>
                                    <Text fontSize="xs" color="gray.400">At price when ordered</Text>
                                </Box>
                            )}
                        </VStack>
                    </Box>
                </SimpleGrid>

                <Box bg="white" p={6} borderRadius="lg" borderWidth="1px" borderColor="gray.200">
                    <Heading size="md" mb={6} fontWeight="semibold">Items in Request</Heading>
                    <VStack spacing={4} align="stretch">
                        {request.items.map((item, index) => (
                            <HStack key={index} justify="space-between" p={3} borderWidth="1px" borderColor="gray.100" borderRadius="md" bg="gray.50">
                                <HStack spacing={4}>
                                    <Image src={item.product?.images?.[0] ? `/uploads/${item.product.images[0]}` : ""} boxSize="50px" objectFit="cover" borderRadius="md" fallbackSrc="" />
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
                    <HStack spacing={3} flexWrap="wrap">
                        {request.status === 'REQUESTED' && (
                            <>
                                <Button colorScheme="blue" bg="black" color="white" _hover={{ bg: "gray.800" }} onClick={() => handleStatusUpdate('APPROVED')} isLoading={isUpdating}>Approve</Button>
                                <Button variant="outline" borderColor="red.200" color="red.500" _hover={{ bg: "red.50" }} onClick={() => handleStatusUpdate('REJECTED')} isLoading={isUpdating}>Reject</Button>
                                <Button variant="outline" borderColor="orange.300" color="orange.600" _hover={{ bg: "orange.50" }} onClick={onWaivedOpen} isLoading={isUpdating}>
                                    Refund Without Collection
                                </Button>
                            </>
                        )}
                        {request.status === 'APPROVED' && (
                            <>
                                <Button colorScheme="orange" onClick={() => handleStatusUpdate('PICKED')} isLoading={isUpdating}>Mark as Picked</Button>
                                <Button variant="outline" borderColor="orange.300" color="orange.600" _hover={{ bg: "orange.50" }} onClick={onWaivedOpen} isLoading={isUpdating}>
                                    Refund Without Collection
                                </Button>
                            </>
                        )}
                        {request.status === 'PICKED' && (
                            <Button colorScheme="purple" onClick={openConditionModal} isLoading={isUpdating}>Mark as Received</Button>
                        )}
                        {request.status === 'RECEIVED' && (
                            <>
                                {request.type === 'REFUND' && (
                                    <Button colorScheme="teal" onClick={onRefundOpen} isLoading={isUpdating}>Process Refund</Button>
                                )}
                                {request.type === 'REPLACEMENT' && (
                                    <Button colorScheme="cyan" onClick={handleCreateReplacement} isLoading={isUpdating}>Create Replacement</Button>
                                )}
                            </>
                        )}
                    </HStack>
                </Box>
            </VStack>
        </Box>
    );
};

export default ReturnRequestDetails;
