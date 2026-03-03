/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useState, useContext, useEffect } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Pressable,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { signup, sendVerificationEmail, verifyEmail } from '../api/auth-api';
import { AuthContext } from '../contexts/AuthContext';
import React from 'react';
import LOGO_PNG from '../../assets/static_assets/LOGO_PNG_PREVIEW.png';
import OtpInput from '../components/OtpInput';
import { showError } from '../utils/errorAlert';
import { Colors } from '../constants/Colors';

type Step = 'form' | 'verifyEmail';

export default function SignupScreen({ navigation }: any) {
    const { login } = useContext(AuthContext);
    const [step, setStep] = useState<Step>('form');

    // Form fields
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [consentChecked, setConsentChecked] = useState(false);

    // Validation errors
    const [emailError, setEmailError] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [mobileError, setMobileError] = useState('');
    const [addressError, setAddressError] = useState('');
    const [signupError, setSignupError] = useState('');

    // Email verification
    const [otp, setOtp] = useState('');
    const [verifyError, setVerifyError] = useState('');
    const [timer, setTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);

    const [loading, setLoading] = useState(false);

    // Timer countdown
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // ─── Validation ───────────────────────────────────────

    const validateEmail = (value: string) => {
        if (!value) {
            setEmailError('Email is required');
            return false;
        }
        if (!value.includes('@')) {
            setEmailError('Please enter a valid email');
            return false;
        }
        setEmailError('');
        return true;
    };

    const validateFirstName = (value: string) => {
        if (!value.trim()) {
            setFirstNameError('First name is required');
            return false;
        }
        setFirstNameError('');
        return true;
    };

    const validatePassword = (value: string) => {
        if (!value) {
            setPasswordError('Password is required');
            return false;
        }
        if (value.length < 5) {
            setPasswordError('Password must be at least 5 characters');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const validateMobile = (value: string) => {
        if (!value.trim()) {
            setMobileError('Mobile number is required');
            return false;
        }
        if (!/^\d{10}$/.test(value)) {
            setMobileError('Mobile number must be 10 digits');
            return false;
        }
        setMobileError('');
        return true;
    };

    const validateAddress = (value: string) => {
        if (!value.trim()) {
            setAddressError('Address is required');
            return false;
        }
        setAddressError('');
        return true;
    };

    // ─── Step 1: Send verification email ──────────────────

    const handleSendVerification = async () => {
        const emailValid = validateEmail(email);
        const nameValid = validateFirstName(firstName);
        const passValid = validatePassword(password);
        const mobileValid = validateMobile(mobile);
        const addrValid = validateAddress(address);

        if (!emailValid || !nameValid || !passValid || !mobileValid || !addrValid) {
            return;
        }

        try {
            setLoading(true);
            setSignupError('');
            await sendVerificationEmail(email.trim().toLowerCase());
            setStep('verifyEmail');
            setTimer(300);
            setCanResend(false);
        } catch (err: any) {
            if (err.response?.status === 409) {
                setSignupError('Email already registered. Please use a different email.');
            } else if (err.response?.data?.message) {
                setSignupError(err.response.data.message);
            } else {
                setSignupError('Failed to send verification email. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ─── Step 2: Verify OTP & Complete Signup ─────────────

    const handleVerifyAndSignup = async () => {
        if (otp.length !== 6) {
            setVerifyError('Please enter the complete 6-digit code');
            return;
        }

        try {
            setLoading(true);
            setVerifyError('');

            // First verify the email
            await verifyEmail(email.trim().toLowerCase(), otp);

            // Then complete signup
            const res = await signup({
                email: email.trim().toLowerCase(),
                firstName,
                password,
                mobile,
                address,
            });
            login(res.data.access_token);
        } catch (err: any) {
            if (err.response?.data?.message) {
                setVerifyError(err.response.data.message);
            } else {
                setVerifyError('Verification failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ─── Resend verification code ─────────────────────────

    const handleResend = async () => {
        try {
            setLoading(true);
            setVerifyError('');
            setOtp('');
            await sendVerificationEmail(email.trim().toLowerCase());
            setTimer(300);
            setCanResend(false);
        } catch (err: any) {
            setVerifyError(
                err.response?.data?.message || 'Failed to resend code. Please try again.',
            );
        } finally {
            setLoading(false);
        }
    };

    // ────────────────────────────────────────────────────────

    if (step === 'verifyEmail') {
        return (
            <View style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.verifyContainer}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.verifyIcon}>
                            <Text style={styles.verifyIconText}>📧</Text>
                        </View>

                        <Text style={styles.verifyTitle}>Verify Your Email</Text>
                        <Text style={styles.verifySubtitle}>
                            We've sent a 6-digit verification code to{'\n'}
                            <Text style={styles.emailHighlight}>{email}</Text>
                        </Text>

                        <OtpInput
                            value={otp}
                            onChange={(v) => {
                                setOtp(v);
                                setVerifyError('');
                            }}
                            autoFocus
                            disabled={loading}
                        />

                        {timer > 0 && (
                            <Text style={styles.timerText}>
                                Code expires in {formatTime(timer)}
                            </Text>
                        )}

                        {verifyError ? (
                            <Text style={styles.verifyErrorText}>{verifyError}</Text>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleVerifyAndSignup}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Verify & Create Account</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.resendButton,
                                (!canResend || loading) && styles.buttonDisabled,
                            ]}
                            onPress={handleResend}
                            disabled={!canResend || loading}
                        >
                            <Text style={styles.resendText}>
                                {canResend ? 'Resend Code' : `Resend in ${formatTime(timer)}`}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setStep('form');
                                setOtp('');
                                setVerifyError('');
                            }}
                        >
                            <Text style={styles.changeEmail}>Change email address</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.formContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <Image
                        source={LOGO_PNG}
                        style={styles.logo}
                        fadeDuration={0}
                        resizeMethod="resize"
                    />

                    <Text style={styles.title}>Create Your Account</Text>

                    <TextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={(value) => {
                            setEmail(value);
                            validateEmail(value);
                        }}
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                    <TextInput
                        placeholder="Name"
                        value={firstName}
                        onChangeText={(value) => {
                            setFirstName(value);
                            validateFirstName(value);
                        }}
                        style={styles.input}
                    />
                    {firstNameError ? (
                        <Text style={styles.errorText}>{firstNameError}</Text>
                    ) : null}

                    <TextInput
                        placeholder="Password"
                        value={password}
                        secureTextEntry
                        onChangeText={(value) => {
                            setPassword(value);
                            validatePassword(value);
                        }}
                        style={styles.input}
                    />
                    {passwordError ? (
                        <Text style={styles.errorText}>{passwordError}</Text>
                    ) : null}

                    <TextInput
                        placeholder="Mobile"
                        value={mobile}
                        onChangeText={(value) => {
                            setMobile(value);
                            validateMobile(value);
                        }}
                        style={styles.input}
                        keyboardType="phone-pad"
                    />
                    {mobileError ? (
                        <Text style={styles.errorText}>{mobileError}</Text>
                    ) : null}

                    <TextInput
                        placeholder="Address"
                        value={address}
                        onChangeText={(value) => {
                            setAddress(value);
                            validateAddress(value);
                        }}
                        style={styles.input}
                    />
                    {addressError ? (
                        <Text style={styles.errorText}>{addressError}</Text>
                    ) : null}

                    {signupError ? (
                        <Text style={styles.signupError}>{signupError}</Text>
                    ) : null}

                    <View style={styles.consentRow}>
                        <TouchableOpacity
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: consentChecked }}
                            onPress={() => setConsentChecked((v) => !v)}
                            style={[styles.checkbox, consentChecked && styles.checkboxChecked]}
                            activeOpacity={0.8}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            {consentChecked ? <Text style={styles.checkmark}>✓</Text> : null}
                        </TouchableOpacity>
                        <Text style={styles.consentText}>I agree to the </Text>
                        <Pressable
                            onPress={() => navigation.navigate('TermsWebView')}
                            hitSlop={6}
                        >
                            <Text style={styles.consentLink}>Terms & Conditions</Text>
                        </Pressable>
                        <Text style={styles.consentText}> and </Text>
                        <Pressable
                            onPress={() => navigation.navigate('PrivacyWebView')}
                            hitSlop={6}
                        >
                            <Text style={styles.consentLink}>Privacy Policy</Text>
                        </Pressable>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            (loading || !consentChecked) && styles.buttonDisabled,
                        ]}
                        onPress={handleSendVerification}
                        disabled={loading || !consentChecked}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Continue</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.link}>Already have an account? Login</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.screenBg,
    },
    formContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    verifyContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    logo: {
        width: 200,
        height: 120,
        alignSelf: 'center',
        marginBottom: 20,
        borderRadius: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
        color: Colors.textPrimary,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.borderInput,
        padding: 12,
        borderRadius: 10,
        marginBottom: 5,
        backgroundColor: Colors.inputBg,
        fontSize: 16,
        color: Colors.textBody,
    },
    errorText: {
        color: Colors.error,
        marginBottom: 10,
        marginLeft: 5,
        fontSize: 12,
    },
    signupError: {
        color: Colors.error,
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: '500',
    },
    consentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 6,
        marginBottom: 6,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.borderInput,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        backgroundColor: Colors.inputBg,
    },
    checkboxChecked: {
        borderColor: Colors.checkboxActive,
        backgroundColor: Colors.checkboxBg,
    },
    checkmark: {
        color: Colors.checkboxActive,
        fontSize: 14,
        fontWeight: 'bold',
    },
    consentText: {
        color: Colors.textSecondary,
        fontSize: 13,
    },
    consentLink: {
        color: Colors.link,
        fontSize: 13,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: Colors.textOnPrimary,
        fontWeight: '700',
        fontSize: 16,
    },
    link: {
        marginTop: 20,
        color: Colors.link,
        textAlign: 'center',
    },
    // ─── Verify step styles ──────────────────
    verifyIcon: {
        alignSelf: 'center',
        marginBottom: 16,
    },
    verifyIconText: {
        fontSize: 48,
    },
    verifyTitle: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    verifySubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 28,
        lineHeight: 20,
    },
    emailHighlight: {
        fontWeight: '700',
        color: Colors.primary,
    },
    timerText: {
        textAlign: 'center',
        color: Colors.textSecondary,
        fontSize: 13,
        marginTop: 8,
        marginBottom: 4,
    },
    verifyErrorText: {
        color: Colors.error,
        textAlign: 'center',
        marginBottom: 12,
        fontSize: 13,
        fontWeight: '500',
    },
    resendButton: {
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    resendText: {
        color: Colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    changeEmail: {
        color: Colors.link,
        textAlign: 'center',
        marginTop: 14,
        fontSize: 14,
    },
});
