import axios from "axios";

// const baseURL = `${process.env.REACT_APP_API_URL}api`;
const baseURL = `${process.env.REACT_APP_API_URL}`;

const instance = axios.create({
    baseURL,
    withCredentials: true,
});

// Global session-expiry handling: a 401 means the token is missing, invalid,
// or expired server-side. Every admin screen was previously left to fail
// silently (or with its own confusing error) when this happened — instead,
// clear the stale session, flag it for the login page to explain, and kick
// the admin back to login immediately (mirrors the manual logout flow in
// Sidebar.js/header.js).
let sessionExpiryHandled = false;

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const url = error?.config?.url || "";
        const isAuthCall = url.includes("/auth/adminLogin") || url.includes("/auth/login");

        if (status === 401 && !isAuthCall && !sessionExpiryHandled) {
            sessionExpiryHandled = true;
            localStorage.clear();
            sessionStorage.setItem("sessionExpired", "1");
            window.location.href = "/admin";
        }

        return Promise.reject(error);
    }
);

/* ================= AUTH ================= */

export async function login(email, password) {
    const res = await instance.post("/auth/adminLogin", { email, password });
    return res.data;
}

export async function logout() {
    const res = await instance.post("/auth/logout");
    return res.data;
}

/* ================= CATEGORY ================= */

export async function getAllCategories() {
    const res = await instance.get("/categories");
    return res.data;
}

export async function createCategory(formData) {
    const res = await instance.post("/categories", formData);
    return res.data;
}

export async function updateCategory(categoryId, formData) {
    const res = await instance.put(`/categories/${categoryId}`, formData);
    return res.data;
}

export async function deleteCategory(categoryId) {
    const res = await instance.delete(`/categories/${categoryId}`);
    return res.data;
}

/* ================= SUBCATEGORY ================= */

/* ================= SUBCATEGORY ================= */

// Admin – Get all subcategories
export async function getAllSubCategories() {
    const res = await instance.get("/subcategory");
    return res.data;
}

// Admin – Create subcategory
export async function createSubCategory(formData) {
    const res = await instance.post("/subcategory", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

// Admin – Update subcategory
export async function updateSubCategory(id, formData) {
    const res = await instance.put(`/subcategory/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

// Admin – Delete subcategory
export async function deleteSubCategory(id) {
    const res = await instance.delete(`/subcategory/${id}`);
    return res.data;
}

// Client / Admin – Get subcategories by category
export async function getSubCategoriesByCategory(categoryId) {
    const res = await instance.get(`/subcategory/category/${categoryId}`);
    return res.data;
}


/* ================= PRODUCTS ================= */

/**
 * params can include:
 * category
 * subCategory
 * featured
 * page
 * limit
 */
/* ================= PRODUCTS ================= */

// Get all products (admin)
export async function getAllProducts(params = {}) {
    const res = await instance.get("/products", { params });
    return res.data.products;
}

// Create product
export async function createProduct(formData) {
    const res = await instance.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

// Update product
export async function updateProduct(productId, formData) {
    const res = await instance.put(`/products/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

// Delete product
export async function deleteProduct(productId) {
    const res = await instance.delete(`/products/${productId}`);
    return res.data;
}

// auth all dashboard get data
export const fetchDashboardStats = async () => {
    try {
        const response = await instance.get(`/auth/getDashboardStats`, {
            // withCredentials: true, // Important for cookies/sessions
        });
        // Return the full data object from the backend
        return response.data;
    } catch (error) {
        // Throw error so the component knows something went wrong
        throw error;
    }
};

// admin orders code
// ===============================
// 👑 ADMIN - GET ALL ORDERS
// ===============================
export const getAdminAllOrders = async (
    page = 1,
    limit = 10,
    filters = {}
) => {
    try {
        const response = await instance.get("/order/admin/allOrders", {
            params: {
                page,
                limit,
                ...filters
            },
        });

        return response;
    } catch (error) {
        console.error("Admin fetch orders error:", error);
        throw error;
    }
};


// ===============================
// 👑 ADMIN - UPDATE ORDER STATUS
// ===============================
export const updateOrderStatus = async (id, statusData) => {
    try {
        const response = await instance.put(
            `/order/admin/updateOrder/${id}`,
            statusData
        );

        return response;
    } catch (error) {
        console.error("Update status error:", error);
        throw error;
    }
};


// Add, remove, or correct stock (mode: "add" | "remove" | "set", reason + note required)

export const adjustStock = async (productId, adjustmentData) => {
    try {
        const res = await instance.post(`/products/${productId}/adjust-stock`, adjustmentData);
        return res.data;
    } catch (error) {
        console.error("Adjust stock error:", error);
        throw error;
    }
};

export const getInventoryLogs = async (productId, page = 1, limit = 10) => {
    try {
        const res = await instance.get(`/products/${productId}/inventory`, {
            params: { page, limit },
        });
        return res.data;
    } catch (error) {
        console.error("Get inventory logs error:", error);
        throw error;
    }
};

/* ================= RETURNS ================= */
export const getAllReturnRequests = async () => {
    try {
        const response = await instance.get("/returns/admin/all");
        return response.data;
    } catch (error) {
        console.error("Fetch all return requests error:", error);
        throw error;
    }
};

export const getReturnRequestDetails = async (id) => {
    try {
        const response = await instance.get(`/returns/${id}`);
        return response.data;
    } catch (error) {
        console.error("Fetch return request details error:", error);
        throw error;
    }
};

export const updateReturnRequestStatus = async (id, status) => {
    try {
        const response = await instance.put(`/returns/admin/status/${id}`, { status });
        return response.data;
    } catch (error) {
        console.error("Update return status error:", error);
        throw error;
    }
};

export const processReturnRequest = async (id, conditions = []) => {
    try {
        const response = await instance.put(`/returns/admin/process/${id}`, { conditions });
        return response.data;
    } catch (error) {
        console.error("Process return error:", error);
        throw error;
    }
};

export const processRefund = async (id) => {
    try {
        const response = await instance.put(`/returns/admin/refund/${id}`);
        return response.data;
    } catch (error) {
        console.error("Process refund error:", error);
        throw error;
    }
};

export const createReplacementOrder = async (id) => {
    try {
        const response = await instance.post(`/returns/admin/replacement/${id}`);
        return response.data;
    } catch (error) {
        console.error("Create replacement order error:", error);
        throw error;
    }
};

export const processWaivedRefund = async (id) => {
    try {
        const response = await instance.put(`/returns/admin/waived-refund/${id}`);
        return response.data;
    } catch (error) {
        console.error("Waived refund error:", error);
        throw error;
    }
};