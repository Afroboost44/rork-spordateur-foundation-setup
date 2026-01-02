import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AlertCircle, Plus, Trash2 } from 'lucide-react-native';
import colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Partner {
  id: string;
  email: string;
  companyName: string;
  status: string;
  description?: string;
  websiteLink?: string;
  address: string;
}

export default function PartnerDashboard() {
  const router = useRouter();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartnerData();
  }, []);

  const loadPartnerData = async () => {
    try {
      const partnerData = await AsyncStorage.getItem('partner');
      if (partnerData) {
        setPartner(JSON.parse(partnerData));
      }
    } catch (error) {
      console.error('Error loading partner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const offersQuery = trpc.offers.getMyOffers.useQuery(
    { partnerId: partner?.id || '' },
    { enabled: !!partner?.id && partner?.status === 'APPROVED' }
  );

  const deleteOfferMutation = trpc.offers.deleteOffer.useMutation({
    onSuccess: () => {
      offersQuery.refetch();
      Alert.alert('Succès', 'Offre supprimée avec succès');
    },
    onError: (error) => {
      Alert.alert('Erreur', error.message);
    },
  });

  const handleDeleteOffer = (offerId: string) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cette offre ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            if (partner?.id) {
              deleteOfferMutation.mutate({ partnerId: partner.id, offerId });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary.magenta} />
      </View>
    );
  }

  if (!partner) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erreur: Partenaire non trouvé</Text>
      </View>
    );
  }

  if (partner.status === 'PENDING') {
    return (
      <View style={styles.container}>
        <View style={styles.pendingContainer}>
          <AlertCircle size={80} color={colors.action.yellow} />
          <Text style={styles.pendingTitle}>Compte en attente de validation</Text>
          <Text style={styles.pendingText}>
            Votre compte est en cours de validation par l&apos;administration.
          </Text>
          <Text style={styles.pendingSubtext}>
            Vous recevrez une notification une fois votre compte approuvé.
          </Text>
        </View>
      </View>
    );
  }

  if (partner.status === 'SUSPENDED') {
    return (
      <View style={styles.container}>
        <View style={styles.pendingContainer}>
          <AlertCircle size={80} color={colors.action.red} />
          <Text style={styles.pendingTitle}>Compte suspendu</Text>
          <Text style={styles.pendingText}>
            Votre compte a été suspendu. Contactez l&apos;administration pour plus d&apos;informations.
          </Text>
        </View>
      </View>
    );
  }

  if (partner.status === 'REJECTED') {
    return (
      <View style={styles.container}>
        <View style={styles.pendingContainer}>
          <AlertCircle size={80} color={colors.action.red} />
          <Text style={styles.pendingTitle}>Compte rejeté</Text>
          <Text style={styles.pendingText}>
            Votre demande d&apos;inscription a été rejetée. Contactez l&apos;administration pour plus d&apos;informations.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Offres</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/partner/offers/create')}
        >
          <Plus size={24} color={colors.text.main} />
          <Text style={styles.createButtonText}>Créer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {offersQuery.isLoading && (
          <ActivityIndicator size="large" color={colors.primary.magenta} />
        )}

        {offersQuery.data && offersQuery.data.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune offre créée</Text>
            <Text style={styles.emptySubtext}>
              Commencez par créer votre première offre
            </Text>
          </View>
        )}

        {offersQuery.data?.map((offer: any) => (
          <View key={offer.id} style={styles.offerCard}>
            <Image
              source={{ uri: offer.imageUrl }}
              style={styles.offerImage}
              resizeMode="cover"
            />
            <View style={styles.offerContent}>
              <Text style={styles.offerTitle}>{offer.title}</Text>
              <Text style={styles.offerSport}>{offer.sport}</Text>
              <Text style={styles.offerDescription} numberOfLines={2}>
                {offer.description}
              </Text>
              <View style={styles.offerFooter}>
                <View style={styles.offerDetails}>
                  <Text style={styles.offerPrice}>{offer.price.toFixed(2)} €</Text>
                  <Text style={styles.offerLocation}>{offer.location}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteOffer(offer.id)}
                  disabled={deleteOfferMutation.isPending}
                >
                  <Trash2 size={20} color={colors.action.red} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.main,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.bg.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.main,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.main,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.magenta,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: colors.text.main,
    fontSize: 16,
    fontWeight: '600',
  },
  pendingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  pendingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.main,
    marginTop: 24,
    textAlign: 'center',
  },
  pendingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  pendingSubtext: {
    fontSize: 14,
    color: colors.text.muted,
    marginTop: 8,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.muted,
    marginTop: 8,
  },
  offerCard: {
    backgroundColor: colors.bg.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  offerImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.bg.main,
  },
  offerContent: {
    padding: 16,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.main,
    marginBottom: 4,
  },
  offerSport: {
    fontSize: 14,
    color: colors.primary.magenta,
    fontWeight: '600',
    marginBottom: 8,
  },
  offerDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerDetails: {
    flex: 1,
  },
  offerPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.action.green,
    marginBottom: 4,
  },
  offerLocation: {
    fontSize: 12,
    color: colors.text.muted,
  },
  deleteButton: {
    padding: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.action.red,
  },
});
