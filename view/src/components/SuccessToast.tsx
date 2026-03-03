import React, { useEffect, useRef, useState } from 'react';
import { subscribe } from '../utils/successToast';
import { Animated, Text, View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';

export default function SuccessToast() {
    const [message, setMessage] = useState<string | null>(null);
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const hideTimer = useRef<number | null>(null);

    useEffect(() => {
        const unsub = subscribe((msg) => {
            if (hideTimer.current) {
                clearTimeout(hideTimer.current);
                hideTimer.current = null;
            }
            setMessage(msg);
            // haptic feedback for success
            try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (e) {
                // ignore if haptics not available
            }
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
                Animated.sequence([
                    Animated.timing(scale, { toValue: 1.05, duration: 160, useNativeDriver: true }),
                    Animated.timing(scale, { toValue: 1, duration: 140, useNativeDriver: true }),
                ]),
            ]).start();

            hideTimer.current = setTimeout(() => {
                Animated.parallel([
                    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
                    Animated.timing(translateY, { toValue: 20, duration: 200, useNativeDriver: true }),
                ]).start(() => setMessage(null));
            }, 2000) as unknown as number;
        });

        return () => {
            unsub();
            if (hideTimer.current) {
                clearTimeout(hideTimer.current);
            }
        };
    }, [opacity, translateY]);

    if (!message) return null;

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.container,
                { opacity, transform: [{ translateY }, { scale }] },
            ]}
        >
            <View style={styles.inner}>
                <Ionicons name="thumbs-up" size={22} color={Colors.success} />
                <Text style={styles.text}>{message}</Text>
            </View>
        </Animated.View>
    );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        // place below typical navbar height (navbar ~100px), a bit lower for breathing room
        top: 110,
        left: 16,
        right: 16,
        zIndex: 1000,
        alignItems: 'center',
    },
    inner: {
        backgroundColor: Colors.successBg,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: Colors.shadow,
        shadowOpacity: 0.14,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(11,189,87,0.15)',
    },
    text: {
        color: Colors.success,
        marginLeft: 12,
        fontWeight: '700',
        fontSize: 16,
    },
});
