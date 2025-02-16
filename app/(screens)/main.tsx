import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { useRouter } from "expo-router";

const MainScreen: React.FC = () => {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular });

  if (!fontsLoaded) {
    return null; // Retorne null ou um componente vazio enquanto as fontes estão carregando
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#2A4D69" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient
          colors={["#5D9B9B", "#2A4D69"]}
          style={styles.container}
        >
          <View style={styles.header}>
            <Text style={styles.title}>BIZMANAGER</Text>
          </View>
          <Text style={styles.subtitle}>MENU PRINCIPAL</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              // onPress={() => router.push("")}
            >
              <Text style={styles.buttonText}>NOTAS FISCAIS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              // onPress={() => router.push("")}
            >
              <Text style={styles.buttonText}>FINANCEIRO</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              // onPress={() => router.push("")}
            >
              <Text style={styles.buttonText}>RETORNO FINANCEIRO</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center" },
  header: {
    width: "100%",
    paddingVertical: 20,
    paddingTop: 50,
    alignItems: "center",
    backgroundColor: "#2A4D69",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: { fontSize: 50, fontFamily: "BebasNeue", color: "#F5F5F5" },
  subtitle: {
    fontSize: 50,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
    marginTop: 20,
  },
  buttonContainer: {
    width: "90%",
    marginTop: 20,
    marginBottom: 45,
  },
  button: {
    backgroundColor: "#5D9B9B",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonText: {
    fontSize: 25,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
  },
});

export default MainScreen;