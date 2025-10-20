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
import { MaterialCommunityIcons, Feather, AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { useRouter } from "expo-router";
import { apiFetch } from "../services/api";

const PALETTE = {
  LaranjaPrincipal: "#F5A623",
  VerdeAgua: "#5D9B9B",
  AzulEscuro: "#2A4D69",
  Branco: "#F5F5F5",
  CinzaClaro: "#ccc",
};

const RecoveryPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular, Montserrat: Montserrat_400Regular });

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
      Alert.alert("Sucesso", "Um e-mail com o código de recuperação foi enviado. Verifique sua caixa de entrada e spam.");
      setStep(2);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível enviar o e-mail de recuperação.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async () => {
    if (!codigo || !senha || !confirmarSenha) {
        Alert.alert("Erro", "Preencha todos os campos.");
        return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }
    if (senha.length < 6) {
      Alert.alert("Erro", "A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/api/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, token: codigo, newPassword: senha }),
      });
      Alert.alert("Sucesso", "Sua senha foi redefinida com sucesso!");
      router.replace("/screens/login");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível redefinir a senha. O código pode ser inválido ou ter expirado.");
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]} style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1, width: '100%' }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
              <AntDesign name="arrow-left" size={30} color={PALETTE.Branco} onPress={() => router.back()} />
              <Feather name="unlock" size={30} color={PALETTE.Branco} />
              <Text style={styles.title}>Recuperar Conta</Text>
          </View>

          <View style={styles.formContainer}>
            {step === 1 ? (
              <>
                <Text style={styles.instructions}>
                  Insira seu e-mail para receber um código de verificação.
                </Text>
                <View style={styles.inputGroup}>
                    <Feather name="mail" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Digite seu e-mail"
                        placeholderTextColor={PALETTE.CinzaClaro}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                <TouchableOpacity style={styles.button} onPress={handleRequestCode} disabled={loading}>
                  {loading ? <ActivityIndicator color={PALETTE.Branco} /> : <Text style={styles.buttonText}>Enviar Código</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.instructions}>
                  Verifique seu e-mail e insira o código e sua nova senha.
                </Text>
                <View style={styles.inputGroup}>
                    <Feather name="hash" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                    <TextInput style={styles.input} value={codigo} onChangeText={setCodigo} placeholder="Código de verificação" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="numeric"/>
                </View>
                <View style={styles.inputGroup}>
                    <Feather name="lock" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                    <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry={!passwordVisible} placeholder="Nova Senha" placeholderTextColor={PALETTE.CinzaClaro} />
                    <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.iconButton}>
                        <MaterialCommunityIcons name={passwordVisible ? "eye-off" : "eye"} size={20} color={PALETTE.Branco} />
                    </TouchableOpacity>
                </View>
                <View style={styles.inputGroup}>
                    <Feather name="lock" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                    <TextInput style={styles.input} value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry={!confirmPasswordVisible} placeholder="Confirmar Nova Senha" placeholderTextColor={PALETTE.CinzaClaro} />
                     <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)} style={styles.iconButton}>
                        <MaterialCommunityIcons name={confirmPasswordVisible ? "eye-off" : "eye"} size={20} color={PALETTE.Branco} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleRecovery} disabled={loading}>
                  {loading ? <ActivityIndicator color={PALETTE.Branco} /> : <Text style={styles.buttonText}>Redefinir Senha</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  title: { color: PALETTE.Branco, fontSize: 25, fontFamily: "BebasNeue_400Regular" },
  formContainer: {
    width: '100%',
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding: 20,
    borderRadius: 16,
  },
  instructions: {
    color: PALETTE.CinzaClaro,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 25,
  },
  inputGroup: {
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
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
  button: {
    backgroundColor: PALETTE.VerdeAgua,
    borderRadius: 30,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: PALETTE.Branco,
    fontSize: 20,
    fontFamily: "BebasNeue_400Regular",
  },
});

export default RecoveryPage;