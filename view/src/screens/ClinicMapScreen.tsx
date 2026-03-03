import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Linking } from 'react-native';
import Skeleton from '../components/Skeleton';
import { Colors } from '../constants/Colors';

// Load react-native-maps once per module to avoid duplicate native view registrations (AIRMap)
let MapViewComp: any = null;
let MarkerComp: any = null;
let ProviderConst: any = null;
if (Platform.OS !== 'web') {
  try {
    const mod: any = require('react-native-maps');
    MapViewComp = mod.default;
    MarkerComp = mod.Marker;
    ProviderConst = mod.PROVIDER_GOOGLE;
  } catch (e) {
    // ignore here; component will show friendly overlay
  }
}

export default function ClinicMapScreen() {
  const [mapError, setMapError] = useState<string | null>(null);
  const [tilesLoaded, setTilesLoaded] = useState(false);

  useEffect(() => {
    // if maps failed to load at module level, set a friendly error
    if (Platform.OS !== 'web' && (!MapViewComp || !MarkerComp)) {
      setMapError('Map cannot be loaded at the moment.');
    }
  }, []);

  const clinicLocation = {
    latitude: 28.6139,
    longitude: 77.209,
  };

  const clinicAddress = 'MyDent Clinic, Connaught Place, New Delhi - 110001';
  const [mapLoaded, setMapLoaded] = useState(false);

  // detect tile failures: if MapView mounts but onMapLoaded doesn't fire within timeout
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (MapViewComp && !tilesLoaded && !mapError) {
      timer = setTimeout(() => {
        if (!tilesLoaded) {
          // Don't expose API key/internal errors to users; log details and show generic message
          console.warn('Map tiles did not load within timeout (possible API key/network issue)');
          setMapError('Map cannot be loaded at the moment.');
        }
      }, 8000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [tilesLoaded, mapError]);

  const openInMaps = async () => {
    const lat = clinicLocation.latitude;
    const lng = clinicLocation.longitude;
    const label = encodeURIComponent(clinicAddress);
    const latLng = `${lat},${lng}`;

    // Preferred deep links for Android and iOS, fallback to Google Maps web URL
    const geoUrlAndroid = `geo:${latLng}?q=${latLng}(${label})`;
    const appleMapsUrl = `maps://?q=${label}@${latLng}`;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}`;

    try {
      if (Platform.OS === 'android') {
        const supported = await Linking.canOpenURL(geoUrlAndroid);
        if (supported) return Linking.openURL(geoUrlAndroid);
        return Linking.openURL(googleMapsUrl);
      }

      if (Platform.OS === 'ios') {
        const supported = await Linking.canOpenURL(appleMapsUrl);
        if (supported) return Linking.openURL(appleMapsUrl);
        return Linking.openURL(googleMapsUrl);
      }

      // web or unknown platform: open in browser
      return Linking.openURL(googleMapsUrl);
    } catch (err) {
      console.warn('Failed to open maps URL', err);
      Linking.openURL(googleMapsUrl).catch(() => null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1753.6574034695534!2d77.2089776!3d28.6139394!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd36a73f0f1b%3A0x33cfb9aa12d14bb9!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001%2C%20India!5e0!3m2!1sen!2sin!4v1715060640000!5m2!1sen!2sin"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              onLoad={() => setMapLoaded(true)}
            ></iframe>
            <View style={{ alignItems: 'center', marginTop: 10 }}>
              <TouchableOpacity style={styles.openButton} onPress={openInMaps}>
                <Text style={styles.openText}>Open in Google Maps</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : MapViewComp && MarkerComp ? (
          <>
            <MapViewComp
              provider={ProviderConst}
              style={styles.map}
              initialRegion={{
                ...clinicLocation,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onMapReady={() => setMapLoaded(true)}
              onMapLoaded={() => {
                setTilesLoaded(true);
                setMapLoaded(true);
              }}
              onError={(e: any) => {
                // Log full error, but show a generic message to the user
                console.warn('MapView error', e);
                setMapError('Map cannot be loaded at the moment.');
              }}
            >
              {/* Using Google Maps SDK via react-native-maps provider */}
              <MarkerComp coordinate={clinicLocation} title="Our Clinic" />
            </MapViewComp>
            {!mapLoaded && (
              <View style={styles.mapOverlay} pointerEvents="none">
                <Skeleton width={'100%'} height={300} radius={8} />
              </View>
            )}
            {/* Note: using Google Maps SDK (provider). Ensure API key is configured in native config. */}
          </>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Skeleton width={'100%'} height={300} radius={8} />
          </View>
        )}

        {/* Error overlay shown above the shimmer (generic message only) */}
        {mapError && Platform.OS !== 'web' && (
          <View style={styles.errorOverlay} pointerEvents="box-none">
            <View style={styles.errorPanel}>
              <Text style={styles.errorTitle}>Map Unavailable</Text>
              <Text style={styles.errorMessage}>Map cannot be loaded at the moment.</Text>
              <Text style={styles.hintText}>
                You can open the location in Google Maps to get directions and view nearby routes.
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.openButton} onPress={openInMaps}>
                  <Text style={styles.openText}>Open in Google Maps</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    setMapError(null);
                    setMapLoaded(false);
                    // nothing to re-import; module-level load already attempted
                    // let the shimmer persist and MapView load callback handle success
                  }}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* If using iframe, show skeleton until onLoad fires */}
        {Platform.OS === 'web' && !mapLoaded && (
          <View style={styles.mapOverlay} pointerEvents="none">
            <Skeleton width={'100%'} height={300} radius={8} />
          </View>
        )}
      </View>

      <Text style={styles.addressTitle}>Clinic Address:</Text>
      <Text style={styles.addressText}>{clinicAddress}</Text>
    </View>
  );

}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { position: 'relative', width: '100%', height: 300 },
  map: { width: '100%', height: 300 },
  mapPlaceholder: { width: '100%', height: 300, justifyContent: 'center', alignItems: 'center' },
  mapOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 300, justifyContent: 'center', alignItems: 'center' },
  addressTitle: { fontSize: 16, fontWeight: '600', margin: 12 },
  addressText: { fontSize: 14, marginHorizontal: 12, color: Colors.textSecondary },
  errorOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 300, justifyContent: 'center', alignItems: 'center' },
  errorPanel: { backgroundColor: 'rgba(255,255,255,0.95)', padding: 16, borderRadius: 8, alignItems: 'center', width: '88%' },
  errorTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  errorMessage: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 12 },
  retryButton: { backgroundColor: Colors.primaryLight, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  retryText: { color: Colors.textOnBrand, fontWeight: '600' },
  errorInline: { marginTop: 8, paddingHorizontal: 12 },
  hintText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: 12, paddingHorizontal: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  openButton: { backgroundColor: Colors.success, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 6, marginRight: 8 },
  openText: { color: Colors.textOnBrand, fontWeight: '600' },
  attribution: { position: 'absolute', right: 8, bottom: 6, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  attribText: { fontSize: 10, color: Colors.textBody },
});