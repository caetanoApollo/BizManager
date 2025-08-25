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
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";
import { apiFetch } from "../services/api"; 

const RecoveryPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [step, setStep] = useState(1); // 1 para pedir email, 2 para inserir código e nova senha
  const [loading, setLoading] = useState(false);

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
    return null;
  }

  const handleRequestCode = async () => {
    if (!email) {
      Alert.alert("Erro", "Por favor, insira seu e-mail.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/api/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      Alert.alert("Sucesso", "Um e-mail com o código de recuperação foi enviado. Verifique o Sapam.");
      setStep(2); 
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível enviar o e-mail de recuperação.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async () => {
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

    setLoading(true);
    try {
      await apiFetch('/api/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, token: codigo, newPassword: senha }),
      });
      Alert.alert("Sucesso", "Sua senha foi redefinida com sucesso!");
      router.push("/screens/home"); 
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível redefinir a senha.");
    } finally {
      setLoading(false);
    }
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

          {step === 1 ? (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>EMAIL:</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Digite seu email"
                placeholderTextColor="#ccc"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.button} onPress={handleRequestCode} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>ENVIAR CÓDIGO</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>CÓDIGO DE VERIFICAÇÃO:</Text>
              <TextInput
                style={styles.input}
                value={codigo}
                onChangeText={setCodigo}
                placeholder="Digite o código recebido por email"
                placeholderTextColor="#ccc"
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
              <TouchableOpacity style={styles.button} onPress={handleRecovery} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>REDEFINIR SENHA</Text>}
              </TouchableOpacity>
            </View>
          )}

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
        fontFamily: "Montserrat_400Regular",
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