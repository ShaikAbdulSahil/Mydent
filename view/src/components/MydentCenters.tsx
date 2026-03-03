/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Skeleton from './Skeleton';
import { getCenters } from '../api/centers-api';
import { Colors } from '../constants/Colors';


export default function MydentCenters({ navigation }: any) {
  const [centers, setCenters] = useState<
    { cityName: string; imageUrl: string; _id: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    setLoading(true);
    let mounted = true;
    getCenters()
      .then((res) => {
        if (!mounted) return;
        setCenters(res.data);

        const urls = (res.data || []).map((c: any) => c.imageUrl).filter(Boolean);
        if (urls.length === 0) {
          setImagesLoaded(true);
          return;
        }

        // Prefetch images and only stop loading once they are ready
        Promise.all(urls.map((u: string) => Image.prefetch(u)))
          .then(() => {
            if (mounted) setImagesLoaded(true);
          })
          .catch((e) => {
            console.warn('Image prefetch failed for centers', e);
            if (mounted) setImagesLoaded(true);
          });
      })
      .catch((err) => {
        console.error('Failed to fetch centers:', err);
        setImagesLoaded(true);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mydent Centers</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CentersTab')}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {loading || !imagesLoaded ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {Array.from({ length: 6 }).map((_, idx) => (
            <View key={idx} style={styles.item}>
              <Skeleton width={70} height={70} radius={35} />
              <Skeleton style={{ marginTop: 8, width: 60, height: 10 }} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {centers.map((center) => (
            <TouchableOpacity
              key={center._id}
              style={styles.item}
              onPress={() =>
                navigation.navigate('CentersTab', {
                  selectedCity: center.cityName,
                })
              }
            >
              {center.imageUrl ? (
                <Image
                  source={{ uri: center.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                  fadeDuration={0}
                  resizeMethod="resize"
                />
              ) : (
                <View style={[styles.image, { backgroundColor: Colors.skeletonBg }]} />
              )}
              <Text style={{ marginTop: 4 }}>{center.cityName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: Colors.cardBg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  item: {
    alignItems: 'center',
    marginRight: 12,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.skeletonBg,
  },
  viewAll: {
    fontSize: 14,
    color: Colors.primaryLight,
    fontWeight: '500',
  },
});
