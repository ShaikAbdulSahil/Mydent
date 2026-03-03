import { useContext } from 'react';
import { Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

export const useRequireAuth = () => {
    const { token, isGuest, logout } = useContext(AuthContext);

    const requireAuth = (
        action: () => void | Promise<void>,
        message?: string
    ): boolean => {
        if (token) {
            // User is authenticated, proceed
            if (typeof action === 'function') {
                const result = action();
                if (result instanceof Promise) {
                    result.catch((err) => console.error('Action error:', err));
                }
            }
            return true;
        }

        // User is guest, show login prompt
        Alert.alert(
            'Login Required',
            message || 'Please log in to access this feature',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Login',
                    onPress: () => {
                        // Clear guest mode — this resets to the AuthScreen
                        // where Login is the first screen
                        logout();
                    },
                },
            ]
        );
        return false;
    };

    return { requireAuth, isAuthenticated: !!token, isGuest };
};
