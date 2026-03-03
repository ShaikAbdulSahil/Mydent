import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import NEWS_1 from '../../assets/static_assets/NEWS_1.png';
import NEWS_2 from '../../assets/static_assets/NEWS_2.png';
import NEWS_3 from '../../assets/static_assets/NEWS_3.png';
import NEWS_4 from '../../assets/static_assets/NEWS_4.png';
import SkeletonImage from './Skeleton';
import { Colors } from '../constants/Colors';


const screenWidth = Dimensions.get('window').width;

export default function FeaturedIn() {
  const images = [
    NEWS_1,
    NEWS_2,
    NEWS_3,
    NEWS_4,
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.fullWidthBg}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {images.map((img, idx) => (
            <View key={idx} style={styles.card}>
              <Image
                source={img}
                style={styles.image}
                resizeMode="contain"
                fadeDuration={0}
                resizeMethod="resize"
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 16,
  },
  fullWidthBg: {
    width: screenWidth,
    backgroundColor: Colors.featuredBg,
    paddingVertical: 12,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 10,
    padding: 16,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 90,
    height: 30,
    transform: [{ scale: 2 }],
  },
});
