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
import { useRouter, useFocusEffect } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, makeRedirectUri, ResponseType, AuthRequestPromptOptions } from 'expo-auth-session';

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
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
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
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authRequestLoading, setAuthRequestLoading] = useState(false);
  const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular, Montserrat: Montserrat_400Regular });

  const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '134585370245-b9fdacgtn2lac2oimp7ap4t9v8iibrab.apps.googleusercontent.com';

  const redirectUri = "https://auth.expo.io/@caetano.apollo/bizmanager";
  console.log("Redirect URI usado:", redirectUri);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: clientId,
      scopes: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/calendar.events'],
      redirectUri: redirectUri,
      responseType: ResponseType.Code,
      extraParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
    discovery
  );

  useEffect(() => {
    const handleAuthResponse = async () => {
      setAuthRequestLoading(false);
      if (response?.type === 'success') {
        const { code } = response.params;
        console.log('Código de Autorização Recebido (via Proxy):', code);
        setLoading(true);
        try {
          if (!userId) throw new Error("ID do usuário não encontrado para troca de código.");

          console.log(`Enviando código para backend (userId: ${userId}, redirectUri: ${redirectUri})`);
          await apiFetch(`/api/google/exchange-code`, {
            method: 'POST',
            body: JSON.stringify({ code: code, userId: userId, redirectUri: redirectUri }),
          });
          Alert.alert('Sucesso', 'Google Calendar conectado!');
          setIsCalendarConnected(true);
          setIntegracaoGoogleCalendar(true);
        } catch (error: any) {
          console.error("Erro ao trocar código por token no backend:", error);
          Alert.alert('Erro', 'Falha ao finalizar conexão com Google Calendar: ' + (error.message || 'Erro desconhecido'));
          setIsCalendarConnected(false);
          setIntegracaoGoogleCalendar(false);
        } finally {
          setLoading(false);
        }
      } else if (response?.type === 'error') {
        console.error('Erro na autenticação Google:', response.params.error_description || response.params.error || 'Erro desconhecido');
        Alert.alert('Erro', 'Falha na autenticação com Google: ' + (response.params.error_description || response.params.error || 'Tente novamente'));
        setIsCalendarConnected(false);
        setIntegracaoGoogleCalendar(false);
      } else if (response?.type === 'cancel' || response?.type === 'dismiss') {
        console.log("Autenticação cancelada pelo usuário.");
        setIntegracaoGoogleCalendar(isCalendarConnected);
      } else if (response) {
        console.log("Resposta da autenticação recebida (Proxy):", response.type);
      }
    };

    handleAuthResponse();
  }, [response, userId, redirectUri]);


  const loadUserDataAndConfig = useCallback(async () => {
    try {
      const usuarioIdString = await AsyncStorage.getItem('usuario_id');
      if (!usuarioIdString) {
        Alert.alert("Erro", "ID do usuário não encontrado. Faça login novamente.");
        router.replace('/screens/login');
        return;
      }
      const id = parseInt(usuarioIdString, 10);
      setUserId(id);

      console.log("Buscando dados para userId:", id);
      const [userProfile, userConfigs] = await Promise.all([
        getUserProfile(id).catch(err => { console.error("Erro ao buscar perfil:", err); return null; }),
        getConfigsByUserId(id).catch(err => { console.error("Erro ao buscar configs:", err); return null; })
      ]);

      if (userProfile) {
        setNome(userProfile.nome || "");
        setCnpj(formatCNPJ(userProfile.cnpj || ""));
        setEmail(userProfile.email || "");
      }
      if (userConfigs) {
        console.log("Configurações recebidas:", userConfigs);
        const calendarIntegrationEnabled = !!userConfigs.integracao_google_calendar;
        const hasRefreshToken = !!userConfigs.google_refresh_token;

        setNotificacoesEstoque(!!userConfigs.notificacoes_estoque);
        setIntegracaoGoogleCalendar(calendarIntegrationEnabled);
        setIsCalendarConnected(hasRefreshToken);

        if (calendarIntegrationEnabled && !hasRefreshToken) {
          console.warn("Inconsistência: Integração Google marcada como ativa, mas sem refresh token. Desmarcando visualmente.");
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
                // await apiFetch(`/api/google/disconnect`, { method: 'POST', body: JSON.stringify({ userId }) }); // Implementar no backend
                await updateConfigs(userId, notificacoesEstoque, false);
                console.log("Solicitação de desconexão enviada ao backend (simulado).");

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
    } else {
      if (!request) {
        Alert.alert("Erro", "Não foi possível iniciar a autenticação. Tente novamente mais tarde.");
        console.error("AuthRequest não está pronto:", request);
        return;
      }
      setAuthRequestLoading(true);
      try {
        await promptAsync();
      } catch (error) {
        console.error("Erro ao chamar promptAsync:", error);
        Alert.alert("Erro", "Ocorreu um erro ao tentar iniciar a conexão com o Google.");
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
      const userDataToUpdate: { nome?: string; email?: string; cnpj?: string; senha?: string } = {};
      if (nome) userDataToUpdate.nome = nome;
      if (email) userDataToUpdate.email = email;
      if (cnpj) userDataToUpdate.cnpj = cnpj.replace(/[^\d]/g, '');
      if (senha) {
        if (senha.length < 6) {
          throw new Error("A nova senha deve ter no mínimo 6 caracteres.");
        }
        userDataToUpdate.senha = senha;
      }

      await Promise.all([
        Object.keys(userDataToUpdate).length > 0 ? updateUserData(userId, userDataToUpdate) : Promise.resolve(),
        updateConfigs(userId, notificacoesEstoque, integracaoGoogleCalendar)
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
                <Feather name="user" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome Completo" placeholderTextColor={PALETTE.CinzaClaro} editable={!saving && !authRequestLoading} />
              </View>
              <View style={styles.inputGroup}>
                <MaterialCommunityIcons name="card-account-details-outline" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                <TextInput style={styles.input} value={cnpj} onChangeText={handleCNPJChange} placeholder="CNPJ" placeholderTextColor={PALETTE.CinzaClaro} maxLength={18} keyboardType="numeric" editable={!saving && !authRequestLoading} />
              </View>
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
                  onValueChange={(newValue) => {
                    if (newValue && !isCalendarConnected) {
                      handleCalendarConnectToggle();
                    } else if (!newValue && isCalendarConnected) {
                      Alert.alert("Desconectar", "Use o botão 'Desconectar Google Calendar' abaixo para remover a integração.");
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
        </ScrollView>
      </KeyboardAvoidingView>
      <Nav style={styles.nav} />
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
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10
  }
});

export default SettingsPage;