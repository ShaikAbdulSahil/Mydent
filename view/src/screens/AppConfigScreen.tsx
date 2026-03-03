import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import appConfig from '../../app.json';
import { Colors } from '../constants/Colors';

export default function AppConfigScreen() {
  const { expo } = appConfig;

  // Function to render object properties recursively
  const renderConfig = (config: any, level = 0) => {
    return Object.entries(config).map(([key, value]) => {
      const indent = { paddingLeft: level * 20 };

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return (
          <View key={key} style={indent}>
            <Text style={styles.sectionTitle}>{key}:</Text>
            {renderConfig(value, level + 1)}
          </View>
        );
      } else if (Array.isArray(value)) {
        return (
          <View key={key} style={indent}>
            <Text style={styles.key}>{key}:</Text>
            {value.map((item, index) => (
              <View key={index} style={{ paddingLeft: 20 }}>
                {typeof item === 'object' ? (
                  renderConfig(item, level + 2)
                ) : (
                  <Text style={styles.value}>- {String(item)}</Text>
                )}
              </View>
            ))}
          </View>
        );
      } else {
        return (
          <View key={key} style={[styles.row, indent]}>
            <Text style={styles.key}>{key}:</Text>
            <Text style={styles.value}>{String(value)}</Text>
          </View>
        );
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>App Configuration</Text>
      <Text style={styles.subtitle}>Loaded from app.json</Text>
      <View style={styles.configContainer}>
        {renderConfig(expo)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBg,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: Colors.textBody,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  configContainer: {
    backgroundColor: Colors.cardBg,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
    color: Colors.primaryLight,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  key: {
    fontWeight: '600',
    width: 150,
    color: Colors.textBody,
  },
  value: {
    flex: 1,
    color: Colors.textSecondary,
  },
});