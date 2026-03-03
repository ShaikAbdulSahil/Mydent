/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { showError } from '../utils/errorAlert';
import { showSuccess } from '../utils/successToast';
import Skeleton from '../components/Skeleton';
import { getProductById } from '../api/product-api';
import { addToCart } from '../api/cart-api';
import { useCart } from '../contexts/CartContext';
import { Product } from '../constants/product.type';
import { Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';

const screenWidth = Dimensions.get('window').width;

export default function ProductDetailScreen({ route }: any) {
  const { productId } = route?.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const { addItems, addProductId } = useCart();

  useEffect(() => {
    let mounted = true;
    async function fetchProduct() {
      try {
        setLoading(true);
        const fetchedProduct = await getProductById(productId);
        if (!mounted) return;
        setProduct(fetchedProduct);

        // Prefetch product images (if any)
        const urls: string[] = [];
        if (fetchedProduct?.images) {
          (fetchedProduct.images || []).forEach((u: any) => typeof u === 'string' && u && urls.push(u));
        }

        if (urls.length === 0) {
          setImagesLoaded(true);
        } else {
          Promise.all(urls.map((u) => Image.prefetch(u)))
            .then(() => {
              if (!mounted) return;
              setImagesLoaded(true);
            })
            .catch((e) => {
              console.warn('Product images prefetch failed', e);
              if (mounted) setImagesLoaded(true);
            });
        }
      } catch (error) {
        showError('Failed to load product data.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProduct();
    return () => {
      mounted = false;
    };
  }, [productId]);


  // Render skeleton placeholders while loading product data or images.
  if (loading || !product || !imagesLoaded) {
    // If loading finished but product is null, show not found.
    if (!loading && !product) {
      return (
        <View style={styles.container}>
          <Text>Product not found.</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.container}>
        <Skeleton width={screenWidth} height={400} radius={0} style={{ marginBottom: 12 }} />

        <View style={styles.detailsContainer}>
          <Skeleton width={'60%'} height={24} radius={6} style={{ marginBottom: 8 }} />
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <Skeleton width={60} height={20} radius={6} style={{ marginRight: 8 }} />
            <Skeleton width={60} height={20} radius={6} style={{ marginRight: 8 }} />
            <Skeleton width={60} height={20} radius={6} />
          </View>

          <Skeleton width={'40%'} height={20} radius={6} style={{ marginBottom: 8 }} />
          <Skeleton width={'100%'} height={12} radius={4} style={{ marginBottom: 6 }} />
          <Skeleton width={'100%'} height={12} radius={4} style={{ marginBottom: 6 }} />
          <Skeleton width={'80%'} height={12} radius={4} />
        </View>

        <View style={styles.sectionContainer}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={styles.section}>
              <Skeleton width={'100%'} height={44} radius={8} style={{ marginBottom: 8 }} />
              <Skeleton width={'100%'} height={60} radius={8} />
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <Skeleton width={'100%'} height={48} radius={8} />
        </View>
      </ScrollView>
    );
  }

  const possibleSections: { label: string; key: keyof Product }[] = [
    { label: 'Product Details', key: 'productDetails' },
    { label: 'Benefits', key: 'benefits' },
    { label: 'How to Use', key: 'howToUse' },
    { label: 'Ingredients', key: 'ingredients' },
    { label: 'Caution', key: 'caution' },
    { label: 'Information', key: 'information' },
  ];

  const sections = possibleSections.filter((section) => product[section.key]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );

  const handleAddToCart = async () => {
    try {
      if (!product) return;

      const productId = product._id;

      if (!productId) {
        showError('Product ID is missing');
        return;
      }

      setAdding(true);
      const res = await addToCart(productId, 1);
      addItems(1);
      addProductId(productId);
      // res may contain server message
      const successMsg = res?.message || 'Product added to cart';
      showSuccess(successMsg);
    } catch (error: any) {
      console.error('Add to cart failed:', error);
      const msg = error?.response?.data?.message || error?.message || '';
      if (typeof msg === 'string' && msg.toLowerCase().includes('out of stock')) {
        showError(`${product?.title ?? 'Product'} is out of stock`);
      } else {
        showError('Failed to add product to cart');
      }
    }
    finally {
      setAdding(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {product.images &&
          product.images.map((imgSrc: string, idx: number) => (
            <Image
              key={idx}
              source={{ uri: imgSrc }}
              style={styles.productImage}
              resizeMode="contain"
              fadeDuration={0}
              resizeMethod="resize"
            />
          ))}
      </ScrollView>

      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{product.title}</Text>
        <View style={styles.tags}>
          {product.tags &&
            product.tags.map((tag: string, idx: number) => (
              <Text key={idx} style={styles.tag}>
                {tag}
              </Text>
            ))}
        </View>

        <Text style={styles.price}>
          ₹{product.price}{' '}
          <Text style={styles.strike}>₹{product.originalPrice}</Text>{' '}
          <Text style={styles.discount}>{discount}% off</Text>
        </Text>
        <Text style={styles.description}>{product.description}</Text>
      </View>

      <View style={styles.sectionContainer}>
        {sections.map(({ label, key }) => (
          <View key={label} style={styles.section}>
            <TouchableOpacity
              onPress={() => toggleSection(label)}
              style={[
                styles.sectionHeader,
                expandedSection === label && styles.sectionHeaderActive,
              ]}
            >
              <Text style={styles.sectionTitle}>{label.toLowerCase()}</Text>
              <Text style={styles.plus}>
                {expandedSection === label ? '-' : '+'}
              </Text>
            </TouchableOpacity>
            {expandedSection === label && (
              <View style={styles.sectionContent}>
                <Text style={styles.sectionText}>
                  {product[key] || 'No data available'}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, adding && styles.buttonDisabled]}
        onPress={handleAddToCart}
        disabled={adding}
      >
        {adding ? (
          <Text style={styles.buttonText}>Adding...</Text>
        ) : (
          <Text style={styles.buttonText}>Add to cart</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    paddingBottom: 100,
  },
  productImage: {
    width: screenWidth,
    height: 400,
  },
  detailsContainer: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  tag: {
    backgroundColor: Colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
    fontSize: 12,
  },
  price: { fontSize: 20, fontWeight: 'bold', marginVertical: 8 },
  strike: { textDecorationLine: 'line-through', color: Colors.tabInactive, fontSize: 16 },
  discount: { color: Colors.discount, fontWeight: '600', fontSize: 16 },
  description: { fontSize: 14, color: Colors.textBody, lineHeight: 20 },
  sectionContainer: { paddingHorizontal: 16, marginTop: 16 },
  section: { marginBottom: 12 },
  sectionHeader: {
    backgroundColor: Colors.sectionHeaderBg,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderActive: {
    backgroundColor: Colors.sectionHeaderActiveBg,
  },
  sectionTitle: {
    textTransform: 'lowercase',
    fontWeight: '600',
    fontSize: 15,
    color: Colors.textBody,
  },
  plus: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textBody,
  },
  sectionContent: {
    backgroundColor: Colors.screenBg,
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  sectionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.brandRed,
    margin: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 130,
  },
  buttonText: { color: Colors.textOnBrand, textAlign: 'center', fontSize: 16 },
  buttonDisabled: {
    opacity: 0.7,
  },
});
