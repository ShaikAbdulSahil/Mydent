/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { Colors } from '../constants/Colors';
import WHATSAPP_06_13_1AM from '../../assets/static_assets/WHATSAPP_06_13_1AM.jpg';

export default function ConsultationOptionScreen({ navigation }: any) {
  const { requireAuth } = useRequireAuth();

  const handleContinue = () => {
    if (!requireAuth(() => {
      navigation.navigate('AgeSelection');
    }, 'Please log in to book a consultation')) {
      return;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Please select</Text>
      <View style={styles.card}>
        <Image
          source={WHATSAPP_06_13_1AM}
          style={styles.image}
          fadeDuration={0}
          resizeMethod="resize"
        />
        <Text style={styles.title}>Talk to Our Expert Doctor First</Text>
        <Text style={styles.desc}>
          Before beginning your scan or 3D impression, you'll have a video
          consultation with our doctor. During this session, the doctor will
          assess your case and provide personalized guidance on the best
          treatment plan for your smile transformation.
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>₹ 199</Text>
          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.screenBg, padding: 16 },
  header: { fontSize: 16, color: Colors.brandRed, marginBottom: 16 },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 16 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: { fontSize: 18, color: Colors.brandRed, fontWeight: 'bold' },
  button: {
    backgroundColor: Colors.brandRed,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: { color: Colors.textOnBrand, fontWeight: '600' },
});
