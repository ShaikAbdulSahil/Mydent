import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import SignupScreen from '../screens/Signup';
import LoginScreen from '../screens/Login';
import ForgotPasswordScreen from '../screens/ForgotPassword';
import ResetPasswordScreen from '../screens/ResetPassword';
import TermsWebViewScreen from '../screens/TermsWebViewScreen';
import PrivacyWebViewScreen from '../screens/PrivacyWebViewScreen';
import { Colors } from '../constants/Colors';

const Stack = createNativeStackNavigator();

const AuthScreen = () => {
  return (
    <>
      <Stack.Navigator
        screenOptions={{
          contentStyle: { backgroundColor: Colors.cardBg },
          statusBarBackgroundColor: Colors.cardBg,
          statusBarStyle: 'dark',
          statusBarTranslucent: false,
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TermsWebView"
          component={TermsWebViewScreen}
          options={{ headerShown: true, title: 'Terms & Conditions' }}
        />
        <Stack.Screen
          name="PrivacyWebView"
          component={PrivacyWebViewScreen}
          options={{ headerShown: true, title: 'Privacy Policy' }}
        />
      </Stack.Navigator>
    </>
  );
};
export default AuthScreen;
