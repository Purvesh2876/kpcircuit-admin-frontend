import React, { useEffect, useState } from "react";
import {
    Box,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Spinner,
    Center,
    Text,
    Badge,
    Button,
} from "@chakra-ui/react";
import { getAllReturnRequests } from "../actions/apiActions";
import { Link as RouterLink } from "react-router-dom";

const ReturnRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await getAllReturnRequests();
                if (res.success) {
                    setRequests(res.data);
                }
            } catch (err) {
                setError("Failed to fetch return requests.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const statusColor = (status) => {
        switch (status) {
            case "REQUESTED":
                return "yellow";
            case "APPROVED":
                return "blue";
            case "PICKED":
                return "orange";
            case "RECEIVED":
                return "purple";
            case "COMPLETED":
                return "green";
            case "REJECTED":
                return "red";
            default:
                return "gray";
        }
    };

    if (loading) return <Center h="80vh"><Spinner size="xl" /></Center>;
    if (error) return <Center h="80vh"><Text color="red.500">{error}</Text></Center>;

    return (
        <Box maxW="100%">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
                <Box>
                    <Heading size="lg" fontWeight="bold" letterSpacing="tight" mb={1}>Return Requests</Heading>
                    <Text color="gray.500" fontSize="sm">Manage customer returns and replacements</Text>
                </Box>
            </Box>

            <Box bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.200" overflow="hidden">
                <Box overflowX="auto">
                    <Table variant="simple" size="md">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Order ID</Th>
                                <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">User</Th>
                                <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Date</Th>
                                <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Type</Th>
                                <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Status</Th>
                                <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" textAlign="right">Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {requests.map((req) => (
                                <Tr key={req._id} _hover={{ bg: "gray.50" }}>
                                    <Td fontWeight="medium" color="black">{req.order?.orderId}</Td>
                                    <Td color="gray.600">{req.user?.name || "N/A"}</Td>
                                    <Td color="gray.600">{new Date(req.createdAt).toLocaleDateString("en-IN")}</Td>
                                    <Td color="gray.600">{req.type}</Td>
                                    <Td>
                                        <Badge borderRadius="full" px="2" colorScheme={statusColor(req.status)}>
                                            {req.status}
                                        </Badge>
                                    </Td>
                                    <Td textAlign="right">
                                        <Button
                                            as={RouterLink}
                                            to={`/returns/${req._id}`}
                                            size="sm"
                                            variant="outline"
                                            borderColor="gray.300"
                                            color="gray.600"
                                            _hover={{ bg: "gray.50" }}
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
        </Box>
    );
};

export default ReturnRequests;
