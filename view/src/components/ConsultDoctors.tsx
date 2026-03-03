/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { getExperts } from '../api/expert-api';
import Skeleton from './Skeleton';
import { Colors } from '../constants/Colors';

interface Expert {
  _id: string;
  imageUrl: string;
  title: string;
}

export default function DoctorCard() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const { data } = await getExperts();
        setExperts(data);
        const urls = (data || []).map((d: any) => d.imageUrl).filter(Boolean);
        if (urls.length === 0) {
          setImagesLoaded(true);
        } else {
          Promise.all(urls.map((u: string) => Image.prefetch(u)))
            .then(() => setImagesLoaded(true))
            .catch((e) => {
              console.warn('Image prefetch failed for experts', e);
              setImagesLoaded(true);
            });
        }
      } catch (error) {
        console.error('Failed to fetch experts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, []);

  const renderItem = ({ item }: { item: Expert }) => (
    <TouchableOpacity style={styles.card}>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image} fadeDuration={0}
          resizeMethod="resize"
        />
      ) : (
        <View style={[styles.image, { backgroundColor: Colors.skeletonBg }]} />
      )}
      <Text style={styles.name} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Our Experts</Text>
      <Text style={styles.sectionSubtitle}>
        Behind every smile is a team of trusted specialists - meet our
        superstars.
      </Text>

      {loading || !imagesLoaded ? (
        <FlatList
          data={Array.from({ length: 4 })}
          renderItem={() => (
            <View style={styles.card}>
              <Skeleton width={'100%'} height={190} radius={12} />
              <Skeleton style={{ marginTop: 8, width: '60%', height: 12 }} />
            </View>
          )}
          keyExtractor={(_, i) => String(i)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        />
      ) : (
        <FlatList
          data={experts}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.favorite,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textBody,
    marginBottom: 12,
  },
  scrollContainer: {
    paddingVertical: 4,
  },
  card: {
    width: 200,
    height: 200,
    marginRight: 12,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: 190,
    resizeMode: 'cover',
  },
  name: {
    padding: 8,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
