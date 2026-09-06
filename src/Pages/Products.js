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
  Spinner,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CloseIcon, AddIcon } from "@chakra-ui/icons";

import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  getSubCategoriesByCategory,
  adjustStock,
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
  const [stockMode, setStockMode] = useState("add"); // "add" | "remove" | "set"
  const [stockQty, setStockQty] = useState("");
  const [stockReason, setStockReason] = useState("");
  const [stockNote, setStockNote] = useState("");

  // Manual stock changes are restricted to these reasons, mirroring the
  // backend allow-list — system flows (orders, returns) use their own
  // reasons and never appear here.
  const STOCK_REASONS = {
    add: ["PURCHASE", "ADJUSTMENT"],
    remove: ["DAMAGED", "ADJUSTMENT"],
    set: ["ADJUSTMENT"], // a correction always nets to ADJUSTMENT (IN or OUT depending on direction)
  };
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyProduct, setHistoryProduct] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(false);

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setStockMode("add");
    setStockQty("");
    setStockReason("");
    setStockNote("");
    setIsStockModalOpen(true);
  };

  const openHistoryModal = async (product, page = 1) => {
    // Open immediately with a loading state — no data (or a failed fetch)
    // should never surface as an alert(); the modal itself shows what happened.
    setHistoryProduct(product);
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    setHistoryError(false);

    try {
      const res = await getInventoryLogs(product._id, page, 10);

      setHistoryLogs(res.logs || []);
      setHistoryPage(res.page || 1);
      setHistoryTotalPages(res.totalPages || 0);
    } catch (err) {
      console.error(err);
      setHistoryLogs([]);
      setHistoryError(true);
    } finally {
      setHistoryLoading(false);
    }
  };

  // SEPARATE STATE FOR IMAGES
  // 1. Array of strings (URLs) for images already on the server
  const [existingImages, setExistingImages] = useState([]);
  // 2. Array of File objects for new uploads
  const [newImages, setNewImages] = useState([]);

  // Optional datasheet PDF
  const [existingDatasheet, setExistingDatasheet] = useState(null); // saved path, or null
  const [datasheetFile, setDatasheetFile] = useState(null); // newly selected File, or null
  const [removeDatasheet, setRemoveDatasheet] = useState(false);

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

  // Bulk/quantity pricing rows: { minQty, maxQty, pricePerUnit }.
  // maxQty is kept as a raw string; empty means "and above" (open-ended).
  const [priceTiers, setPriceTiers] = useState([]);

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
    setExistingDatasheet(null);
    setDatasheetFile(null);
    setRemoveDatasheet(false);
    setSubCategories([]);
    setAttributeValues({});
    setPriceTiers([]);
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

    // Prefill the existing datasheet, if any
    setExistingDatasheet(product.datasheet || null);
    setDatasheetFile(null);
    setRemoveDatasheet(false);

    // Prefill attribute values from the saved product
    setAttributeValues(
      Object.fromEntries(
        (product.attributes || []).map((a) => [a.key, a.value])
      )
    );

    // Prefill bulk pricing tiers from the saved product
    setPriceTiers(
      (product.priceTiers || []).map((t) => ({
        minQty: String(t.minQty),
        maxQty: t.maxQty === null || t.maxQty === undefined ? "" : String(t.maxQty),
        pricePerUnit: String(t.pricePerUnit),
      }))
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

  // Bulk pricing tier rows
  const addPriceTierRow = () => {
    setPriceTiers((rows) => [...rows, { minQty: "", maxQty: "", pricePerUnit: "" }]);
  };

  const updatePriceTierRow = (index, patch) => {
    setPriceTiers((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  };

  const removePriceTierRow = (index) => {
    setPriceTiers((rows) => rows.filter((_, i) => i !== index));
  };

  // Handle selecting new files
  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...filesArray]);
    }
  };

  // Datasheet: pick a new PDF (replaces any existing one on save)
  const handleDatasheetChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDatasheetFile(file);
    setRemoveDatasheet(false);
  };

  const clearDatasheet = () => {
    setDatasheetFile(null);
    setExistingDatasheet(null);
    setRemoveDatasheet(true);
  };

  // Remove a newly selected image (File object)
  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  // Remove an existing image (String URL)
  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleAdjustStock = async () => {
    if (stockMode === "set") {
      if (stockQty === "" || Number(stockQty) < 0) {
        alert("Enter a valid stock quantity");
        return;
      }
    } else if (!stockQty || Number(stockQty) <= 0) {
      alert("Enter a valid quantity");
      return;
    }
    if (!stockReason) {
      alert("Select a reason");
      return;
    }
    if (!stockNote.trim()) {
      alert("A description is required for this stock change");
      return;
    }

    try {
      await adjustStock(selectedProduct._id, {
        mode: stockMode,
        quantity: stockQty,
        reason: stockReason,
        note: stockNote,
      });

      setIsStockModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to update stock");
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

    // Datasheet: either a newly picked PDF, or a removal request
    if (datasheetFile) {
      fd.append("datasheet", datasheetFile);
    } else if (removeDatasheet) {
      fd.append("removeDatasheet", "true");
    }

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

    // 5. Append bulk pricing tiers (only fully-filled rows; maxQty stays
    // blank/null for an open-ended top tier, e.g. "30+")
    fd.append(
      "priceTiers",
      JSON.stringify(
        priceTiers
          .filter((t) => String(t.minQty).trim() && String(t.pricePerUnit).trim())
          .map((t) => ({
            minQty: Number(t.minQty),
            maxQty: String(t.maxQty).trim() ? Number(t.maxQty) : null,
            pricePerUnit: Number(t.pricePerUnit),
          }))
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
      alert(error?.response?.data?.message || "Failed to save product. Check console for details.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (error) {
        alert(error?.response?.data?.message || "Failed to delete product. Please try again.");
      }
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
                  <Td color="gray.600">
                    ₹{p.price}
                    {p.priceTiers?.length > 0 && (
                      <Badge ml={2} colorScheme="green" borderRadius="full" fontSize="0.6rem">
                        Bulk
                      </Badge>
                    )}
                  </Td>
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
                        Stock
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

                {/* -------- BULK PRICING -------- */}
                <Box p={3} borderWidth="1px" borderColor="gray.200" borderRadius="lg">
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontSize="sm" fontWeight="bold">
                      Bulk Pricing
                    </Text>
                    <Button size="xs" leftIcon={<AddIcon />} onClick={addPriceTierRow}>
                      Add Tier
                    </Button>
                  </Flex>

                  {priceTiers.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">
                      No quantity tiers. The base price above applies to every order.
                    </Text>
                  ) : (
                    <Stack spacing={2}>
                      {priceTiers.map((tier, index) => (
                        <Flex key={index} gap={2} align="center">
                          <Input
                            size="sm"
                            type="number"
                            placeholder="Min qty"
                            value={tier.minQty}
                            onChange={(e) =>
                              updatePriceTierRow(index, { minQty: e.target.value })
                            }
                          />
                          <Text fontSize="sm" color="gray.400">
                            to
                          </Text>
                          <Input
                            size="sm"
                            type="number"
                            placeholder="Max qty (blank = and above)"
                            value={tier.maxQty}
                            onChange={(e) =>
                              updatePriceTierRow(index, { maxQty: e.target.value })
                            }
                          />
                          <Text fontSize="sm" color="gray.400">
                            @ ₹
                          </Text>
                          <Input
                            size="sm"
                            type="number"
                            placeholder="Price/pc"
                            value={tier.pricePerUnit}
                            onChange={(e) =>
                              updatePriceTierRow(index, { pricePerUnit: e.target.value })
                            }
                          />
                          <IconButton
                            aria-label="Remove tier"
                            icon={<CloseIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => removePriceTierRow(index)}
                          />
                        </Flex>
                      ))}
                    </Stack>
                  )}
                </Box>

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

                {/* -------- DATASHEET (PDF, optional) -------- */}
                <FormControl>
                  <FormLabel fontSize="sm">Datasheet (PDF, optional)</FormLabel>
                  <Input
                    size="sm"
                    type="file"
                    accept="application/pdf"
                    onChange={handleDatasheetChange}
                  />

                  {(existingDatasheet || datasheetFile) && (
                    <Flex
                      align="center"
                      justify="space-between"
                      mt={2}
                      p={2}
                      borderWidth="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                    >
                      <Text fontSize="sm" color="gray.700" noOfLines={1}>
                        📄{" "}
                        {datasheetFile
                          ? datasheetFile.name
                          : existingDatasheet.split("/").pop()}
                      </Text>
                      <Flex gap={2}>
                        {existingDatasheet && !datasheetFile && (
                          <Button
                            as="a"
                            href={`/uploads${existingDatasheet}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="xs"
                            variant="outline"
                          >
                            View
                          </Button>
                        )}
                        <IconButton
                          aria-label="Remove datasheet"
                          icon={<CloseIcon />}
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          onClick={clearDatasheet}
                        />
                      </Flex>
                    </Flex>
                  )}
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
          <ModalHeader>
            Adjust Stock
            {selectedProduct && (
              <Text fontSize="sm" fontWeight="normal" color="gray.500" mt={1}>
                {selectedProduct.name} — current stock: {selectedProduct.stock}
              </Text>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Action</FormLabel>
                <ButtonGroup isAttached w="full">
                  {[
                    { key: "add", label: "Add Stock" },
                    { key: "remove", label: "Remove Stock" },
                    { key: "set", label: "Set Exact Stock" },
                  ].map((opt) => (
                    <Button
                      key={opt.key}
                      flex="1"
                      size="sm"
                      variant={stockMode === opt.key ? "solid" : "outline"}
                      colorScheme={stockMode === opt.key ? "purple" : "gray"}
                      onClick={() => {
                        setStockMode(opt.key);
                        setStockQty("");
                        setStockReason("");
                      }}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </ButtonGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>
                  {stockMode === "set" ? "New Total Stock" : "Quantity"}
                </FormLabel>
                <Input
                  type="number"
                  min={0}
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                />
                {stockMode === "remove" && selectedProduct && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Max: {selectedProduct.stock} in stock
                  </Text>
                )}
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Reason</FormLabel>
                <Select
                  placeholder="Select reason"
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                >
                  {STOCK_REASONS[stockMode].map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Explain this stock change — required for the audit log"
                  value={stockNote}
                  onChange={(e) => setStockNote(e.target.value)}
                />
              </FormControl>

              <Button
                colorScheme={
                  stockMode === "remove" ? "red" : stockMode === "set" ? "purple" : "blue"
                }
                onClick={handleAdjustStock}
              >
                {stockMode === "add" && "Add Stock"}
                {stockMode === "remove" && "Remove Stock"}
                {stockMode === "set" && "Update Stock"}
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

          <ModalBody pb={6}>
            {historyLoading ? (
              <Flex justify="center" align="center" py={10}>
                <Spinner size="lg" color="purple.500" />
              </Flex>
            ) : historyError ? (
              <Flex direction="column" align="center" py={10} gap={3}>
                <Text color="gray.600">Couldn't load history right now.</Text>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openHistoryModal(historyProduct, historyPage)}
                >
                  Retry
                </Button>
              </Flex>
            ) : historyLogs.length === 0 ? (
              <Flex direction="column" align="center" py={10} gap={1}>
                <Text fontWeight="medium" color="gray.600">
                  No stock history yet
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Changes made via Add / Remove / Set Stock will show up here.
                </Text>
              </Flex>
            ) : (
              <>
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
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProductManagement;