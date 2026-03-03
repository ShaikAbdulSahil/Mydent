/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import React, { useEffect, useState } from 'react';
import {
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import Skeleton from '../components/Skeleton';
import { Colors } from '../constants/Colors';
import { getLatestBlogs } from '../api/blogs-api';

export default function ShowAllBlogsScreen({ navigation }: any) {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await getLatestBlogs();
        if (!mounted) return;
        const data = response.data || [];
        setBlogs(data);

        // Prefetch first image of each blog (if any)
        const urls: string[] = [];
        data.forEach((b: any) => {
          const img = Array.isArray(b.images) && b.images.length > 0 ? b.images[0] : b.images;
          if (typeof img === 'string' && img) urls.push(img);
          else if (img && img.uri) urls.push(img.uri);
        });

        if (urls.length === 0) {
          if (mounted) setImagesLoaded(true);
        } else {
          Promise.all(urls.map((u) => Image.prefetch(u)))
            .then(() => {
              if (mounted) setImagesLoaded(true);
            })
            .catch((e) => {
              console.warn('Blog images prefetch failed', e);
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

  // While loading or prefetching images show skeleton cards
  if (loading || !imagesLoaded) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>All Blogs</Text>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={styles.card}>
            <Skeleton width={'100%'} height={200} radius={0} />
            <Skeleton width={'60%'} height={18} radius={6} style={{ margin: 12 }} />
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>All Blogs</Text>
      {blogs.map((blog) => (
        <TouchableOpacity
          key={blog._id}
          style={styles.card}
          onPress={() => navigation.navigate('BlogScreen', { blog })}
        >
          {blog?.images && blog.images.length > 0 ? (
            (() => {
              const raw = Array.isArray(blog.images) ? blog.images[0] : blog.images;
              const uri = typeof raw === 'string' ? raw : raw && (raw.uri || raw.imageUrl) ? (raw.uri || raw.imageUrl) : undefined;
              return uri ? (
                <Image source={{ uri }} style={styles.image} fadeDuration={0} resizeMethod="resize" />
              ) : (
                <View style={[styles.image, { backgroundColor: Colors.skeletonBg }]} />
              );
            })()
          ) : (
            <View style={[styles.image, { backgroundColor: Colors.skeletonBg }]} />
          )}
          <Text style={styles.title}>{blog.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.cardBg,
    paddingBottom: 120,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.favorite,
  },
  card: {
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: Colors.screenBg,
    overflow: 'hidden',
    elevation: 1,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 14,
    padding: 8,
    color: Colors.textBody,
    fontWeight: '500',
  },
});
