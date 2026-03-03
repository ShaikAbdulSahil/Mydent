/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { enhanceSmile } from '../api/nano-banana-api';
import { useUser } from '../contexts/UserContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { Colors } from '../constants/Colors';
import LOGO_JPG from '../../assets/static_assets/LOGO_JPG.jpg';
import WHATSAPP_06_15_9PM from '../../assets/static_assets/WHATSAPP_06_15_9PM.jpg';
import WHATSAPP_06_15_9PM_1 from '../../assets/static_assets/WHATSAPP_06_15_9PM_1.jpg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const engagementMessages = [
  '✨ Creating your perfect smile...',
  '🦷 Whitening and aligning your teeth...',
  '💫 Removing imperfections...',
  '🌟 Enhancing your natural beauty...',
  '✨ Almost there! Finalizing your new smile...',
];

export default function SmilePreview() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const { user } = useUser();
  const { requireAuth, isAuthenticated } = useRequireAuth();

  // Show login prompt if guest tries to access this screen
  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.screenBg, padding: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '600', color: Colors.textBody, marginBottom: 12 }}>Login Required</Text>
        <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>
          Please log in to use the Smile Preview feature
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: Colors.primaryLight, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8 }}
          onPress={() => requireAuth(() => { }, 'Please log in to use the Smile Preview feature')}
        >
          <Text style={{ color: Colors.textOnPrimary, fontWeight: '600', fontSize: 16 }}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSelfie = async () => {
    if (!ageConfirmed) {
      Alert.alert(
        'Age Confirmation Required',
        'You must confirm you are 18 or older.',
      );
      return;
    }

    Alert.alert(
      'Select Option',
      'Choose image source',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 1,
            });
            if (!result.canceled) {
              setSelectedImage(result.assets[0].uri);
              setEnhancedImage(null); // Reset enhanced image
              handleEnhanceSmile(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 1,
            });
            if (!result.canceled) {
              setSelectedImage(result.assets[0].uri);
              setEnhancedImage(null); // Reset enhanced image
              handleEnhanceSmile(result.assets[0].uri);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  const handleEnhanceSmile = async (imageUri: string) => {
    if (!user) {
      Alert.alert('Error', 'Please log in to use this feature');
      return;
    }

    setIsProcessing(true);
    setCurrentMessage(0);

    // Rotate through engagement messages
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % engagementMessages.length);
    }, 3000);

    try {
      const result = await enhanceSmile(imageUri, user._id);
      setEnhancedImage(result.enhancedImageUrl);

      Alert.alert(
        'Success! 🎉',
        'Your perfect smile preview is ready! This is how your teeth could look after treatment.',
      );
    } catch (error: any) {
      console.error('Error enhancing smile:', error);

      const status = error?.response?.status;
      const serverMessage = error?.response?.data?.message;

      if (status === 503) {
        // Service unavailable — Gen AI not available
        Alert.alert(
          'Service Unavailable',
          serverMessage || 'Smile enhancement service is unavailable at the moment. Please try after some time.',
        );
      } else {
        Alert.alert(
          'Oops!',
          serverMessage || 'Something went wrong. Please try again later.',
        );
      }
    } finally {
      clearInterval(messageInterval);
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!enhancedImage) return;

    try {
      const filename = `mydent-smile-${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      // Download the image
      const downloadResult = await FileSystem.downloadAsync(
        enhancedImage,
        fileUri,
      );

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Save your enhanced smile',
        });
      } else {
        Alert.alert(
          'Success',
          `Image saved to: ${downloadResult.uri}`,
        );
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      Alert.alert('Error', 'Failed to download image. Please try again.');
    }
  };

  const handleRetake = () => {
    setSelectedImage(null);
    setEnhancedImage(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Image
          source={LOGO_JPG}
          style={styles.logo}
          resizeMode="contain"
          fadeDuration={0}
          resizeMethod="resize"
        />

        <Text style={styles.heading}>
          Let’s get started with your new smile
        </Text>
        <Text style={styles.subheading}>
          Take a smiling selfie and we’ll show you how your smile can be
          transformed.
        </Text>

        <View style={styles.tips}>
          <Text style={styles.tip}>✔️ Ensure sufficient light</Text>
          <Text style={styles.tip}>✔️ Remove glasses or hat</Text>
          <Text style={styles.tip}>✔️ Keep your head straight</Text>
          <Text style={styles.tip}>✔️ Look at camera and smile brightly</Text>
        </View>

        <View style={styles.switchRow}>
          <Switch value={ageConfirmed} onValueChange={setAgeConfirmed} />
          <Text style={styles.switchText}>
            I confirm that I am 18 years or older
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: ageConfirmed ? Colors.primaryLight : Colors.textMuted },
          ]}
          onPress={handleSelfie}
          disabled={!ageConfirmed}
        >
          <Text style={styles.buttonText}>Take a Selfie</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Your photo will only be used to simulate your smile preview and
          improve your experience.
        </Text>

        {/* Processing Loading State */}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={Colors.primaryLight} />
            <Text style={styles.processingText}>
              {engagementMessages[currentMessage]}
            </Text>
            <Text style={styles.processingSubtext}>
              This may take 20-40 seconds. Please wait...
            </Text>
          </View>
        )}

        {/* Original Selfie Preview */}
        {selectedImage && !enhancedImage && !isProcessing && (
          <View style={styles.imagePreviewContainer}>
            <Text style={styles.previewLabel}>Original Photo</Text>
            <Image
              source={{ uri: selectedImage }}
              style={styles.uploadedImage}
              fadeDuration={0}
              resizeMethod="resize"
            />
          </View>
        )}

        {/* Enhanced Smile Preview */}
        {enhancedImage && (
          <View style={styles.enhancedContainer}>
            <Text style={styles.successTitle}>Your Perfect Smile! 🎉</Text>

            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.comparisonScroll}
            >
              <View style={styles.comparisonImageWrapper}>
                <Text style={styles.comparisonLabel}>Before</Text>
                <Image
                  source={{ uri: selectedImage! }}
                  style={styles.comparisonImage}
                  resizeMode="contain"
                  fadeDuration={0}
                  resizeMethod="resize"
                />
              </View>
              <View style={styles.comparisonImageWrapper}>
                <Text style={styles.comparisonLabel}>After ✨</Text>
                <Image
                  source={{ uri: enhancedImage }}
                  style={styles.comparisonImage}
                  resizeMode="contain"
                  fadeDuration={0}
                  resizeMethod="resize"
                />
              </View>
            </ScrollView>

            <Text style={styles.swipeHint}>← Swipe to compare →</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={handleDownload}
              >
                <Text style={styles.downloadButtonText}>Download Image</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.retakeButton}
                onPress={handleRetake}
              >
                <Text style={styles.retakeButtonText}>Take Another</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Example Transformations */}
        {!selectedImage && !isProcessing && (
          <>
            <Text style={styles.examplesTitle}>See what's possible:</Text>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
            >
              <Image
                source={WHATSAPP_06_15_9PM_1}
                style={styles.sliderImage}
                resizeMode="contain"
                fadeDuration={0}
                resizeMethod="resize"
              />
              <Image
                source={WHATSAPP_06_15_9PM}
                style={styles.sliderImage}
                resizeMode="contain"
                fadeDuration={0}
                resizeMethod="resize"
              />
            </ScrollView>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.darkBg,
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.shadow,
    elevation: 5,
  },
  logo: {
    height: 40,
    alignSelf: 'center',
    marginBottom: 16,
  },
  heading: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primaryLight,
  },
  subheading: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.darkBg,
    marginTop: 8,
  },
  tips: {
    marginTop: 16,
  },
  tip: {
    fontSize: 14,
    marginBottom: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  switchText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
    color: Colors.textBody,
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
  },
  footer: {
    marginTop: 16,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  processingContainer: {
    marginTop: 24,
    padding: 24,
    backgroundColor: Colors.skeletonBg,
    borderRadius: 12,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primaryLight,
    textAlign: 'center',
  },
  processingSubtext: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  imagePreviewContainer: {
    marginTop: 20,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textBody,
    marginBottom: 8,
  },
  uploadedImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  enhancedContainer: {
    marginTop: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.successAlt,
    textAlign: 'center',
    marginBottom: 16,
  },
  comparisonScroll: {
    marginBottom: 8,
  },
  comparisonImageWrapper: {
    width: SCREEN_WIDTH - 70,
    marginRight: 10,
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textBody,
    marginBottom: 8,
    textAlign: 'center',
  },
  comparisonImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  swipeHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: Colors.skeletonBg,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: Colors.textBody,
    fontWeight: '600',
    fontSize: 15,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textBody,
    marginTop: 24,
    marginBottom: 12,
  },
  sliderImage: {
    width: SCREEN_WIDTH - 70,
    height: SCREEN_WIDTH - 40,
    borderRadius: 10,
  },
});
