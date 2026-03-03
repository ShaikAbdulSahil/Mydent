import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import HOSPITAL_ICON from '../../assets/static_assets/HOSPITAL_ICON.png';
import { Colors } from '../constants/Colors';


interface Props {
  onPress: () => void;
}

export default function ClinicVisitCard({ onPress }: Props) {
  return (
    <>
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.row}>
          <Image
            source={HOSPITAL_ICON}
            style={styles.icon}
            resizeMode="contain"
            fadeDuration={0}
            resizeMethod="resize"
          />
          <Text style={styles.text}>Want to Visit Clinic?</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    padding: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    margin: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 32, height: 32, marginRight: 8 },
  text: { fontSize: 16, fontWeight: '600', color: Colors.tealLight },
  arrow: { fontSize: 24, color: Colors.tealLight },
});
