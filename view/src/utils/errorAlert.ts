import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

export function showError(message: string) {
    try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {
        // ignore
    }

    Alert.alert('Error', message);
}

export function showPaymentSuccessAlert(message: string, onOk?: () => void) {
    try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
        // ignore
    }

    Alert.alert('✅ Payment Successful', message, [
        { text: 'OK', onPress: onOk },
    ], { cancelable: false });
}

export function showSuccess(message: string) {
    try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
        // ignore
    }

    Alert.alert('Success', message);
}

export function showPaymentFailureAlert(message: string, onOk?: () => void) {
    try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {
        // ignore
    }

    Alert.alert('❌ Payment Failed', message, [
        { text: 'OK', onPress: onOk },
    ], { cancelable: true });
}
