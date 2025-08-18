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
  Image,
  ActivityIndicator, 
} from "react-native";
import {
  MaterialCommunityIcons,
  Feather,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import * as ImagePicker from "expo-image-picker";
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";
import { cadastro } from "../services/api";

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
  const [imageUri, setImageUri] = useState<string | null>(null); // Renomeado para clareza
  const [loading, setLoading] = useState(false); // Estado de carregamento

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

  const formatCNPJ = (value: string) => {
    // Remove tudo que não é dígito
    const cleanedValue = value.replace(/\D/g, "");

    // Aplica a máscara de CNPJ
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
  };

  const handleCNPJChange = (value: string) => {
    const formattedCNPJ = formatCNPJ(value);
    setCnpj(formattedCNPJ);
  };

  const handleCadastro = async () => {
    // --- Validações ---
    if (!nome || !email || !cnpj || !senha || !confirmarSenha) {
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

    setLoading(true); 
    try {
      await cadastro(
        nome,
        email,
        telefone,
        cnpj.replace(/[^0-9]/g, ''), 
        senha,
        imageUri || undefined 
      );
      Alert.alert(
        "Sucesso!",
        "Sua conta foi criada com sucesso. Faça o login para continuar."
      );
      router.push("/screens/home"); 
    } catch (err: any) {
      Alert.alert(
        "Erro no Cadastro",
        err.message || "Não foi possível criar a conta. Tente novamente."
      );
    } finally {
      setLoading(false); 
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão Necessária",
        "Precisamos de permissão para acessar sua galeria de fotos."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#2A4D69" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
            <View style={styles.photoContainer}>
              <TouchableOpacity onPress={pickImage} style={styles.photoCircle}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.profileImage} />
                ) : (
                  <FontAwesome5 name="user" size={60} color="#F5F5F5" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editPhotoButton}
                onPress={pickImage}
              >
                <Feather name="edit-2" size={20} color="#F5F5F5" />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>CNPJ:</Text>
            <TextInput
              style={styles.input}
              value={cnpj}
              onChangeText={handleCNPJChange}
              placeholder="Digite seu CNPJ"
              placeholderTextColor="#ccc"
              maxLength={18}
              keyboardType="numeric"
            />
            <Text style={styles.label}>NOME:</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Digite seu nome"
              placeholderTextColor="#ccc"
            />
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
            <Text style={styles.label}>TELEFONE:</Text>
            <TextInput
              style={styles.input}
              value={telefone}
              onChangeText={setTelefone}
              placeholder="Digite seu telefone (Opcional)"
              placeholderTextColor="#ccc"
              keyboardType="phone-pad"
              maxLength={15}
            />
            <Text style={styles.label}>SENHA:</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!senhaVisivel}
                placeholder="Mínimo 6 caracteres"
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
            <TouchableOpacity
              style={styles.button}
              onPress={handleCadastro}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#F5F5F5" />
              ) : (
                <Text style={styles.buttonText}>CRIAR CONTA</Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.recoverContainer}>
            <Text style={styles.recoverText}>JÁ POSSUI UMA CONTA?</Text>
            <TouchableOpacity
              style={styles.recoverButton}
              onPress={() => router.push("/screens/home")}
            >
              <Text style={styles.recoverButtonText}>FAZER LOGIN</Text>
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
  title: {
    fontSize: 50,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
    letterSpacing: 1.5,
  },
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
    fontSize: 16, 
    marginBottom: 10,
    width: "100%",
    fontFamily: "Montserrat_400Regular", 
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    width: "100%",
  },
  icon: { position: "absolute", right: 10, top: 10 },
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
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 60,
    width: "60%",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 50,
    borderWidth: 2,
    borderColor: "#5D9B9B",
  },
  recoverButtonText: {
    fontSize: 22,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
  },
  photoContainer: {
    position: "relative",
    marginBottom: 15,
    alignItems: "center",
  },
  photoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(245, 245, 245, 0.09)",
    justifyContent: "center",
    alignItems: "center",
    overflow: 'hidden', 
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  editPhotoButton: {
    position: "absolute",
    right: '30%',
    bottom: 0,
    backgroundColor: "#5D9B9B",
    borderRadius: 15,
    padding: 8,
  },
});

export default CadastroPage;