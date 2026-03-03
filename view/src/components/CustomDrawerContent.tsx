/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import React from 'react';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../contexts/UserContext';
import { AuthContext } from '../contexts/AuthContext';
import EditProfileForm from './EditUserDetails';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MYDENT_LOGO from '../../assets/static_assets/LOGO_PNG_PREVIEW.png';
import CONSULTANT_IMAGE from '../../assets/static_assets/CONSULTANT_IMAGE.jpg';
import { Colors } from '../constants/Colors';

export default function CustomDrawerContent(props: any) {
  const { user, setUser } = useUser();
  const { isGuest, logout } = React.useContext(AuthContext);

  const iconColor = Colors.brandRed;

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image
          source={MYDENT_LOGO}
          style={styles.logo}
          fadeDuration={0}
          resizeMethod="resize"
        />
      </View>
      <View style={styles.profileContainer}>
        <Image
          source={CONSULTANT_IMAGE}
          style={styles.avatar}
          fadeDuration={0}
          resizeMethod="resize"
        />
        <View style={styles.profileTextContainer}>
          {isGuest ? (
            <>
              <Text style={styles.name}>Guest User</Text>
              <Text style={styles.email}>Browse our products</Text>
              <TouchableOpacity
                onPress={() => logout()}
                style={styles.loginButton}
              >
                <Ionicons name="log-in-outline" size={16} color={Colors.textOnPrimary} />
                <Text style={styles.loginText}>Login / Sign Up</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.name}>{user?.firstName ?? 'John Doe'}</Text>
              <Text style={styles.email}>{user?.email ?? 'email@example.com'}</Text>
              <TouchableOpacity
                onPress={() =>
                  props.navigation.navigate('HomeTabs', {
                    screen: 'Home',
                    params: { screen: 'EditProfile' },
                  })
                }
                style={styles.editButton}
              >
                <Ionicons name="create-outline" size={16} color={Colors.primaryLight} />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={styles.menuItems}>
        {[
          { label: 'Home', icon: 'home-outline', screen: 'HomeTab' },
          {
            label: 'Book Consultation',
            icon: 'book-sharp',
            screen: 'ConsultationOption',
            parentTab: 'HomeTab',
          },
          { label: 'Buy Products', icon: 'bag-add', screen: 'ProductsTab' },
          {
            label: 'Centers',
            icon: 'business-outline',
            screen: 'CentersTab',
          },
          {
            label: 'Addresses',
            icon: 'location-outline',
            screen: 'CentersTab',
          },
          {
            label: 'Coins',
            icon: 'cash-outline',
            screen: 'MyDentCoinsScreen',
            parentTab: 'Home',
          },
          {
            label: 'Refer a friend',
            icon: 'body-outline',
            screen: 'CentersTab',
          },
          { label: 'Rate us', icon: 'star-outline', screen: 'CentersTab' },
          { label: 'Help & Support', icon: 'help', screen: 'CentersTab' },
          { label: 'Contact Us', icon: 'call-outline', screen: 'ContactUsTab' },
        ].map((item, index) => (
          <DrawerItem
            key={index}
            label={item.label}
            onPress={async () => {
              if (item.label === 'Help & Support') {
                Linking.openURL('https://wa.me/+919381590963');
                return;
              }
              if (item.label === 'Rate us') {
                const pkg = 'com.sahilshaik786.mydent';
                const marketUrl = `market://details?id=${pkg}`;
                const webUrl = `https://play.google.com/store/apps/details?id=${pkg}`;
                try {
                  const canOpen = await Linking.canOpenURL(marketUrl);
                  if (canOpen) {
                    await Linking.openURL(marketUrl);
                  } else {
                    await Linking.openURL(webUrl);
                  }
                } catch {
                  await Linking.openURL(webUrl);
                }
                return;
              }
              if (item.label === 'Refer a friend') {
                const pkg = 'com.sahilshaik786.mydent';
                const storeUrl = `https://play.google.com/store/apps/details?id=${pkg}`;
                const message = encodeURIComponent(
                  `Check out the Mydent app! Download here: ${storeUrl}`,
                );
                const waShareUrl = `https://wa.me/?text=${message}`;
                try {
                  await Linking.openURL(waShareUrl);
                } catch {
                  // fallback: open store link directly
                  await Linking.openURL(storeUrl);
                }
                return;
              }
              props.navigation.navigate('HomeTabs', {
                screen: item.parentTab ?? item.screen,
                ...(item.parentTab && { params: { screen: item.screen } }),
              });
            }}
            icon={({ size }) => (
              <Ionicons name={item.icon as any} size={size} color={iconColor} />
            )}
          />
        ))}
      </View>

      <View style={styles.bottomSection}>
        <DrawerItem
          label="New Ticket"
          onPress={() =>
            props.navigation.navigate('HomeTabs', {
              screen: 'Home', // this must match your tab screen name
              params: { screen: 'NewTicketScreen' }, // this must match your stack screen name
            })
          }
          icon={({ size }) => (
            <Ionicons
              name="document-text-outline"
              size={size}
              color={iconColor}
            />
          )}
        />

        <DrawerItem
          label="View Ticket"
          onPress={() =>
            props.navigation.navigate('HomeTabs', {
              screen: 'Home', // this must match your tab screen name
              params: { screen: 'CancelTicketScreen' }, // this must match your stack screen name
            })
          }
          icon={({ size }) => (
            <Ionicons name="clipboard-outline" size={size} color={iconColor} />
          )}
        />
        <DrawerItem
          label={isGuest ? 'Login' : 'Logout'}
          onPress={async () => {
            try {
              if (isGuest) {
                // Clear guest mode → app shows AuthScreen (Login)
                await logout();
              } else {
                // Logout authenticated user
                await logout();
                setUser(null);
              }
            } catch (err) {
              console.error('Logout/Login error:', err);
            }
          }}
          icon={({ size }) => (
            <Ionicons
              name={isGuest ? 'log-in-outline' : 'log-out-outline'}
              size={size}
              color={iconColor}
            />
          )}
        />
      </View>

      {/* Edit navigates to screen, modal removed for consistency */}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    borderTopRightRadius: 18,
    height: 100,
    paddingHorizontal: 10,
    marginTop: -50,
  },
  logo: {
    width: '80%',
    height: 90,
    resizeMode: 'cover',
  },
  profileContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  profileTextContainer: {
    flexShrink: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  email: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  editText: {
    color: Colors.primaryLight,
    marginLeft: 4,
    fontSize: 14,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  loginText: {
    color: Colors.textOnPrimary,
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  menuItems: {
    marginTop: 8,
  },
  bottomSection: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    paddingBottom: 16,
  },
});
