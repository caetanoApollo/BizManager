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
} from "react-native";
import {
  MaterialCommunityIcons,
  FontAwesome6,
  Feather,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

const SettingsPage = () => {
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [image, setImage] = useState<string | null>(null);
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
    // Solicitar permissão para acessar a galeria
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Desculpe, precisamos de permissão para acessar suas fotos!");
      return;
    }

    // Abrir o seletor de imagens
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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
              {image ? (
                <Image source={{ uri: image }} style={styles.profileImage} />
              ) : (
                <Text style={styles.photoText}>FOTO</Text>
              )}
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
                  placeholder="Digite sua senha"
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

            <TouchableOpacity style={styles.updateButton}>
              <Text style={styles.updateButtonText}>ATUALIZAR CONTA</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity>
              <FontAwesome6 name="boxes-stacked" size={25} color="#F5F5F5" />
            </TouchableOpacity>
            <TouchableOpacity>
              <MaterialCommunityIcons name="folder" size={30} color="#F5F5F5" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(screens)/main")}>
              <MaterialCommunityIcons name="home" size={30} color="#F5F5F5" />
            </TouchableOpacity>
            <TouchableOpacity>
              <MaterialCommunityIcons
                name="finance"
                size={30}
                color="#F5F5F5"
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <MaterialCommunityIcons
                name="calendar"
                size={30}
                color="#F5F5F5"
              />
            </TouchableOpacity>
          </View>
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
    fontFamily: "BebasNeue",
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
});

export default SettingsPage;
