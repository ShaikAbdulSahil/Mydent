/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../constants/Colors';

export default function ConsultationBookedScreen({ navigation, route }: any) {
  const { slotDate = 'Fri 16 May 25', slotTime = '1:20 PM to 1:35 PM' } =
    route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.icon}
          fadeDuration={0}
          resizeMethod="resize"
        />
        <Text style={styles.title}>your video-consultation is booked!</Text>

        <Text style={styles.description}>
          For a doctor to be better prepared for the session, we need you to
          fill an easy pre-consultation form. It is mandatory to complete this
          form before the session.
        </Text>

        <View style={styles.appointmentBox}>
          <View style={styles.row}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.iconSmall}
              fadeDuration={0}
              resizeMethod="resize"
            />
            <Text style={styles.slotText}>{slotDate}</Text>
          </View>
          <View style={styles.row}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.iconSmall}
              fadeDuration={0}
              resizeMethod="resize"

            />
            <Text style={styles.slotText}>{slotTime}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => navigation.navigate('ConsultationDetailsScreen')}
        >
          <Text style={styles.detailsButtonText}>consultation details</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  appointmentBox: {
    backgroundColor: Colors.screenBg,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconSmall: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  slotText: {
    fontSize: 15,
    color: Colors.textBody,
  },
  detailsButton: {
    borderWidth: 1,
    borderColor: Colors.brandRed,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  detailsButtonText: {
    color: Colors.brandRed,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
