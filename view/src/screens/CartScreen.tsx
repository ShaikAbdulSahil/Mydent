/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { showError } from '../utils/errorAlert';
import Skeleton from '../components/Skeleton';
import {
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from '../api/cart-api';
import { useCart } from '../contexts/CartContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { Colors } from '../constants/Colors';

type CartItem = {
  _id: string;
  quantity: number;
  product: {
    _id: string;
    title: string;
    price: number;
    quantity?: number;
  };
};

export default function CartScreen({ navigation }: any) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { totalAmount, setTotalAmount, addItems, removeItem, removeItems, removeProductId, clearProductIds, itemsCount } = useCart();
  const { requireAuth, isAuthenticated } = useRequireAuth();

  // Show login prompt if guest tries to access cart
  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.screenBg, padding: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '600', color: Colors.textBody, marginBottom: 12 }}>Login Required</Text>
        <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>
          Please log in to view your cart
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: Colors.primaryLight, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8 }}
          onPress={() => requireAuth(() => { }, 'Please log in to view your cart')}
        >
          <Text style={{ color: Colors.textOnPrimary, fontWeight: '600', fontSize: 16 }}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await getCart();
      setCartItems(response.data);
    } catch (error) {
      showError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const onUpdateQuantity = async (id: string, quantity: number) => {
    // Determine delta before optimistic update
    const prevItem = cartItems.find((ci) => ci._id === id);
    const prevQty = prevItem ? prevItem.quantity : 0;
    const delta = quantity - prevQty;

    // Optimistically update UI only (badge updates after success)
    setCartItems((prev) => prev.map((ci) => (ci._id === id ? { ...ci, quantity } : ci)));
    try {
      await updateCartItem(id, quantity);
      // Update badge counts based on confirmed delta
      if (delta > 0) {
        addItems(delta);
      } else if (delta < 0) {
        removeItems(Math.abs(delta));
      }
      // Refresh to ensure server truth
      fetchCart();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to update item. Please try again.';
      showError(message);
      // Revert by refetching
      fetchCart();
    }
  };

  const incrementItem = (item: CartItem) => {
    const newQty = item.quantity + 1;
    onUpdateQuantity(item._id, newQty);
  };

  const decrementItem = (item: CartItem) => {
    if (item.quantity <= 1) return;
    const newQty = item.quantity - 1;
    onUpdateQuantity(item._id, newQty);
  };

  const onRemoveItem = async (id: string, quantity: number, productId?: string) => {
    // Optimistically update UI and badge
    removeItems(quantity);
    setCartItems((prev) => prev.filter((ci) => ci._id !== id));
    if (productId) removeProductId(productId);
    try {
      await removeCartItem(id);
      fetchCart();
    } catch {
      showError('Failed to remove item');
      // Revert by refetching
      fetchCart();
    }
  };

  useEffect(() => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0,
    );
    setTotalAmount(total);
  }, [cartItems]);

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.productTitle}>{item.product.title}</Text>
        <Text style={styles.productPrice}>
          ₹{(item.product.price * item.quantity).toFixed(2)}
        </Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity
            onPress={() => decrementItem(item)}
            disabled={item.quantity <= 1}
            style={[styles.qtyButtonContainer, item.quantity <= 1 && styles.disabledButton]}
          >
            <Text style={styles.qtyButtonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.qtyText}>{item.quantity}</Text>

          <TouchableOpacity
            onPress={() => incrementItem(item)}
            disabled={item.product.quantity != null && item.quantity >= item.product.quantity}
            style={[
              styles.qtyButtonContainer,
              item.product.quantity != null && item.quantity >= item.product.quantity && styles.disabledButton,
            ]}
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => onRemoveItem(item._id, item.quantity, (item as any)?.product?._id)}>
        <Text style={styles.remove}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading)
    return (
      <View style={{ flex: 1, padding: 16, backgroundColor: Colors.screenBg }}>
        <Skeleton width={'60%'} height={28} radius={6} style={{ marginBottom: 16 }} />

        {Array.from({ length: 3 }).map((_, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Skeleton width={'70%'} height={14} radius={6} style={{ marginBottom: 8 }} />
              <Skeleton width={'40%'} height={12} radius={6} />
            </View>

            <View style={{ width: 80, alignItems: 'flex-end' }}>
              <Skeleton width={60} height={14} radius={6} />
            </View>
          </View>
        ))}

        <View style={{ marginTop: 20 }}>
          <Skeleton width={'50%'} height={20} radius={6} style={{ marginBottom: 10 }} />
          <Skeleton width={'100%'} height={44} radius={8} />
        </View>
      </View>
    );

  if (!cartItems.length)
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>🛒 Your cart is empty</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
        <Text style={styles.heading}>🛒 Cart</Text>

        {cartItems.map((item) => (
          <React.Fragment key={item._id}>{renderItem({ item })}</React.Fragment>
        ))}

        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={async () => {
              // Optimistic clear: reset local list, badge, and product IDs
              setCartItems([]);
              if (itemsCount > 0) removeItems(itemsCount);
              clearProductIds();
              try {
                await clearCart();
              } finally {
                fetchCart();
              }
            }}
          >
            <Text style={styles.clearText}>Clear Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() =>
              navigation.navigate('HomeTab', {
                screen: 'PaymentScreen',
                params: {
                  from: 'cart',
                  amount: totalAmount,
                },
              })
            }
          >
            <Text style={styles.checkoutText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButtonContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primaryLight,
    lineHeight: 20,
  },
  disabledButton: {
    opacity: 0.4,
  },
  qtyText: {
    fontSize: 16,
    marginHorizontal: 12,
    fontWeight: '700',
    color: Colors.textBody,
  },
  remove: {
    color: Colors.error,
    fontSize: 14,
  },
  summaryContainer: {
    padding: 16,
    marginTop: 16,
    backgroundColor: Colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primaryLight,
  },
  clearButton: {
    backgroundColor: Colors.error,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  clearText: {
    color: Colors.textOnPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkoutButton: {
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutText: {
    color: Colors.textOnPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: Colors.tabInactive,
  },
});
