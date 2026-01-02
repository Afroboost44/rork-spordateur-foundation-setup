import { StyleSheet, Text, View } from "react-native";

import colors from "@/constants/colors";

export default function OffersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Offers</Text>
      <Text style={styles.text}>Partner deals and activities</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg.main,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.main,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
    color: colors.text.secondary,
  },
});
