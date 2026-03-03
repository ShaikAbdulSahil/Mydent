/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Image } from 'react-native';
import Carousel from '../components/Carousel';
import ServiceCards from '../components/ServiceCards';
import FindBiteType from '../components/FindBiteType';
import TopProducts from '../components/TopProducts';
import MydentCenters from '../components/MydentCenters';
import Transformation from '../components/Transformation';
import BeforeAfterTreatment from '../components/Treatment';
import ClinicVisitCard from '../components/VisitClinic';
import FeaturedIn from '../components/FeaturedIn';
import FeatureStats from '../components/FeatureStats';
import DoctorCard from '../components/ConsultDoctors';
import Blogs from '../components/Blogs';
import { getCarousels } from '../api/carousel-api';
import { normalizeScreenName } from '../utils/navigationHelpers';
import Skeleton from '../components/Skeleton';
import TeethAlignmentProblems from '../components/TeethAlignmentProblems';
import { AuthContext } from '../contexts/AuthContext';
import FormExamplesCard from '../components/FormExamplesCard';
import { Colors } from '../constants/Colors';

export type CarouselItem = {
  uri: string;
  type: string;
  group: string;
  navigateTo: string;
};

export default function HomeScreen({ navigation }: any) {
  const { token } = useContext(AuthContext);
  const [topCarousel, setTopCarousel] = useState<CarouselItem[]>([]);
  const [bottomCarousel, setBottomCarousel] = useState<CarouselItem[]>([]);

  // We track carousel loading separately so we don't block the whole screen
  const [isCarouselLoading, setIsCarouselLoading] = useState(true);
  const [carouselImagesLoaded, setCarouselImagesLoaded] = useState(false);

  useEffect(() => {
    const fetchCarousels = async () => {
      try {
        const res = await getCarousels();

        if (res.data?.home?.topCarousel) {
          setTopCarousel(
            res.data.home.topCarousel.map((img: any) => ({
              uri: img.imageUrl,
              type: img.type,
              group: 'home',
              navigateTo: normalizeScreenName(img.screenName) || 'DefaultScreen',
            })),
          );
        }

        if (res.data?.home?.bottomCarousel) {
          setBottomCarousel(
            res.data.home.bottomCarousel.map((img: any) => ({
              uri: img.imageUrl,
              type: img.type,
              group: 'home',
              navigateTo: normalizeScreenName(img.screenName) || 'DefaultScreen',
            })),
          );
        }

        // Prefetch carousel images (both top and bottom) and keep skeleton until done
        const topUrls = (res.data?.home?.topCarousel || []).map((i: any) => i.imageUrl).filter(Boolean);
        const bottomUrls = (res.data?.home?.bottomCarousel || []).map((i: any) => i.imageUrl).filter(Boolean);
        const urls = [...topUrls, ...bottomUrls];
        if (urls.length === 0) {
          setCarouselImagesLoaded(true);
        } else {
          Promise.all(urls.map((u: string) => Image.prefetch(u)))
            .then(() => setCarouselImagesLoaded(true))
            .catch((e) => {
              console.warn('Carousel image prefetch failed', e);
              setCarouselImagesLoaded(true);
            });
        }
      } catch (error) {
        console.error('Failed to load carousels:', error);
      } finally {
        // Stop the carousel placeholder once data (or error) is received
        setIsCarouselLoading(false);
      }
    };

    fetchCarousels();
  }, [token]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        // 👇 CRITICAL: This prevents images from vanishing on Android when scrolling back up
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={false}
      >

        {/* Top Carousel Section */}
        {(isCarouselLoading || !carouselImagesLoaded) ? (
          <Skeleton width={'100%'} height={200} radius={10} style={styles.carouselPlaceholder} />
        ) : (
          <Carousel images={topCarousel} />
        )}

        {/* 👇 These Local Components will now load INSTANTLY (0ms) */}
        <ServiceCards navigation={navigation} />
        <FindBiteType navigation={navigation} />
        <TopProducts navigation={navigation} />

        {/* Remote Components (will load their own data internally) */}
        <MydentCenters navigation={navigation} />
        <TeethAlignmentProblems navigation={navigation} />
        <Transformation navigation={navigation} />
        <BeforeAfterTreatment />

        <ClinicVisitCard onPress={() => navigation.navigate('CentersTab')} />

        {/* <FormExamplesCard navigation={navigation} /> */}

        {/* Bottom Carousel Section */}
        {(isCarouselLoading || !carouselImagesLoaded) ? (
          <Skeleton width={'100%'} height={200} radius={10} style={styles.carouselPlaceholder} />
        ) : (
          <Carousel images={bottomCarousel} />
        )}

        <DoctorCard />
        <FeaturedIn />
        <Blogs navigation={navigation} />
        <FeatureStats />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cardBg,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  // Simple gray placeholder to prevent layout jumps while carousel loads
  carouselPlaceholder: {
    height: 200,
    backgroundColor: Colors.skeletonBg,
    borderRadius: 10,
    margin: 10,
  }
});