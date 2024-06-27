import apiClient from "../utils/apiClient"

export const generateImageWithStyle = async (formData: any) => {
    try {
        const response = await apiClient.post(`/image-generate/upload`,formData);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};