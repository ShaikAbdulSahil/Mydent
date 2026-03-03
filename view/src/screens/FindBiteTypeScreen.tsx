/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { getCarousels } from '../api/carousel-api';
import { normalizeScreenName } from '../utils/navigationHelpers';
import Carousel from '../components/Carousel';
import Skeleton from '../components/Skeleton';
import { Colors } from '../constants/Colors';
import { CarouselItem } from './Home';
import VIDEO_1 from '../../assets/static_assets/VIDEO_1.png';
import VIDEO_2 from '../../assets/static_assets/VIDEO_2.png';
import VIDEO_3 from '../../assets/static_assets/VIDEO_3.png';
import VIDEO_4 from '../../assets/static_assets/VIDEO_4.png';
import VIDEO_5 from '../../assets/static_assets/VIDEO_5.png';
import VIDEO_6 from '../../assets/static_assets/VIDEO_6.png';
import VIDEO_7 from '../../assets/static_assets/VIDEO_7.png';
import VIDEO_8 from '../../assets/static_assets/VIDEO_8.png';
import VIDEO_9 from '../../assets/static_assets/VIDEO_9.png';


const categories = [
  { title: 'Under bite', icon: VIDEO_1 },
  { title: 'Open bite', icon: VIDEO_2 },
  { title: 'Crooked teeth', icon: VIDEO_3 },
  { title: 'Gap teeth', icon: VIDEO_4 },
  {
    title: 'Deep bite',
    icon: VIDEO_5,
  },
  {
    title: 'Cross bite',
    icon: VIDEO_6,
  },
  {
    title: 'Forwardly placed teeth',
    icon: VIDEO_7,
  },
  {
    title: 'Teeth Spacings',
    icon: VIDEO_8,
  },
  { title: 'Jaw correction', icon: VIDEO_9 },
];

export default function FindBiteTypeScreen({ navigation }: any) {
  const [carousel, setCarousel] = useState<CarouselItem[]>([]);
  const [carouselLoading, setCarouselLoading] = useState(true);

  const { width: screenWidth } = Dimensions.get('window');
  const horizontalMargin = 10;
  const imageWidth = screenWidth - horizontalMargin * 2;

  useEffect(() => {
    const fetchCarousels = async () => {
      try {
        const res = await getCarousels();
        setCarousel(
          res.data.biteTypeCarousel.map((img: any) => ({
            uri: img.imageUrl,
            type: img.type,
            group: 'biteType',
            navigateTo: normalizeScreenName(img.screenName) || 'DefaultScreen',
          })),
        );
        // prefetch carousel images and only clear loading after assets are cached
        const urls = (res.data.biteTypeCarousel || []).map((it: any) => it.imageUrl).filter(Boolean);
        if (urls.length === 0) {
          setCarouselLoading(false);
        } else {
          try {
            await Promise.all(urls.map((u: string) => Image.prefetch(u)));
          } catch (e) {
            // ignore individual prefetch failures, still show carousel
            console.warn('Carousel image prefetch failed', e);
          }
          setCarouselLoading(false);
        }
      } catch (error) {
        console.error('Failed to load carousels:', error);
        setCarouselLoading(false);
      }
    };

    fetchCarousels();
  }, []);

  const showGridAtTop = !carouselLoading && carousel.length === 0;

  const renderGrid = () => (
    <>
      <Text style={styles.sectionTitle}>
        Discover your bite type and See the transformation
      </Text>

      <View style={styles.grid}>
        {categories.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() =>
              navigation.navigate('BiteTypeVideosScreen', { title: item.title })
            }
          >
            <Image source={item.icon} style={styles.icon} fadeDuration={0} resizeMethod="resize" />
            <Text style={styles.label}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  return (
    <ScrollView style={styles.container}>
      {showGridAtTop ? (
        renderGrid()
      ) : (
        <>
          {carouselLoading ? (
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Skeleton width={imageWidth} height={200} radius={10} />
            </View>
          ) : (
            <Carousel images={carousel} />
          )}

          {renderGrid()}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    paddingHorizontal: 12,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 6,
  },

  label: {
    textAlign: 'center',
    fontSize: 12,
  },
});
