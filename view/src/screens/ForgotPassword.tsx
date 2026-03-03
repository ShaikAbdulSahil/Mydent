/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import OtpInput from '../components/OtpInput';
import { forgotPassword, verifyResetOTP, resetPassword } from '../api/auth-api';
import { showError } from '../utils/errorAlert';
import { showSuccess } from '../utils/successToast';
import { Colors } from '../constants/Colors';

type Step = 'email' | 'otp' | 'newPassword';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Timer for OTP expiry
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

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

  // ─── Step 1: Send OTP to email ─────────────────────────
  const handleSendOTP = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await forgotPassword(email.trim().toLowerCase());
      setStep('otp');
      setTimer(300);
      setCanResend(false);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Could not send reset code. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ───────────────────────────────
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await verifyResetOTP(email.trim().toLowerCase(), otp);
      setResetToken(res.data.resetToken);
      setStep('newPassword');
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Invalid or expired code. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: Set new password ─────────────────────────
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both fields');
      return;
    }
    if (newPassword.length < 5) {
      setError('Password must be at least 5 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await resetPassword(email.trim().toLowerCase(), resetToken, newPassword);
      showSuccess('Password reset successfully!');
      navigation.navigate('Login');
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend OTP ───────────────────────────────────────
  const handleResend = async () => {
    try {
      setLoading(true);
      setError('');
      setOtp('');
      await forgotPassword(email.trim().toLowerCase());
      setTimer(300);
      setCanResend(false);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Failed to resend code. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step indicator ───────────────────────────────────
  const StepIndicator = () => (
    <View style={styles.stepRow}>
      {(['email', 'otp', 'newPassword'] as Step[]).map((s, i) => (
        <React.Fragment key={s}>
          <View
            style={[
              styles.stepDot,
              (step === s || i < ['email', 'otp', 'newPassword'].indexOf(step))
                ? styles.stepDotActive
                : null,
            ]}
          >
            <Text
              style={[
                styles.stepDotText,
                (step === s || i < ['email', 'otp', 'newPassword'].indexOf(step))
                  ? styles.stepDotTextActive
                  : null,
              ]}
            >
              {i + 1}
            </Text>
          </View>
          {i < 2 && (
            <View
              style={[
                styles.stepLine,
                i < ['email', 'otp', 'newPassword'].indexOf(step)
                  ? styles.stepLineActive
                  : null,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <StepIndicator />

          <Text style={styles.title}>
            {step === 'email' && 'Reset Your Password'}
            {step === 'otp' && 'Enter Verification Code'}
            {step === 'newPassword' && 'Create New Password'}
          </Text>

          <Text style={styles.subtitle}>
            {step === 'email' &&
              "Enter your email address and we'll send you a 6-digit verification code."}
            {step === 'otp' &&
              `We've sent a 6-digit code to ${email}. Please enter it below.`}
            {step === 'newPassword' &&
              'Your identity has been verified. Enter your new password.'}
          </Text>

          {/* ── Step 1: Email ──────────────────────────── */}
          {step === 'email' && (
            <>
              <TextInput
                placeholder="Email address"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setError('');
                }}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send Verification Code</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 2: OTP ────────────────────────────── */}
          {step === 'otp' && (
            <>
              <OtpInput
                value={otp}
                onChange={(v) => {
                  setOtp(v);
                  setError('');
                }}
                autoFocus
                disabled={loading}
              />

              {timer > 0 && (
                <Text style={styles.timerText}>
                  Code expires in {formatTime(timer)}
                </Text>
              )}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify Code</Text>
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
                  setStep('email');
                  setOtp('');
                  setError('');
                }}
              >
                <Text style={styles.changeEmail}>Change email address</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 3: New Password ──────────────────── */}
          {step === 'newPassword' && (
            <>
              <TextInput
                placeholder="New Password"
                placeholderTextColor="#999"
                value={newPassword}
                onChangeText={(v) => {
                  setNewPassword(v);
                  setError('');
                }}
                secureTextEntry
                style={styles.input}
                autoFocus
              />

              <TextInput
                placeholder="Confirm New Password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={(v) => {
                  setConfirmPassword(v);
                  setError('');
                }}
                secureTextEntry
                style={styles.input}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepDotText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  stepDotTextActive: {
    color: Colors.textOnPrimary,
  },
  stepLine: {
    width: 40,
    height: 3,
    backgroundColor: Colors.border,
    marginHorizontal: 6,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: Colors.inputBg,
    fontSize: 16,
    color: Colors.textBody,
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '500',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.textOnPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  timerText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
    marginBottom: 4,
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
  backButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  backText: {
    color: Colors.link,
    fontSize: 15,
    fontWeight: '500',
  },
});
