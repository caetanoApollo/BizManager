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
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";

const RecoveryPage: React.FC = () => {
  const router = useRouter();
  const [cnpj, setCnpj] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [codigo, setCodigo] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular });

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
    return null; // Retorne null ou um componente vazio enquanto as fontes estão carregando
  }

  const formatCNPJ = (value: string) => {
    const cleanedValue = value.replace(/[^a-zA-Z0-9]/g, "");
    const isAlphanumeric = /[a-zA-Z]/.test(cleanedValue);

    if (isAlphanumeric) {
      if (cleanedValue.length <= 8) {
        return cleanedValue;
      } else if (cleanedValue.length <= 12) {
        return `${cleanedValue.slice(0, 8)}-${cleanedValue.slice(8)}`;
      } else {
        return `${cleanedValue.slice(0, 8)}-${cleanedValue.slice(
          8,
          12
        )}-${cleanedValue.slice(12, 14)}`;
      }
    } else {
      if (cleanedValue.length <= 2) {
        return cleanedValue;
      } else if (cleanedValue.length <= 5) {
        return `${cleanedValue.slice(0, 2)}.${cleanedValue.slice(2)}`;
      } else if (cleanedValue.length <= 8) {
        return `${cleanedValue.slice(0, 2)}.${cleanedValue.slice(
          2,
          5
        )}.${cleanedValue.slice(5)}`;
      } else if (cleanedValue.length <= 12) {
        return `${cleanedValue.slice(0, 2)}.${cleanedValue.slice(
          2,
          5
        )}.${cleanedValue.slice(5, 8)}/${cleanedValue.slice(8)}`;
      } else {
        return `${cleanedValue.slice(0, 2)}.${cleanedValue.slice(
          2,
          5
        )}.${cleanedValue.slice(5, 8)}/${cleanedValue.slice(
          8,
          12
        )}-${cleanedValue.slice(12, 14)}`;
      }
    }
  };

  const handleCNPJChange = (value: string) => {
    const formattedCNPJ = formatCNPJ(value);
    setCnpj(formattedCNPJ);
  };

  const handleRecovery = () => {
    if (cnpj.length !== 18) {
      Alert.alert("Erro: CNPJ inválido", "Digite um CNPJ válido.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert(
        "Erro: Senhas não coincidem",
        "As senhas digitadas devem ser iguais."
      );
      return;
    }

    if (codigo.length === 0) {
      Alert.alert(
        "Erro: Código inválido",
        "Digite o código recebido por email."
      );
      return;
    }

    Alert.alert("Sucesso", "Sua senha foi redefinida com sucesso!");
    router.push("/"); // Redireciona para a tela inicial
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
          <Text style={styles.subtitle}>RECUPERAR CONTA</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>CNPJ:</Text>
            <TextInput
              style={styles.input}
              value={cnpj}
              onChangeText={handleCNPJChange}
              placeholder="Digite seu CNPJ"
              placeholderTextColor="#ccc"
              maxLength={18}
            />
            <Text style={styles.label}>NOVA SENHA:</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!passwordVisible}
                placeholder="Digite sua nova senha"
                placeholderTextColor="#ccc"
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={styles.icon}
              >
                <MaterialCommunityIcons
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={20}
                  color="#F5F5F5"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>CONFIRMAR SENHA:</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={!confirmPasswordVisible}
                placeholder="Confirme sua nova senha"
                placeholderTextColor="#ccc"
              />
              <TouchableOpacity
                onPress={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                }
                style={styles.icon}
              >
                <MaterialCommunityIcons
                  name={confirmPasswordVisible ? "eye-off" : "eye"}
                  size={20}
                  color="#F5F5F5"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>CÓDIGO DE VERIFICAÇÃO:</Text>
            <TextInput
              style={styles.input}
              value={codigo}
              onChangeText={setCodigo}
              placeholder="Digite o código recebido por email"
              placeholderTextColor="#ccc"
            />
            <TouchableOpacity style={styles.button} onPress={handleRecovery}>
              <Text style={styles.buttonText}>REDEFINIR SENHA</Text>
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
  inputContainer: {
    width: "90%",
    backgroundColor: "rgba(245, 245, 245, 0.09)",
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
  },
  label: {
    fontSize: 25,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "rgba(42, 77, 105, 0.35)",
    borderRadius: 5,
    padding: 10,
    color: "#F5F5F5",
    fontSize: 20,
    marginBottom: 10,
    width: "100%",
    fontFamily: "BebasNeue",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  icon: { position: "absolute", right: 10, bottom: 20 },
  button: {
    backgroundColor: "#5D9B9B",
    padding: 10,
    borderRadius: 60,
    width: "60%",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonText: { fontSize: 22, fontFamily: "BebasNeue", color: "#F5F5F5" },
});

export default RecoveryPage;
