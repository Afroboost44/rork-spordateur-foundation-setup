import { Stack } from 'expo-router';
import colors from '@/constants/colors';

export default function PartnerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.bg.card,
        },
        headerTintColor: colors.text.main,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: colors.bg.main,
        },
      }}
    >
      <Stack.Screen
        name="dashboard/index"
        options={{
          title: 'Tableau de bord',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="offers/create"
        options={{
          title: 'Créer une offre',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
