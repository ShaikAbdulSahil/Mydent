/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import DOCTOR_1 from '../../assets/static_assets/DOCTOR_1.png';
import DOCTOR_2 from '../../assets/static_assets/DOCTOR_2.png';
import DOCTOR_3 from '../../assets/static_assets/DOCTOR_3.png';
import DOCTOR_4 from '../../assets/static_assets/DOCTOR_4.png';
import DOCTOR_5 from '../../assets/static_assets/DOCTOR_5.png';
import Doctor_6 from '../../assets/static_assets/DOCTOR6.png';
import SkeletonImage from './Skeleton';
import { Colors } from '../constants/Colors';
const doctors = [
  { img: DOCTOR_5 }, // index 0
  { img: DOCTOR_2 }, // index 1
  { img: DOCTOR_3 }, // index 2
  { img: Doctor_6 }, // index 3
  { img: DOCTOR_4 }, // index 4
  { img: DOCTOR_1 }, // index 5
];

export default function TopProducts({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {doctors.map((doc, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() => {
              if (idx === 4 || idx === 5) {
                navigation.navigate('ProductsTab');
              } else if (idx === 1) {
                navigation.navigate('AlignersForTeensScreen');
              } else if (idx === 0) {
                navigation.navigate('Mydent');
              } else if (idx === 3) {
                navigation.navigate('SmilePreview');
              } else {
                navigation.navigate('TeethWhiteningScreen');
              }
            }}
          >
            <Image
              source={doc.img}
              style={styles.image}
              resizeMode="cover"
              fadeDuration={0}
              resizeMethod='resize'
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: Colors.errorBg },
  title: { fontSize: 16, fontWeight: '600' },
  viewAll: { color: Colors.primaryLight },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '30%',
    aspectRatio: 0.8,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    backgroundColor: Colors.cardBg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
