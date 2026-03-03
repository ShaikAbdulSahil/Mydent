/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState, useContext, useEffect } from 'react';
import {
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  View,
} from 'react-native';
import { login, sendOTP, verifyOTP, resendOTP } from '../api/auth-api';
import { AuthContext } from '../contexts/AuthContext';
import React from 'react';
import LOGO_JPG from '../../assets/static_assets/LOGO_PNG_PREVIEW.png';
import OtpInput from '../components/OtpInput';
import { Colors } from '../constants/Colors';


export default function LoginScreen({ navigation }: any) {
  const { login: setToken, continueAsGuest } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP login states
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await login({ email, password });
      setToken(res.data.access_token);
      setLoginError(''); // Clear any previous error if login successful
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 409) {
          setLoginError('Invalid credentials. Please check your email and password.');
        } else if (err.response.status >= 500) {
          setLoginError('Server error. Please try again later.');
        } else if (err.response.data && err.response.data.message) {
          setLoginError(err.response.data.message);
        } else {
          setLoginError('Login failed. Please check your connection and try again.');
        }
      } else if (err.request) {
        // Request was made but no response received
        setLoginError('Network error. Please check your connection and ensure the server is running.');
      } else {
        // Something else happened
        setLoginError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      setLoginError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setLoginError('');
      await sendOTP(email);
      setOtpSent(true);
      setTimer(300); // 5 minutes in seconds
      setCanResend(false);
    } catch (err: any) {
      console.error('Send OTP error:', err);
      if (err.response?.data?.message) {
        setLoginError(err.response.data.message);
      } else {
        setLoginError('Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setLoginError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      setLoginError('');
      const res = await verifyOTP(email, otp);
      setToken(res.data.access_token);
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      if (err.response?.data?.message) {
        setLoginError(err.response.data.message);
      } else {
        setLoginError('Invalid or expired OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      setLoginError('');
      await resendOTP(email);
      setTimer(300); // Reset timer
      setCanResend(false);
      setOtp(''); // Clear OTP input
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      if (err.response?.data?.message) {
        setLoginError(err.response.data.message);
      } else {
        setLoginError('Failed to resend OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleLoginMode = () => {
    setLoginMode(loginMode === 'password' ? 'otp' : 'password');
    setLoginError('');
    setOtpSent(false);
    setOtp('');
    setPassword('');
    setTimer(0);
  };

  // Timer countdown effect
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.screenBg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={LOGO_JPG}
            style={styles.logo}
            fadeDuration={0}
            resizeMethod="resize"
          />

          <Text style={styles.title}>Welcome Back</Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!otpSent}
          />

          {loginMode === 'password' && (
            <>
              <TextInput
                placeholder="Password"
                value={password}
                secureTextEntry
                onChangeText={setPassword}
                style={styles.input}
              />

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={{ alignSelf: 'flex-end', marginBottom: 10 }}
              >
                <Text style={{ color: Colors.link }}>Forgot Password?</Text>
              </TouchableOpacity>
            </>
          )}

          {loginMode === 'otp' && otpSent && (
            <>
              <View style={styles.otpContainer}>
                <OtpInput
                  value={otp}
                  onChange={(text) => {
                    setOtp(text);
                    setLoginError('');
                  }}
                  autoFocus
                  disabled={loading}
                />

                <View style={styles.timerContainer}>
                  <Text style={styles.timerText}>
                    {timer > 0 ? `OTP expires in ${formatTime(timer)}` : 'OTP expired'}
                  </Text>
                </View>
              </View>
            </>
          )}

          {loginError ? (
            <Text style={styles.errorText}>{loginError}</Text>
          ) : null}

          {loginMode === 'password' && (
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>
          )}

          {loginMode === 'otp' && !otpSent && (
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Sending OTP...' : 'Send OTP'}</Text>
            </TouchableOpacity>
          )}

          {loginMode === 'otp' && otpSent && (
            <>
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resendButton, (!canResend || loading) && styles.buttonDisabled]}
                onPress={handleResendOTP}
                disabled={!canResend || loading}
              >
                <Text style={styles.resendButtonText}>
                  {canResend ? 'Resend OTP' : `Resend in ${formatTime(timer)}`}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleLoginMode}
          >
            <Text style={styles.toggleButtonText}>
              {loginMode === 'password' ? '🔐 Try another way (OTP)' : '🔑 Use password instead'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={continueAsGuest}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.link}>Don't have an account? Sign up</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.screenBg,
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
    marginBottom: 15,
    backgroundColor: Colors.inputBg,
    fontSize: 16,
    color: Colors.textBody,
  },
  errorText: {
    color: Colors.error,
    marginBottom: 10,
    marginLeft: 5,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
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
  skipButton: {
    backgroundColor: Colors.transparent,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  skipButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  otpContainer: {
    marginBottom: 10,
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: -10,
    marginBottom: 10,
  },
  timerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  resendButton: {
    backgroundColor: Colors.transparent,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  resendButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  toggleButton: {
    backgroundColor: Colors.transparent,
    padding: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  toggleButtonText: {
    color: Colors.tabInactive,
    fontSize: 14,
    fontWeight: '500',
  },
});