/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import Skeleton from '../components/Skeleton';
import { Colors } from '../constants/Colors';

const BlogScreen = ({ route }: any) => {
  const { blog } = route.params || {};
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const prefetchImages = async () => {
      if (!blog || !blog.images || blog.images.length === 0) {
        if (mounted) setImagesLoaded(true);
        return;
      }

      const urls: string[] = [];
      blog.images.forEach((img: any) => {
        if (typeof img === 'string') urls.push(img);
        else if (img && img.uri) urls.push(img.uri);
      });

      if (urls.length === 0) {
        if (mounted) setImagesLoaded(true);
        return;
      }

      try {
        await Promise.all(urls.map((u) => Image.prefetch(u)));
        if (mounted) setImagesLoaded(true);
      } catch (e) {
        console.warn('Blog images prefetch failed', e);
        if (mounted) setImagesLoaded(true);
      }
    };

    prefetchImages();
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

  // Show skeletons until images are prefetched (or immediately if there are no images)
  if (!imagesLoaded) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Skeleton width={'80%'} height={28} radius={6} style={{ marginBottom: 8 }} />
          <Skeleton width={'50%'} height={14} radius={4} style={{ marginBottom: 6 }} />
          <Skeleton width={'30%'} height={14} radius={4} style={{ marginBottom: 12 }} />
        </View>

        <View style={styles.content}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={styles.contentItem}>
              <Skeleton width={'100%'} height={14} radius={4} style={{ marginBottom: 8 }} />
              {i % 2 === 0 && <Skeleton width={'100%'} height={200} radius={8} style={{ marginBottom: 8 }} />}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  // Split content into paragraphs and filter out empty ones to avoid gaps
  const paragraphs = blog.content.split('\n').filter((p: string) => p.trim().length > 0);

  // Create an array of content blocks, alternating between text and images
  const contentArray: { type: string; content: any }[] = [];
  let imageIndex = 0;
  let paragraphCount = 0;

  // CONFIG: Insert an image every 3 paragraphs
  const PARAGRAPHS_PER_IMAGE = 3;

  paragraphs.forEach((paragraph: any, index: number) => {
    contentArray.push({ type: 'text', content: paragraph });
    paragraphCount++;

    // Insert image if we hit the count OR if it's the last paragraph and we still have images left
    if (
      (paragraphCount >= PARAGRAPHS_PER_IMAGE || index === paragraphs.length - 1) &&
      imageIndex < blog.images.length
    ) {
      const imageSource = blog.images[imageIndex];
      // Safety check to ensure imageSource exists before pushing
      if (imageSource) {
        contentArray.push({ type: 'image', content: imageSource });
        imageIndex++;
      }
      paragraphCount = 0; // Reset paragraph counter after adding an image
    }
  });

  // FINAL CHECK: If there are still images left after all text is processed, append them at the end
  while (imageIndex < blog.images.length) {
    const imageSource = blog.images[imageIndex];
    if (imageSource) {
      contentArray.push({ type: 'image', content: imageSource });
    }
    imageIndex++;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>{blog.title}</Text>
        <Text style={styles.date}>
          By {blog.author} | {blog.date}
        </Text>
        <Text style={styles.category}>{blog.category}</Text>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {contentArray.map((item, index) => (
          <View key={index} style={styles.contentItem}>
            {item.type === 'text' ? (
              <Text style={styles.contentText}>{item.content}</Text>
            ) : (
              <Image
                // Check if content is string (URL) or number (local asset)
                source={typeof item.content === 'string' ? { uri: item.content } : item.content}
                style={styles.image}
                fadeDuration={0}
                resizeMethod="resize"
              />
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 130,
    marginBottom: 110,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: Colors.tabInactive,
    marginVertical: 4,
  },
  category: {
    fontSize: 16,
    fontStyle: 'italic',
    marginVertical: 8,
  },
  content: {
    marginBottom: 16,
  },
  contentItem: {
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 8,
  },
});

export default BlogScreen;