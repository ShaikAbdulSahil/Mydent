/* eslint-disable @typescript-eslint/no-misused-promises */
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Image,
  StyleSheet,
} from 'react-native';
import IMAGES_MEET from '../../assets/static_assets/IMAGES_MEET.png';
import { Colors } from '../constants/Colors';

interface MeetModalProps {
  visible: boolean;
  onClose: () => void;
  meetLink: string;
}

const MeetModal = ({ visible, onClose, meetLink }: MeetModalProps) => {
  const openLink = async () => {
    const supported = await Linking.canOpenURL(meetLink);
    if (supported) await Linking.openURL(meetLink);
    else alert("Can't open the meeting link");
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Image
            source={IMAGES_MEET}
            style={styles.logo}
            resizeMode="contain"
            fadeDuration={0}
            resizeMethod="resize"
          />
          <Text style={styles.title}>Your Meeting is Ready</Text>
          <TouchableOpacity onPress={openLink}>
            <Text style={styles.link}>{meetLink}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default MeetModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Colors.overlayBg,
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.cardBg,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 70,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  link: {
    fontSize: 16,
    color: Colors.primaryLight,
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  closeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 8,
  },
  closeText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
