import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { Montserrat_400Regular } from "@expo-google-fonts/montserrat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { login } from "../services/api";

const PALETTE = {
  LaranjaPrincipal: "#F5A623",
  VerdeAgua: "#5D9B9B",
  AzulEscuro: "#2A4D69",
  Branco: "#F5F5F5",
  CinzaClaro: "#ccc",
};

export default function LoginPage() {
  const router = useRouter();
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fontsLoaded] = useFonts({
    BebasNeue: BebasNeue_400Regular,
    Montserrat: Montserrat_400Regular,
  });

  const handleLogin = async () => {
    if (!identificador.trim() || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      const user = await login(identificador.trim(), senha);
      if (user.token) {
        await AsyncStorage.setItem("token", user.token);
      }
      if (user.usuario_id) {
        await AsyncStorage.setItem("usuario_id", String(user.usuario_id));
      }
      if (user.nome) {
        await AsyncStorage.setItem("user_name", user.nome);
      }
      router.replace("/screens/main");
    } catch (err: any) {
      Alert.alert(
        "Erro no Login",
        err.message || "Credenciais inválidas. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatIdentificador = (value: string) => {
    if (/[a-zA-Z@]/.test(value)) {
      setIdentificador(value);
    } else {
      const numbers = value.replace(/\D/g, "");
      let cnpj = numbers;
      if (cnpj.length > 2) cnpj = cnpj.replace(/^(\d{2})(\d)/, "$1.$2");
      if (cnpj.length > 6)
        cnpj = cnpj.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      if (cnpj.length > 10)
        cnpj = cnpj.replace(
          /^(\d{2})\.(\d{3})\.(\d{3})(\d)/,
          "$1.$2.$3/$4"
        );
      if (cnpj.length > 15)
        cnpj = cnpj.replace(
          /^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/,
          "$1.$2.$3/$4-$5"
        );
      setIdentificador(cnpj);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]}
      style={styles.gradient}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1, width: "100%" }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoContainer}>
              <Image 
              source={require('../../assets/images/logo_page.png')}
              style={{ width: 250, height: 120, marginBottom: 10 }}
              />
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Feather
                  name="user"
                  size={20}
                  color={PALETTE.CinzaClaro}
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="CNPJ ou E-mail"
                  placeholderTextColor={PALETTE.CinzaClaro}
                  value={identificador}
                  onChangeText={formatIdentificador}
                  maxLength={50}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  textContentType="username"
                  returnKeyType="next"
                  editable={!loading}
                  accessibilityLabel="Campo de CNPJ ou E-mail"
                />
              </View>

              <View style={styles.inputGroup}>
                <Feather
                  name="lock"
                  size={20}
                  color={PALETTE.CinzaClaro}
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Digite sua senha"
                  secureTextEntry={!passwordVisible}
                  placeholderTextColor={PALETTE.CinzaClaro}
                  value={senha}
                  onChangeText={setSenha}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                  returnKeyType="done"
                  editable={!loading}
                  accessibilityLabel="Campo de senha"
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  style={styles.iconButton}
                  accessibilityLabel={
                    passwordVisible ? "Ocultar senha" : "Mostrar senha"
                  }
                >
                  <MaterialCommunityIcons
                    name={passwordVisible ? "eye-off" : "eye"}
                    size={20}
                    color={PALETTE.Branco}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.recoverLink}
                onPress={() => router.push("/screens/passwordReset")}
                disabled={loading}
              >
                <Text style={styles.recoverText}>Esqueceu a senha?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  loading && { backgroundColor: PALETTE.CinzaClaro },
                ]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={PALETTE.Branco} />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Não tem uma conta?</Text>
              <TouchableOpacity
                onPress={() => router.push("/screens/signup")}
                disabled={loading}
              >
                <Text style={styles.registerLink}>Cadastre-se aqui</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 55,
    fontFamily: "BebasNeue_400Regular",
    letterSpacing: 4,
    textAlign: "center",
    color: PALETTE.LaranjaPrincipal,
    textShadowColor: "#0008",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  titleBar: {
    width: 80,
    height: 6,
    borderRadius: 3,
    backgroundColor: PALETTE.LaranjaPrincipal,
    marginTop: 2,
    marginBottom: 10,
    opacity: 0.85,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Montserrat_400Regular",
    color: PALETTE.Branco,
    marginBottom: 10,
    textAlign: "center",
    marginTop: 6,
  },
  subtitleStrong: {
    color: PALETTE.LaranjaPrincipal,
    fontWeight: "bold",
    fontFamily: "Montserrat_400Regular",
    fontSize: 19,
  },
  formContainer: {
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    padding: 22,
    borderRadius: 18,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.09)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
  },
  icon: { paddingHorizontal: 15 },
  iconButton: { paddingRight: 15 },
  input: {
    flex: 1,
    paddingVertical: 15,
    color: PALETTE.Branco,
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
  },
  recoverLink: {
    alignSelf: "flex-end",
    paddingVertical: 10,
  },
  recoverText: {
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
    color: PALETTE.CinzaClaro,
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: PALETTE.VerdeAgua,
    borderRadius: 30,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    elevation: 2,
  },
  buttonText: {
    color: PALETTE.Branco,
    fontSize: 22,
    fontFamily: "BebasNeue_400Regular",
    letterSpacing: 1,
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  registerText: {
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    color: PALETTE.CinzaClaro,
  },
  registerLink: {
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    color: PALETTE.LaranjaPrincipal,
    fontWeight: "bold",
    marginLeft: 5,
    textDecorationLine: "underline",
  },
});