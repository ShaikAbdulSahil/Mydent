/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors } from '../constants/Colors';

const timeSlots = [
  '10:40 AM',
  '11:00 AM',
  '11:20 AM',
  '11:40 AM',
  '12:00 PM',
  '12:20 PM',
  '12:40 PM',
  '01:00 PM',
  '01:20 PM',
  '01:30 PM',
  '01:50 PM',
  '02:00 PM',
  '02:20 PM',
  '02:40 PM',
  '03:00 PM',
  '03:20 PM',
];

const dateOptions = [
  { label: 'Today', date: '16 May' },
  { label: 'Tomorrow', date: '17 May' },
  { label: 'Sunday', date: '18 May' },
];

export default function BookingScreen({ navigation }: any) {
  const [selectedDate, setSelectedDate] = useState('16 May');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>
        Please select date and time for your doctor’s consultation
      </Text>

      <View style={styles.dateRow}>
        {dateOptions.map((item) => (
          <TouchableOpacity
            key={item.date}
            style={[
              styles.datePill,
              selectedDate === item.date && styles.selectedDatePill,
            ]}
            onPress={() => {
              setSelectedDate(item.date);
              setSelectedTime(null); // Reset time when date changes
            }}
          >
            <Text style={styles.dateTextTop}>{item.date.split(' ')[0]}</Text>
            <Text
              style={[
                styles.dateTextBottom,
                selectedDate === item.date && { color: Colors.textOnBrand },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.selectTimeLabel}>Select time for {selectedDate}</Text>

      <ScrollView contentContainerStyle={styles.timeGrid}>
        {timeSlots.map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.timeButton,
              selectedTime === time && styles.selectedTimeButton,
            ]}
            onPress={() => setSelectedTime(time)}
          >
            <Text
              style={[
                styles.timeButtonText,
                selectedTime === time && { color: Colors.brandRed },
              ]}
            >
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.proceedButton, !selectedTime && { opacity: 0.4 }]}
        disabled={!selectedTime}
        onPress={() =>
          navigation.navigate('ConsultationBookedScreen', {
            slotDate: selectedDate,
            slotTime: selectedTime,
          })
        }
      >
        <Text style={styles.proceedButtonText}>proceed</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.screenBg,
  },
  header: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  datePill: {
    backgroundColor: Colors.skeletonBg,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: '30%',
  },
  selectedDatePill: {
    backgroundColor: Colors.brandRed,
  },
  dateTextTop: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  dateTextBottom: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  selectTimeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.textSecondary,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  timeButton: {
    width: '48%',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: Colors.skeletonBg,
    marginBottom: 12,
    alignItems: 'center',
  },
  selectedTimeButton: {
    borderWidth: 2,
    borderColor: Colors.brandRed,
    backgroundColor: Colors.cardBg,
  },
  timeButtonText: {
    color: Colors.textBody,
    fontSize: 15,
  },
  proceedButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: Colors.brandRed,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 120,
  },
  proceedButtonText: {
    color: Colors.textOnBrand,
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
