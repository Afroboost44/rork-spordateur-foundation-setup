import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MapPin, Calendar, Tag } from 'lucide-react-native';
import colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';

export default function OffersScreen() {
  const { data: offers, isLoading } = trpc.offers.getAvailable.useQuery();

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderOffer = ({ item }: any) => (
    <TouchableOpacity style={styles.offerCard}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.offerImage}
        resizeMode="cover"
      />
      
      <View style={styles.offerContent}>
        <View style={styles.headerRow}>
          <View style={styles.sportTag}>
            <Tag size={14} color={colors.text.main} />
            <Text style={styles.sportText}>{item.sport}</Text>
          </View>
          <Text style={styles.price}>{item.price} CHF</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Calendar size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>{formatDate(item.datetime)}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <MapPin size={16} color={colors.text.secondary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>

        <View style={styles.partnerRow}>
          <Text style={styles.partnerLabel}>Organisé par</Text>
          <Text style={styles.partnerName}>{item.partnerName}</Text>
        </View>

        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Réserver</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!offers || offers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune offre disponible</Text>
          <Text style={styles.emptySubtext}>
            Les partenaires n&apos;ont pas encore créé d&apos;activités
          </Text>
        </View>
      ) : (
        <FlatList
          data={offers}
          renderItem={renderOffer}
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
  offerCard: {
    backgroundColor: colors.bg.card,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  offerImage: {
    width: '100%',
    height: 200,
  },
  offerContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  sportText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.text.main,
  },
  price: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.brand.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text.main,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
    gap: 8,
  },
  partnerLabel: {
    fontSize: 12,
    color: colors.text.muted,
  },
  partnerName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.text.secondary,
  },
  bookButton: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.main,
  },
});
