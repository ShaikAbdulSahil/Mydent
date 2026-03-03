import { NavigationContainer } from '@react-navigation/native';
import { useContext } from 'react';
import { StatusBar, View } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { Colors } from '../constants/Colors';

import AuthScreen from './AuthScreen';
import DrawerNavigator from './DrawerNavigation';

const linking = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      Login: 'login',
      Signup: 'signup',
      ForgotPassword: 'forgot-password',
      ResetPassword: {
        path: 'reset-password',
        parse: {
          token: (token: string) => token,
        },
      },
    },
  },
};

export default function AppNavigator() {
  const { token, isGuest, loading } = useContext(AuthContext);

  // Don't render navigation until auth state is resolved to avoid
  // flickering between Auth and App stacks when a token exists.
  if (loading) return null;

  // Allow access to app if user has token OR is in guest mode
  const hasAccess = token || isGuest;

  return (
    <NavigationContainer linking={linking}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={hasAccess ? Colors.primaryBg : Colors.cardBg}
        translucent={false}
      />
      {hasAccess ? (
        <View style={{ flex: 1, backgroundColor: Colors.primaryBg }}>
          <DrawerNavigator />
        </View>
      ) : (
        <View style={{ flex: 1, backgroundColor: Colors.cardBg }}>
          <AuthScreen />
        </View>
      )}
    </NavigationContainer>
  );
}
