/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { updateUser } from '../api/user-api';
import { Colors } from '../constants/Colors';

const options = [
  'Allergy',
  'Diabetes/Asthma/Anemia etc.',
  'Any Medical treatment',
  'Bone Disease',
  'Corticosteroids',
  'Chemotherapy/Radiation Therapy',
  'Bone Marrow Transplant/Treatment of Blood Cancer',
  'NA',
];

export default function MedicalHistoryScreen({ navigation }: any) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((o) => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleNext = async () => {
    if (selectedOptions.length === 0) return;

    try {
      setLoading(true);
      await updateUser({ medicalHistory: selectedOptions });
      navigation.navigate('GenderSelection');
    } catch (error) {
      console.error('Failed to update medical history:', error);
      import('../utils/errorAlert').then(({ showError }) => showError('Something went wrong while saving your selection.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>
          Do You Have a History of Any of the Following?
        </Text>

        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.checkboxContainer}
            onPress={() => toggleOption(option)}
          >
            <View
              style={[
                styles.checkbox,
                selectedOptions.includes(option) && styles.checkboxChecked,
              ]}
            />
            <Text style={styles.checkboxLabel}>{option}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.stepText}>few more steps to go</Text>
        <Text style={styles.stepCounter}>4 / 8 steps</Text>

        <TouchableOpacity
          style={[
            styles.nextButton,
            (selectedOptions.length === 0 || loading) && { opacity: 0.5 },
          ]}
          disabled={selectedOptions.length === 0 || loading}
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
    flex: 1,
    backgroundColor: Colors.cardBg,
    paddingBottom: 110,
  },
  content: {
    padding: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 4,
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: Colors.textBody,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: Colors.border,
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
