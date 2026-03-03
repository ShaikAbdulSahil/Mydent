/* eslint-disable @typescript-eslint/no-floating-promises */

import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Linking,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BOOK_SCAN_IMAGE from '../../assets/static_assets/BOOK_SCAN_IMAGE.jpg';
import CONSULT_IMAGE from '../../assets/static_assets/CONSULT_IMAGE.jpg';
import WA_IMAGE from '../../assets/static_assets/WA_IMAGE.jpg';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

export default function OverlayFloatingButtons() {
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();
  const [buttonWidth, setButtonWidth] = useState(0);

  const handleWhatsAppPress = () => {
    Linking.openURL('https://wa.me/+919381590963');
  };

  const handleBookPress = () => {
    navigation.navigate('HomeTab', {
      screen: 'ConsultationOption',
    });
  };

  const handleConsultPress = () => {
    navigation.navigate('HomeTab', {
      screen: 'ConsultationOption',
    });
  };

  return (
    <View style={[styles.container, { bottom: 65 + insets.bottom }]}>
      {/* Book Scan Button */}
      <TouchableOpacity style={styles.imageWrapper} onPress={handleBookPress}>
        <Image
          source={BOOK_SCAN_IMAGE}
          style={styles.iconImage}
          fadeDuration={0}
          resizeMethod="resize"
        />
      </TouchableOpacity>

      {/* Center Consult Button */}
      <View pointerEvents="box-none" style={styles.centerAbsoluteRow}>
        <TouchableOpacity style={styles.centerWrapper} onPress={handleConsultPress}>
          <Image
            source={CONSULT_IMAGE}
            style={styles.centerIconImage}
            fadeDuration={0}
            resizeMethod="resize"
          />
        </TouchableOpacity>
      </View>

      {/* WhatsApp */}
      <TouchableOpacity onPress={handleWhatsAppPress}>
        <Image
          source={WA_IMAGE}
          style={styles.whatsappIcon}
          fadeDuration={0}
          resizeMethod="resize"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 65,
    left: 0,
    right: 0,
    zIndex: 20,
    pointerEvents: 'box-none',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  imageWrapper: {
    backgroundColor: Colors.cardBg,
    padding: 6,
    borderRadius: 25,
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginLeft: -4,
  },
  iconImage: {
    width: 80,
    height: 25,
    resizeMode: 'contain',
  },
  centerAbsoluteRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  centerWrapper: {
    bottom: -22,
    backgroundColor: Colors.cardBg,
    padding: 6,
    borderRadius: 30,
    zIndex: 50,
    elevation: 10,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  centerIconImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    borderRadius: 25,
  },
  whatsappIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    borderRadius: 25,
  },
});
