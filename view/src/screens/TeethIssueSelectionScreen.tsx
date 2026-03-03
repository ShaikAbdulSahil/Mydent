/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { updateUser } from '../api/user-api';
import { Colors } from '../constants/Colors';
import TEETH_GAPS from '../../assets/static_assets/TEETH_GAPS.png';
import OVERBITE from '../../assets/static_assets/OVERBITE.png';
import CROSSBITE from '../../assets/static_assets/CROSSBITE.png';
import UNDERBITE from '../../assets/static_assets/UNDERBITE.png';
import OPEN_BITE from '../../assets/static_assets/OPEN_BITE.png';
import CROOKED_TEETH from '../../assets/static_assets/CROOKED_TEETH.png';

const TEETH_ISSUES = [
  {
    id: 'crooked',
    label: 'Crooked teeth',
    image: TEETH_GAPS,
  },
  {
    id: 'forward',
    label: 'Forwardly placed',
    image: OVERBITE,
  },
  {
    id: 'crossbite',
    label: 'Crossbite',
    image: CROSSBITE,
  },
  {
    id: 'underbite',
    label: 'Other 1',
    image: UNDERBITE,
  },
  {
    id: 'openbite',
    label: 'Other 2',
    image: OPEN_BITE,
  },
  {
    id: 'crookedteeth',
    label: 'Other 3',
    image: CROOKED_TEETH,
  },
  {
    id: 'other',
    label: 'Other',
  },
];

export default function TeethIssueSelectionScreen({ navigation }: any) {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [customIssue, setCustomIssue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!selectedIssue) return;

    try {
      setLoading(true);

      const payload: any = {
        teethIssue: selectedIssue,
      };

      if (selectedIssue === 'other_custom' && customIssue) {
        payload.problemText = customIssue;
      }

      await updateUser(payload);

      navigation.navigate('ProblemDetail');
    } catch (error) {
      console.error('Failed to update teeth issue:', error);
      import('../utils/errorAlert').then(({ showError }) => showError('Something went wrong while saving your selection.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>What's Your Teeth Concern?</Text>
      <Text style={styles.subText}>
        Let us know your issue so we can guide you with the right treatment
        plan.
      </Text>

      <FlatList
        data={TEETH_ISSUES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              selectedIssue === item.id && styles.cardSelected,
            ]}
            onPress={() => setSelectedIssue(item.id)}
            activeOpacity={0.8}
          >
            {item.image ? (
              <>
                <Image source={item.image} style={styles.image} fadeDuration={0} resizeMethod="resize" />
                <Text style={styles.knowMore}>know more</Text>
              </>
            ) : (
              <>
                <Text style={styles.cardText}>{item.label}</Text>
                {selectedIssue === 'other_custom' && (
                  <View style={styles.commentBoxContainer}>
                    <TextInput
                      style={styles.commentBox}
                      placeholder="Describe your issue"
                      value={customIssue}
                      onChangeText={setCustomIssue}
                      multiline
                    />
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
        )}
      />

      {/* Bottom Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarBackground}>
          <View style={styles.progressBarFill} />
        </View>

        <View style={styles.progressContent}>
          <View>
            <Text style={styles.progressSmallText}>You're almost done</Text>
            <Text style={styles.progressTitle}>Few steps</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.nextButtonAlt,
              (!selectedIssue || loading) && styles.nextButtonDisabled,
            ]}
            disabled={!selectedIssue || loading}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonTextAlt}>
              {' '}
              {loading ? 'Saving...' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    padding: 16,
    paddingBottom: 110,
  },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  subText: { color: Colors.textSecondary, marginBottom: 16 },
  grid: { justifyContent: 'space-between' },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.borderInput,
    padding: 12,
    borderRadius: 8,
    margin: 4,
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
  },
  commentBoxContainer: {
    marginTop: 8,
    width: '100%',
  },
  commentBox: {
    borderColor: Colors.borderInput,
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  cardSelected: {
    borderColor: Colors.brandRed,
    backgroundColor: Colors.errorBg,
  },
  cardText: { fontWeight: '600', marginVertical: 6 },
  knowMore: { color: Colors.error, fontSize: 12 },
  image: { width: 80, height: 120, resizeMode: 'contain' },

  // Bottom Progress UI
  progressSection: {
    marginTop: 'auto',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: Colors.cardBg,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: Colors.primaryBg,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    width: '25%',
    height: 4,
    backgroundColor: Colors.info,
  },
  progressContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressSmallText: {
    color: Colors.tabInactive,
    fontSize: 12,
  },
  progressTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  nextButtonAlt: {
    backgroundColor: Colors.brandRed,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.borderInput,
  },
  nextButtonTextAlt: {
    color: Colors.textOnBrand,
    fontWeight: '600',
  },
});
