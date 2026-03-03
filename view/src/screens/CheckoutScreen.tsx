/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { navigateToScreen } from '../utils/navigationHelpers';
import { Colors } from '../constants/Colors';
import CONSULTANT_IMAGE from '../../assets/static_assets/CONSULTANT_IMAGE.jpg';

export default function CheckoutSummaryScreen({ navigation }: any) {
  const handlePayment = () => {
    navigateToScreen(navigation, 'PaymentScreen', {
      params: { from: 'checkout-summary', amount: 199 },
      parentTab: 'HomeTab',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Image
          source={CONSULTANT_IMAGE}
          style={styles.image}
          resizeMode="cover"
          fadeDuration={0}
          resizeMethod="resize"
        />
        <View style={styles.cardContent}>
          <Text style={styles.title}>video consultation</Text>
          <Text style={styles.subtitle}>teeth alignment</Text>
          <Text style={styles.price}>₹199</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.promoBox}>
        <Text style={styles.promoText}>Promotions</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <View style={styles.priceBox}>
        <View style={styles.priceRow}>
          <Text style={styles.label}>Total (with tax)</Text>
          <Text style={styles.value}>₹ 399</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.label}>Discount on MRP</Text>
          <Text style={[styles.value, { color: Colors.success }]}>–₹ 200</Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Payable Amount</Text>
          <Text style={styles.totalValue}>₹ 199</Text>
        </View>
      </View>

      <Text style={styles.savings}>
        You’ll save ₹ 200 on this order/purchase
      </Text>

      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.payButtonText}>Make Payment</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBg,
    padding: 20,
    paddingBottom: 120,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 80,
    resizeMode: 'cover',
    borderRadius: 8,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: Colors.tabInactive,
    marginVertical: 4,
  },
  price: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  promoBox: {
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  promoText: {
    fontWeight: '500',
    fontSize: 16,
  },
  arrow: {
    fontSize: 24,
    color: Colors.brandRed,
  },
  priceBox: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    fontSize: 15,
    color: Colors.textBody,
  },
  value: {
    fontSize: 15,
    color: Colors.textBody,
  },
  totalRow: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderInput,
    paddingTop: 8,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  savings: {
    textAlign: 'center',
    color: Colors.success,
    marginVertical: 16,
    fontSize: 14,
  },
  payButton: {
    backgroundColor: Colors.brandRed,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payButtonText: {
    color: Colors.textOnBrand,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
