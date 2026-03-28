import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import colors from "@/constants/colors";

export default function UserLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.auth.userLogin.useMutation({
    onSuccess: (data) => {
      console.log("User logged in:", data);
      Alert.alert("Bienvenue !", `Connecté en tant que ${data.name}`, [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    },
    onError: (error) => {
      Alert.alert("Erreur de connexion", error.message);
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Connexion",
          headerStyle: { backgroundColor: colors.bg.card },
          headerTintColor: colors.text.main,
        }}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.subtitle}>Accédez à votre compte Spordateur</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            placeholderTextColor={colors.text.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            testID="email-input"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Votre mot de passe"
            placeholderTextColor={colors.text.muted}
            secureTextEntry
            testID="password-input"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.loginButton,
            loginMutation.isPending && styles.disabledButton,
          ]}
          onPress={handleLogin}
          disabled={loginMutation.isPending}
          testID="login-button"
        >
          <Text style={styles.loginButtonText}>
            {loginMutation.isPending ? "Connexion..." : "Se connecter"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signUpLink}
          onPress={() => router.push("/auth/user/sign-up")}
        >
          <Text style={styles.signUpLinkText}>
            Pas encore de compte ?{" "}
            <Text style={styles.signUpLinkTextBold}>Créer un compte</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.main,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
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
    marginBottom: 40,
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
  loginButton: {
    backgroundColor: colors.primary.magenta,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.text.main,
  },
  signUpLink: {
    marginTop: 20,
    alignItems: "center",
  },
  signUpLinkText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  signUpLinkTextBold: {
    color: colors.primary.magenta,
    fontWeight: "700" as const,
  },
});
