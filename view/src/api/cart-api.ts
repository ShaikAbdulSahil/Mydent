import axiosClient from './axios-client';

export const addToCart = async (productId: string, quantity: number) => {
  // Simple retry for transient server errors (500)
  const makeRequest = async () =>
    axiosClient.post('/cart/add', { productId, quantity });

  try {
    const response = await makeRequest();
    return response.data;
  } catch (error: any) {
    // If server error, try once more
    const status = error?.response?.status;
    if (status && status >= 500 && status < 600) {
      try {
        const retryResponse = await makeRequest();
        return retryResponse.data;
      } catch (retryError: any) {
        const msg = retryError?.response?.data?.message || retryError.message || 'Server error while adding to cart';
        throw new Error(`${retryError?.response?.status || ''} ${msg}`.trim());
      }
    }

    const msg = error?.response?.data?.message || error.message || 'Failed to add to cart';
    throw new Error(`${status || ''} ${msg}`.trim());
  }
};

export const getCart = () => {
  return axiosClient.get('/cart');
};

export const updateCartItem = (id: string, quantity: number) => {
  return axiosClient.patch(`/cart/update/${id}`, { quantity });
};

export const removeCartItem = (id: string) => {
  return axiosClient.delete(`/cart/${id}`);
};

export const clearCart = () => {
  return axiosClient.delete('/cart/clear');
};
