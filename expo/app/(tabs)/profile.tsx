import { StyleSheet, Text, View } from "react-native";

import colors from "@/constants/colors";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.text}>Your sports profile</Text>
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
