import React, { useState, useEffect, useCallback } from "react";
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
  apiFetch,
} from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import { useRouter, useFocusEffect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  ResponseType,
} from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

const PALETTE = {
  LaranjaPrincipal: "#F5A623",
  VerdeAgua: "#5D9B9B",
  AzulEscuro: "#2A4D69",
  Branco: "#F5F5F5",
  CinzaClaro: "#ccc",
  VermelhoErro: "#e74c3c",
};

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

const SettingsPage = () => {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // --- NOVOS STATES ---
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState("");
  const [codigoMunicipio, setCodigoMunicipio] = useState("");
  // --- FIM NOVOS STATES ---

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [notificacoesEstoque, setNotificacoesEstoque] = useState(true);
  const [integracaoGoogleCalendar, setIntegracaoGoogleCalendar] = useState(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authRequestLoading, setAuthRequestLoading] = useState(false);
  const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular, Montserrat: Montserrat_400Regular });

  const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!clientId) {
    throw new Error("ERRO CRÍTICO: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID não está definido no .env.");
  }

  const redirectUri = AuthSession.makeRedirectUri();

  console.log("Redirect URI usado (Automático):", redirectUri);
  console.log("Verifique se este URI está no Google Cloud Console!");

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId,
      redirectUri: redirectUri,
      responseType: ResponseType.Code,
      scopes: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/calendar.events'],
      extraParams: {
        access_type: 'offline',
        prompt: 'consent'
      },
    },
    discovery
  );

  const exchangeCode = async (code: string) => {
    if (!userId) {
      console.warn("UserID não encontrado ao tentar trocar o código.");
      Alert.alert("Erro", "ID do usuário não encontrado. Tente novamente.");
      setAuthRequestLoading(false);
      return;
    }

    setLoading(true);
    setAuthRequestLoading(false);

    try {
      const apiResult = await apiFetch(`/api/google/exchange-code`, {
        method: 'POST',
        body: JSON.stringify({ code, userId, redirectUri }),
      });

      Alert.alert("Sucesso", "Google Calendar conectado!");
      setIsCalendarConnected(true);
      setIntegracaoGoogleCalendar(true);
      await loadUserDataAndConfig();

    } catch (err: any) {
      console.error("❌ Erro ao trocar código:", err);
      Alert.alert("Erro", "Falha ao finalizar conexão: " + err.message);
      setIsCalendarConnected(false);
      setIntegracaoGoogleCalendar(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (response) {

      setAuthRequestLoading(false);

      if (response.type === "success") {
        const { code } = response.params;
        exchangeCode(code);
      } else if (response.type === "error") {
        console.error("❌ Erro no AuthSession:", response.error);
        Alert.alert("Erro", `Falha na autenticação: ${response.error?.message || 'Tente novamente.'}`);
      } else if (response.type === "cancel") {
        setIntegracaoGoogleCalendar(isCalendarConnected);
      }
    }
  }, [response, userId]);

  const loadUserDataAndConfig = useCallback(async () => {
    try {
      const usuarioIdString = await AsyncStorage.getItem('usuario_id');
      if (!usuarioIdString) {
        router.replace('/screens/login');
        return;
      }
      const id = parseInt(usuarioIdString, 10);
      setUserId(id);

      const [userProfile, userConfigs] = await Promise.all([
        getUserProfile(id).catch(err => { console.error("Erro ao buscar perfil:", err); return null; }),
        getConfigsByUserId(id).catch(err => { console.error("Erro ao buscar configs:", err); return null; })
      ]);

      if (userProfile) {
        setNome(userProfile.nome || "");
        setCnpj(formatCNPJ(userProfile.cnpj || ""));
        setEmail(userProfile.email || "");
        // --- CARREGA NOVOS DADOS ---
        setInscricaoMunicipal(userProfile.inscricao_municipal || "");
        setCodigoMunicipio(userProfile.codigo_municipio || "");
        // --- FIM NOVOS DADOS ---
      }
      if (userConfigs) {
        const calendarIntegrationEnabled = !!userConfigs.integracao_google_calendar;
        const hasRefreshToken = !!userConfigs.google_refresh_token;

        setNotificacoesEstoque(!!userConfigs.notificacoes_estoque);
        setIntegracaoGoogleCalendar(calendarIntegrationEnabled);
        setIsCalendarConnected(hasRefreshToken);

        if (calendarIntegrationEnabled && !hasRefreshToken) {
          console.warn("Inconsistência: Integração Google marcada como ativa, mas sem refresh token.");
          setIntegracaoGoogleCalendar(false);
          setIsCalendarConnected(false);
        }

      } else {
        setNotificacoesEstoque(true);
        setIntegracaoGoogleCalendar(false);
        setIsCalendarConnected(false);
      }

    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      Alert.alert("Erro", "Não foi possível carregar seus dados.");
      setIntegracaoGoogleCalendar(false);
      setIsCalendarConnected(false);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadUserDataAndConfig();
    }, [loadUserDataAndConfig])
  );

  const handleCalendarConnectToggle = async () => {
    if (!userId) return;

    if (isCalendarConnected) {
      Alert.alert(
        "Desconectar Google Calendar",
        "Tem certeza que deseja desconectar sua conta Google? Seus eventos não serão mais sincronizados.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Desconectar",
            style: "destructive",
            onPress: async () => {
              setLoading(true);
              try {
                await apiFetch(`/api/google/disconnect`, { method: 'POST', body: JSON.stringify({ userId }) });
                await updateConfigs(userId, notificacoesEstoque, false);
                Alert.alert("Sucesso", "Google Calendar desconectado.");
                setIsCalendarConnected(false);
                setIntegracaoGoogleCalendar(false);
              } catch (error: any) {
                console.error("Erro ao desconectar Google Calendar:", error);
                Alert.alert("Erro", "Não foi possível desconectar: " + error.message);
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    }
    else {
      if (!request) {
        Alert.alert("Erro", "Não foi possível iniciar a autenticação. Tente recarregar a tela.");
        return;
      }

      setAuthRequestLoading(true);

      try {
        await promptAsync();
      } catch (error: any) {
        console.error("Erro ao chamar promptAsync:", error);
        Alert.alert("Erro", "Não foi possível abrir a tela de login: " + error.message);
        setAuthRequestLoading(false);
      }
    }
  };

  const handleUpdateAccount = async () => {
    if (!userId) {
      Alert.alert("Erro", "Usuário não identificado.");
      return;
    }
    setSaving(true);
    try {
      // --- ATUALIZA TIPO DO OBJETO ---
      const userDataToUpdate: {
        nome?: string;
        email?: string;
        cnpj?: string;
        senha?: string;
        inscricao_municipal?: string; // NOVO
        codigo_municipio?: string;    // NOVO
      } = {};

      if (nome) userDataToUpdate.nome = nome;
      if (email) userDataToUpdate.email = email;
      if (cnpj) userDataToUpdate.cnpj = cnpj.replace(/[^\d]/g, '');

      // --- ADICIONA NOVOS CAMPOS AO PAYLOAD ---
      if (inscricaoMunicipal) userDataToUpdate.inscricao_municipal = inscricaoMunicipal;
      if (codigoMunicipio) userDataToUpdate.codigo_municipio = codigoMunicipio;
      // --- FIM DA ADIÇÃO ---

      if (senha) {
        if (senha.length < 6) {
          throw new Error("A nova senha deve ter no mínimo 6 caracteres.");
        }
        userDataToUpdate.senha = senha;
      }

      await Promise.all([
        Object.keys(userDataToUpdate).length > 0 ? updateUserData(userId, userDataToUpdate) : Promise.resolve(),
        updateConfigs(userId, notificacoesEstoque, isCalendarConnected && integracaoGoogleCalendar)
      ]);

      if (userDataToUpdate.nome) {
        await AsyncStorage.setItem("user_name", userDataToUpdate.nome);
      }

      Alert.alert("Sucesso", "Seu perfil e preferências foram atualizados!");
      setSenha('');

    } catch (error: any) {
      console.error("Erro ao atualizar conta:", error);
      Alert.alert("Erro", "Não foi possível atualizar seus dados: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  function formatCNPJ(value: string) {
    if (!value) return "";
    const numbers = value.replace(/\D/g, "");
    let cnpj = numbers.slice(0, 14);
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
    return (
      <LinearGradient colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]} style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={PALETTE.Branco} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]} style={styles.container}>
      <Header />
      <KeyboardAvoidingView
        style={{ flex: 1, width: '100%' }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
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
                <Feather name="user" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome Completo" placeholderTextColor={PALETTE.CinzaClaro} editable={!saving && !authRequestLoading} />
              </View>
              <View style={styles.inputGroup}>
                <MaterialCommunityIcons name="card-account-details-outline" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                <TextInput style={styles.input} value={cnpj} onChangeText={handleCNPJChange} placeholder="CNPJ" placeholderTextColor={PALETTE.CinzaClaro} maxLength={18} keyboardType="numeric" editable={!saving && !authRequestLoading} />
              </View>

              {/* --- NOVOS CAMPOS ADICIONADOS --- */}
              <View style={styles.inputGroup}>
                <Feather name="hash" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  value={inscricaoMunicipal}
                  onChangeText={setInscricaoMunicipal}
                  placeholder="Inscrição Municipal"
                  placeholderTextColor={PALETTE.CinzaClaro}
                  editable={!saving && !authRequestLoading}
                />
              </View>
              <View style={styles.inputGroup}>
                <Feather name="map-pin" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  value={codigoMunicipio}
                  onChangeText={setCodigoMunicipio}
                  placeholder="Código do Município"
                  placeholderTextColor={PALETTE.CinzaClaro}
                  keyboardType="numeric"
                  editable={!saving && !authRequestLoading}
                />
              </View>
              {/* --- FIM DOS NOVOS CAMPOS --- */}

              <View style={styles.inputGroup}>
                <Feather name="mail" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="email-address" autoCapitalize="none" editable={!saving && !authRequestLoading} />
              </View>
              <View style={styles.inputGroup}>
                <Feather name="lock" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry={!passwordVisible} placeholder="Nova Senha (mínimo 6 caracteres)" placeholderTextColor={PALETTE.CinzaClaro} editable={!saving && !authRequestLoading} />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.iconButton} disabled={saving || authRequestLoading}>
                  <MaterialCommunityIcons name={passwordVisible ? "eye-off" : "eye"} size={20} color={PALETTE.Branco} />
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
                  disabled={saving || authRequestLoading}
                  style={{ marginTop: 12 }}
                />
              </View>

              <Text style={styles.sectionTitle}>Integrações</Text>
              <View style={styles.switchGroup}>
                <Feather name="calendar" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                <Text style={styles.switchLabel}>Sincronizar com Google Calendar</Text>
                <Switch
                  trackColor={{ false: "#767577", true: PALETTE.VerdeAgua }}
                  thumbColor={integracaoGoogleCalendar ? PALETTE.Branco : "#f4f3f4"}
                  value={integracaoGoogleCalendar}
                  style={{ marginTop: 12 }}
                  onValueChange={(newValue) => {
                    setIntegracaoGoogleCalendar(newValue);

                    if (newValue && !isCalendarConnected) {
                      handleCalendarConnectToggle();
                    } else if (!newValue && isCalendarConnected) {
                      handleCalendarConnectToggle();
                    } else if (newValue && isCalendarConnected) {
                    }
                  }}
                  disabled={saving || authRequestLoading}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: isCalendarConnected ? PALETTE.VermelhoErro : PALETTE.VerdeAgua, marginTop: 5 },
                  (!request || authRequestLoading || saving) && styles.buttonDisabled
                ]}
                onPress={handleCalendarConnectToggle}
                disabled={!request || authRequestLoading || saving}
              >
                {authRequestLoading ? (
                  <ActivityIndicator color={PALETTE.Branco} />
                ) : (
                  <Text style={styles.buttonText}>
                    {isCalendarConnected ? 'Desconectar Google Calendar' : 'Conectar Google Calendar'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, saving && styles.buttonDisabled, { marginTop: 20 }]} onPress={handleUpdateAccount} disabled={saving || authRequestLoading}>
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
          <Nav style={styles.nav} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
    marginBottom: 20,
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
    minHeight: 55,
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
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    minHeight: 50,
  },
  buttonDisabled: {
    backgroundColor: PALETTE.CinzaClaro,
    opacity: 0.7,
  },
  buttonText: {
    color: PALETTE.Branco,
    fontSize: 20,
    fontFamily: "BebasNeue",
    marginLeft: 10,
    textAlign: 'center',
  },
  nav: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 0,
    alignItems: 'center',
    zIndex: 10
  }
});

export default SettingsPage;