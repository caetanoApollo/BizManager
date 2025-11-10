/*
 * ARQUIVO: client/app/screens/signup.tsx (Atualizado)
 *
 * O que mudou:
 * 1. Adicionados states para `inscricaoMunicipal` e `codigoMunicipio`.
 * 2. Adicionados dois novos TextInputs para coletar esses dados.
 * 3. `handleCadastro` atualizado para enviar os novos campos para a API `cadastro`.
 */
import React, { useState } from "react";
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
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState("");
  const [codigoMunicipio, setCodigoMunicipio] = useState("");

  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular, Montserrat: Montserrat_400Regular });

  const formatCNPJ = (value: string) => {
    const cleanedValue = value.replace(/\D/g, "");
    let formatted = cleanedValue.slice(0, 14); // Limita para 14 dígitos
    if (formatted.length > 2) formatted = `${formatted.slice(0, 2)}.${formatted.slice(2)}`;
    if (formatted.length > 6) formatted = `${formatted.slice(0, 2)}.${formatted.slice(2, 5)}.${formatted.slice(5)}`;
    if (formatted.length > 10) formatted = `${formatted.slice(0, 2)}.${formatted.slice(2, 5)}.${formatted.slice(5, 8)}/${formatted.slice(8)}`;
    if (formatted.length > 15) formatted = `${formatted.slice(0, 2)}.${formatted.slice(2, 5)}.${formatted.slice(5, 8)}/${formatted.slice(8, 12)}-${formatted.slice(12, 14)}`;
    return formatted;
  };

  const handleCadastro = async () => {
    if (!nome || !email || !cnpj || !senha || !confirmarSenha || !telefone) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios.");
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
    // Validação de CNPJ (simples)
    if (cnpj.replace(/[^\d]/g, '').length !== 14) {
      Alert.alert("Erro", "CNPJ inválido.");
      return;
    }

    setLoading(true);
    try {
      // Envia os novos campos para a API
      await cadastro(
        nome, 
        email, 
        telefone, 
        cnpj, 
        senha,
        inscricaoMunicipal,
        codigoMunicipio
      );
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
            <AntDesign name="arrow-left" size={30} color={PALETTE.Branco} onPress={() => router.back()} style={styles.backButton} />
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/logo_page.png')}
                style={{ width: 250, height: 120, marginBottom: 10 }}
              />
            </View>
            <Text style={styles.create}>Criar Conta</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
            <View style={styles.inputGroup}>
              <Feather name="user" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
              <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome Completo" placeholderTextColor={PALETTE.CinzaClaro} />
            </View>
            <View style={styles.inputGroup}>
              <Feather name="mail" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="E-mail" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={styles.inputGroup}>
              <Feather name="phone" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
              <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} placeholder="Telefone" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="phone-pad" maxLength={15} />
            </View>

            <Text style={styles.sectionTitle}>Dados da Empresa (MEI)</Text>
            <View style={styles.inputGroup}>
              <MaterialCommunityIcons name="card-account-details-outline" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
              <TextInput style={styles.input} value={cnpj} onChangeText={(text) => setCnpj(formatCNPJ(text))} placeholder="CNPJ" placeholderTextColor={PALETTE.CinzaClaro} maxLength={18} keyboardType="numeric" />
            </View>
            
            {/* NOVO CAMPO: Inscrição Municipal */}
            <View style={styles.inputGroup}>
              <Feather name="hash" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
              <TextInput style={styles.input} value={inscricaoMunicipal} onChangeText={setInscricaoMunicipal} placeholder="Inscrição Municipal (Opcional)" placeholderTextColor={PALETTE.CinzaClaro} />
            </View>
            {/* NOVO CAMPO: Código do Município */}
            <View style={styles.inputGroup}>
              <Feather name="map-pin" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
              <TextInput style={styles.input} value={codigoMunicipio} onChangeText={setCodigoMunicipio} placeholder="Cód. do Município (Opcional)" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="numeric" />
            </View>

            <Text style={styles.sectionTitle}>Segurança</Text>
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
    paddingTop: 80, // Adiciona espaço no topo
  },
  header: {
    alignItems: "center",
    gap: 10,
    alignSelf: "center",
    marginBottom: 20,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 5, // Ajusta a posição do botão de voltar
  },
  logoContainer: {
    alignItems: "center",
    // Removido marginBottom para aproximar o título
  },
  title: {
    fontSize: 60,
    fontFamily: "BebasNeue_400Regular",
    color: PALETTE.Branco,
    letterSpacing: 1.5,
  },
  create: { 
    color: PALETTE.Branco, 
    fontSize: 25, 
    fontFamily: "BebasNeue_400Regular",
    marginTop: -15, // Puxa o "Criar Conta" para mais perto do logo
  },
  formContainer: {
    width: '100%',
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    color: PALETTE.Branco,
    fontSize: 22,
    fontFamily: "BebasNeue_400Regular",
    marginBottom: 15,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: PALETTE.LaranjaPrincipal,
    paddingLeft: 10,
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
    paddingRight: 15, // Adicionado padding à direita
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