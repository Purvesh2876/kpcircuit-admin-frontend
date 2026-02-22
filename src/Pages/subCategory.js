// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Heading,
//   Table,
//   Thead,
//   Tbody,
//   Tr,
//   Th,
//   Td,
//   Spinner,
//   Button,
//   ButtonGroup,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
//   Stack,
//   FormControl,
//   FormLabel,
//   Input,
//   Select,
//   Textarea,
// } from "@chakra-ui/react";
// import { EditIcon, DeleteIcon } from "@chakra-ui/icons";

// import {
//   getAllCategories,
//   getAllSubCategories,
//   createSubCategory,
//   updateSubCategory,
//   deleteSubCategory,
// } from "../actions/apiActions";

// const SubCategory = () => {
//   const [loading, setLoading] = useState(false);
//   const [subCategories, setSubCategories] = useState([]);
//   const [categories, setCategories] = useState([]);

//   const [isAddModalOpen, setAddModalOpen] = useState(false);
//   const [isEditModalOpen, setEditModalOpen] = useState(false);
//   const [selectedSubCategory, setSelectedSubCategory] = useState(null);

//   const [imagePreview, setImagePreview] = useState(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     category: "",
//     image: null, // ✅ ADD THIS
//   });


//   /* ---------------- FETCH ---------------- */

//   const fetchData = async () => {
//     setLoading(true);
//     const [cats, subs] = await Promise.all([
//       getAllCategories(),
//       getAllSubCategories(),
//     ]);
//     setCategories(cats);
//     setSubCategories(subs);
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   /* ---------------- ADD ---------------- */

//   const openAddModal = () => {
//     setFormData({ name: "", description: "", category: "" });
//     setAddModalOpen(true);
//   };

//   const handleAddSubmit = async (e) => {
//     e.preventDefault();

//     const fd = new FormData();
//     fd.append("name", formData.name);
//     fd.append("description", formData.description);
//     fd.append("category", formData.category);

//     if (formData.image) {
//       fd.append("image", formData.image); // ✅ IMPORTANT
//     }

//     await createSubCategory(fd);
//     setAddModalOpen(false);
//     fetchData();
//   };


//   /* ---------------- EDIT ---------------- */

//   const openEditModal = (sub) => {
//     setSelectedSubCategory(sub);

//     setFormData({
//       name: sub.name,
//       description: sub.description || "",
//       category: sub.category._id,
//       image: null, // new image (optional)
//     });

//     // ✅ show existing image
//     setImagePreview(
//       sub.image
//         ? `${process.env.REACT_APP_API_URL}uploads${sub.image}`
//         : null
//     );

//     setEditModalOpen(true);
//   };


//   const handleEditSubmit = async (e) => {
//     e.preventDefault();

//     const fd = new FormData();
//     fd.append("name", formData.name);
//     fd.append("description", formData.description);
//     fd.append("category", formData.category);

//     if (formData.image) {
//       fd.append("image", formData.image);
//     }


//     await updateSubCategory(selectedSubCategory._id, fd);
//     setEditModalOpen(false);
//     fetchData();
//   };

//   /* ---------------- DELETE ---------------- */

//   const handleDelete = async (id) => {
//     await deleteSubCategory(id);
//     fetchData();
//   };

//   /* ---------------- UI ---------------- */

//   return (
//     <Box p={4}>
//       <Box display="flex" justifyContent="space-between" mb={4}>
//         <Heading>SubCategory Management</Heading>
//         <Button colorScheme="purple" onClick={openAddModal}>
//           + Add SubCategory
//         </Button>
//       </Box>

//       {loading ? (
//         <Spinner />
//       ) : (
//         <Table variant="simple">
//           <Thead>
//             <Tr>
//               <Th>#</Th>
//               <Th>Name</Th>
//               <Th>Image</Th>
//               <Th>Category</Th>
//               <Th>Description</Th>
//               <Th>Actions</Th>
//             </Tr>
//           </Thead>
//           <Tbody>
//             {subCategories.map((sub, index) => (
//               <Tr key={sub._id}>
//                 <Td>{index + 1}</Td>
//                 <Td>{sub.name}</Td>
//                 <Td>
//                   {sub.image ? (
//                     <img
//                       src={`${process.env.REACT_APP_API_URL}uploads${sub.image}`}
//                       alt={sub.name}
//                       style={{ width: 60, height: 40, objectFit: "cover" }}
//                     />
//                   ) : (
//                     "-"
//                   )}
//                 </Td>

//                 <Td>{sub.category?.name}</Td>
//                 <Td>{sub.description || "-"}</Td>
//                 <Td>
//                   <ButtonGroup>
//                     <Button onClick={() => openEditModal(sub)}>
//                       <EditIcon />
//                     </Button>
//                     <Button
//                       colorScheme="red"
//                       onClick={() => handleDelete(sub._id)}
//                     >
//                       <DeleteIcon />
//                     </Button>
//                   </ButtonGroup>
//                 </Td>
//               </Tr>
//             ))}
//           </Tbody>
//         </Table>
//       )}

//       {/* ---------------- ADD MODAL ---------------- */}
//       <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)}>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Add SubCategory</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <form onSubmit={handleAddSubmit}>
//               <Stack spacing={4}>
//                 <FormControl isRequired>
//                   <FormLabel>Name</FormLabel>
//                   <Input
//                     value={formData.name}
//                     onChange={(e) =>
//                       setFormData({ ...formData, name: e.target.value })
//                     }
//                   />
//                 </FormControl>

//                 <FormControl isRequired>
//                   <FormLabel>Category</FormLabel>
//                   <Select
//                     value={formData.category}
//                     onChange={(e) =>
//                       setFormData({ ...formData, category: e.target.value })
//                     }
//                   >
//                     <option value="">Select Category</option>
//                     {categories.map((cat) => (
//                       <option key={cat._id} value={cat._id}>
//                         {cat.name}
//                       </option>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 <FormControl>
//                   <FormLabel>Description</FormLabel>
//                   <Textarea
//                     value={formData.description}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         description: e.target.value,
//                       })
//                     }
//                   />
//                 </FormControl>

//                 <FormControl>
//                   <FormLabel>Image</FormLabel>
//                   <Input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => {
//                       const file = e.target.files[0];
//                       if (!file) return;

//                       setFormData({ ...formData, image: file });
//                       setImagePreview(URL.createObjectURL(file)); // ✅ preview
//                     }}
//                   />

//                 </FormControl>
//                 {imagePreview && (
//                   <Box>
//                     <img
//                       src={imagePreview}
//                       alt="Preview"
//                       style={{
//                         width: "120px",
//                         height: "80px",
//                         objectFit: "cover",
//                         borderRadius: "6px",
//                         border: "1px solid #ddd",
//                       }}
//                     />
//                   </Box>
//                 )}

//                 <Button type="submit" colorScheme="purple">
//                   Add SubCategory
//                 </Button>
//               </Stack>
//             </form>
//           </ModalBody>
//         </ModalContent>
//       </Modal>

//       {/* ---------------- EDIT MODAL ---------------- */}
//       <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)}>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Edit SubCategory</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <form onSubmit={handleEditSubmit}>
//               <Stack spacing={4}>
//                 <FormControl>
//                   <FormLabel>Name</FormLabel>
//                   <Input
//                     value={formData.name}
//                     onChange={(e) =>
//                       setFormData({ ...formData, name: e.target.value })
//                     }
//                   />
//                 </FormControl>

//                 <FormControl>
//                   <FormLabel>Category</FormLabel>
//                   <Select
//                     value={formData.category}
//                     onChange={(e) =>
//                       setFormData({ ...formData, category: e.target.value })
//                     }
//                   >
//                     {categories.map((cat) => (
//                       <option key={cat._id} value={cat._id}>
//                         {cat.name}
//                       </option>
//                     ))}
//                   </Select>
//                 </FormControl>

//                 <FormControl>
//                   <FormLabel>Description</FormLabel>
//                   <Textarea
//                     value={formData.description}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         description: e.target.value,
//                       })
//                     }
//                   />
//                 </FormControl>

//                 <FormControl>
//                   <Input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => {
//                       const file = e.target.files[0];
//                       if (!file) return;

//                       setFormData({ ...formData, image: file });
//                       setImagePreview(URL.createObjectURL(file));
//                     }}
//                   />

//                 </FormControl>
//                 {imagePreview && (
//                   <Box>
//                     <img
//                       src={imagePreview}
//                       alt="Preview"
//                       style={{
//                         width: "120px",
//                         height: "80px",
//                         objectFit: "cover",
//                         borderRadius: "6px",
//                         border: "1px solid #ddd",
//                       }}
//                     />
//                   </Box>
//                 )}


//                 <Button type="submit" colorScheme="purple">
//                   Update SubCategory
//                 </Button>
//               </Stack>
//             </form>
//           </ModalBody>
//         </ModalContent>
//       </Modal>
//     </Box>
//   );
// };

// export default SubCategory;

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
  Textarea,
  Flex,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, AddIcon } from "@chakra-ui/icons";

import {
  getAllCategories,
  getAllSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../actions/apiActions";

const SubCategory = () => {
  const [loading, setLoading] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    image: null,
  });

  /* ---------- Color Mode (Top Only) ---------- */
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tableHeadBg = useColorModeValue("gray.100", "gray.700");
  const rowHoverBg = useColorModeValue("gray.50", "gray.700");

  /* ---------------- FETCH ---------------- */
  const fetchData = async () => {
    setLoading(true);
    const [cats, subs] = await Promise.all([
      getAllCategories(),
      getAllSubCategories(),
    ]);
    setCategories(cats);
    setSubCategories(subs);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------------- ADD ---------------- */
  const openAddModal = () => {
    setFormData({ name: "", description: "", category: "", image: null });
    setImagePreview(null);
    setAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("description", formData.description);
    fd.append("category", formData.category);
    if (formData.image) fd.append("image", formData.image);
    await createSubCategory(fd);
    setAddModalOpen(false);
    fetchData();
  };

  /* ---------------- EDIT ---------------- */
  const openEditModal = (sub) => {
    setSelectedSubCategory(sub);
    setFormData({
      name: sub.name,
      description: sub.description || "",
      category: sub.category._id,
      image: null,
    });
    setImagePreview(
      sub.image
        ? `${process.env.REACT_APP_API_URL}uploads${sub.image}`
        : null
    );
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("description", formData.description);
    fd.append("category", formData.category);
    if (formData.image) fd.append("image", formData.image);
    await updateSubCategory(selectedSubCategory._id, fd);
    setEditModalOpen(false);
    fetchData();
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    await deleteSubCategory(id);
    fetchData();
  };

  return (
    <Box p={8} bg={pageBg} minH="100vh">
      {/* ---------- Header ---------- */}
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">SubCategory Management</Heading>
          <Text fontSize="sm" color="gray.500">
            Organize your subcategories efficiently
          </Text>
        </Box>

        <Button
          leftIcon={<AddIcon />}
          colorScheme="purple"
          borderRadius="xl"
          onClick={openAddModal}
        >
          Add SubCategory
        </Button>
      </Flex>

      {/* ---------- Table Container ---------- */}
      <Box
        bg={cardBg}
        borderRadius="2xl"
        border="1px solid"
        borderColor={borderColor}
        boxShadow="sm"
        overflow="hidden"
      >
        {loading ? (
          <Flex justify="center" align="center" p={10}>
            <Spinner size="lg" />
          </Flex>
        ) : subCategories.length === 0 ? (
          <Flex justify="center" align="center" p={10}>
            <Text color="gray.500">No subcategories found.</Text>
          </Flex>
        ) : (
          <Table variant="simple">
            <Thead bg={tableHeadBg}>
              <Tr>
                <Th>#</Th>
                <Th>Name</Th>
                <Th>Image</Th>
                <Th>Category</Th>
                <Th>Description</Th>
                <Th textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {subCategories.map((sub, index) => (
                <Tr key={sub._id} _hover={{ bg: rowHoverBg }}>
                  <Td>{index + 1}</Td>
                  <Td fontWeight="medium">{sub.name}</Td>
                  <Td>
                    {sub.image ? (
                      <img
                        src={`${process.env.REACT_APP_API_URL}uploads${sub.image}`}
                        alt={sub.name}
                        style={{
                          width: 70,
                          height: 45,
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #eee",
                        }}
                      />
                    ) : (
                      "-"
                    )}
                  </Td>
                  <Td>{sub.category?.name}</Td>
                  <Td maxW="200px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                    {sub.description || "-"}
                  </Td>
                  <Td textAlign="center">
                    <ButtonGroup size="sm" variant="ghost">
                      <Button onClick={() => openEditModal(sub)}>
                        <EditIcon />
                      </Button>
                      <Button colorScheme="red" onClick={() => handleDelete(sub._id)}>
                        <DeleteIcon />
                      </Button>
                    </ButtonGroup>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* ---------- ADD MODAL ---------- */}
      <SubCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add SubCategory"
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        onSubmit={handleAddSubmit}
        submitLabel="Add SubCategory"
      />

      {/* ---------- EDIT MODAL ---------- */}
      <SubCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit SubCategory"
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        onSubmit={handleEditSubmit}
        submitLabel="Update SubCategory"
      />
    </Box>
  );
};

/* ---------- Reusable Modal ---------- */
const SubCategoryModal = ({
  isOpen,
  onClose,
  title,
  formData,
  setFormData,
  categories,
  imagePreview,
  setImagePreview,
  onSubmit,
  submitLabel,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="2xl">
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <form onSubmit={onSubmit}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  borderRadius="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  borderRadius="lg"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  borderRadius="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Image</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setFormData({ ...formData, image: file });
                    setImagePreview(URL.createObjectURL(file));
                  }}
                />
              </FormControl>

              {imagePreview && (
                <Box>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "120px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                    }}
                  />
                </Box>
              )}

              <Button type="submit" colorScheme="purple" borderRadius="lg">
                {submitLabel}
              </Button>
            </Stack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SubCategory;