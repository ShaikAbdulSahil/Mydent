/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { showError } from '../utils/errorAlert';
import Carousel from '../components/Carousel';
import Skeleton from '../components/Skeleton';
import { showSuccess } from '../utils/successToast';
import { addToCart } from '../api/cart-api';
import { useCart } from '../contexts/CartContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import FeatureStats from '../components/FeatureStats';
import { getCarousels } from '../api/carousel-api';
import { normalizeScreenName } from '../utils/navigationHelpers';
import { getAllProducts } from '../api/product-api';
import ProductCard from '../components/ProductCard';
import {
  addToFavorite,
  getFavorites,
  removeFavoriteItem,
} from '../api/fav-api';
import { useFocusEffect } from '@react-navigation/native';
import { CarouselItem } from './Home';
import BANNER_1 from '../../assets/static_assets/BANNER_1.png';
import AD_BANNER from '../../assets/static_assets/AD_BANNER.png';
import BANNER_3 from '../../assets/static_assets/BANNER_3.png';
import { Colors } from '../constants/Colors';

const ad1 = BANNER_1;
const ad2 = AD_BANNER;
const ad3 = BANNER_3;
export default function EComScreen({ navigation }: any) {
  const [topCarousel, setTopCarousel] = useState<CarouselItem[]>([]);
  const [middleCarousel, setMiddleCarousel] = useState<CarouselItem[]>([]);
  const [bottomCarousel, setBottomCarousel] = useState<CarouselItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [carouselImagesLoaded, setCarouselImagesLoaded] = useState(false);

  const bestSellers = categories.filter((p) => p.bestSeller);
  const combos = categories.filter((p) => p.combos);
  const recommended = categories.filter((p) => p.recommended);

  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    React.useCallback(() => {
      // 👇 Scroll to top on tab focus
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  const sections = [
    {
      title: 'Best Selling',
      data: bestSellers,
      ad: ad1,
    },
    {
      title: 'Save Big With Combos',
      data: combos,
      ad: ad2,
    },
    {
      title: 'Recommended For You',
      data: recommended,
      ad: ad3,
    },
  ].filter((section) => section.data.length > 0); // Avoid empty sections

  useEffect(() => {
    const fetchCarousels = async () => {
      try {
        const res = await getCarousels();
        setTopCarousel(
          res.data.shop.topCarousel.map((img: any) => ({
            uri: img.imageUrl,
            type: img.type,
            group: 'shop',
            tab: img.tabName || 'Home',
            navigateTo: normalizeScreenName(img.screenName) || 'DefaultScreen',
          })),
        );

        setMiddleCarousel(
          res.data.shop.middleCarousel.map((img: any) => ({
            uri: img.imageUrl,
            type: img.type,
            group: 'shop',
            tab: img.tabName || 'Home',
            navigateTo: normalizeScreenName(img.screenName) || 'DefaultScreen',
          })),
        );
        setBottomCarousel(
          res.data.shop.bottomCarousel.map((img: any) => ({
            uri: img.imageUrl,
            type: img.type,
            group: 'shop',
            tab: img.tabName || 'Home',
            navigateTo: normalizeScreenName(img.screenName) || 'DefaultScreen',
          })),
        );
        // Prefetch carousel images
        const urls: string[] = [];
        (res.data.shop.topCarousel || []).forEach((i: any) => i.imageUrl && urls.push(i.imageUrl));
        (res.data.shop.middleCarousel || []).forEach((i: any) => i.imageUrl && urls.push(i.imageUrl));
        (res.data.shop.bottomCarousel || []).forEach((i: any) => i.imageUrl && urls.push(i.imageUrl));
        if (urls.length === 0) {
          setCarouselImagesLoaded(true);
        } else {
          Promise.all(urls.map((u) => Image.prefetch(u)))
            .then(() => setCarouselImagesLoaded(true))
            .catch((e) => {
              console.warn('Carousel prefetch failed', e);
              setCarouselImagesLoaded(true);
            });
        }
      } catch (error) {
        console.error('Failed to load carousels:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const products = await getAllProducts();
        setCategories(products);
        // Prefetch product images (first image of each product)
        const prodUrls: string[] = [];
        (products || []).forEach((p: any) => {
          const rawImage = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : p.images;
          if (typeof rawImage === 'string' && rawImage) prodUrls.push(rawImage);
        });
        if (prodUrls.length === 0) {
          setImagesLoaded(true);
        } else {
          Promise.all(prodUrls.map((u: string) => Image.prefetch(u)))
            .then(() => setImagesLoaded(true))
            .catch((e) => {
              console.warn('Product images prefetch failed', e);
              setImagesLoaded(true);
            });
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };

    const fetchFavorites = async () => {
      try {
        const favRes = await getFavorites();
        setFavorites(favRes.data.map((item: any) => item.productId));
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      }
    };

    fetchCarousels();
    fetchProducts();
    fetchFavorites();
  }, []);

  // We no longer short-circuit render the whole screen while loading.
  // Instead we show skeletons in-place until data and images are ready.

  const { addItems, addProductId } = useCart();
  const { requireAuth } = useRequireAuth();

  const handleToggleFavorite = async (productId: string, newState: boolean) => {
    if (!requireAuth(async () => {
      try {
        if (newState) {
          await addToFavorite(productId);
          setFavorites((prev) => [...prev, productId]);
        } else {
          await removeFavoriteItem(productId);
          setFavorites((prev) => prev.filter((id) => id !== productId));
        }
      } catch (error) {
        console.error('Failed to update favorite:', error);
      }
    }, 'Please log in to save favorites')) {
      return;
    }
  };

  const handleAddToCart = async (product: any, quantity: number) => {
    if (!requireAuth(async () => {
      try {
        if (!product || !product._id) {
          showError('Product ID is missing');
          return;
        }
        await addToCart(product._id, quantity);
        addItems(quantity);
        addProductId(product._id);
        showSuccess(`${product.title} added to cart`);
      } catch (error: any) {
        const msg = error?.response?.data?.message || error?.message || '';
        if (typeof msg === 'string' && msg.toLowerCase().includes('out of stock')) {
          showError(`${product.title} is out of stock`);
        } else {
          showError('Failed to add product to cart');
        }
      }
    }, 'Please log in to add items to your cart')) {
      return;
    }
  };

  return (
    <ScrollView style={styles.container} ref={scrollRef}>
      <Text style={styles.header}>Oral Care Categories</Text>

      {/* CATEGORIES GRID */}
      {!imagesLoaded ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View key={i} style={styles.item}>
              <View style={styles.imageWrapper}>
                <Skeleton width={'70%'} height={'70%'} radius={12} />
              </View>
              <Skeleton width={'80%'} height={12} radius={4} style={{ marginTop: 6 }} />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={categories}
          numColumns={4}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const rawImage = Array.isArray(item.images) && item.images.length > 0
              ? item.images[0]
              : item.images;

            const imageSource = typeof rawImage === 'string' ? { uri: rawImage } : rawImage;

            return (
              <TouchableOpacity
                style={styles.item}
                onPress={() =>
                  navigation.navigate('ProductDetailScreen', {
                    productId: item._id,
                  })
                }
              >
                <View style={styles.imageWrapper}>
                  {imageSource ? (
                    <Image
                      source={imageSource}
                      style={styles.icon}
                      fadeDuration={0}
                      resizeMethod="resize"
                    />
                  ) : (
                    <View style={[styles.icon, { backgroundColor: Colors.skeletonBg, borderRadius: 8 }]} />
                  )}
                </View>
                <Text style={styles.label}>{item.title || item.name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* TOP CAROUSEL */}
      {topCarousel.length > 0 ? (
        carouselImagesLoaded ? (
          <Carousel images={topCarousel} />
        ) : (
          <Skeleton width={'100%'} height={180} radius={10} style={{ marginVertical: 8 }} />
        )
      ) : null}

      {/* SECTIONS */}
      {sections.map((section) => (
        <View key={section.title} style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {!imagesLoaded ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} style={{ width: 160, marginRight: 12 }}>
                  <Skeleton width={'100%'} height={140} radius={8} />
                  <Skeleton width={'80%'} height={12} radius={4} style={{ marginTop: 8 }} />
                  <Skeleton width={'60%'} height={12} radius={4} style={{ marginTop: 6 }} />
                </View>
              ))}
            </ScrollView>
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={section.data}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <ProductCard
                  item={item}
                  onAddToCart={(product: any, quantity: number) =>
                    handleAddToCart(product, quantity)
                  }
                  onToggleFavorite={() =>
                    handleToggleFavorite(item._id, !favorites.includes(item._id))
                  }
                />
              )}
              contentContainerStyle={styles.horizontalList}
            />
          )}
        </View>
      ))}

      {/* MIDDLE CAROUSEL */}
      {middleCarousel.length > 0 ? (
        carouselImagesLoaded ? (
          <Carousel images={middleCarousel} />
        ) : (
          <Skeleton width={'100%'} height={140} radius={10} style={{ marginVertical: 8 }} />
        )
      ) : null}

      {bottomCarousel.length > 0 ? (
        carouselImagesLoaded ? (
          <Carousel images={bottomCarousel} />
        ) : (
          <Skeleton width={'100%'} height={140} radius={10} style={{ marginVertical: 8 }} />
        )
      ) : null}
      <FeatureStats />
      {/* BOTTOM CAROUSEL at end */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: Colors.cardBg,
  },

  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  grid: {
    justifyContent: 'center',
  },
  item: {
    width: '22%',
    margin: '1.5%',
    alignItems: 'center',
  },
  imageWrapper: {
    backgroundColor: Colors.categoryBg,
    borderRadius: 12,
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  icon: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
  label: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 12,
  },
  sectionWrapper: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 13,
    color: Colors.primaryLight,
  },
  horizontalList: {
    paddingHorizontal: 0,
    justifyContent: 'center',
    gap: 12,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
