import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Text, View } from 'react-native';
import Centers from '../screens/CentersScreen';
import EComScreen from '../screens/ECommerceScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import HomeStack from './HomeStack';
import { withAppShell } from '../utils/AppShellWrapper';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CurvedTabBarBackground from '../components/CurvedTabBarBackground';
import MyDentAlignersScreen from '../screens/MydentAligners';
import CartScreen from '../screens/CartScreen';
import TransformationBlogDetailsScreen from '../screens/TransformationBlogs';
import FavProductScreen from '../screens/FavProductScreen';
import TransformationScreen from '../screens/TransformationScreen';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HOME from '../../assets/static_assets/HOME.jpg';
import MYDENTTAB from '../../assets/static_assets/MYDENTTAB.jpg';
import WHATS_APP_IMAGE_2025_06_16_AT_11_36_57_AM from '../../assets/static_assets/WHATS_APP_IMAGE_2025_06_16_AT_11_36_57_AM.jpg';
import SHOP from '../../assets/static_assets/SHOP.jpg';
import CONTACT from '../../assets/static_assets/CONTACT.jpg';
import { Colors } from '../constants/Colors';


const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          bottom: 0,
        },
        headerShown: false,
        tabBarBackground: () => <CurvedTabBarBackground />,
      }}
    >
      <Tab.Screen
        name="HomeMain"
        component={HomeStack}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.dispatch(
              CommonActions.navigate({
                name: 'HomeTab',
                params: {
                  screen: 'Home',
                },
              }),
            );
          },
        })}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 16,
              }}
            >
              <Image
                source={HOME}
                style={{
                  width: 28,
                  height: 28,
                  resizeMode: 'contain',
                  borderWidth: focused ? 2 : 0,
                  borderColor: focused ? Colors.tabActive : Colors.transparent,
                  borderRadius: 8,
                }}
                fadeDuration={0}
                resizeMethod="resize"
              />
              <Text
                style={{
                  fontSize: 8,
                  color: focused ? Colors.tabActive : Colors.tabInactive,
                }}
              >
                Home
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="CartScreen"
        component={withAppShell(CartScreen)}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="Mydent"
        component={withAppShell(MyDentAlignersScreen)}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault(); // Prevent default tab behavior

            navigation.dispatch(
              CommonActions.navigate({
                name: 'Mydent',
                params: {}, // Clear params to reset
              }),
            );
          },
        })}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 16,
              }}
            >
              <Image
                source={MYDENTTAB}
                style={{
                  width: 28,
                  height: 28,
                  resizeMode: 'contain',
                  borderWidth: focused ? 2 : 0,
                  borderColor: focused ? Colors.tabActive : Colors.transparent,
                  borderRadius: 8,
                }}
                fadeDuration={0}
                resizeMethod="resize"
              />
              <Text
                style={{
                  fontSize: 8,
                  color: focused ? Colors.tabActive : Colors.tabInactive,
                }}
              >
                Mydent
              </Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="TransformationBlogDetailsScreen"
        component={withAppShell(TransformationBlogDetailsScreen)}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="CentersTab"
        component={withAppShell(Centers)}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 38,
              }}
            >
              <Image
                source={WHATS_APP_IMAGE_2025_06_16_AT_11_36_57_AM}
                style={{
                  width: 22,
                  height: 22,
                  resizeMode: 'contain',
                  borderWidth: focused ? 2 : 0,
                  borderColor: focused ? Colors.tabActive : Colors.transparent,
                  borderRadius: 8,
                }}
                resizeMode="contain"
                fadeDuration={0}
                resizeMethod="resize"
              />
              <Text
                style={{
                  fontSize: 8,
                  color: focused ? Colors.tabActive : Colors.tabInactive,
                }}
              >
                Centers
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="FavProductScreen"
        component={withAppShell(FavProductScreen)}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="ProductsTab"
        component={withAppShell(EComScreen)}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 16,
              }}
            >
              <Image
                source={SHOP}
                style={{
                  width: 28,
                  height: 28,
                  resizeMode: 'contain',
                  borderWidth: focused ? 2 : 0,
                  borderColor: focused ? Colors.tabActive : Colors.transparent,
                  borderRadius: 8,
                }}
                fadeDuration={0}
                resizeMethod="resize"
              />
              <Text
                style={{
                  fontSize: 8,
                  color: focused ? Colors.tabActive : Colors.tabInactive,
                }}
              >
                Shop
              </Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ProductDetailScreen"
        component={withAppShell(ProductDetailScreen)}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="ContactUsTab"
        component={ContactUsScreen}
        options={{
          tabBarLabel: '', // hide default label
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 16,
              }}
            >
              <Image
                source={CONTACT}
                style={{
                  width: 28,
                  height: 28,
                  resizeMode: 'contain',
                  borderWidth: focused ? 2 : 0,
                  borderColor: focused ? Colors.tabActive : Colors.transparent,
                  borderRadius: 8,
                }}
                fadeDuration={0}
                resizeMethod="resize"
              />
              <Text
                style={{
                  fontSize: 8,
                  color: focused ? Colors.tabActive : Colors.tabInactive,
                }}
              >
                Contact
              </Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="TransformationScreen"
        component={withAppShell(TransformationScreen)}
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
}
