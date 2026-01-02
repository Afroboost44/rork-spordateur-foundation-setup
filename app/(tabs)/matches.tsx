import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';

export default function MatchesScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: matches, isLoading } = trpc.matching.getMatches.useQuery({
    currentUserId: user?.id || '',
  }, {
    enabled: !!user?.id,
  });

  const handleMatchPress = (chatId: string | null | undefined) => {
    if (chatId) {
      router.push(`/chat/${chatId}` as any);
    }
  };

  const renderMatch = ({ item }: any) => {
    const user = item.matchedUser;
    const imageUrl = user.images && user.images.length > 0 ? user.images[0] : null;

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => handleMatchPress(item.chatId)}
      >
        <View style={styles.matchImageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.matchImage} />
          ) : (
            <View style={[styles.matchImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>
                {user.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>
            {user.name}, {user.age}
          </Text>
          {user.bio && (
            <Text style={styles.matchBio} numberOfLines={2}>
              {user.bio}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => handleMatchPress(item.chatId)}
        >
          <MessageCircle size={24} color={colors.brand.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!matches || matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun match pour le moment</Text>
          <Text style={styles.emptySubtext}>
            Commencez à swiper pour trouver des matchs !
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatch}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.main,
  },
  listContainer: {
    padding: 16,
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
  matchCard: {
    flexDirection: 'row',
    backgroundColor: colors.bg.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  matchImageContainer: {
    marginRight: 16,
  },
  matchImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  placeholderImage: {
    backgroundColor: colors.brand.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text.main,
  },
  matchInfo: {
    flex: 1,
    marginRight: 12,
  },
  matchName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text.main,
    marginBottom: 4,
  },
  matchBio: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  chatButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bg.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
