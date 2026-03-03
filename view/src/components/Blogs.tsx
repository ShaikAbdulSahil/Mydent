/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { getLatestBlogs } from '../api/blogs-api';
import Skeleton from './Skeleton';
import { Colors } from '../constants/Colors';


export default function Blogs({ navigation }: any) {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await getLatestBlogs();
        setBlogs(response.data);
        const urls = (response.data || []).slice(0, 6).map((b: any) => b.images?.[0]).filter(Boolean);
        if (urls.length === 0) {
          setImagesLoaded(true);
        } else {
          Promise.all(urls.map((u: string) => Image.prefetch(u)))
            .then(() => setImagesLoaded(true))
            .catch((e) => {
              console.warn('Image prefetch failed for blogs', e);
              setImagesLoaded(true);
            });
        }
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      }
    };

    fetchBlogs();
  }, []);

  const handlePress = (blog: any) => {
    navigation.navigate('BlogScreen', { blog });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Latest Blogs</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('ShowAllBlogsScreen')}
        >
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionSubtitle}>
        Tips & info about your smile journey
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {(blogs.length === 0 || !imagesLoaded) ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <View key={idx} style={styles.card}>
              <Skeleton width={'100%'} height={110} radius={12} />
              <Skeleton style={{ marginTop: 8, width: '80%', height: 12 }} />
              <Skeleton style={{ marginTop: 6, width: '60%', height: 12 }} />
            </View>
          ))
        ) : (
          blogs.map((blog) => (
            <TouchableOpacity
              key={blog._id}
              style={styles.card}
              onPress={() => handlePress(blog)}
            >
              {blog.images && blog.images[0] ? (
                <Image source={{ uri: blog.images[0] }} style={styles.image} fadeDuration={0} resizeMethod="resize" />
              ) : (
                <View style={[styles.image, { backgroundColor: Colors.skeletonBg }]} />
              )}
              <Text style={styles.title} numberOfLines={3}>
                {blog.title}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
    height: 180,
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
    height: 110,
    resizeMode: 'cover',
  },
  title: {
    padding: 8,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  viewAll: {
    fontSize: 13,
    color: Colors.primaryLight,
    fontWeight: 'bold',
  },
});
