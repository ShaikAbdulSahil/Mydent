import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import FOOTER_IMAGE from '../../assets/static_assets/FOOTER_IMAGE.jpg';
import { Colors } from '../constants/Colors';


const screenWidth = Dimensions.get('window').width;

export default function FeatureStats() {
  return (
    <View style={styles.container}>
      <Image
        source={FOOTER_IMAGE}
        style={styles.image}
        resizeMode="cover"
        fadeDuration={0}
        resizeMethod="resize"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 120,
    overflow: 'hidden',
    backgroundColor: Colors.primaryBg,
  },
  image: {
    width: screenWidth - 32,
    height: 180,
    resizeMode: 'cover',
    borderRadius: 16,
  },
});
