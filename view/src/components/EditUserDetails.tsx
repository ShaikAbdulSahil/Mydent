/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { updateUser, getUserDetails } from '../api/user-api';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';

export default function EditProfileForm({ onClose }: { onClose?: () => void }) {
  const { user, setUser } = useUser();
  const navigation = useNavigation<any>();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [mobile, setMobile] = useState<string>(typeof (user as any)?.mobile === 'string' ? (user as any).mobile : '');
  const [address, setAddress] = useState<string>(typeof (user as any)?.address === 'string' ? (user as any).address : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const hydrate = async () => {
      try {
        setInitialLoading(true);
        const res = await getUserDetails();
        if (!mounted) return;
        setUser(res.data);
        setFirstName(res.data?.firstName ?? '');
        setEmail(res.data?.email ?? '');
        setMobile(res.data?.mobile ?? '');
        setAddress(res.data?.address ?? '');
      } catch (e) {
        // fallback to existing context values if fetch fails
        setFirstName(user?.firstName ?? '');
        setEmail(user?.email ?? '');
        setMobile((user as any)?.mobile ?? '');
        setAddress((user as any)?.address ?? '');
      } finally {
        if (mounted) setInitialLoading(false);
      }
    };
    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  const handleUpdate = async () => {
    try {
      setError('');
      setSaving(true);
      await updateUser({ firstName, mobile, address });
      const res = await getUserDetails();
      setUser(res.data);
      if (onClose) {
        onClose();
      } else {
        try {
          navigation.goBack();
        } catch { }
      }
    } catch (err) {
      console.error('Failed to update user', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Profile</Text>
      {initialLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={Colors.primaryLight} />
          <Text style={styles.loadingText}>Loading your details…</Text>
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.label}>Name</Text>
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        placeholder="First Name"
        style={styles.input}
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        placeholder="Email"
        style={styles.input}
        keyboardType="email-address"
        editable={false}
        placeholderTextColor={Colors.tabInactive}
      />
      <Text style={styles.label}>Mobile</Text>
      <TextInput
        value={mobile}
        onChangeText={setMobile}
        placeholder="Mobile"
        style={styles.input}
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Address</Text>
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Address"
        style={[styles.input, styles.multiline]}
        multiline
      />
      <View style={styles.buttonRow}>
        <View style={styles.buttonCol}>
          <Button title={saving ? 'Saving...' : 'Save Changes'} onPress={handleUpdate} disabled={saving} />
        </View>
        <View style={styles.buttonCol}>
          <Button
            title="Cancel"
            color={Colors.error}
            onPress={() => {
              if (onClose) onClose();
              else {
                try {
                  navigation.goBack();
                } catch { }
              }
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  label: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: Colors.borderInput,
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  error: {
    color: Colors.error,
    marginBottom: 8,
  },
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: Colors.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  buttonCol: { flex: 1 },
});
