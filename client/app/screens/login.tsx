// client/app/screens/login.tsx
import React, { useState, useEffect } from "react";
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
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { login } from "../services/api"; 

export default function loginPage() {
  const router = useRouter();
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular, Montserrat: Montserrat_400Regular });

const handleLogin = async () => {
    if (!identificador.trim() || !senha) {
        Alert.alert("Erro", "Por favor, preencha todos os campos.");
        return;
    }
  try {
    const cleanedIdentificador = identificador.includes('@')
        ? identificador.trim()
        : identificador.replace(/\D/g, '');

    const user = await login(cleanedIdentificador, senha);
    if (user.token) {
      await AsyncStorage.setItem('token', user.token);
    }
    if (user.usuario_id) {
      await AsyncStorage.setItem('usuario_id', String(user.usuario_id));
    }
    // CORREÇÃO: Salva o nome do usuário no AsyncStorage para ser usado em outras telas
    if (user.nome) {
      await AsyncStorage.setItem('user_name', user.nome);
    }
    Alert.alert("Sucesso", `Bem-vindo, ${user.nome || "usuário"}!`);
    router.push("/screens/main");
  } catch (err: any) {
    Alert.alert("Erro", err.message || "Erro ao fazer login.");
  }
};

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

function formatCNPJ(value: string) {
  const numbers = value.replace(/\D/g, "");
  let cnpj = numbers;
  if (cnpj.length > 2) cnpj = cnpj.replace(/^(\d{2})(\d)/, "$1.$2");
  if (cnpj.length > 6) cnpj = cnpj.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
  if (cnpj.length > 10) cnpj = cnpj.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4");
  if (cnpj.length > 15) cnpj = cnpj.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
  return cnpj;
}

const handleIdentificadorChange = (value: string) => {
    if (value.includes('@')) {
        setIdentificador(value);
    } else {
        setIdentificador(formatCNPJ(value));
    }
};

  const handlePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

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

          <Text style={styles.subtitle}>LOGIN</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>CNPJ ou E-MAIL:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu CNPJ ou E-mail"
              placeholderTextColor="#ccc"
              value={identificador}
              onChangeText={handleIdentificadorChange}
              maxLength={50}
              autoCapitalize="none"
            />

            <Text style={styles.label}>SENHA:</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                secureTextEntry={!passwordVisible}
                placeholderTextColor="#ccc"
                value={senha}
                onChangeText={setSenha}
              />
              <TouchableOpacity
                onPress={handlePasswordVisibility}
                style={styles.icon}
              >
                <MaterialCommunityIcons
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={20}
                  color="#F5F5F5"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.recoverText}>
              ESQUECEU SENHA?{" "}
              <Text
                style={styles.recoverLink}
                onPress={() => router.push("/screens/passwordReset")}
              >
                RECUPERAR CONTA
              </Text>
            </Text>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>ENTRAR</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>NÃO TEM CONTA?</Text>
            <Text style={styles.registerSubText}>
              CLIQUE NO BOTÃO ABAIXO E CADASTRE-SE
            </Text>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push("/screens/signup")}
            >
              <Text style={styles.registerButtonText}>CADASTRAR</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
  inputContainer: {
    width: "90%",
    backgroundColor: "rgba(245, 245, 245, 0.09)",
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    marginBottom: 45,
  },
  label: {
    fontSize: 25,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "rgba(42, 77, 105, 0.35)",
    borderRadius: 5,
    padding: 10,
    color: "#F5F5F5",
    fontSize: 14,
    marginBottom: 10,
    width: "100%",
    fontFamily: "Montserrat",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  icon: {
    position: "absolute",
    paddingBottom: 10,
    right: 10,
  },
  recoverText: {
    paddingTop: 10,
    paddingBottom: 20,
    fontSize: 18,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
  },
  recoverLink: {
    fontFamily: "BebasNeue",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: "#5D9B9B",
    marginLeft: 60,
    padding: 10,
    borderRadius: 60,
    width: "60%",
    alignItems: "center",
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
  registerContainer: {
    alignItems: "center",
  },
  registerText: {
    fontSize: 20,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
  },
  registerSubText: {
    fontSize: 20,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: "#F5A623",
    padding: 10,
    borderRadius: 60,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    width: 170,
    alignItems: "center",
  },
  registerButtonText: {
    fontSize: 25,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
  },
});

