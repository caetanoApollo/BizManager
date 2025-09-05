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
  Image,
  Switch,
  Alert,
} from "react-native";
import {
  MaterialCommunityIcons,
  Feather,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { Montserrat_400Regular } from "@expo-google-fonts/montserrat";
import { Nav } from "../components/utils";
import {
  updateConfigs,
  getUserProfile,
  updateUserData,
} from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsPage = () => {
  const [nome, setNome] = useState(""); // Adicionado estado para o nome
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [notificacoesEstoque, setNotificacoesEstoque] = useState(true);
  const [integracaoGoogleCalendar, setIntegracaoGoogleCalendar] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular, Montserrat: Montserrat_400Regular });

  useEffect(() => {
  }, [fontsLoaded]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const usuarioIdString = await AsyncStorage.getItem('usuario_id');
        if (!usuarioIdString) {
          Alert.alert("Erro", "ID do usuário não encontrado. Faça login novamente.");
          return;
        }
        const id = parseInt(usuarioIdString, 10);
        setUserId(id);

        const userProfile = await getUserProfile(id);
        if (userProfile) {
          setNome(userProfile.nome || "");
          setCnpj(formatCNPJ(userProfile.cnpj || ""));
          setEmail(userProfile.email || "");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };
    loadUserData();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const handleUpdateAccount = async () => {
    const usuarioIdString = await AsyncStorage.getItem('usuario_id');
    const usuario_id = usuarioIdString ? parseInt(usuarioIdString, 10) : null;

    if (usuario_id === null) {
      Alert.alert("Erro", "Usuário não identificado.");
      return;
    }

    setLoading(true);
    try {

      const userDataToUpdate: { nome: string; email: string; cnpj: string; senha?: string } = {
        nome,
        email,
        cnpj: cnpj.replace(/[^0-9]/g, ''),
      };
      if (senha) {
        userDataToUpdate.senha = senha;
      }

      await updateUserData(usuario_id, { nome, email, cnpj, senha });
      await updateConfigs(usuario_id, notificacoesEstoque, integracaoGoogleCalendar);

      Alert.alert("Sucesso", "Seu perfil foi atualizado!");
      setSenha('');
    } catch (error) {
      console.error("Erro ao atualizar conta:", error);
      Alert.alert("Erro", "Não foi possível atualizar seus dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  function formatCNPJ(value: string) {
    const numbers = value.replace(/\D/g, "");
    let cnpj = numbers;
    if (cnpj.length > 2) cnpj = cnpj.replace(/^(\d{2})(\d)/, "$1.$2");
    if (cnpj.length > 6) cnpj = cnpj.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    if (cnpj.length > 10) cnpj = cnpj.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4");
    if (cnpj.length > 15) cnpj = cnpj.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
    return cnpj;
  }
  const handleCNPJChange = (value: string) => {
    const formattedCNPJ = formatCNPJ(value);
    setCnpj(formattedCNPJ);
  };


  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#2A4D69" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient colors={["#5D9B9B", "#2A4D69"]} style={styles.container}>

          <View style={styles.header}>
            <Text style={styles.title}>BIZMANAGER</Text>
          </View>

          <Text style={styles.subtitle}>CONFIGURAÇÕES</Text>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CNPJ:</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={cnpj}
                  placeholder="Digite seu CNPJ"
                  placeholderTextColor="#ccc"
                  onChangeText={handleCNPJChange}
                  maxLength={18}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL:</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Digite seu email"
                  placeholderTextColor="#ccc"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SENHA:</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={!passwordVisible}
                  placeholder="Deixe em branco para não alterar"
                  placeholderTextColor="#ccc"
                  maxLength={15}
                />
                <TouchableOpacity
                  style={[styles.icon, { marginRight: 30, left: 280 }]}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <MaterialCommunityIcons
                    name={passwordVisible ? "eye-off" : "eye"}
                    size={20}
                    color="#F5F5F5"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.configOption}>
              <Text style={styles.label}>Notificações de Estoque:</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#5D9B9B" }}
                thumbColor={notificacoesEstoque ? "#F5F5F5" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setNotificacoesEstoque}
                value={notificacoesEstoque}
              />
            </View>

            <View style={styles.configOption}>
              <Text style={styles.label}>Integração Google Calendar:</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#5D9B9B" }}
                thumbColor={integracaoGoogleCalendar ? "#F5F5F5" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setIntegracaoGoogleCalendar}
                value={integracaoGoogleCalendar}
              />
            </View>

            <TouchableOpacity style={styles.updateButton} onPress={handleUpdateAccount}>
              <Text style={styles.updateButtonText}>ATUALIZAR CONTA</Text>
            </TouchableOpacity>
          </View>

          <Nav />
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#2A4D69",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    width: "100%",
  },
  title: {
    letterSpacing: 1.5,
    fontSize: 50,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
  },
  subtitle: {
    fontSize: 50,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
    marginTop: 10,
  },
  formContainer: {
    width: "90%",
    backgroundColor: "rgba(245, 245, 245, 0.09)",
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  icon: { position: "absolute", left: 245, bottom: 10 },
  label: {
    fontSize: 25,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(42, 77, 105, 0.35)",
    borderRadius: 5,
  },
  input: {
    flex: 1,
    padding: 10,
    color: "#F5F5F5",
    fontSize: 15,
    fontFamily: "Montserrat",
  },
  updateButton: {
    backgroundColor: "#5D9B9B",
    padding: 10,
    borderRadius: 60,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  updateButtonText: {
    fontSize: 22,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
  },
  footer: {
    width: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 60,
    padding: 10,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 8, height: 5 },
  },
  configOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: "rgba(42, 77, 105, 0.35)",
    borderRadius: 5,
  },
});

export default SettingsPage;