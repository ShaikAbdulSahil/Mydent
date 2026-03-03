/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

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
import { Colors } from '../constants/Colors';
import { getAllBlogs } from '../api/transformation-api';


export default function Transformation({ navigation }: any) {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchBlogs = async () => {
      try {
        const response = await getAllBlogs();
        if (!mounted) return;
        setBlogs(response.data);

        const urls = (response.data || []).slice(0, 4).map((b: any) => b.imageUrl).filter(Boolean);
        if (urls.length === 0) {
          setImagesLoaded(true);
        } else {
          Promise.all(urls.map((u: string) => Image.prefetch(u)))
            .then(() => mounted && setImagesLoaded(true))
            .catch((e) => {
              console.warn('Image prefetch failed for transformation blogs', e);
              mounted && setImagesLoaded(true);
            });
        }
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
        setImagesLoaded(true);
      } finally {
        mounted && setLoading(false);
      }
    };

    fetchBlogs();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Transformations</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('TransformationScreen')}
        >
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionSubtitle}>
        Tips & info about your smile journey
      </Text>

      {loading || !imagesLoaded ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollRow}
        >
          {Array.from({ length: 4 }).map((_, idx) => (
            <View key={idx} style={styles.card}>
              <Skeleton width={'100%'} height={220} radius={12} />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollRow}
        >
          {blogs.slice(0, 4).map((item, idx) => (
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
        </ScrollView>
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
    marginBottom: 8,
  },
  headerRight: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  viewAll: {
    fontSize: 13,
    color: Colors.primaryLight,
    fontWeight: '500',
  },
  scrollRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  card: {
    width: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: Colors.cardBg,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 220,
  },
  cardFooter: {
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
});
