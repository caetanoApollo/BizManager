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
  ActivityIndicator,
  Image,
} from "react-native";
import {
  MaterialCommunityIcons,
  Feather,
  AntDesign,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { useRouter } from "expo-router";
import { cadastro } from "../services/api";

const PALETTE = {
  LaranjaPrincipal: "#F5A623",
  VerdeAgua: "#5D9B9B",
  AzulEscuro: "#2A4D69",
  Branco: "#F5F5F5",
  CinzaClaro: "#ccc",
};

const CadastroPage: React.FC = () => {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmarSenhaVisivel, setConfirmarSenhaVisivel] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular, Montserrat: Montserrat_400Regular });

  const formatCNPJ = (value: string) => {
    const cleanedValue = value.replace(/\D/g, "");
    let formatted = cleanedValue;
    if (cleanedValue.length > 2) formatted = `${cleanedValue.slice(0, 2)}.${cleanedValue.slice(2)}`;
    if (cleanedValue.length > 5) formatted = `${cleanedValue.slice(0, 2)}.${cleanedValue.slice(2, 5)}.${cleanedValue.slice(5)}`;
    if (cleanedValue.length > 8) formatted = `${cleanedValue.slice(0, 2)}.${cleanedValue.slice(2, 5)}.${cleanedValue.slice(5, 8)}/${cleanedValue.slice(8)}`;
    if (cleanedValue.length > 12) formatted = `${cleanedValue.slice(0, 2)}.${cleanedValue.slice(2, 5)}.${cleanedValue.slice(5, 8)}/${cleanedValue.slice(8, 12)}-${cleanedValue.slice(12, 14)}`;
    return formatted;
  };

  const handleCadastro = async () => {
    if (!nome || !email || !cnpj || !senha || !confirmarSenha || !telefone) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erro", "Por favor, insira um e-mail válido.");
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }
    if (senha.length < 6) {
      Alert.alert("Erro", "A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await cadastro(nome, email, telefone, cnpj.replace(/[^\d]/g, ''), senha);
      Alert.alert("Sucesso!", "Sua conta foi criada. Faça o login para continuar.");
      router.replace("/screens/login");
    } catch (err: any) {
      Alert.alert("Erro no Cadastro", err.message || "Não foi possível criar a conta.");
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
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/logo_page.png')}
                style={{ width: 250, height: 120, marginBottom: 10 }}
              />
            </View>
            <Text style={styles.create}>Criar Conta</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Feather name="user" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
              <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome Completo" placeholderTextColor={PALETTE.CinzaClaro} />
            </View>
            <View style={styles.inputGroup}>
              <MaterialCommunityIcons name="card-account-details-outline" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
              <TextInput style={styles.input} value={cnpj} onChangeText={(text) => setCnpj(formatCNPJ(text))} placeholder="CNPJ" placeholderTextColor={PALETTE.CinzaClaro} maxLength={18} keyboardType="numeric" />
            </View>
            <View style={styles.inputGroup}>
              <Feather name="mail" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="E-mail" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={styles.inputGroup}>
              <Feather name="phone" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
              <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} placeholder="Telefone" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="phone-pad" maxLength={15} />
            </View>
            <View style={styles.inputGroup}>
              <Feather name="lock" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
              <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry={!senhaVisivel} placeholder="Senha (mínimo 6 caracteres)" placeholderTextColor={PALETTE.CinzaClaro} />
              <TouchableOpacity onPress={() => setSenhaVisivel(!senhaVisivel)} style={styles.iconButton}>
                <MaterialCommunityIcons name={senhaVisivel ? "eye-off" : "eye"} size={20} color={PALETTE.Branco} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Feather name="lock" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
              <TextInput style={styles.input} value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry={!confirmarSenhaVisivel} placeholder="Confirmar Senha" placeholderTextColor={PALETTE.CinzaClaro} />
              <TouchableOpacity onPress={() => setConfirmarSenhaVisivel(!confirmarSenhaVisivel)} style={styles.iconButton}>
                <MaterialCommunityIcons name={confirmarSenhaVisivel ? "eye-off" : "eye"} size={20} color={PALETTE.Branco} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleCadastro} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={PALETTE.Branco} />
              ) : (
                <Text style={styles.buttonText}>CRIAR CONTA</Text>
              )}
            </TouchableOpacity>
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
    alignItems: "center",
    gap: 10,
    alignSelf: "center",
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 60,
    fontFamily: "BebasNeue_400Regular",
    color: PALETTE.Branco,
    letterSpacing: 1.5,
  },
  create: { color: PALETTE.Branco, fontSize: 25, fontFamily: "BebasNeue_400Regular" },
  formContainer: {
    width: '100%',
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding: 20,
    borderRadius: 16,
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

export default CadastroPage;