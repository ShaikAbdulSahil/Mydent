import axiosClient from './axios-client';

export interface EnhanceSmileResponse {
    originalImageUrl: string;
    enhancedImageUrl: string;
    processingTime: number;
    status: string;
    recordId: string;
}

export const enhanceSmile = async (
    imageUri: string,
    userId: string,
): Promise<EnhanceSmileResponse> => {
    const formData = new FormData();

    // React Native FormData format for files
    formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'smile.jpg',
    } as any);
    formData.append('userId', userId);

    const result = await axiosClient.post('/nano-banana/enhance-smile', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds
    });

    return result.data;
};

export const getEnhancementHistory = async (userId: string) => {
    const result = await axiosClient.get(`/nano-banana/history/${userId}`);
    return result.data;
};

export const getEnhancement = async (id: string) => {
    const result = await axiosClient.get(`/nano-banana/enhancement/${id}`);
    return result.data;
};
