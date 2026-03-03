import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigation';
import { AuthProvider } from './src/contexts/AuthContext';
import { UserProvider } from './src/contexts/UserContext';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { FavoriteProvider } from './src/contexts/FavContext';
import { CartProvider } from './src/contexts/CartContext';
import { Video, ResizeMode } from 'expo-av';
import * as SplashScreen from 'expo-splash-screen'; // Import this


// 1. Prevent the native splash from hiding automatically
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function App() {
  const [showVideoSplash, setShowVideoSplash] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // 2. Hide the NATIVE static image only when the video is ready to play
  const onVideoLoad = useCallback(async () => {
    setIsVideoLoaded(true);
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {


    // Hide the custom video splash after 5 seconds
    const timer = setTimeout(() => {
      setShowVideoSplash(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (showVideoSplash) {
    return (
      <View style={styles.splashContainer}>
        <Video
          source={require('./assets/welcome.mp4')}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          isLooping={false} // Usually intro animations shouldn't loop
          onLoad={onVideoLoad} // 3. Trigger native splash hide here
        />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <PaperProvider>
        <SafeAreaProvider>
          <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <UserProvider>
                  <CartProvider>
                    <FavoriteProvider>
                      <AppNavigator />
                    </FavoriteProvider>
                  </CartProvider>
                </UserProvider>
              </AuthProvider>
            </QueryClientProvider>
          </SafeAreaView>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});