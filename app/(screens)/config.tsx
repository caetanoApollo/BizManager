import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";

const ConfigPage: React.FC = () => {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular });

  React.useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();
  }, []);

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <LinearGradient colors={["#5D9B9B", "#2A4D69"]} style={styles.container}>
        <Text style={styles.title}>CONFIGURAÇÕES</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/main")}> 
          <Text style={styles.buttonText}>Voltar ao Dashboard</Text>
        </TouchableOpacity>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 50, fontFamily: "BebasNeue", color: "#F5F5F5", marginBottom: 20 },
  button: {
    backgroundColor: "#5D9B9B",
    padding: 10,
    borderRadius: 60,
    width: "60%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { fontSize: 22, fontFamily: "BebasNeue", color: "#F5F5F5" },
});

export default ConfigPage;