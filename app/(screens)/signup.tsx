import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";

const CadastroPage: React.FC = () => {
  const router = useRouter();
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmarSenhaVisivel, setConfirmarSenhaVisivel] = useState(false);
  const [telefone, setTelefone] = useState("");
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

  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Validação da senha: no mínimo 8 caracteres, um número e um caractere especial
  const validarSenha = (senha: string) => {
    const regex = /^(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(senha);
  };

  const handleCadastro = () => {
    if (!validarEmail(email)) {
      Alert.alert("Erro: E-mail inválido", "Digite um e-mail válido.");
      return;
    }

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

    if (!validarSenha(senha)) {
      Alert.alert(
        "Erro: A senha não cumpre os requisitos",
        "A senha deve ter no mínimo 8 caracteres, incluindo um número e um caractere especial."
      );
      return;
    }

    console.log("Cadastro realizado com sucesso!");
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
          <Text style={styles.subtitle}>CADASTRO</Text>
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
            <Text style={styles.label}>EMAIL:</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu email"
              placeholderTextColor="#ccc"
              keyboardType="email-address"
            />
            <Text style={styles.label}>TELEFONE:</Text>
            <TextInput
              style={styles.input}
              value={telefone}
              onChangeText={setTelefone}
              placeholder="Digite seu telefone"
              placeholderTextColor="#ccc"
              keyboardType="phone-pad"
              maxLength={15} // Formato: (XX) XXXXX-XXXX
            />
            <Text style={styles.label}>SENHA:</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!senhaVisivel}
                placeholder="Digite sua senha"
                placeholderTextColor="#ccc"
              />
              <TouchableOpacity
                onPress={() => setSenhaVisivel(!senhaVisivel)}
                style={styles.icon}
              >
                <MaterialCommunityIcons
                  name={senhaVisivel ? "eye-off" : "eye"}
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
                secureTextEntry={!confirmarSenhaVisivel}
                placeholder="Confirme sua senha"
                placeholderTextColor="#ccc"
              />
              <TouchableOpacity
                onPress={() => setConfirmarSenhaVisivel(!confirmarSenhaVisivel)}
                style={styles.icon}
              >
                <MaterialCommunityIcons
                  name={confirmarSenhaVisivel ? "eye-off" : "eye"}
                  size={20}
                  color="#F5F5F5"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleCadastro}>
              <Text style={styles.buttonText}>CRIAR CONTA</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recoverContainer}>
            <Text style={styles.recoverText}>PARA RECUPERAR SUA CONTA</Text>
            <Text style={styles.recoverText}>CLIQUE NO BOTÃO ABAIXO</Text>
            <TouchableOpacity
              style={styles.recoverButton}
              onPress={() => router.push("/(screens)/passwordReset")}
            >
              <Text style={styles.recoverButtonText}>RECUPERAR CONTA</Text>
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
  recoverContainer: { alignItems: "center", marginTop: 30 },
  recoverText: { fontSize: 18, fontFamily: "BebasNeue", color: "#F5F5F5" },
  recoverButton: {
    backgroundColor: "#5D9B9B",
    padding: 10,
    borderRadius: 60,
    width: "60%",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 50,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  recoverButtonText: {
    fontSize: 22,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
  },
});

export default CadastroPage;
