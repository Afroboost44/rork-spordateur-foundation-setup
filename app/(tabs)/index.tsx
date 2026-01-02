import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, X } from 'lucide-react-native';
import colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.65;

export default function DiscoverScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);

  const { data: users, isLoading, refetch } = trpc.matching.getFeed.useQuery({
    currentUserId: user?.id || '',
    limit: 20,
  }, {
    enabled: !!user?.id,
  });

  const swipeMutation = trpc.matching.swipe.useMutation({
    onSuccess: (data) => {
      console.log('[DISCOVER] Swipe result:', data);
      if (data.isMatch) {
        setMatchData(data);
        setShowMatchModal(true);
      }
    },
    onError: (error) => {
      console.error('[DISCOVER] Swipe error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du swipe');
    },
  });

  const handleSwipe = async (direction: 'LIKE' | 'PASS') => {
    if (!users || users.length === 0) return;

    const currentUser = users[currentIndex];
    console.log('[DISCOVER] Swiping:', direction, 'on user:', currentUser.id);

    swipeMutation.mutate({
      currentUserId: user?.id || '',
      targetUserId: currentUser.id,
      direction,
    });

    if (currentIndex < users.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      console.log('[DISCOVER] End of feed, refetching...');
      setCurrentIndex(0);
      refetch();
    }
  };

  const handleLike = () => handleSwipe('LIKE');
  const handlePass = () => handleSwipe('PASS');

  const handleGoToChat = () => {
    setShowMatchModal(false);
    if (matchData?.chatId) {
      router.push(`/chat/${matchData.chatId}` as any);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (!users || users.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun profil disponible</Text>
          <Text style={styles.emptySubtext}>
            Revenez plus tard pour découvrir de nouveaux profils
          </Text>
        </View>
      </View>
    );
  }

  const currentUser = users[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {currentUser.images && currentUser.images.length > 0 && (
              <Image
                source={{ uri: currentUser.images[0] }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            )}

            <View style={styles.cardContent}>
              <View style={styles.headerSection}>
                <Text style={styles.name}>
                  {currentUser.name}, {currentUser.age}
                </Text>
                <Text style={styles.location}>{currentUser.location}</Text>
              </View>

              {currentUser.bio && (
                <View style={styles.bioSection}>
                  <Text style={styles.sectionTitle}>À propos</Text>
                  <Text style={styles.bio}>{currentUser.bio}</Text>
                </View>
              )}

              {currentUser.sports && currentUser.sports.length > 0 && (
                <View style={styles.sportsSection}>
                  <Text style={styles.sectionTitle}>Sports</Text>
                  <View style={styles.sportsContainer}>
                    {currentUser.sports.map((sport: string, index: number) => (
                      <View key={index} style={styles.sportTag}>
                        <Text style={styles.sportText}>{sport}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {currentUser.images && currentUser.images.length > 1 && (
                <View style={styles.moreImagesSection}>
                  <Text style={styles.sectionTitle}>Plus de photos</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imagesScroll}
                  >
                    {currentUser.images.slice(1).map((img: string, idx: number) => (
                      <Image
                        key={idx}
                        source={{ uri: img }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={handlePass}
          disabled={swipeMutation.isPending}
        >
          <X size={32} color={colors.text.main} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={handleLike}
          disabled={swipeMutation.isPending}
        >
          <Heart size={32} color={colors.text.main} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showMatchModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMatchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>C&apos;est un Match! 💖</Text>
            <Text style={styles.modalText}>
              Vous pouvez maintenant discuter ensemble
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleGoToChat}
            >
              <Text style={styles.modalButtonText}>Envoyer un message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowMatchModal(false)}
            >
              <Text style={styles.modalCloseText}>Continuer à découvrir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text.main,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.bg.card,
    borderRadius: 20,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  cardImage: {
    width: '100%',
    height: 350,
  },
  cardContent: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text.main,
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  bioSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text.main,
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  sportsSection: {
    marginBottom: 20,
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportTag: {
    backgroundColor: colors.brand.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sportText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text.main,
  },
  moreImagesSection: {
    marginBottom: 20,
  },
  imagesScroll: {
    marginTop: 8,
  },
  thumbnailImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    gap: 40,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  passButton: {
    backgroundColor: colors.action.danger,
  },
  likeButton: {
    backgroundColor: colors.brand.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.bg.card,
    borderRadius: 20,
    padding: 32,
    width: width * 0.85,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.text.main,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  modalButton: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text.main,
  },
  modalCloseButton: {
    paddingVertical: 12,
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});
