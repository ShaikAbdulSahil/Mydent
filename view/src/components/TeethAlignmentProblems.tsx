/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import TEETH_GAPS from '../../assets/static_assets/TEETH_GAPS.png';
import CROOKED_TEETH from '../../assets/static_assets/CROOKED_TEETH.png';
import CROSSBITE from '../../assets/static_assets/CROSSBITE.png';
import OPEN_BITE from '../../assets/static_assets/OPEN_BITE.png';
import OVERBITE from '../../assets/static_assets/OVERBITE.png';
import UNDERBITE from '../../assets/static_assets/UNDERBITE.png';
import { Colors } from '../constants/Colors';



const treatmentItems = [
  {
    img: TEETH_GAPS,
    route: 'teethgaps',
  },
  {
    img: CROOKED_TEETH,
    route: 'crookedteeth',
  },
  {
    img: CROSSBITE,
    route: 'crossbite',
  },
  {
    img: OPEN_BITE,
    route: 'openbite',
  },
  {
    img: OVERBITE,
    route: 'overbite',
  },
  {
    img: UNDERBITE,
    route: 'underbite',
  },
];

export default function TeethAlignmentProblems({ navigation }: any) {
  return (
    <View style={styles.bgColor}>
      <Text style={styles.title}>Understanding teeth alignment problems</Text>
      <View style={styles.treatmentGrid}>
        {treatmentItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.treatmentItem}
            onPress={() =>
              navigation.navigate('HomeTab', {
                screen: 'TeethTreatmentScreen',
                params: { routeKey: item.route },
              })
            }
          >
            <Image
              source={item.img}
              style={styles.treatmentImage}
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
  bgColor: {
    backgroundColor: Colors.primaryBg,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  treatmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  treatmentItem: {
    width: '30%',
    marginBottom: 16,
    alignItems: 'center',
  },
  treatmentImage: {
    width: '100%',
    height: 130,
    aspectRatio: 0.75,
    borderRadius: 8,
    backgroundColor: Colors.borderLight,
  },
});
