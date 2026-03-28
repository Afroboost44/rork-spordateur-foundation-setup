import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import colors from "@/constants/colors";

export default function UserSignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [sports, setSports] = useState("");
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [image3, setImage3] = useState("");
  const [image4, setImage4] = useState("");
  const [image5, setImage5] = useState("");

  const registerMutation = trpc.auth.userRegister.useMutation({
    onSuccess: () => {
      Alert.alert(
        "Compte créé !",
        "Votre compte a été créé avec succès. Connectez-vous maintenant.",
        [{ text: "OK", onPress: () => router.replace("/auth/user/login") }]
      );
    },
    onError: (error) => {
      Alert.alert("Erreur", error.message);
    },
  });

  const handleSignUp = () => {
    const images = [image1, image2, image3, image4, image5].filter(
      (img) => img.trim() !== ""
    );

    if (!email || !password || !name || !age || !gender || !location) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (images.length === 0) {
      Alert.alert("Erreur", "Veuillez ajouter au moins une image (URL)");
      return;
    }

    const sportsArray = sports
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    if (sportsArray.length === 0) {
      Alert.alert("Erreur", "Veuillez ajouter au moins un sport");
      return;
    }

    registerMutation.mutate({
      email,
      password,
      name,
      age: parseInt(age, 10),
      gender,
      bio,
      location,
      sports: sportsArray,
      images,
    });
  };

  const openImageGuide = () => {
    Linking.openURL("https://imgbb.com/");
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Créer un compte",
          headerStyle: { backgroundColor: colors.bg.card },
          headerTintColor: colors.text.main,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Rejoindre Spordateur</Text>
        <Text style={styles.subtitle}>
          Trouvez des partenaires sportifs pour vos activités
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
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
          <Text style={styles.label}>Nom complet *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Votre nom"
            placeholderTextColor={colors.text.muted}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Âge *</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="18+"
              placeholderTextColor={colors.text.muted}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Genre *</Text>
            <TextInput
              style={styles.input}
              value={gender}
              onChangeText={setGender}
              placeholder="Homme/Femme"
              placeholderTextColor={colors.text.muted}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Localisation *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Ville, Région"
            placeholderTextColor={colors.text.muted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sports (séparés par des virgules) *</Text>
          <TextInput
            style={styles.input}
            value={sports}
            onChangeText={setSports}
            placeholder="Tennis, Football, Natation"
            placeholderTextColor={colors.text.muted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Parlez de vous..."
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.imagesSection}>
          <Text style={styles.sectionTitle}>Vos photos (URLs uniquement)</Text>
          <TouchableOpacity
            onPress={openImageGuide}
            style={styles.helpLink}
            testID="image-url-help"
          >
            <Text style={styles.helpLinkText}>
              Comment convertir une image en URL ?
            </Text>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL 1 *</Text>
            <TextInput
              style={styles.input}
              value={image1}
              onChangeText={setImage1}
              placeholder="https://exemple.com/image1.jpg"
              placeholderTextColor={colors.text.muted}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL 2</Text>
            <TextInput
              style={styles.input}
              value={image2}
              onChangeText={setImage2}
              placeholder="https://exemple.com/image2.jpg"
              placeholderTextColor={colors.text.muted}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL 3</Text>
            <TextInput
              style={styles.input}
              value={image3}
              onChangeText={setImage3}
              placeholder="https://exemple.com/image3.jpg"
              placeholderTextColor={colors.text.muted}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL 4</Text>
            <TextInput
              style={styles.input}
              value={image4}
              onChangeText={setImage4}
              placeholder="https://exemple.com/image4.jpg"
              placeholderTextColor={colors.text.muted}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL 5</Text>
            <TextInput
              style={styles.input}
              value={image5}
              onChangeText={setImage5}
              placeholder="https://exemple.com/image5.jpg"
              placeholderTextColor={colors.text.muted}
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.signUpButton,
            registerMutation.isPending && styles.disabledButton,
          ]}
          onPress={handleSignUp}
          disabled={registerMutation.isPending}
          testID="sign-up-button"
        >
          <Text style={styles.signUpButtonText}>
            {registerMutation.isPending ? "Création..." : "Créer mon compte"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push("/auth/user/login")}
        >
          <Text style={styles.loginLinkText}>
            Déjà un compte ?{" "}
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
    minHeight: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  imagesSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.text.main,
    marginBottom: 8,
  },
  helpLink: {
    marginBottom: 20,
  },
  helpLinkText: {
    fontSize: 14,
    color: colors.primary.magenta,
    textDecorationLine: "underline",
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
