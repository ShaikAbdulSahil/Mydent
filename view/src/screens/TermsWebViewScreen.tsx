import React, { useRef } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { WebView } from 'react-native-webview';

export default function TermsWebViewScreen() {
    const webViewRef = useRef<WebView>(null);

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                source={{ uri: 'https://mydent-api.onrender.com/terms_conditions.html' }}
                startInLoadingState
                renderLoading={() => (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={Colors.primaryLight} />
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.cardBg,
    },
    loaderContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
