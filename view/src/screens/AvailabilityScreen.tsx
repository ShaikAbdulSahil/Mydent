/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// screens/AvailabilityScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { updateUser } from '../api/user-api';
import { Colors } from '../constants/Colors';

const options = ['Yes', 'No'];

export default function AvailabilityScreen({ navigation }: any) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!selected) return;

    try {
      setLoading(true);
      await updateUser({ availability: selected });
      navigation.navigate('CheckoutSummary');
    } catch (error) {
      console.error('Error updating availability:', error);
      import('../utils/errorAlert').then(({ showError }) => showError('Failed to save your selection. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>
        Will You Be in India or Your Current Location Throughout the Treatment?
      </Text>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionBox,
              selected === option && styles.optionBoxSelected,
            ]}
            onPress={() => setSelected(option)}
          >
            <View style={styles.radioCircle}>
              {selected === option && <View style={styles.selectedDot} />}
            </View>
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.stepText}>few more steps to go</Text>
        <Text style={styles.stepCounter}>7 / 8 steps</Text>

        <TouchableOpacity
          style={[
            styles.nextButton,
            (!selected || loading) && { opacity: 0.5 },
          ]}
          disabled={!selected || loading}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Saving...' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 120,
    flex: 1,
    padding: 20,
    backgroundColor: Colors.cardBg,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionBox: {
    width: '45%',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderInput,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionBoxSelected: {
    borderColor: Colors.brandRed,
    backgroundColor: Colors.errorBg,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.brandRed,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.brandRed,
  },
  optionText: {
    fontSize: 16,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 16,
  },
  stepText: {
    color: Colors.tabInactive,
    fontSize: 14,
  },
  stepCounter: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 4,
  },
  nextButton: {
    backgroundColor: Colors.brandRed,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  nextButtonText: {
    color: Colors.textOnBrand,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
