/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import { showError } from '../utils/errorAlert';
import { useUser } from '../contexts/UserContext';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { addToCart } from '../api/cart-api';
import { useCart } from '../contexts/CartContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import FeatureStats from '../components/FeatureStats';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import Transformation from '../components/Transformation';
import ProductCard from '../components/ProductCard';
import { getContactUs } from '../api/contact-us-api';
import { AVPlaybackSource, ResizeMode, Video } from 'expo-av';
import { FlatList } from 'react-native';
import { getDoctorAssignment } from '../api/user-api';
import { getMyReports, uploadReportImage } from '../api/report-api';
import * as ImagePicker from 'expo-image-picker';
import MeetModal from '../components/Meet';
import { getUserMeets } from '../api/meet-api';
import { getDoctorTeams } from '../api/doctors-team';
import Skeleton from '../components/Skeleton';
import { Colors } from '../constants/Colors';
import { showSuccess } from '../utils/successToast';
import WHITENING_PEN_1 from '../../assets/static_assets/WHITENING_PEN_1.png';
import WHITENING_GEL_1 from '../../assets/static_assets/WHITENING_GEL_1.png';
import CONSULTANT_IMAGE from '../../assets/static_assets/CONSULTANT_IMAGE.jpg';

const products = [
  {
    title: 'Whitening pen',
    _id: '682779a388e60dac093dbb8a',
    images: WHITENING_PEN_1,
    price: 599,
    originalPrice: 899,
  },
  {
    title: 'Whitening gel',
    _id: '682779a388e60dac093dbb89',
    images: WHITENING_GEL_1,
    price: 899,
    originalPrice: 1299,
  },
];

const programSteps = [
  { title: 'Full month Intraoral scan', sessions: '1 Live Session' },
  { title: 'Orthodontist Consultation', sessions: '3 Session' },
  { title: 'Aligner Plan Confirmation', sessions: '2 Session' },
  { title: 'Counselling and monitoring', sessions: '3 Session' },
];

const alignerFAQs = [
  {
    question: 'Do aligners cause pain?',
    answer:
      'Mild discomfort is normal when starting aligners or switching to a new set. It means your teeth are moving as planned. This usually subsides within a few days.',
  },
  {
    question: 'I feel discomfort while wearing my aligners. What should I do?',
    answer:
      'Discomfort can be managed by:\n\n• Wearing the aligners as instructed (usually 20–22 hours a day)\n• Using chewies to seat aligners properly\n• Taking a mild pain reliever if needed\n• Contacting the Mydent support team if pain is sharp or persistent',
  },
  {
    question: 'How do I properly wear and remove my aligners?',
    answer:
      'To wear: Gently push them over your front teeth, then press down on your molars using your fingertips.\n\nTo remove: Use your fingers to lift the aligners from the molars on one side, then the other, and gently peel them off the front teeth.\n\nAlways use clean, dry hands and avoid using sharp objects.',
  },
  {
    question: 'When can I expect to see visible results?',
    answer:
      'Most users notice changes within 6–8 weeks. However, this can vary based on the complexity of your case and your consistency in wearing the aligners.',
  },
  {
    question: 'How can I avoid relapse after completing my treatment?',
    answer:
      'Relapse can be prevented by:\n\n• Wearing your retainers as instructed after treatment\n• Following post-treatment care guidance\n• Attending follow-ups if advised by your orthodontist',
  },
  {
    question: 'What are Mydent Booster Aligners and Enhancement Aligners?',
    answer:
      'Booster Aligners are used to speed up or improve the results of ongoing treatment.\n\nEnhancement Aligners are provided after your initial treatment if slight corrections are still needed. These are designed to perfect your smile and ensure long-term stability.',
  },
  {
    question:
      'What dental procedures might be involved in my treatment journey?',
    answer:
      'Your treatment might include:\n\n• IPR (Interproximal Reduction) to create space between teeth\n• Attachments or buttons to help guide tooth movement\n• Dental cleanings before and during treatment\n• Extractions in select cases (rare for aligner-only plans)\n\nAll procedures are planned by a licensed orthodontist based on your need',
  },
];

interface DoctorAssignment {
  doctor: {
    _id: string;
    name: string;
    specialization?: string;
    email?: string;
    place?: string;
  };
  step: number;
  assignedAt: Date;
}

interface DoctorTeams {
  name: string;
  image: string;
  time: string;
  date: string;
  type: string;
}

const formatAppointmentDateTime = (date: Date | null) => {
  if (!date) return { dateString: '', timeString: '' };

  return {
    dateString: date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    timeString: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  };
};

export default function ContactUsScreen() {
  const [activeAlignerIndex, setActiveAlignerIndex] = useState<number | null>(
    null,
  );
  const [videos, setVideos] = useState<AVPlaybackSource[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);

  const [reports, setReports] = useState<string[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  const [doctorTeams, setDoctorTeams] = useState<DoctorTeams[] | []>([]);
  const [doctorTeamsLoading, setDoctorTeamsLoading] = useState(true);

  const [doctorAssignment, setDoctorAssignment] =
    useState<DoctorAssignment | null>(null);
  const [doctorAssignmentLoading, setDoctorAssignmentLoading] = useState(true);

  const navigation = useNavigation<NavigationProp<any>>();

  const [modalVisible, setModalVisible] = useState(false);
  const [meetLink, setMeetLink] = useState('');
  const { user } = useUser();

  const videoRefs = useRef<(Video | null)[]>([]);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const handlePlayPause = async (index: number) => {
    const currentRef = videoRefs.current[index];
    if (!currentRef) return;

    const status = await currentRef.getStatusAsync();

    if ('isLoaded' in status && status.isLoaded) {
      if (status.isPlaying) {
        await currentRef.pauseAsync();
        setPlayingIndex(null);
      } else {
        // Pause all others
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

  const handleJoinClick = async () => {
    try {
      const res = await getUserMeets();
      if (res.data?.length > 0) {
        setMeetLink(res.data[0].meetLink);
        setModalVisible(true);
      } else {
        alert('No meeting found.');
      }
    } catch (err) {
      console.error('Failed to fetch meet:', err);
    }
  };

  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    React.useCallback(() => {
      // 👇 Scroll to top on tab focus
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  useEffect(() => {
    const fetchDoctorData = async () => {
      setDoctorAssignmentLoading(true);
      try {
        const res = await getDoctorAssignment();
        const assignment = {
          ...res.data,
          assignedAt: new Date(res.data.assignedAt),
        };
        setDoctorAssignment(assignment);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setDoctorAssignment(null); // No assignment found
        } else {
          console.error('Failed to fetch doctor assignment:', err);
        }
      } finally {
        setDoctorAssignmentLoading(false);
      }
    };

    const fetchTeams = async () => {
      if (!user?._id) {
        setDoctorTeamsLoading(false);
        return;
      }
      setDoctorTeamsLoading(true);
      try {
        const res = await getDoctorTeams(user?._id);
        const data = res.data || [];
        setDoctorTeams(data);

        // Prefetch team images
        const urls: string[] = [];
        data.forEach((d: any) => {
          if (d?.image) urls.push(d.image);
        });
        if (urls.length > 0) {
          try {
            await Promise.all(urls.map((u) => Image.prefetch(u)));
          } catch (e) {
            console.warn('Doctor team images prefetch failed', e);
          }
        }
      } catch (error) {
        console.error('Failed to fetch doctor teams', error);
      } finally {
        setDoctorTeamsLoading(false);
      }
    };

    const fetchContactData = async () => {
      setVideosLoading(true);
      try {
        const res = await getContactUs();
        const allVideos: string[] = [];

        // Flatten all videos from all documents
        res.data.forEach((doc: any) => {
          if (doc.videos && Array.isArray(doc.videos)) {
            allVideos.push(...doc.videos);
          }
        });

        if (allVideos.length > 0) {
          const sources = allVideos.map((url) => ({ uri: url }));
          setVideos(sources);
        }
      } catch (err) {
        console.error('Failed to fetch contact data:', err);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchDoctorData();
    fetchContactData();
    fetchTeams();
  }, []);

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const { data } = await getMyReports();
      const urls = data.map((r: any) => r.imageUrl).filter(Boolean);
      setReports(urls);

      // Prefetch report images
      if (urls.length > 0) {
        try {
          await Promise.all(urls.map((u: string) => Image.prefetch(u)));
        } catch (e) {
          console.warn('Report images prefetch failed', e);
        }
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as const,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const image = result.assets[0];
      const formData = new FormData();

      formData.append('image', {
        uri: image.uri,
        type: 'image/jpeg',
        name: 'report.jpg',
      } as any);

      try {
        await uploadReportImage(formData);
        await fetchReports(); // refresh after upload
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const toggleAlignerFAQ = (index: number) => {
    setActiveAlignerIndex(activeAlignerIndex === index ? null : index);
  };

  const { addItems, addProductId } = useCart();
  const { requireAuth } = useRequireAuth();

  const handleAddToCart = async (product: any, quantity: number) => {
    if (!requireAuth(async () => {
      try {
        if (!product || !product._id) {
          showError('Product ID is missing');
          return;
        }
        await addToCart(product._id, quantity);
        addItems(quantity);
        addProductId(product._id);
        showSuccess(`${product.title} added to cart`);
      } catch (error: any) {
        console.error(error);
        const msg = error?.response?.data?.message || error?.message || '';
        if (typeof msg === 'string' && msg.toLowerCase().includes('out of stock')) {
          showError(`${product.title} is out of stock`);
        } else {
          showError('Failed to add product to cart');
        }
      }
    }, 'Please log in to add items to your cart')) {
      return;
    }
  };

  return (
    <ScrollView style={styles.container} ref={scrollRef}>
      {/* 1. Welcome Section */}
      <View style={styles.welcomeContainer}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          <View style={styles.profileRow}>
            <Image
              source={CONSULTANT_IMAGE}
              style={styles.profileImage}
              fadeDuration={0}
              resizeMethod="resize"
            />
            <Text style={styles.helloText}>Hello, {user?.firstName}</Text>
          </View>
          <Text style={styles.subText}>
            Start your journey of Aligners with us
          </Text>

          <TouchableOpacity style={styles.coordinatorButton} onPress={() => Linking.openURL('https://wa.me/+919381590963')}>
            <Text style={styles.buttonText}>
              Reach out to your program co-ordinator
            </Text>
            <Text style={styles.timeText}>🕒 8Am - 11Pm</Text>
          </TouchableOpacity>
        </View>

        {/* Right Side: Bell Icon */}
        <TouchableOpacity style={styles.bellIconWrapper}>
          <Ionicons name="notifications-outline" size={24} color={Colors.teal} />
        </TouchableOpacity>
      </View>
      {/* 2. Program Structure Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Program Structure</Text>
        <View style={styles.timelineContainer}>
          {programSteps.map((item, index) => {
            // Get current step from doctorAssignment (default to 0 if not available)
            const currentStep = doctorAssignment?.step || 0;
            // Step numbers start at 1, so we compare with index+1
            const isCompleted = index + 1 < currentStep;
            const isCurrent = index + 1 === currentStep;

            return (
              <View key={index} style={styles.stepContainer}>
                {/* Circle marker - filled if completed or current */}
                <View
                  style={[
                    styles.circle,
                    isCompleted || isCurrent
                      ? styles.filledCircle
                      : styles.hollowCircle,
                    isCurrent && styles.currentCircle, // Add special style for current step
                  ]}
                />

                {/* Vertical connector line - filled if next step is completed */}
                {index !== programSteps.length - 1 && (
                  <View
                    style={[
                      styles.verticalLine,
                      isCompleted && styles.completedLine,
                    ]}
                  />
                )}

                {/* Text container */}
                <View style={styles.stepTextWrapper}>
                  <Text
                    style={[
                      styles.stepTitle,
                      (isCompleted || isCurrent) && styles.completedText,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.stepSession}>{item.sessions}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
      {/* 3. Schedule */}
      <View style={styles.todayAppointmentCard}>
        <Text style={styles.todayTitle}>Today's Appointment</Text>

        {doctorAssignmentLoading ? (
          <View style={{ padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Skeleton width={64} height={64} radius={32} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Skeleton width={'50%'} height={16} radius={6} style={{ marginBottom: 6 }} />
                <Skeleton width={'40%'} height={12} radius={6} />
              </View>
            </View>
            <View style={{ marginTop: 12 }}>
              <Skeleton width={'100%'} height={140} radius={8} />
            </View>
          </View>
        ) : doctorAssignment ? (
          <>
            <Text style={styles.appointmentId}>
              Appointment ID: {doctorAssignment.doctor._id}
            </Text>
            <View style={styles.doctorInfo}>
              <Image
                source={CONSULTANT_IMAGE}
                style={styles.expertImage}
                fadeDuration={0}
                resizeMethod="resize"
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.doctorName}>
                  {doctorAssignment.doctor.name}
                </Text>
                <Text style={styles.doctorSpeciality}>
                  {doctorAssignment.doctor.specialization}
                </Text>
                <Text style={styles.ratingStars}>★★★★★</Text>
                <View style={styles.timeRow}>
                  <Text style={styles.scheduleTime}>
                    🕒{' '}
                    {
                      formatAppointmentDateTime(doctorAssignment.assignedAt)
                        .timeString
                    }
                  </Text>
                  <Text style={[styles.scheduleDate, { marginLeft: 10 }]}>
                    📅{' '}
                    {
                      formatAppointmentDateTime(doctorAssignment.assignedAt)
                        .dateString
                    }
                  </Text>
                </View>
              </View>
            </View>

            {user?.paid === 'paid' && (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={handleJoinClick}
                >
                  <Text style={styles.joinButtonText}>Join video call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rescheduleButton}>
                  <Text style={styles.rescheduleText}>Reschedule</Text>
                </TouchableOpacity>
              </View>
            )}

            <MeetModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              meetLink={meetLink}
            />

            <View>
              <View style={styles.uploadRow}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleUpload}
                >
                  <Text style={styles.uploadText}>📎 Upload Reports</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={fetchReports}>
                  <Text style={styles.viewText}>View</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {reportsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} width={120} height={120} radius={10} style={{ marginRight: 10, marginTop: 16 }} />
                  ))
                ) : (
                  reports.map((url, index) => (
                    <Image
                      key={index}
                      source={{ uri: url }}
                      style={styles.reportImage}
                      resizeMode="cover"
                      fadeDuration={0}
                      resizeMethod="resize"
                    />
                  ))
                )}
              </ScrollView>
            </View>
          </>
        ) : (
          <View style={styles.noAppointmentContainer}>
            <Image
              source={CONSULTANT_IMAGE}
              style={styles.noAppointmentImage}
              fadeDuration={0}
              resizeMethod="resize"
            />
            <Text style={styles.noAppointmentText}>
              No appointment scheduled for today
            </Text>
            <TouchableOpacity style={styles.bookButton} onPress={() => navigation.navigate('HomeTab', { screen: 'ConsultationOption' })}>
              <Text style={styles.bookButtonText}>Book an Appointment</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {/* 4. Team of Experts*/}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          Your Team of IOS certified Orthodontist
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.expertsContainer}
        >
          {doctorTeamsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <View key={i} style={styles.expertBox}>
                <Skeleton width={64} height={64} radius={32} style={{ marginRight: 12 }} />
                <Skeleton width={80} height={12} style={{ marginTop: 8 }} />
              </View>
            ))
          ) : (
            doctorTeams.map((item, idx) => (
              <View key={idx} style={styles.expertBox}>
                <Image source={{ uri: item.image }} style={styles.expertImage} fadeDuration={0} resizeMethod="resize" />
                <Text style={styles.expertName}>{item.name}</Text>
              </View>
            ))
          )}
        </ScrollView>
        {doctorTeams.length === 0 && (
          <Text style={styles.noAppointmentText}>No Doctors Team Assigned</Text>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
          Schedule Appointments
        </Text>
        {doctorTeamsLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <View key={i} style={styles.scheduleItem}>
              <View style={{ flex: 1 }}>
                <Skeleton width={120} height={14} style={{ marginBottom: 6 }} />
                <Skeleton width={80} height={12} />
              </View>
              <View>
                <Skeleton width={60} height={14} />
                <Skeleton width={60} height={12} style={{ marginTop: 6 }} />
              </View>
            </View>
          ))
        ) : (
          doctorTeams.map((item, index) => (
            <View key={index} style={styles.scheduleItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.scheduleDoctor}>{item.name}</Text>
                <Text style={styles.scheduleInfo}>{item.type}</Text>
              </View>
              <View>
                <Text style={styles.scheduleTime}>{item.time}</Text>
                <Text style={styles.scheduleDate}>{item.date}</Text>
              </View>
            </View>
          ))
        )}

        {doctorTeams.length === 0 && (
          <Text style={styles.noAppointmentText}>
            No Appointments scheduled
          </Text>
        )}
      </View>
      {/* 5. Video Section */}
      <View style={styles.videoStepContainer}>
        {/* Heading and View All button */}
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Testimonials</Text>
          <TouchableOpacity onPress={() => { }}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Videos */}
        <FlatList
          data={videos}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingHorizontal: 12 }}
          renderItem={({ item, index }) => (
            <TouchableWithoutFeedback onPress={() => handlePlayPause(index)}>
              <Video
                ref={(ref) => { (videoRefs.current[index] = ref) }}
                source={item}
                style={styles.videoItem}
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                useNativeControls
              />
            </TouchableWithoutFeedback>
          )}
        />
      </View>
      {/* 6. Product Section & FAQs */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Buy Products</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProductsTab')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productRow}>
          {products.map((item) => (
            <ProductCard
              key={item._id}
              item={item}
              onAddToCart={(product: any, quantity: any) =>
                handleAddToCart(product, quantity)
              }
              onToggleFavorite={(id: string, isFav: boolean) => {
                console.log('Favorite toggled:', id, isFav);
              }}
            />
          ))}
        </View>

        <Transformation navigation={navigation} />

        <View style={[styles.faq, { marginTop: 24 }]}>
          <Text style={styles.title}>Aligner FAQs</Text>
          <View style={[styles.separator, { marginTop: 16 }]} />

          {alignerFAQs.map((faq, index) => (
            <View key={index}>
              <View style={styles.item}>
                <TouchableOpacity
                  onPress={() => toggleAlignerFAQ(index)}
                  activeOpacity={0.8}
                >
                  <View style={styles.questionRow}>
                    <Text style={styles.question}>{faq.question}</Text>
                    <Ionicons
                      name={
                        activeAlignerIndex === index
                          ? 'chevron-up-outline'
                          : 'chevron-down-outline'
                      }
                      size={20}
                      color={Colors.tabInactive}
                    />
                  </View>
                </TouchableOpacity>
                {activeAlignerIndex === index && (
                  <Text style={styles.answer}>{faq.answer}</Text>
                )}
              </View>

              {/* Horizontal line after each FAQ */}
              <View style={styles.separator} />
            </View>
          ))}
        </View>
      </View>
      <FeatureStats />
      <View style={styles.footerContainer}>
        {/* Quick Links */}
        <Text style={styles.footerHeading}>Quick Links</Text>
        <View style={styles.linkColumns}>
          <View style={styles.linkColumn}>
            <TouchableOpacity onPress={() => navigation.navigate('HomeTab')}>
              <Text style={styles.linkText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ProductsTab')}
            >
              <Text style={styles.linkText}>Order Products</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Home', {
                  screen: 'TermsAndConditionsScreen',
                })
              }
            >
              <Text style={styles.linkText}>Cancellation & Refund</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('FavProductScreen')}
            >
              <Text style={styles.linkText}>Favorite Page</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Home', {
                  screen: 'TermsAndConditionsScreen',
                })
              }
            >
              <Text style={styles.linkText}>Terms and Conditions | mydent</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Home', {
                  screen: 'TermsAndConditionsScreen',
                })
              }
            >
              <Text style={styles.linkText}>Shipping Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('CartScreen')}>
              <Text style={styles.linkText}>Cart Page</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.linkColumn}>
            <TouchableOpacity
              onPress={() => navigation.navigate('TransformationScreen')}
            >
              <Text style={styles.linkText}>Success Stories</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Mydent')}>
              <Text style={styles.linkText}>Mydent Aligners</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('CentersTab')}>
              <Text style={styles.linkText}>Mydent Centers</Text>
            </TouchableOpacity>

            <Text style={styles.linkText}>support@mydent.com</Text>

            <Text style={[styles.linkText, { marginTop: 10 }]}>Mobile:</Text>
            <Text style={styles.linkText}>+9 19381590963</Text>
          </View>
        </View>

        {/* About Company */}
        <Text style={styles.footerHeading}>About Company</Text>
        <Text style={styles.linkText}>
          Corporate Office Address:
          {'\n'}mydent pvt.ltd, 4th floor, Apurupa Turbo Tower, No:36 Pillar No:1680, H.No 8-2-293/82/a/787, Jubilee Hills, Hyderabad, Telangana , 500033
        </Text>

        {/* Footer Note */}
        <Text style={styles.footerNote}>@2025, Mydent</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.screenBg,
    flex: 1,
    paddingBottom: 120,
  },
  currentCircle: {
    backgroundColor: Colors.warning,
    borderColor: Colors.warning,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.successAlt,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 14,
    color: Colors.primaryLight,
  },
  faq: {
    padding: 20,
    borderRadius: 12,
  },
  item: {
    marginBottom: 12,
  },
  videoStepContainer: {
    margin: 16,
  },
  videoFull: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: Colors.shadow,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoItem: {
    width: 350,
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.shadow,
  },

  question: {
    fontWeight: '600',
    fontSize: 15,
    color: Colors.textBody,
    flex: 1,
  },
  icon: {
    fontSize: 16,
    color: Colors.tabInactive,
    marginLeft: 8,
  },
  answer: {
    marginTop: 6,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  welcomeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: Colors.primaryBg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  leftSection: {
    flex: 1,
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },

  helloText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.teal,
  },

  subText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
  },

  coordinatorButton: {
    backgroundColor: Colors.brandRed,
    padding: 10,
    borderRadius: 12,
    maxWidth: 300,
  },

  buttonText: {
    color: Colors.textOnBrand,
    fontSize: 14,
    fontWeight: '600',
  },

  timeText: {
    color: Colors.textOnBrand,
    fontSize: 12,
    marginTop: 4,
  },

  bellIconWrapper: {
    padding: 8,
  },
  sectionCard: {
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  timelineContainer: {
    paddingLeft: 10,
    position: 'relative',
  },

  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    position: 'relative',
  },

  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 2,
    marginRight: 10,
    zIndex: 1,
  },

  filledCircle: {
    backgroundColor: Colors.info,
  },

  hollowCircle: {
    borderWidth: 2,
    borderColor: Colors.info,
    backgroundColor: Colors.cardBg,
  },

  verticalLine: {
    position: 'absolute',
    top: 12,
    left: 4,
    height: '100%',
    width: 2,
    backgroundColor: Colors.info,
    zIndex: 0,
  },

  stepTextWrapper: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  stepTitle: {
    color: Colors.info,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  stepSession: {
    fontSize: 13,
    color: Colors.textBody,
    fontWeight: '500',
    marginLeft: 10,
  },
  bellIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.teal,
  },
  welcomeSection: {
    backgroundColor: Colors.primaryBg,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.info,
    fontWeight: '600',
  },

  stepTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  programText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  sessionText: {
    color: Colors.successAlt,
    fontWeight: '600',
  },
  expertsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  expertBox: {
    alignItems: 'center',
    marginRight: 16,
  },
  expertImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 6,
    backgroundColor: Colors.border,
  },
  expertName: {
    fontSize: 13,
    color: Colors.textBody,
  },
  scheduleItem: {
    backgroundColor: Colors.primaryBg,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleDoctor: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textBody,
  },
  scheduleInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.info,
    textAlign: 'right',
  },
  scheduleDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: Colors.skeletonBg,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textBody,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  faqText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  todayAppointmentCard: {
    padding: 20,
    backgroundColor: Colors.skeletonBg,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
    elevation: 2,
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textBody,
    marginBottom: 4,
  },
  appointmentId: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  doctorInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.info,
  },
  doctorSpeciality: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ratingStars: {
    color: Colors.successDark,
    marginTop: 2,
  },
  completedLine: {
    backgroundColor: Colors.successDark,
  },
  completedText: {
    fontWeight: 'bold',
  },
  timeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  joinButton: {
    backgroundColor: Colors.successAlt,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  joinButtonText: {
    color: Colors.textOnBrand,
    fontWeight: '600',
  },
  rescheduleButton: {
    borderColor: Colors.info,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  rescheduleText: {
    color: Colors.info,
    fontWeight: '600',
  },
  uploadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  uploadText: {
    fontSize: 14,
    color: Colors.info,
  },
  viewText: {
    fontSize: 14,
    color: Colors.info,
    fontWeight: '600',
  },
  footerContainer: {
    backgroundColor: Colors.skeletonBg,
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -60,
    paddingBottom: 120,
  },
  footerHeading: {
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.textBody,
    marginBottom: 10,
  },
  linkColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkColumn: {
    flex: 1,
    marginRight: 10,
  },
  linkText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  footerNote: {
    marginTop: 16,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  whatsappIcon: {
    width: 40,
    height: 40,
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  noAppointmentContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noAppointmentImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  noAppointmentText: {
    fontSize: 16,
    color: Colors.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: Colors.brandRed,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  bookButtonText: {
    color: Colors.textOnBrand,
    fontWeight: 'bold',
  },

  uploadButton: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: Colors.textOnBrand,
    fontSize: 16,
  },
  reportImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 10,
    marginTop: 16,
  },
});
