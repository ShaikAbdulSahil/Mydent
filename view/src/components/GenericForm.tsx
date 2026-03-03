import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface FormField {
  name: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
}

interface GenericFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => void;
  submitButtonText?: string;
  title?: string;
}

export default function GenericForm({
  fields,
  onSubmit,
  submitButtonText = 'Submit',
  title,
}: GenericFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
        isValid = false;
      }

      if (field.type === 'email' && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Please enter a valid email';
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      {fields.map(field => (
        <View key={field.name} style={styles.fieldContainer}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            style={[styles.input, errors[field.name] && styles.inputError]}
            placeholder={field.placeholder}
            value={formData[field.name] || ''}
            onChangeText={(value) => handleInputChange(field.name, value)}
            secureTextEntry={field.type === 'password'}
            keyboardType={field.type === 'email' ? 'email-address' : field.type === 'number' ? 'numeric' : 'default'}
            autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
          />
          {errors[field.name] && (
            <Text style={styles.errorText}>{errors[field.name]}</Text>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{submitButtonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.screenBg,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.textBody,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    color: Colors.textBody,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.borderInput,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.inputBg,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    marginTop: 5,
    fontSize: 14,
  },
  button: {
    backgroundColor: Colors.primaryLight,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: Colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
});