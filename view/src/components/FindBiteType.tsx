/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

import VIDEO_1 from '../../assets/static_assets/VIDEO_1.png';
import VIDEO_2 from '../../assets/static_assets/VIDEO_2.png';
import VIDEO_3 from '../../assets/static_assets/VIDEO_3.png';
import VIDEO_4 from '../../assets/static_assets/VIDEO_4.png';
import VIDEO_5 from '../../assets/static_assets/VIDEO_5.png';
import VIDEO_6 from '../../assets/static_assets/VIDEO_6.png';
import VIDEO_7 from '../../assets/static_assets/VIDEO_7.png';
import { Colors } from '../constants/Colors';


const categories = [
  { title: 'Under bite', img: VIDEO_1 },
  { title: 'Open bite', img: VIDEO_2 },
  { title: 'Crooked teeth', img: VIDEO_3 },
  { title: 'Gap teeth', img: VIDEO_4 },
  { title: 'Deep bite', img: VIDEO_5 },
  { title: 'Cross bite', img: VIDEO_6 },
  {
    title: 'Forwardly placed teeth',
    img: VIDEO_7,
  },
];

export default function FindBiteType({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find your bite type</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('FindBiteTypeScreen')}
        >
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.item}
            onPress={() =>
              navigation.navigate('BiteTypeVideosScreen', { title: item.title })
            }
          >
            <Image
              source={item.img}
              style={styles.image}
              fadeDuration={0}
              resizeMethod="resize"
            />
            <Text style={styles.itemText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: '600' },
  viewAll: { color: Colors.primaryLight },
  item: { alignItems: 'center', marginRight: 16 },
  image: { width: 50, height: 50, borderRadius: 25, marginBottom: 4 },
  itemText: { marginTop: 4, fontSize: 12 },
});
