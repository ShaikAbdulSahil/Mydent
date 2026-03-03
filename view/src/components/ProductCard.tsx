import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useFavorites } from '../contexts/FavContext';
import { useCart } from '../contexts/CartContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { Colors } from '../constants/Colors';

const ProductCard = ({ item, onAddToCart, onToggleFavorite, style }: any) => {
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { favorites, toggleFavorite } = useFavorites();
  const { cartProductIds } = useCart();
  const { requireAuth } = useRequireAuth();

  useEffect(() => {
    // React instantly to context changes without extra API call
    const exists = cartProductIds.has(String(item?._id));
    setIsAdded(exists);
  }, [item?._id, cartProductIds]);
  // no direct badge updates here; CartScreen handles confirmed changes

  const isFavorite = favorites.some((fav: any) => fav.product._id === item._id);

  const discount =
    item.originalPrice && item.originalPrice > item.price
      ? Math.round(
        ((item.originalPrice - item.price) / item.originalPrice) * 100,
      )
      : 0;

  const handleAdd = () => {
    if (!requireAuth(() => {
      setIsAdded(true);
      onAddToCart(item, quantity);
    }, 'Please log in to add items to your cart')) {
      return;
    }
  };

  const increment = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    onAddToCart(item, newQty);
  };

  const decrement = () => {
    const newQty = quantity > 1 ? quantity - 1 : 1;
    setQuantity(newQty);
    onAddToCart(item, newQty);
    // Cart badge updates on confirmed API in CartScreen
  };

  const handleFavoriteToggle = () => {
    if (!requireAuth(() => {
      toggleFavorite(item._id, !isFavorite);
      if (onToggleFavorite) {
        onToggleFavorite(item._id, !isFavorite);
      }
    }, 'Please log in to save favorites')) {
      return;
    }
  };

  // 👇 FIX: Safely extract the image source (Handle Array vs Single)
  const rawImage = Array.isArray(item.images) && item.images.length > 0
    ? item.images[0]
    : item.images;

  // 👇 FIX: Determine format (Local Number vs Remote String)
  const imageSource = typeof rawImage === 'string'
    ? { uri: rawImage }
    : rawImage;

  return (
    <View style={[styles.card, { margin: 4 }, style]}>
      <TouchableOpacity style={styles.heartIcon} onPress={handleFavoriteToggle}>
        <IconButton
          icon={isFavorite ? 'heart' : 'heart-outline'}
          size={24}
          iconColor={isFavorite ? Colors.favorite : Colors.favoriteInactive}
        />
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        <Image
          // 👇 USE THE SAFE SOURCE HERE
          source={imageSource}
          style={styles.cardImage}
          resizeMode="contain"
          fadeDuration={0}
          resizeMethod="resize"
        />
        {item.bestSeller && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>BEST SELLER</Text>
          </View>
        )}
      </View>

      <Text style={styles.cardName} numberOfLines={1} ellipsizeMode="tail">
        {item.title}
      </Text>

      <View style={styles.priceRow}>
        <Text style={styles.cardPrice}>₹{item.price}</Text>
        {item.originalPrice && item.originalPrice > item.price && (
          <>
            <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
            <Text style={styles.discount}>{discount}% off</Text>
          </>
        )}
      </View>

      {!isAdded ? (
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addText}>ADD TO CART</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.addButton, styles.addedButton]} disabled>
          <Text style={styles.addedText}>ADDED TO CART</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  // ... keep your existing styles ...
  card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: Colors.cardBg,
    elevation: 2,
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginTop: 10,
  },
  cardImage: {
    width: 120,
    height: 100,
    resizeMode: 'contain',
  },
  heartIcon: {
    position: 'absolute',
    top: -8,
    right: -6,
    zIndex: 2,
  },
  badge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: Colors.ratingBadge,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  cardName: {
    marginTop: 6,
    fontWeight: '600',
    fontSize: 14,
    height: 20,
    overflow: 'hidden',
    textAlign: 'center',
    alignSelf: 'center',
    width: 140,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
    marginLeft: 6,
  },
  discount: {
    fontSize: 12,
    color: Colors.discount,
    marginLeft: 6,
  },
  addButton: {
    marginTop: 10,
    backgroundColor: Colors.brandRed,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  addText: {
    color: Colors.textOnBrand,
    fontWeight: 'bold',
  },
  addedButton: {
    backgroundColor: Colors.success,
  },
  addedText: {
    color: Colors.textOnPrimary,
    fontWeight: 'bold',
  },
});