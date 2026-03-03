import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import { treatmentData } from '../constants/teethTreatment';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import IMG_12 from '../../assets/static_assets/IMG_12.png';
import Skeleton from '../components/Skeleton';
import { Colors } from '../constants/Colors';

const LazyImage = ({
  source,
  style,
  resizeMode = 'cover',
}: {
  source: any;
  style?: any;
  resizeMode?: any;
}) => {
  const [loaded, setLoaded] = useState(false);

  // If local asset (number), render directly (keep original styling)
  if (typeof source === 'number') {
    return <Image source={source} style={style} resizeMode={resizeMode} />;
  }

  const uri = source?.uri;
  // If no uri, render plain grey box with the same style
  if (!uri) {
    return <View style={[style, { backgroundColor: Colors.skeletonBg }]} />;
  }

  // Ensure we preserve the original style/layout by applying it to the wrapper
  const wrapperStyle = Array.isArray(style) ? StyleSheet.flatten(style) : style || {};
  const imageBorderRadius = wrapperStyle?.borderRadius ?? 0;
  const imageHeight = wrapperStyle?.height;

  return (
    <View style={wrapperStyle}>
      {!loaded && (
        <View style={StyleSheet.absoluteFill}>
          <Skeleton width={'100%'} height={imageHeight ?? 200} radius={imageBorderRadius} />
        </View>
      )}
      <Image
        source={{ uri }}
        style={[StyleSheet.absoluteFill, { borderRadius: imageBorderRadius }]}
        resizeMode={resizeMode}
        onLoad={() => setLoaded(true)}
      />
    </View>
  );
};

type TeethTreatmentRouteParams = {
  params: {
    routeKey: string;
  };
};

export default function TeethTreatmentScreen() {
  const [activeFAQIndex, setActiveFAQIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveFAQIndex((prev) => (prev === index ? null : index));
  };

  const route = useRoute<RouteProp<TeethTreatmentRouteParams, 'params'>>();
  const { routeKey } = route.params || {};
  const data = treatmentData.find((item) => item.route === routeKey);

  if (!data) {
    return (
      <View style={styles.container}>
        <Text>Treatment not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{data.title}</Text>
      {/* Intro Section */}
      <Section title={`What are ${routeKey}?`}>
        <Text style={styles.paragraph}>{data.intro.description}</Text>
        {data.intro.treatmentOverview.map((point, idx) => (
          <Text key={idx} style={styles.bullet}>
            • {point}
          </Text>
        ))}
      </Section>
      {/* Intro Illustration Image */}
      {data.images[0] && (
        <LazyImage source={{ uri: data.images[0] }} style={styles.illustration} resizeMode="contain" />
      )}
      {/* Symptoms Image */}
      {data.images[1] && (
        <LazyImage source={{ uri: data.images[1] }} style={styles.fullWidthImage} resizeMode="cover" />
      )}
      {/* Why Treat */}
      <Section title={`Why should you correct ${routeKey}?`}>
        {data.whyTreat.map((why, idx) => (
          <Text key={idx} style={styles.bullet}>
            • {why}
          </Text>
        ))}
      </Section>
      {/* Aligners Image */}
      {data.images[2] && (
        <LazyImage source={{ uri: data.images[2] }} style={styles.fullWidthImage} resizeMode="cover" />
      )}
      {/* Journey / Process */}
      <Section title="How it Works – Your Smile Makeover Journey">
        {data.treatments.children.map((step, idx) => (
          <Text key={idx} style={styles.bullet}>
            • {step}
          </Text>
        ))}
      </Section>
      {/* Aligner Demo Image */}
      {data.images[3] && (
        <LazyImage source={{ uri: data.images[3] }} style={styles.fullWidthImage} resizeMode="cover" />
      )}
      {/* Cost */}
      <Section title={`Cost of ${routeKey} treatment`}>
        {data.cost.map((costItem, idx) => (
          <Text key={idx} style={styles.bullet}>
            {costItem.method}: {costItem.range}
          </Text>
        ))}
      </Section>
      {/* Mydent Highlights */}
      <Section title={data.mydentHighlight.title}>
        {data.mydentHighlight.points.map((point, idx) => (
          <Text key={idx} style={styles.bullet}>
            • {point}
          </Text>
        ))}
      </Section>
      {/* FAQs */}
      <Section title={`FAQs about ${routeKey}`}>
        {/* Horizontal line after Section title */}
        <View style={styles.divider} />

        {data.faqs.map((faq, idx) => (
          <View key={idx} style={styles.faq}>
            <TouchableOpacity
              onPress={() => toggleFAQ(idx)}
              activeOpacity={0.8}
            >
              <View style={styles.faqRow}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={
                    activeFAQIndex === idx
                      ? 'chevron-up-outline'
                      : 'chevron-down-outline'
                  }
                  size={20}
                  color={Colors.tabInactive}
                />
              </View>
            </TouchableOpacity>

            {/* Show answer if active */}
            {activeFAQIndex === idx && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}

            {/* Horizontal line after each question-answer */}
            <View style={styles.divider} />
          </View>
        ))}
      </Section>

      {/* Gallery */}
      <View style={{ marginTop: -20, marginBottom: 120 }}>
        <Image
          source={IMG_12}
          style={styles.galleryImage}
          resizeMode="cover"
          fadeDuration={0}
          resizeMethod="resize"
        />
      </View>
    </ScrollView>
  );
}

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={{ marginVertical: 16 }}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: Colors.cardBg,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    marginVertical: 2,
  },
  faq: {
    marginBottom: 12,
  },
  faqAnswer: {
    marginTop: 6,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  illustration: {
    width: '100%',
    height: 200,
    marginVertical: 12,
  },
  fullWidthImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginVertical: 12,
  },
  galleryImage: {
    width: 350,
    height: 300,
    marginRight: 10,
    borderRadius: 15,
  },
  faqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    flex: 1,
    paddingRight: 10,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderInput,
    marginVertical: 8,
  },
  faqIcon: {
    fontSize: 16,
    color: Colors.link,
  },
});
