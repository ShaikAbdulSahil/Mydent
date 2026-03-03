/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import BOOK_ICON from '../../assets/static_assets/BOOK_ICON.png';
import SERVICE_CARD_BOOK_2 from '../../assets/static_assets/SERVICE_CARD_BOOK_2.png';
import SERVICE_CARD_BOOK_4 from '../../assets/static_assets/SERVICE_CARD_BOOK_4.png';
import SERVICE_CARD_MY_DENT_AI from '../../assets/static_assets/SERVICE_CARD_MY_DENT_AI.jpg';
import { Colors } from '../constants/Colors';


const services = [
  {
    title: 'Book Appointment',
    image: BOOK_ICON,
  },
  {
    title: 'Instant video Consultation',
    image: SERVICE_CARD_BOOK_2,
  },
  {
    title: 'Visit mydent experience center',
    image: SERVICE_CARD_BOOK_4,
  },
  {
    title: 'Mydent AI',
    image:
      SERVICE_CARD_MY_DENT_AI,
  },
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export default function ServiceCards({ navigation }: any) {
  const handlePress = (item: any) => {
    if (item.title === 'Mydent AI') {
      navigation.navigate('SmilePreview');
    } else if (
      item.title === 'Book Appointment' ||
      item.title === 'Instant Video Consultation'
    ) {
      navigation.navigate('ConsultationOption');
    } else {
      navigation.navigate('CentersTab');
    }
  };

  return (
    <View style={styles.grid}>
      {services.map((item, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.card}
          onPress={() => handlePress(item)}
        >
          {/* <Image source={item.image} style={styles.image} />
           */}
          <View style={{ flex: 1 }} collapsable={false}>
            <Image source={item.image} style={styles.image} fadeDuration={0} resizeMethod='resize' />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    marginTop: 6,
  },
  card: {
    width: CARD_WIDTH * 0.8,
    height: CARD_WIDTH * 1.1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.cardBg,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
});
