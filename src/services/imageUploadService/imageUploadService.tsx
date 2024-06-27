import axios from 'axios';

export const uploadImage = async (formData: any) => {
    try {
        const response = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`, formData);
        return response.data;
    } catch (error) {
        console.error('Error fetching user details:', error);
        throw error;
    }
};