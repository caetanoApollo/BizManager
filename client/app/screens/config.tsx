// config.tsx
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
import { useFonts, BebasNeue_400Regular} from "@expo-google-fonts/bebas-neue";
import {Montserrat_400Regular } from "@expo-google-fonts/montserrat";
import * as SplashScreen from "expo-splash-screen";
import * as ImagePicker from "expo-image-picker";
import { Nav } from "../components/utils";
import { getConfigsByUserId, updateConfigs, getUserProfile, updateUserProfile } from "../services/api"; // Importar todas as funções necessárias
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsPage = () => {
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [notificacoesEstoque, setNotificacoesEstoque] = useState(true); // Default value
  const [integracaoGoogleCalendar, setIntegracaoGoogleCalendar] = useState(false); // Default value
  const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular, Montserrat: Montserrat_400Regular });

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

  // Carregar configurações e perfil do usuário ao montar o componente
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const usuarioIdString = await AsyncStorage.getItem('usuario_id');
        if (!usuarioIdString) {
          Alert.alert("Erro", "ID do usuário não encontrado. Por favor, faça login novamente.");
          return;
        }
        const usuario_id = parseInt(usuarioIdString, 10);

        // 1. Carregar configurações
        try {
          const configs = await getConfigsByUserId(usuario_id);
          if (configs) {
            setNotificacoesEstoque(configs.notificacoes_estoque);
            setIntegracaoGoogleCalendar(configs.integracao_google_calendar);
          }
        } catch (configError: any) {
          // Se as configurações não forem encontradas (404), usamos os valores padrão do estado
          // Outros erros são logados.
          if (configError.message !== 'Configurações não encontradas para este usuário.') {
            console.error("Erro ao carregar configurações:", configError);
            Alert.alert("Erro", "Não foi possível carregar suas configurações.");
          }
          // Se for 404, os estados já estão com os valores padrão (true/false)
        }

        // 2. Carregar perfil do usuário
        try {
          const userProfile = await getUserProfile(usuario_id);
          if (userProfile) {
            setCnpj(formatCNPJ(userProfile.cnpj || ""));
            setEmail(userProfile.email || "");
            if (userProfile.foto_perfil) {
              // Assumindo que foto_perfil do backend é uma URI ou base64
              setImage(`data:image/jpeg;base64,${userProfile.foto_perfil}`);
            }
          }
        } catch (profileError) {
          console.error("Erro ao carregar perfil do usuário:", profileError);
          Alert.alert("Erro", "Não foi possível carregar seus dados de perfil.");
        }

      } catch (mainError) {
        console.error("Erro geral no carregamento de dados do usuário:", mainError);
      }
    };
    loadUserData();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const formatCNPJ = (value: string) => {
    // ... (função formatCNPJ inalterada) ...
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

  const pickImage = async () => {
    // ... (função pickImage inalterada) ...
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Desculpe, precisamos de permissão para acessar suas fotos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpdateAccount = async () => {
    try {
      const usuarioIdString = await AsyncStorage.getItem('usuario_id');
      if (!usuarioIdString) {
        Alert.alert("Erro", "ID do usuário não encontrado. Por favor, faça login novamente.");
        return;
      }
      const usuario_id = parseInt(usuarioIdString, 10);

      let updateSuccess = true;
      let errorMessage = "Erro ao atualizar: ";

      // 1. Atualizar dados do perfil do usuário (CNPJ, Email, Senha)
      const userDataToUpdate: { email?: string; cnpj?: string; senha?: string } = {};
      if (email) userDataToUpdate.email = email;
      // Remova a formatação do CNPJ antes de enviar para o backend
      // O replace(/[^0-9]/g, '') remove TUDO que não for número,
      // Se seu CNPJ pode ter letras, ajuste para /[^0-9A-Za-z]/g
      const rawCnpj = cnpj.replace(/[^0-9]/g, '');
      if (rawCnpj) userDataToUpdate.cnpj = rawCnpj; // Envie o CNPJ sem formatação
      if (senha) userDataToUpdate.senha = senha; // Enviar a senha apenas se preenchida

      if (Object.keys(userDataToUpdate).length > 0) {
        try {
          await updateUserProfile(usuario_id, userDataToUpdate);
        } catch (error: any) {
          updateSuccess = false;
          errorMessage += `Perfil (${error.message || 'Erro desconhecido'}). `;
          console.error("Erro ao atualizar perfil do usuário:", error);
        }
      }

      // 2. Atualizar configurações (notificações de estoque, integração Google Calendar)
      try {
        await updateConfigs(usuario_id, notificacoesEstoque, integracaoGoogleCalendar);
      } catch (error: any) {
        updateSuccess = false;
        errorMessage += `Configurações (${error.message || 'Erro desconhecido'}).`;
        console.error("Erro ao atualizar configurações:", error);
      }

      if (updateSuccess) {
        Alert.alert("Sucesso", "Dados e configurações atualizados com sucesso!");
        setSenha(''); // Limpar campo de senha após atualização
      } else {
        Alert.alert("Erro", errorMessage);
      }

    } catch (mainError) {
      console.error("Erro geral na função handleUpdateAccount:", mainError);
      Alert.alert("Erro", "Ocorreu um erro inesperado ao tentar atualizar.");
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

          <Text style={styles.subtitle}>CONFIGURAÇÕES</Text>

          <View style={styles.photoContainer}>
            <View style={styles.photoCircle}>
              <TouchableOpacity
                onPress={pickImage}
              >
                {image ? (
                  <Image source={{ uri: image }} style={styles.profileImage} />
                ) : (
                  <FontAwesome5 name="user" size={60} color="#F5F5F5" />
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.editPhotoButton}
              onPress={pickImage}
            >
              <Feather name="edit-2" size={20} color="#F5F5F5" />
            </TouchableOpacity>
          </View>

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
                />
                <TouchableOpacity
                  style={[styles.icon, { marginRight: 30 }]}
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
  photoContainer: {
    position: "relative",
    marginTop: 0,
    alignItems: "center",
  },
  photoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(245, 245, 245, 0.09)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoText: {
    fontSize: 25,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 60,
  },
  editPhotoButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#5D9B9B",
    borderRadius: 15,
    padding: 8,
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
  icon: { position: "absolute", left: 280, bottom: 10 },
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
    fontSize: 20,
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