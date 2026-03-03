import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const GUEST_MODE_KEY = 'guest_mode';

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.removeItem(GUEST_MODE_KEY); // Clear guest mode when logging in
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting token from storage:', error);
    return null;
  }
};

export const clearToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const setGuestMode = async (isGuest: boolean) => {
  if (isGuest) {
    await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
  } else {
    await AsyncStorage.removeItem(GUEST_MODE_KEY);
  }
};

export const isGuestMode = async () => {
  try {
    const guestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
    return guestMode === 'true';
  } catch (error) {
    console.error('Error getting guest mode from storage:', error);
    return false;
  }
};

export const clearAllAuth = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(GUEST_MODE_KEY);
};
