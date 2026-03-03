/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useRoute } from '@react-navigation/native';
import { getBiteType } from '../api/bite-type';
import { ResizeMode, Video } from 'expo-av';
import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getCarousels } from '../api/carousel-api';
import { normalizeScreenName } from '../utils/navigationHelpers';
import Carousel from '../components/Carousel';
import Skeleton from '../components/Skeleton';
import { Colors } from '../constants/Colors';
import { CarouselItem } from './Home';

export default function BiteTypeVideosScreen() {
  const route = useRoute();
  const { title } = route.params as { title: string };

  const [carousel, setCarousel] = useState<CarouselItem[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [carouselLoading, setCarouselLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const videoRefs = useRef<(Video | null)[]>([]);
  const [mutedMap, setMutedMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchCarousels = async () => {
      try {
        const res = await getCarousels();
        setCarousel(
          res.data.biteTypeCarousel.map((img: any) => ({
            uri: img.imageUrl,
            type: img.type,
            group: 'bite-type',
            navigateTo: normalizeScreenName(img.screenName) || 'DefaultScreen',
          })),
        );
        // prefetch carousel images
        const urls = (res.data.biteTypeCarousel || []).map((it: any) => it.imageUrl).filter(Boolean);
        if (urls.length === 0) {
          setCarouselLoading(false);
        } else {
          try {
            await Promise.all(urls.map((u: string) => Image.prefetch(u)));
          } catch (e) {
            console.warn('Carousel prefetch failed', e);
          }
          setCarouselLoading(false);
        }
      } catch (error) {
        console.error('Failed to load carousels:', error);
        setCarouselLoading(false);
      }
    };

    const fetchVideos = async () => {
      try {
        setVideosLoading(true);
        const res = await getBiteType();
        const bite = res.data.find((item: any) => item.title === title);
        if (bite) setVideos(bite.videos);
        setVideosLoading(false);
      } catch (err) {
        console.error('Failed to load bite type videos:', err);
        setVideosLoading(false);
      }
    };

    fetchCarousels();
    fetchVideos();
  }, [title]);

  const handlePlayPause = async (index: number) => {
    const currentRef = videoRefs.current[index];
    if (!currentRef) return;

    const status = await currentRef.getStatusAsync();

    if ('isLoaded' in status && status.isLoaded) {
      if (status.isPlaying) {
        await currentRef.pauseAsync();
        setPlayingIndex(null);
      } else {
        // Pause others
        await Promise.all(
          videoRefs.current.map(async (ref, i) => {
            if (ref && i !== index) {
              const s = await ref.getStatusAsync();
              if ('isLoaded' in s && s.isLoaded && s.isPlaying) {
                await ref.pauseAsync();
              }
            }
          }),
        );

        await currentRef.playAsync();
        setPlayingIndex(index);
      }
    }
  };

  const toggleMute = async (index: number) => {
    const currentlyMuted = !!mutedMap[index];
    const next = !currentlyMuted;
    setMutedMap((prev) => ({ ...prev, [index]: next }));

    const ref = videoRefs.current[index];
    try {
      if (ref && typeof (ref as any).setIsMutedAsync === 'function') {
        // keep native state in sync
        await (ref as any).setIsMutedAsync(next);
      }
    } catch (e) {
      // ignore
      // Video prop `isMuted` will still apply on next render
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* If no carousel (after loading), show videos at top */}
      {(!carouselLoading && carousel.length === 0) ? (
        <View>
          <Text style={styles.heading}>Videos for: {title}</Text>
          {videosLoading ? (
            // show two shimmering skeletons while videos load
            <>
              <View style={{ marginTop: 12 }}>
                <Skeleton width={'100%'} height={(Dimensions.get('window').width - 24) * (9 / 16)} radius={12} />
              </View>
              <View style={{ marginTop: 12 }}>
                <Skeleton width={'100%'} height={(Dimensions.get('window').width - 24) * (9 / 16)} radius={12} />
              </View>
            </>
          ) : (
            videos.length > 0 ? (
              videos.map((videoUrl, idx) => (
                <TouchableWithoutFeedback
                  key={idx}
                  onPress={() => handlePlayPause(idx)}
                >
                  <View style={{ position: 'relative' }}>
                    <Video
                      ref={(ref) => { (videoRefs.current[idx] = ref) }}
                      source={{ uri: videoUrl }}
                      style={styles.videoFull}
                      resizeMode={ResizeMode.CONTAIN}
                      useNativeControls
                      isLooping
                      isMuted={!!mutedMap[idx]}
                    />

                    <TouchableWithoutFeedback onPress={() => toggleMute(idx)}>
                      <View style={styles.muteButton}>
                        <Ionicons name={mutedMap[idx] ? 'volume-mute' : 'volume-high'} size={18} color="#fff" />
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              ))
            ) : (
              <View style={styles.noVideoBox}>
                <Text style={styles.noVideoText}>No Videos available to play</Text>
              </View>
            )
          )}
        </View>
      ) : (
        // otherwise show carousel first, then videos section
        <>
          {carouselLoading ? (
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Skeleton width={'100%'} height={200} radius={10} />
            </View>
          ) : (
            <Carousel images={carousel} />
          )}

          <Text style={styles.heading}>Videos for: {title}</Text>

          {videosLoading ? (
            <>
              <View style={{ marginTop: 12 }}>
                <Skeleton width={'100%'} height={(Dimensions.get('window').width - 24) * (9 / 16)} radius={12} />
              </View>
              <View style={{ marginTop: 12 }}>
                <Skeleton width={'100%'} height={(Dimensions.get('window').width - 24) * (9 / 16)} radius={12} />
              </View>
            </>
          ) : (
            videos.length > 0 ? (
              videos.map((videoUrl, idx) => (
                <TouchableWithoutFeedback
                  key={idx}
                  onPress={() => handlePlayPause(idx)}
                >
                  <View style={{ position: 'relative' }}>
                    <Video
                      ref={(ref) => { (videoRefs.current[idx] = ref) }}
                      source={{ uri: videoUrl }}
                      style={styles.videoFull}
                      resizeMode={ResizeMode.CONTAIN}
                      useNativeControls
                      isLooping
                      isMuted={!!mutedMap[idx]}
                    />

                    <TouchableWithoutFeedback onPress={() => toggleMute(idx)}>
                      <View style={styles.muteButton}>
                        <Ionicons name={mutedMap[idx] ? 'volume-mute' : 'volume-high'} size={18} color="#fff" />
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              ))
            ) : (
              <View style={styles.noVideoBox}>
                <Text style={styles.noVideoText}>No Videos available to play</Text>
              </View>
            )
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    paddingBottom: 110,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  error: {
    fontSize: 18,
    color: Colors.error,
    fontWeight: '600',
  },
  videoFull: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: Colors.shadow,
    marginTop: 12,
  },
  noVideoBox: {
    width: '100%',
    backgroundColor: Colors.skeletonBg,
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  noVideoText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  muteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.overlayBg,
    padding: 6,
    borderRadius: 18,
    zIndex: 10,
  },
});
