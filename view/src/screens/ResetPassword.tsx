/**
 * ResetPassword screen is now handled by the ForgotPassword 3-step flow.
 * This screen redirects to ForgotPassword for backwards compatibility.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

const ResetPasswordScreen = ({ navigation }: any) => {
    useEffect(() => {
        navigation.replace('ForgotPassword');
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Redirecting...</Text>
        </View>
    );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.screenBg,
    },
    text: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
});
