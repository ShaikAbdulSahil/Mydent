import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface FormExamplesCardProps {
  navigation: any;
}

export default function FormExamplesCard({ navigation }: FormExamplesCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Form Examples</Text>
      <Text style={styles.description}>
        Check out our new form components and examples
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('FormExample')}
      >
        <Text style={styles.buttonText}>Generic Form Example</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('AppConfig')}
      >
        <Text style={styles.buttonText}>App Configuration Viewer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.textBody,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.primaryLight,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: Colors.tabInactive,
  },
  buttonText: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
});