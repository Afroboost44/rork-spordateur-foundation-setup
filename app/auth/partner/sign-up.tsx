import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import colors from "@/constants/colors";

export default function PartnerSignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [address, setAddress] = useState("");

  const registerMutation = trpc.auth.partnerRegister.useMutation({
    onSuccess: () => {
      Alert.alert(
        "Demande envoyée !",
        "Votre compte partenaire a été créé. Vous serez notifié une fois approuvé par l'équipe Spordateur.",
        [{ text: "OK", onPress: () => router.replace("/auth/partner/login") }]
      );
    },
    onError: (error) => {
      Alert.alert("Erreur", error.message);
    },
  });

  const handleSignUp = () => {
    if (!email || !password || !companyName || !address) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    registerMutation.mutate({
      email,
      password,
      companyName,
      description,
      websiteLink,
      address,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Inscription Partenaire",
          headerStyle: { backgroundColor: colors.bg.card },
          headerTintColor: colors.text.main,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Devenir Partenaire</Text>
        <Text style={styles.subtitle}>
          Proposez vos offres sportives à notre communauté
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="contact@votreclub.com"
            placeholderTextColor={colors.text.muted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mot de passe *</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Min. 6 caractères"
            placeholderTextColor={colors.text.muted}
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom de l&apos;entreprise *</Text>
          <TextInput
            style={styles.input}
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="Club Sportif XYZ"
            placeholderTextColor={colors.text.muted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Adresse complète *</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Rue, Ville, Code postal"
            placeholderTextColor={colors.text.muted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Site Web (optionnel)</Text>
          <TextInput
            style={styles.input}
            value={websiteLink}
            onChangeText={setWebsiteLink}
            placeholder="https://votreclub.com"
            placeholderTextColor={colors.text.muted}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Présentez votre club et vos services..."
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            📋 Votre compte sera en attente de validation par notre équipe.
            Vous recevrez une notification par email une fois approuvé.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.signUpButton,
            registerMutation.isPending && styles.disabledButton,
          ]}
          onPress={handleSignUp}
          disabled={registerMutation.isPending}
          testID="partner-sign-up-button"
        >
          <Text style={styles.signUpButtonText}>
            {registerMutation.isPending
              ? "Envoi en cours..."
              : "Soumettre ma demande"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push("/auth/partner/login")}
        >
          <Text style={styles.loginLinkText}>
            Déjà partenaire ?{" "}
            <Text style={styles.loginLinkTextBold}>Se connecter</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.main,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: colors.text.main,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text.main,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.bg.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text.main,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  infoBox: {
    backgroundColor: colors.bg.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.magenta,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  signUpButton: {
    backgroundColor: colors.primary.magenta,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.text.main,
  },
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  loginLinkTextBold: {
    color: colors.primary.magenta,
    fontWeight: "700" as const,
  },
});
