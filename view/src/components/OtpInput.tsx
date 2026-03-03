import React, { useRef, useEffect } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Keyboard,
    Platform,
} from 'react-native';
import { Colors } from '../constants/Colors';

interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    autoFocus?: boolean;
    disabled?: boolean;
}

export default function OtpInput({
    length = 6,
    value,
    onChange,
    autoFocus = true,
    disabled = false,
}: OtpInputProps) {
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    }, [autoFocus]);

    const handleChange = (text: string, index: number) => {
        // Only allow digits
        const digit = text.replace(/[^0-9]/g, '');

        if (digit.length > 1) {
            // Handle paste — fill from current index
            const pasted = digit.slice(0, length - index);
            const newValue = value.split('');
            for (let i = 0; i < pasted.length; i++) {
                newValue[index + i] = pasted[i];
            }
            const result = newValue.join('').slice(0, length);
            onChange(result);
            const nextIndex = Math.min(index + pasted.length, length - 1);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        const newValue = value.split('');
        newValue[index] = digit;
        const result = newValue.join('').replace(/undefined/g, '');
        onChange(result.slice(0, length));

        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        if (result.length === length) {
            Keyboard.dismiss();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (!digits[index] && index > 0) {
                // Current box empty — move back and clear previous
                const newValue = value.split('');
                newValue[index - 1] = '';
                onChange(newValue.join(''));
                inputRefs.current[index - 1]?.focus();
            } else {
                // Clear current box
                const newValue = value.split('');
                newValue[index] = '';
                onChange(newValue.join(''));
            }
        }
    };

    return (
        <View style={styles.container}>
            {Array.from({ length }, (_, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    style={[
                        styles.cell,
                        digits[index] ? styles.cellFilled : {},
                        disabled ? styles.cellDisabled : {},
                    ]}
                    value={digits[index] || ''}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={Platform.OS === 'android' ? 1 : undefined}
                    selectTextOnFocus
                    editable={!disabled}
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginVertical: 16,
    },
    cell: {
        width: 48,
        height: 56,
        borderWidth: 2,
        borderColor: Colors.otpBorder,
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '700',
        color: Colors.otpText,
        backgroundColor: Colors.cardBg,
        // Subtle shadow for depth
        ...Platform.select({
            ios: {
                shadowColor: Colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    cellFilled: {
        borderColor: Colors.otpFilled,
        backgroundColor: Colors.otpFilledBg,
    },
    cellDisabled: {
        backgroundColor: Colors.skeletonBg,
        opacity: 0.6,
    },
});
