import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../contexts/UserContext';
import { AuthContext } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
  useNavigation,
  NavigationProp,
  DrawerActions,
} from '@react-navigation/native';
import { navigateToScreen } from '../utils/navigationHelpers';
import { useRequireAuth } from '../hooks/useRequireAuth';
import LOGO_PNG_PREVIEW from '../../assets/static_assets/LOGO_PNG_PREVIEW.png';
import { Colors } from '../constants/Colors';

export default function Navbar() {
  const { user } = useUser();
  const navigation = useNavigation<NavigationProp<any>>();
  const { logout, isGuest } = useContext(AuthContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const { itemsCount } = useCart();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { requireAuth } = useRequireAuth();

  const openMenu = () => setShowProfileMenu(true);
  const closeMenu = () => setShowProfileMenu(false);

  const handleProfile = () => {
    closeMenu();
    navigateToScreen(navigation, 'EditProfile');
  };

  const handleLogin = () => {
    closeMenu();
    logout(); // clears guest mode → navigates to AuthScreen (Login)
  };

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  return (
    <View style={styles.navbarWrapper}>
      {/* Status bar is controlled globally for non-auth in AppNavigation */}
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.greeting}>Hi, {isGuest ? 'Guest' : (user?.firstName || 'there')}</Text>
          <TouchableOpacity onPress={() => navigateToScreen(navigation, 'ClinicMap')}>
            <Text style={styles.location}>Add location ▼</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.icons, styles.menuWrapper]}>
          <Ionicons
            name="heart-outline"
            size={22}
            color={Colors.textBody}
            style={styles.icon}
            onPress={() => {
              requireAuth(
                () => navigateToScreen(navigation, 'FavProductScreen'),
                'Please log in to view your favorites',
              );
            }}
          />
          <Ionicons
            name="notifications-outline"
            size={22}
            color={Colors.textBody}
            style={styles.icon}
          />
          <TouchableOpacity
            onPress={() => setShowProfileMenu((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="person-circle-outline" size={26} color={Colors.textBody} />
          </TouchableOpacity>
        </View>
      </View>

      {showProfileMenu && (
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={closeMenu}>
          <View style={styles.dropdownMenu}>
            {isGuest ? (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={handleLogin}>
                  <View style={styles.menuItemRow}>
                    <Ionicons name="log-in-outline" size={18} color={Colors.primary} />
                    <Text style={[styles.menuItemText, { color: Colors.primary, fontWeight: '600' }]}>
                      Login / Sign Up
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
                  <View style={styles.menuItemRow}>
                    <Ionicons name="person-outline" size={18} color={Colors.textPrimary} />
                    <Text style={styles.menuItemText}>My Profile</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                  <View style={styles.menuItemRow}>
                    <Ionicons name="log-out-outline" size={18} color={Colors.favorite} />
                    <Text style={[styles.menuItemText, { color: Colors.favorite }]}>Logout</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* Filter and Cart Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={24}
            color={Colors.info}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, { position: 'relative' }]}
          onPress={() => {
            requireAuth(
              () => navigateToScreen(navigation, 'CartScreen'),
              'Please log in to view your cart',
            );
          }}
        >
          <Ionicons name="cart-outline" size={22} color={Colors.brandRed} />
          {itemsCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText} numberOfLines={1}>
                {itemsCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Banner Image */}
      <View style={styles.imageContainer}>
        <Image
          source={LOGO_PNG_PREVIEW}
          style={styles.logoImage}
          resizeMode="cover"
          fadeDuration={0}
          resizeMethod="resize"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbarWrapper: {
    backgroundColor: Colors.primaryBg,
    zIndex: 1000,
    elevation: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
  },
  location: {
    fontSize: 11,
    color: Colors.link,
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuWrapper: {
    zIndex: 1,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 52,
    right: 12,
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    paddingVertical: 6,
    minWidth: 160,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  menuItemText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    marginHorizontal: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  iconButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 6,
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: Colors.brandRed,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  cartBadgeText: {
    color: Colors.textOnPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  imageContainer: {
    position: 'absolute',
    top: 30,
    width: '100%',
    alignItems: 'center',
    zIndex: -1,
    pointerEvents: 'none',
  },

  logoImage: {
    width: 180,
    height: undefined,
    aspectRatio: 1080 / 289,
    borderRadius: 10,
    opacity: 0.95, // optional
    pointerEvents: 'none',
  },
});
