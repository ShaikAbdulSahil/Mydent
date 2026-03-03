/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Skeleton from '../components/Skeleton';
import ProductCard from '../components/ProductCard';
import { getFavorites } from '../api/fav-api';
import { useCart } from '../contexts/CartContext';
import { addToCart } from '../api/cart-api';
import { showError, showSuccess } from '../utils/errorAlert';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { Colors } from '../constants/Colors';

type FavoriteItem = {
  _id: string;
  userId: string;
  product: {
    _id: string;
    quantity: number;
  };
};

const screenWidth = Dimensions.get('window').width;
const itemWidth = screenWidth / 2 - 20;

const removeDuplicateProducts = (items: FavoriteItem[]): FavoriteItem[] => {
  const uniqueMap = new Map<string, FavoriteItem>();
  items.forEach((item) => {
    if (!uniqueMap.has(item.product._id)) {
      uniqueMap.set(item.product._id, item);
    }
  });
  return Array.from(uniqueMap.values());
};

const FavProductScreen = () => {
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { requireAuth, isAuthenticated } = useRequireAuth();

  // Show login prompt if guest tries to access favorites
  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.screenBg, padding: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '600', color: Colors.textBody, marginBottom: 12 }}>Login Required</Text>
        <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>
          Please log in to view your favorites
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: Colors.primaryLight, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8 }}
          onPress={() => requireAuth(() => { }, 'Please log in to view your favorites')}
        >
          <Text style={{ color: Colors.textOnPrimary, fontWeight: '600', fontSize: 16 }}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favorites = await getFavorites();
        const uniqueFavorites = removeDuplicateProducts(favorites.data);
        setFavoriteProducts(uniqueFavorites);
      } catch (err) {
        console.error('Failed to load favorite products:', err);
        import('../utils/errorAlert').then(({ showError }) => showError('Unable to fetch favorites.'));
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const { addItems, addProductId } = useCart();

  const handleAddToCart = async (
    product: FavoriteItem['product'],
    quantity: number,
  ) => {
    if (!requireAuth(async () => {
      try {
        await addToCart(product._id, quantity);
        addItems(quantity);
        addProductId(product._id);
        showSuccess('Added to cart');
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || '';
        if (typeof msg === 'string' && msg.toLowerCase().includes('out of stock')) {
          showError('This product is out of stock');
        } else {
          showError('Failed to add to cart');
        }
      }
    }, 'Please log in to add items to your cart')) {
      return;
    }
  };

  const handleToggleFavorite = (productId: string, newState: boolean) => {
    setFavoriteProducts((prev) =>
      prev.filter((favItem) => {
        if (!newState) {
          return favItem.product._id !== productId;
        }
        return true;
      }),
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, padding: 12, backgroundColor: Colors.screenBg }}>
        <Skeleton width={'50%'} height={28} radius={6} style={{ marginBottom: 12 }} />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={{ width: itemWidth, marginBottom: 16 }}>
              <Skeleton width={'100%'} height={120} radius={10} />
              <Skeleton width={'70%'} height={12} style={{ marginTop: 8 }} />
              <Skeleton width={'40%'} height={12} style={{ marginTop: 6 }} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No favorite products found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={<Text style={styles.header}>Your Favorites</Text>}
        data={favoriteProducts}
        keyExtractor={(item) => item.product._id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <ProductCard
            item={item.product}
            style={{ width: itemWidth }}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default FavProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBg,
    paddingHorizontal: 8,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 12,
    color: Colors.textBody,
  },
  list: {
    paddingBottom: 120,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
});
