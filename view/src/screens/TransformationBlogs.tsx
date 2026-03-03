/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import Skeleton from '../components/Skeleton';
import { Colors } from '../constants/Colors';

export default function TransformationBlogDetailsScreen({ route }: any) {
  const { blog } = route.params || {};
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const prefetch = async () => {
      if (!blog || !blog.imageUrl) {
        // nothing to prefetch
        if (mounted) setImagesLoaded(true);
        return;
      }

      try {
        await Image.prefetch(blog.imageUrl);
        if (mounted) setImagesLoaded(true);
      } catch (e) {
        console.warn('Blog image prefetch failed', e);
        if (mounted) setImagesLoaded(true);
      }
    };

    prefetch();
    return () => {
      mounted = false;
    };
  }, [blog]);

  if (!blog) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Blog not found.</Text>
      </View>
    );
  }

  // Show skeletons until images are prefetched (or immediately if there's no imageUrl)
  if (!imagesLoaded) {
    return (
      <ScrollView style={styles.container}>
        <Skeleton width={'70%'} height={28} radius={6} style={{ marginBottom: 12 }} />
        <Skeleton width={'100%'} height={550} radius={8} style={{ marginBottom: 16 }} />
        <Skeleton width={'100%'} height={14} radius={4} style={{ marginBottom: 8 }} />
        <Skeleton width={'100%'} height={14} radius={4} style={{ marginBottom: 8 }} />
        <Skeleton width={'80%'} height={14} radius={4} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{blog.title}</Text>
      {blog.imageUrl ? (
        <Image
          source={{ uri: blog.imageUrl }}
          style={styles.image}
          resizeMode="contain"
          fadeDuration={0}
          resizeMethod="resize"
        />
      ) : (
        <View style={[styles.image, { backgroundColor: Colors.skeletonBg }]} />
      )}

      <View style={styles.details}>
        <Text style={styles.content}>{blog.description}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    paddingHorizontal: 15,
  },
  image: { width: '100%', height: 550 },
  details: { paddingBottom: 170 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: Colors.favorite,
  },
  content: { fontSize: 16, lineHeight: 24, color: Colors.textBody },
});
