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
  Button,
  ButtonGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  Image,
  SimpleGrid,
  IconButton,
  Text,
  Textarea, // Added Textarea for description
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CloseIcon } from "@chakra-ui/icons";

import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  getSubCategoriesByCategory,
  addStock,
  getInventoryLogs,
} from "../actions/apiActions";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockQty, setStockQty] = useState("");
  const [stockNote, setStockNote] = useState("");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyProduct, setHistoryProduct] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setStockQty("");
    setStockNote("");
    setIsStockModalOpen(true);
  };

  const openHistoryModal = async (product, page = 1) => {
    try {
      const res = await getInventoryLogs(product._id, page, 10);

      setHistoryLogs(res.logs);
      setHistoryPage(res.page);
      setHistoryTotalPages(res.totalPages);

      setHistoryProduct(product);
      setIsHistoryModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Failed to load history");
    }
  };

  // SEPARATE STATE FOR IMAGES
  // 1. Array of strings (URLs) for images already on the server
  const [existingImages, setExistingImages] = useState([]);
  // 2. Array of File objects for new uploads
  const [newImages, setNewImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    manufacturer: "",
    category: "",
    subCategory: "",
    description: "",
    price: "",
    stock: "",
    minOrderQty: 1,
    featured: false,
    isReturnable: true,
    isReplaceable: true,
    returnWindowDays: 7,
  });

  // Parametric attribute values for the selected subcategory: { [key]: value }
  const [attributeValues, setAttributeValues] = useState({});

  // Filter parameter definitions of the currently selected subcategory
  const selectedSubCategoryAttrs =
    subCategories.find((s) => s._id === formData.subCategory)
      ?.filterAttributes || [];

  /* ---------------- FETCH ---------------- */

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      if (!categoryId) {
        setSubCategories([]);
        return;
      }
      const data = await getSubCategoriesByCategory(categoryId);
      setSubCategories(data);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  /* ---------------- MODAL ---------------- */

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      manufacturer: "",
      category: "",
      subCategory: "",
      description: "",
      price: "",
      stock: "",
      minOrderQty: 1,
      featured: false,
      isReturnable: true,
      isReplaceable: true,
      returnWindowDays: 7,
    });
    setExistingImages([]); // Reset images
    setNewImages([]); // Reset images
    setSubCategories([]);
    setAttributeValues({});
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      manufacturer: product.manufacturer,
      category: product.category?._id || "", // Safe navigation
      subCategory: product.subCategory?._id || "", // Safe navigation
      description: product.description,
      price: product.price,
      minOrderQty: product.minOrderQty ?? 1,
      featured: product.featured,
      isReturnable: product.isReturnable ?? true,
      isReplaceable: product.isReplaceable ?? true,
      returnWindowDays: product.returnWindowDays ?? 7,
    });

    // Set existing images from the product object
    setExistingImages(product.images || []);
    setNewImages([]); // Reset new images

    // Prefill attribute values from the saved product
    setAttributeValues(
      Object.fromEntries(
        (product.attributes || []).map((a) => [a.key, a.value])
      )
    );

    if (product.category?._id) {
      fetchSubCategories(product.category._id);
    }
    setIsModalOpen(true);
  };

  /* ---------------- HANDLERS ---------------- */

  const handleCategoryChange = async (e) => {
    const value = e.target.value;
    setFormData({ ...formData, category: value, subCategory: "" });
    setAttributeValues({});
    fetchSubCategories(value);
  };

  // Handle selecting new files
  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...filesArray]);
    }
  };

  // Remove a newly selected image (File object)
  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  // Remove an existing image (String URL)
  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleAddStock = async () => {
    if (!stockQty || Number(stockQty) <= 0) {
      alert("Enter valid quantity");
      return;
    }

    try {
      await addStock(selectedProduct._id, {
        quantity: stockQty,
        note: stockNote,
      });

      setIsStockModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to add stock");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();

    // 1. Append standard fields
    Object.entries(formData).forEach(([key, value]) => {
      // Ensure we don't send null/undefined values
      const valToSend = value === null || value === undefined ? "" : value;
      fd.append(key, valToSend);
    });

    // 2. Append NEW images (Files)
    newImages.forEach((img) => {
      fd.append("images", img);
    });

    // 3. Append EXISTING images (Strings) - using JSON.stringify
    // This fixes the "Unexpected token" error on the backend
    if (existingImages.length > 0) {
      fd.append("existingImages", JSON.stringify(existingImages));
    } else {
      // Even if empty, sending an empty array as string helps backend logic
      fd.append("existingImages", JSON.stringify([]));
    }

    // Also send removedImages as empty array to prevent backend crash if it expects it
    fd.append("removedImages", JSON.stringify([]));

    // 4. Append parametric attribute values (only non-empty ones)
    fd.append(
      "attributes",
      JSON.stringify(
        Object.entries(attributeValues)
          .filter(([, v]) => String(v).trim())
          .map(([key, value]) => ({ key, value: String(value).trim() }))
      )
    );

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, fd);
      } else {
        await createProduct(fd);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Operation failed:", error);
      alert("Failed to save product. Check console for details.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
      fetchProducts();
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <Box maxW="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading size="lg" fontWeight="bold" letterSpacing="tight" mb={1}>Products</Heading>
          <Text color="gray.500" fontSize="sm">Manage your inventory and catalog</Text>
        </Box>
        <Button bg="black" color="white" _hover={{ bg: "gray.800" }} onClick={openAddModal} leftIcon={<Text fontSize="xl" mb={1}>+</Text>}>
          Create Product
        </Button>
      </Box>

      <Box bg="white" p={0} borderRadius="lg" borderWidth="1px" borderColor="gray.200" overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Name</Th>
                <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Image</Th>
                <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Category</Th>
                <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Price</Th>
                <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">Stock</Th>
                <Th color="gray.500" fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {products.map((p) => (
                <Tr key={p._id} _hover={{ bg: "gray.50" }}>
                  <Td fontWeight="medium" color="black">{p.name}</Td>
                  <Td>
                    {p.images && p.images[0] && (
                      <Image
                        src={`/uploads${p.images[0]}`}
                        boxSize="40px"
                        borderRadius="md"
                        objectFit="cover"
                      />
                    )}
                  </Td>
                  <Td color="gray.600">{p.category?.name}</Td>
                  <Td color="gray.600">₹{p.price}</Td>
                  <Td color="gray.600">{p.stock}</Td>
                  <Td textAlign="right">
                    <ButtonGroup size="sm" variant="ghost" spacing={1}>
                      <IconButton
                        icon={<EditIcon />}
                        aria-label="Edit"
                        color="gray.500"
                        _hover={{ color: "black", bg: "gray.100" }}
                        onClick={() => openEditModal(p)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        borderColor="gray.300"
                        color="gray.600"
                        _hover={{ bg: "gray.50" }}
                        onClick={() => openStockModal(p)}
                      >
                        + Stock
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        borderColor="gray.300"
                        color="gray.600"
                        _hover={{ bg: "gray.50" }}
                        onClick={() => openHistoryModal(p)}
                      >
                        History
                      </Button>
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label="Delete"
                        color="gray.500"
                        _hover={{ color: "red.500", bg: "red.50" }}
                        onClick={() => handleDelete(p._id)}
                      />
                    </ButtonGroup>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader fontSize="lg">
            {editingProduct ? "Edit Product" : "Add Product"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>

                {/* -------- BASIC INFO GRID -------- */}
                <SimpleGrid columns={[1, 2]} spacing={3}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Name</FormLabel>
                    <Input
                      size="sm"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Manufacturer</FormLabel>
                    <Input
                      size="sm"
                      value={formData.manufacturer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          manufacturer: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                </SimpleGrid>

                {/* -------- CATEGORY GRID -------- */}
                <SimpleGrid columns={[1, 2]} spacing={3}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Category</FormLabel>
                    <Select
                      size="sm"
                      value={formData.category}
                      onChange={handleCategoryChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">SubCategory</FormLabel>
                    <Select
                      size="sm"
                      value={formData.subCategory}
                      onChange={(e) => {
                        setFormData({ ...formData, subCategory: e.target.value });
                        setAttributeValues({});
                      }}
                    >
                      <option value="">Select SubCategory</option>
                      {subCategories.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>

                {/* -------- PARAMETRIC ATTRIBUTES (per subcategory) -------- */}
                {selectedSubCategoryAttrs.length > 0 && (
                  <Box p={3} borderWidth="1px" borderColor="gray.200" borderRadius="lg">
                    <Text fontSize="sm" fontWeight="bold" mb={2}>
                      Specifications
                    </Text>
                    <SimpleGrid columns={[1, 2]} spacing={3}>
                      {selectedSubCategoryAttrs.map((attr) => (
                        <FormControl key={attr.key}>
                          <FormLabel fontSize="sm">
                            {attr.name}
                            {attr.unit ? ` (${attr.unit})` : ""}
                          </FormLabel>
                          {attr.type === "select" && attr.options?.length > 0 ? (
                            <Select
                              size="sm"
                              value={attributeValues[attr.key] || ""}
                              onChange={(e) =>
                                setAttributeValues({
                                  ...attributeValues,
                                  [attr.key]: e.target.value,
                                })
                              }
                            >
                              <option value="">Not set</option>
                              {attr.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </Select>
                          ) : (
                            <Input
                              size="sm"
                              placeholder={attr.type === "number" ? "e.g. 10K" : ""}
                              value={attributeValues[attr.key] || ""}
                              onChange={(e) =>
                                setAttributeValues({
                                  ...attributeValues,
                                  [attr.key]: e.target.value,
                                })
                              }
                            />
                          )}
                        </FormControl>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}

                {/* -------- DESCRIPTION -------- */}
                <FormControl>
                  <FormLabel fontSize="sm">Description</FormLabel>
                  <Textarea
                    size="sm"
                    rows={2}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </FormControl>

                {/* -------- PRICE & STOCK -------- */}
                <SimpleGrid columns={[1, 2]} spacing={3}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Price</FormLabel>
                    <Input
                      size="sm"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </FormControl>

                  {!editingProduct && (
                    <FormControl isRequired>
                      <FormLabel fontSize="sm">Stock</FormLabel>
                      <Input
                        size="sm"
                        type="number"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({ ...formData, stock: e.target.value })
                        }
                      />
                    </FormControl>
                  )}

                  <FormControl>
                    <FormLabel fontSize="sm">Min Order Qty</FormLabel>
                    <Input
                      size="sm"
                      type="number"
                      min={1}
                      value={formData.minOrderQty}
                      onChange={(e) =>
                        setFormData({ ...formData, minOrderQty: e.target.value })
                      }
                    />
                  </FormControl>
                </SimpleGrid>

                <Checkbox
                  size="sm"
                  isChecked={formData.featured}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featured: e.target.checked,
                    })
                  }
                >
                  Featured Product
                </Checkbox>

                {/* -------- RETURN POLICY -------- */}
                <SimpleGrid columns={[1, 3]} spacing={3} mt={2}>
                  <Checkbox
                    size="sm"
                    isChecked={formData.isReturnable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isReturnable: e.target.checked,
                      })
                    }
                  >
                    Allow Refund
                  </Checkbox>

                  <Checkbox
                    size="sm"
                    isChecked={formData.isReplaceable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isReplaceable: e.target.checked,
                      })
                    }
                  >
                    Allow Replacement
                  </Checkbox>

                  <FormControl size="sm">
                    <FormLabel fontSize="xs">Return Window (Days)</FormLabel>
                    <Input
                      size="sm"
                      type="number"
                      value={formData.returnWindowDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          returnWindowDays: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                </SimpleGrid>

                {/* -------- IMAGES -------- */}
                <FormControl>
                  <FormLabel fontSize="sm">Images</FormLabel>
                  <Input
                    size="sm"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  <SimpleGrid columns={[3, 4]} spacing={3} mt={3}>
                    {existingImages.map((img, index) => (
                      <Box key={index} position="relative">
                        <Image
                          src={`/uploads${img}`} // ${process.env.REACT_APP_API_URL || "http://76.13.247.39:5000/"} 
                          boxSize="60px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                        <IconButton
                          icon={<CloseIcon />}
                          size="xs"
                          colorScheme="red"
                          position="absolute"
                          top="-5px"
                          right="-5px"
                          rounded="full"
                          onClick={() => removeExistingImage(index)}
                        />
                      </Box>
                    ))}

                    {newImages.map((file, index) => (
                      <Box key={index} position="relative">
                        <Image
                          src={URL.createObjectURL(file)}
                          boxSize="60px"
                          objectFit="cover"
                          borderRadius="md"
                          border="2px solid purple"
                        />
                        <IconButton
                          icon={<CloseIcon />}
                          size="xs"
                          colorScheme="red"
                          position="absolute"
                          top="-5px"
                          right="-5px"
                          rounded="full"
                          onClick={() => removeNewImage(index)}
                        />
                      </Box>
                    ))}
                  </SimpleGrid>
                </FormControl>

                <Button type="submit" colorScheme="purple" size="sm" mt={2}>
                  Save Product
                </Button>
              </Stack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Stock</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            <Stack spacing={3}>
              <FormControl isRequired>
                <FormLabel>Quantity</FormLabel>
                <Input
                  type="number"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Note</FormLabel>
                <Input
                  value={stockNote}
                  onChange={(e) => setStockNote(e.target.value)}
                />
              </FormControl>

              <Button colorScheme="blue" onClick={handleAddStock}>
                Add Stock
              </Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Inventory History - {historyProduct?.name}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Box overflowX="auto" overflowY="auto" maxH="60vh">
              <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Type</Th>
                  <Th>Qty</Th>
                  <Th>Reason</Th>
                  <Th>Note</Th>
                </Tr>
              </Thead>

              <Tbody>
                {historyLogs.map((log) => (
                  <Tr key={log._id}>
                    <Td>{new Date(log.createdAt).toLocaleString()}</Td>

                    <Td color={log.type === "IN" ? "green.500" : "red.500"}>
                      {log.type}
                    </Td>

                    <Td>{log.quantity}</Td>
                    <Td>{log.reason}</Td>
                    <Td>{log.note}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            </Box>

            {/* Pagination */}
            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                size="sm"
                isDisabled={historyPage <= 1}
                onClick={() => openHistoryModal(historyProduct, historyPage - 1)}
              >
                Prev
              </Button>

              <Text>
                Page {historyPage} / {historyTotalPages}
              </Text>

              <Button
                size="sm"
                isDisabled={historyPage >= historyTotalPages || historyTotalPages === 0}
                onClick={() => openHistoryModal(historyProduct, historyPage + 1)}
              >
                Next
              </Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProductManagement;