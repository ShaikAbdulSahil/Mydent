import React from 'react';
import { View, Alert } from 'react-native';
import GenericForm from '../components/GenericForm';
import { Colors } from '../constants/Colors';

export default function FormExampleScreen({ navigation }: any) {
  const formFields = [
    {
      name: 'name',
      label: 'Full Name',
      placeholder: 'Enter your full name',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email',
      type: 'email' as const,
      required: true,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      placeholder: 'Enter your phone number',
      type: 'number' as const,
      required: true,
    },
    {
      name: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      type: 'password' as const,
      required: true,
    },
  ];

  const handleSubmit = (data: Record<string, string>) => {
    // Here you would typically send the data to your backend
    console.log('Form submitted with data:', data);
    Alert.alert(
      'Form Submitted',
      `Thank you ${data.name}! Your form has been submitted successfully.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.screenBg }}>
      <GenericForm
        fields={formFields}
        onSubmit={handleSubmit}
        submitButtonText="Submit Form"
        title="Example Form"
      />
    </View>
  );
}