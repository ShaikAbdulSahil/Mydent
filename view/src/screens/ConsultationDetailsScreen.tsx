/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { navigateToScreen } from '../utils/navigationHelpers';
import { Colors } from '../constants/Colors';
import WHATSAPP_06_13_1AM from '../../assets/static_assets/WHATSAPP_06_13_1AM.jpg';

export default function ConsultationDetailsScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>🎥 Video Consultation</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>upcoming</Text>
        </View>

        <Text style={styles.concern}>
          Concern: <Text style={{ fontWeight: 'bold' }}>teeth gaps</Text>
        </Text>

        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Details Submitted</Text>
            <TouchableOpacity>
              <Text style={styles.viewLink}>view</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.doctorRow}>
            <Image
              source={WHATSAPP_06_13_1AM}
              style={styles.doctorImage}
              fadeDuration={0}
              resizeMethod="resize"
            />
            <View>
              <Text style={styles.doctorName}>Dr. Jayasree</Text>
              <Text style={styles.doctorDesc}>Cosmetologist | 1 yrs exp</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Appointment details</Text>
            <TouchableOpacity>
              <Text style={styles.reschedule}>Reschedule</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.appointmentInfo}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.icon}
              fadeDuration={0}
              resizeMethod="resize"
            />
            <Text style={styles.appointmentText}>16th May, Friday</Text>
          </View>

          <View style={styles.appointmentInfo}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.icon}
              fadeDuration={0}
              resizeMethod="resize"
            />
            <Text style={styles.appointmentText}>1:20pm to 1:35pm</Text>
          </View>
        </View>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            meeting link will be shared 2 mins prior to the appointment start
            time
          </Text>
        </View>

        <View style={styles.ctaBox}>
          <Text style={styles.ctaText}>
            please complete the pre-consultation patient details form for us to
            guide you properly
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() =>
              navigateToScreen(navigation, 'PaymentScreen', {
                params: { from: 'consultation', amount: 500 },
                parentTab: 'HomeTab',
              })
            }
          >
            <Text style={styles.ctaButtonText}>complete now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBg,
    paddingBottom: 120,
  },
  scroll: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.successBg,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  statusText: {
    color: Colors.successText,
    fontSize: 12,
    fontWeight: '600',
  },
  concern: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  detailsBox: {
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  viewLink: {
    color: Colors.brandRed,
    fontWeight: '600',
  },
  reschedule: {
    color: Colors.brandRed,
    fontWeight: '600',
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  doctorName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  doctorDesc: {
    color: Colors.tabInactive,
  },
  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  appointmentText: {
    fontSize: 14,
    color: Colors.textBody,
  },
  noticeBox: {
    backgroundColor: Colors.noticeBg,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  noticeText: {
    textAlign: 'center',
    color: Colors.noticeText,
    fontSize: 13,
  },
  ctaBox: {
    backgroundColor: Colors.dangerBg,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  ctaText: {
    textAlign: 'center',
    color: Colors.dangerText,
    marginBottom: 12,
    fontSize: 14,
  },
  ctaButton: {
    borderWidth: 1,
    borderColor: Colors.brandRed,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  ctaButtonText: {
    color: Colors.brandRed,
    fontWeight: 'bold',
    fontSize: 15,
  },
});
