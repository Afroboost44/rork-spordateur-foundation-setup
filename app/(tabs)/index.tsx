import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';

export default function TabOneScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Découvrir des profils</Text>
      <Text style={styles.subtitle}>Swipez pour trouver votre match sportif</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/user/discover' as any)}
      >
        <Text style={styles.buttonText}>Commencer à swiper</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.push('/user/matches' as any)}
      >
        <Text style={styles.buttonText}>Voir mes matchs</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.main,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: colors.text.main,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 48,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: colors.brand.secondary,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text.main,
  },
});
