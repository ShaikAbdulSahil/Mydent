/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { showSuccess } from '../utils/successToast';
import { Ionicons } from '@expo/vector-icons';
import { uploadTicketImage } from '../api/tickets-api';
import { Colors } from '../constants/Colors';

const NewTicketScreen = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const handleUpload = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '*/*';
      input.onchange = () => {
        if (input.files && input.files.length > 0) {
          const file = input.files[0];
          setSelectedFile(file);
          alert(`File Selected: ${file.name}`);
        }
      };
      input.click();
    } else {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setSelectedFile(result.assets[0]);
        Alert.alert('File Selected', result.assets[0].name);
      }
    }
  };

  const handleSubmit = async () => {
    if (!title || !message) {
      Alert.alert('Error', 'Please fill out all required fields.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('message', message);
      formData.append('category', category);

      if (Platform.OS === 'web' && selectedFile instanceof File) {
        formData.append('file', selectedFile);
      } else if (selectedFile) {
        formData.append('file', {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.mimeType || 'application/octet-stream',
        } as any);
      }

      await uploadTicketImage(formData);

      showSuccess('Your ticket has been submitted.');
      setTitle('');
      setMessage('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Ticket submission failed:', error);
      Alert.alert('Error', 'Something went wrong while submitting the ticket.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>New Support Ticket</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Short summary of the issue"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Category</Text>
      <TouchableOpacity style={styles.dropdown}>
        <Text style={styles.dropdownText}>{category}</Text>
        <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
      </TouchableOpacity>

      <Text style={styles.label}>Message</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Describe your issue in detail..."
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={5}
      />

      <TouchableOpacity style={styles.attachment} onPress={handleUpload}>
        <Ionicons name="attach" size={20} color={Colors.primaryLight} />
        <Text style={styles.attachText}>
          {selectedFile ? selectedFile.name : 'Attach File (optional)'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Ticket</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NewTicketScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.screenBg,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.textPrimary,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderColor: Colors.borderInput,
    borderWidth: 1,
  },
  textarea: {
    height: 120,
    textAlignVertical: 'top',
  },
  dropdown: {
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderInput,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.textBody,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  attachText: {
    marginLeft: 8,
    color: Colors.primaryLight,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  submitButton: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: {
    color: Colors.textOnBrand,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
