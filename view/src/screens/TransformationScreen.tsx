/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Skeleton from '../components/Skeleton';
import { Colors } from '../constants/Colors';
import { getAllBlogs } from '../api/transformation-api';

export default function TransformationScreen({ navigation }: any) {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await getAllBlogs();
        if (!mounted) return;
        const data = response.data || [];
        setBlogs(data);

        // Prefetch images
        const urls: string[] = [];
        data.forEach((b: any) => {
          if (b?.imageUrl) urls.push(b.imageUrl);
        });

        if (urls.length === 0) {
          if (mounted) setImagesLoaded(true);
        } else {
          Promise.all(urls.map((u) => Image.prefetch(u)))
            .then(() => {
              if (mounted) setImagesLoaded(true);
            })
            .catch((e) => {
              console.warn('Transformation images prefetch failed', e);
              if (mounted) setImagesLoaded(true);
            });
        }
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
        if (mounted) setImagesLoaded(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBlogs();
    return () => {
      mounted = false;
    };
  }, []);

  // Show skeletons while loading data or prefetching images
  if (loading || !imagesLoaded) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Before vs After Treatment</Text>
        <View style={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={styles.card}>
              <Skeleton width={'100%'} height={'100%'} radius={10} />
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Before vs After Treatment</Text>

      {blogs.length === 0 ? (
        <View style={{ padding: 16 }}>
          <Text style={{ color: Colors.textSecondary }}>No transformations available.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {blogs.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.card}
              onPress={() =>
                navigation.navigate('TransformationBlogDetailsScreen', {
                  blog: item,
                })
              }
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                  fadeDuration={0}
                  resizeMethod="resize"
                />
              ) : (
                <View style={[styles.image, { backgroundColor: Colors.skeletonBg }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    paddingBottom: 130,
  },
  content: { padding: 12 },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    aspectRatio: 0.8,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: Colors.cardBg,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
