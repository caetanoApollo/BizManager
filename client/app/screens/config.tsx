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
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  MaterialCommunityIcons,
  Feather,
  AntDesign,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { Montserrat_400Regular } from "@expo-google-fonts/montserrat";
import { Nav, Header } from "../components/utils";
import {
  updateConfigs,
  getUserProfile,
  updateUserData,
  getConfigsByUserId,
} from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const PALETTE = {
  LaranjaPrincipal: "#F5A623",
  VerdeAgua: "#5D9B9B",
  AzulEscuro: "#2A4D69",
  Branco: "#F5F5F5",
  CinzaClaro: "#ccc",
};

const SettingsPage = () => {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [notificacoesEstoque, setNotificacoesEstoque] = useState(true);
  const [integracaoGoogleCalendar, setIntegracaoGoogleCalendar] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular, Montserrat: Montserrat_400Regular });

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        const usuarioIdString = await AsyncStorage.getItem('usuario_id');
        if (!usuarioIdString) {
          Alert.alert("Erro", "ID do usuário não encontrado. Faça login novamente.");
          router.replace('/screens/login');
          return;
        }
        const id = parseInt(usuarioIdString, 10);
        setUserId(id);

        const [userProfile, userConfigs] = await Promise.all([
          getUserProfile(id),
          getConfigsByUserId(id)
        ]);
        
        if (userProfile) {
          setNome(userProfile.nome || "");
          setCnpj(formatCNPJ(userProfile.cnpj || ""));
          setEmail(userProfile.email || "");
        }
        if (userConfigs) {
            setNotificacoesEstoque(!!userConfigs.notificacoes_estoque);
            setIntegracaoGoogleCalendar(!!userConfigs.integracao_google_calendar);
        }

      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  const handleUpdateAccount = async () => {
    if (!userId) {
      Alert.alert("Erro", "Usuário não identificado.");
      return;
    }

    setSaving(true);
    try {
      const userDataToUpdate: { nome: string; email: string; cnpj: string; senha?: string } = {
        nome,
        email,
        cnpj: cnpj.replace(/[^\d]/g, ''),
      };
      if (senha) {
        userDataToUpdate.senha = senha;
      }

      await Promise.all([
        updateUserData(userId, userDataToUpdate),
        updateConfigs(userId, notificacoesEstoque, integracaoGoogleCalendar)
      ]);
      
      Alert.alert("Sucesso", "Seu perfil foi atualizado!");
      setSenha('');
    } catch (error) {
      console.error("Erro ao atualizar conta:", error);
      Alert.alert("Erro", "Não foi possível atualizar seus dados. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  function formatCNPJ(value: string) {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";
    let cnpj = numbers;
    if (cnpj.length > 2) cnpj = cnpj.replace(/^(\d{2})(\d)/, "$1.$2");
    if (cnpj.length > 6) cnpj = cnpj.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    if (cnpj.length > 10) cnpj = cnpj.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4");
    if (cnpj.length > 15) cnpj = cnpj.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
    return cnpj;
  }
  const handleCNPJChange = (value: string) => {
    setCnpj(formatCNPJ(value));
  };
  
  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]} style={styles.container}>
      <Header />
       <KeyboardAvoidingView
        style={{ flex: 1, width: '100%' }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <AntDesign
                  name="arrow-left"
                  size={30}
                  color={PALETTE.Branco}
                  onPress={() => router.back()}
              />
              <Feather name="settings" size={30} color={PALETTE.Branco} />
              <Text style={styles.title}>Configurações</Text>
            </View>
            
            {loading ? (
                <ActivityIndicator size="large" color={PALETTE.Branco} style={{ marginTop: 50 }} />
            ) : (
                <View style={styles.formContainer}>
                    <Text style={styles.sectionTitle}>Dados da Conta</Text>
                    <View style={styles.inputGroup}>
                        <MaterialCommunityIcons name="card-account-details-outline" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                        <TextInput style={styles.input} value={cnpj} onChangeText={handleCNPJChange} placeholder="CNPJ" placeholderTextColor={PALETTE.CinzaClaro} maxLength={18} keyboardType="numeric" />
                    </View>
                    <View style={styles.inputGroup}>
                        <Feather name="mail" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="email-address" autoCapitalize="none" />
                    </View>
                    <View style={styles.inputGroup}>
                        <Feather name="lock" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                        <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry={!passwordVisible} placeholder="Nova Senha (opcional)" placeholderTextColor={PALETTE.CinzaClaro} />
                         <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.iconButton}>
                            <MaterialCommunityIcons name={passwordVisible ? "eye-off" : "eye"} size={20} color="#F5F5F5" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionTitle}>Preferências</Text>
                    <View style={styles.switchGroup}>
                      <Feather name="bell" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                      <Text style={styles.switchLabel}>Notificações de Estoque</Text>
                      <Switch
                        trackColor={{ false: "#767577", true: PALETTE.VerdeAgua }}
                        thumbColor={notificacoesEstoque ? PALETTE.Branco : "#f4f3f4"}
                        onValueChange={setNotificacoesEstoque}
                        value={notificacoesEstoque}
                      />
                    </View>
                    <View style={styles.switchGroup}>
                      <Feather name="calendar" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                      <Text style={styles.switchLabel}>Integração Google Calendar</Text>
                      <Switch
                        trackColor={{ false: "#767577", true: PALETTE.VerdeAgua }}
                        thumbColor={integracaoGoogleCalendar ? PALETTE.Branco : "#f4f3f4"}
                        onValueChange={setIntegracaoGoogleCalendar}
                        value={integracaoGoogleCalendar}
                      />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleUpdateAccount} disabled={saving}>
                        {saving ? (
                            <ActivityIndicator color={PALETTE.Branco} />
                        ) : (
                            <>
                                <Feather name="check-circle" size={20} color={PALETTE.Branco} />
                                <Text style={styles.buttonText}>Salvar Alterações</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
      </KeyboardAvoidingView>
      <Nav style={styles.nav} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  scrollContainer: { flexGrow: 1, paddingBottom: 120 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 20,
    paddingTop: 10,
    alignSelf: "flex-start",
  },
  title: { color: PALETTE.Branco, fontSize: 25, fontFamily: "BebasNeue" },
  formContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    color: PALETTE.Branco,
    fontSize: 22,
    fontFamily: "BebasNeue",
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
  switchGroup: {
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingRight: 15,
    height: 55,
  },
  icon: { paddingLeft: 15, paddingRight: 10 },
  iconButton: { paddingRight: 15 },
  input: {
    flex: 1,
    paddingVertical: 15,
    color: PALETTE.Branco,
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
  },
  switchLabel: {
    flex: 1,
    color: PALETTE.Branco,
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
  },
  button: {
    flexDirection: "row",
    backgroundColor: PALETTE.VerdeAgua,
    borderRadius: 30,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: {
    color: PALETTE.Branco,
    fontSize: 20,
    fontFamily: "BebasNeue",
    marginLeft: 10,
  },
  nav: {
      position: 'absolute',
      bottom: 20,
      alignSelf: 'center'
  }
});

export default SettingsPage;