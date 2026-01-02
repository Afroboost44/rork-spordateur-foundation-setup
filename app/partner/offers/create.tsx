import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateOffer() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [datetime, setDatetime] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sport, setSport] = useState('');
  const [imagePreviewValid, setImagePreviewValid] = useState(false);

  const createOfferMutation = trpc.offers.createOffer.useMutation({
    onSuccess: () => {
      Alert.alert('Succès', 'Offre créée avec succès', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error) => {
      Alert.alert('Erreur', error.message);
    },
  });

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    try {
      new URL(url);
      setImagePreviewValid(true);
    } catch {
      setImagePreviewValid(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre');
      return;
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un prix valide');
      return;
    }

    if (!description.trim() || description.length < 10) {
      Alert.alert('Erreur', 'La description doit contenir au moins 10 caractères');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un lieu');
      return;
    }

    if (!datetime.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une date et heure (format: YYYY-MM-DDTHH:MM:SS)');
      return;
    }

    if (!sport.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un sport');
      return;
    }

    try {
      new URL(imageUrl);
    } catch {
      Alert.alert('Erreur', "L'URL de l'image n'est pas valide");
      return;
    }

    try {
      const partnerData = await AsyncStorage.getItem('partner');
      if (!partnerData) {
        Alert.alert('Erreur', 'Données partenaire introuvables');
        return;
      }

      const partner = JSON.parse(partnerData);

      createOfferMutation.mutate({
        partnerId: partner.id,
        title: title.trim(),
        price: parseFloat(price),
        description: description.trim(),
        datetime: datetime.trim(),
        location: location.trim(),
        imageUrl: imageUrl.trim(),
        sport: sport.trim(),
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création de l&apos;offre');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Créer une offre</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.label}>Titre de l&apos;offre *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Session de tennis"
            placeholderTextColor={colors.text.muted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Sport *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Tennis, Football, Basketball..."
            placeholderTextColor={colors.text.muted}
            value={sport}
            onChangeText={setSport}
          />

          <Text style={styles.label}>Prix (€) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 25.00"
            placeholderTextColor={colors.text.muted}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Décrivez votre offre..."
            placeholderTextColor={colors.text.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Lieu *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Paris, France"
            placeholderTextColor={colors.text.muted}
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>Date et heure *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DDTHH:MM:SS (Ex: 2026-02-15T14:30:00)"
            placeholderTextColor={colors.text.muted}
            value={datetime}
            onChangeText={setDatetime}
          />

          <Text style={styles.label}>Image de l&apos;offre (URL) *</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor={colors.text.muted}
            value={imageUrl}
            onChangeText={handleImageUrlChange}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === 'web') {
                window.open('https://imgur.com/upload', '_blank');
              } else {
                Alert.alert(
                  'Convertir image en URL',
                  'Utilisez un service comme Imgur.com pour télécharger votre image et obtenir une URL'
                );
              }
            }}
          >
            <Text style={styles.helperLink}>
              Comment convertir une image en URL gratuitement ?
            </Text>
          </TouchableOpacity>

          {imagePreviewValid && imageUrl && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.imagePreviewLabel}>Aperçu :</Text>
              <Image
                source={{ uri: imageUrl }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              createOfferMutation.isPending && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={createOfferMutation.isPending}
          >
            {createOfferMutation.isPending ? (
              <ActivityIndicator color={colors.text.main} />
            ) : (
              <Text style={styles.submitButtonText}>Créer l&apos;offre</Text>
            )}
          </TouchableOpacity>
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.main,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.bg.card,
    color: colors.text.main,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.bg.card,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  helperLink: {
    color: colors.primary.purple,
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  imagePreviewContainer: {
    marginTop: 8,
  },
  imagePreviewLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.bg.card,
  },
  submitButton: {
    backgroundColor: colors.primary.magenta,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.text.main,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
