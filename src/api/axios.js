// src\api\axios.js
import axios from "axios";
import { URL } from "./url";

const apiClient = axios.create({
    baseURL: URL,
    withCredentials: false,
});

// User functions (existing)
export async function signup(user_email) {
    try {
        const response = await apiClient.post("/user/signup", user_email);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            return error.response.data;
        } else {
            return { status: false, message: "An unexpected error occurred." };
        }
    }
}

export async function login(user_email) {
    try {
        const response = await apiClient.post("/user/login", user_email);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            return error.response.data;
        } else {
            return { message: "An unexpected error occurred." };
        }
    }
}

// Brand functions (new)
export async function analyzeBrand(url) {
    try {
        const response = await apiClient.post("/brand/analyze", { url });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            return error.response.data;
        } else {
            return { success: false, message: "An unexpected error occurred." };
        }
    }
}

export async function saveBrand(brandData) {
    try {
        const response = await apiClient.post("/brand/save", brandData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            return error.response.data;
        } else {
            return { success: false, message: "An unexpected error occurred." };
        }
    }
}

export async function saveTrackingReport(reportData) {
    try {
        const response = await apiClient.post("/tracking/save-report", reportData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            return error.response.data;
        } else {
            return { success: false, message: "An unexpected error occurred." };
        }
    }
}

export async function getUserBrands(userEmail) {
    try {
        const response = await apiClient.get(`/brand/user/${userEmail}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            return error.response.data;
        } else {
            return { success: false, message: "An unexpected error occurred." };
        }
    }
}

export async function generateTrackingReport(brandId) {
    try {
        const response = await apiClient.post("/tracking/generate-report", { brandId });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            return error.response.data;
        } else {
            return { success: false, message: "An unexpected error occurred." };
        }
    }
}