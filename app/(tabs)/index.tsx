// index.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import AppLoading from 'expo-app-loading';
import { useRouter } from "expo-router";

export default function HomePage() { // Exportação padrão
  const router = useRouter();

  const [cnpj, setCnpj] = useState("");

  // Função para formatar o CNPJ
  const formatCNPJ = (value: string) => {
    const cleanedValue = value.replace(/[^a-zA-Z0-9]/g, "");
    const isAlphanumeric = /[a-zA-Z]/.test(cleanedValue);

    if (isAlphanumeric) {
      if (cleanedValue.length <= 8) {
        return cleanedValue;
      } else if (cleanedValue.length <= 12) {
        return `${cleanedValue.slice(0, 8)}-${cleanedValue.slice(8)}`;
      } else {
        return `${cleanedValue.slice(0, 8)}-${cleanedValue.slice(8, 12)}-${cleanedValue.slice(12, 14)}`;
      }
    } else {
      if (cleanedValue.length <= 2) {
        return cleanedValue;
      } else if (cleanedValue.length <= 5) {
        return `${cleanedValue.slice(0, 2)}.${cleanedValue.slice(2)}`;
      } else if (cleanedValue.length <= 8) {
        return `${cleanedValue.slice(0, 2)}.${cleanedValue.slice(2, 5)}.${cleanedValue.slice(5)}`;
      } else if (cleanedValue.length <= 12) {
        return `${cleanedValue.slice(0, 2)}.${cleanedValue.slice(2, 5)}.${cleanedValue.slice(5, 8)}/${cleanedValue.slice(8)}`;
      } else {
        return `${cleanedValue.slice(0, 2)}.${cleanedValue.slice(2, 5)}.${cleanedValue.slice(5, 8)}/${cleanedValue.slice(8, 12)}-${cleanedValue.slice(12, 14)}`;
      }
    }
  };

  const handleCNPJChange = (value: string) => {
    const formattedCNPJ = formatCNPJ(value);
    setCnpj(formattedCNPJ);
  };

  const [passwordVisible, setPasswordVisible] = useState(false);

  const handlePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  let [fontsLoaded] = useFonts({
    BebasNeue: BebasNeue_400Regular,
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <LinearGradient
      colors={['#5D9B9B', '#2A4D69']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>BIZMANAGER</Text>
      </View>
      
      <Text style={styles.loginText}>LOGIN</Text>

      <View style={styles.inputContainer}>
        <View style={styles.blurOverlay}>
          <Text style={styles.label}>CNPJ:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu CNPJ"
            placeholderTextColor="#ccc"
            value={cnpj}
            onChangeText={handleCNPJChange}
            maxLength={18}
          />

          <Text style={styles.label}>SENHA:</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              secureTextEntry={!passwordVisible}
              placeholderTextColor="#ccc"
            />
            <TouchableOpacity onPress={handlePasswordVisibility} style={styles.icon}>
              <MaterialCommunityIcons name={passwordVisible ? "eye-off" : "eye"} size={20} color="#F5F5F5" />
            </TouchableOpacity>
          </View>

          <Text style={styles.recoverText}>
            ESQUECEU SENHA? <Text style={styles.recoverLink}>RECUPERAR CONTA</Text>
          </Text>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>ENTRAR</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>NÃO TEM CONTA?</Text>
        <Text style={styles.registerSubText}>CLIQUE NO BOTÃO ABAIXO E CADASTRE-SE</Text>
        
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push('/(tabs)/signup')}
        >
          <Text style={styles.registerButtonText}>CADASTRAR</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  header: {
    width: "100%",
    paddingVertical: 20,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: "rgba(42, 77, 105, 1)",
  },
  title: {
    fontSize: 60,
    fontFamily: 'BebasNeue',
    color: "#F5F5F5",
  },
  loginText: {
    fontSize: 50,
    fontFamily: 'BebasNeue',
    color: "#F5F5F5",
    marginTop: 50,
  },
  inputContainer: {
    width: "90%",
    backgroundColor: "rgba(245, 245, 245, 0.09)",
    borderRadius: 10,
    marginBottom: 50,
  },
  label: {
    fontSize: 25,
    fontFamily: 'BebasNeue',
    color: "#F5F5F5",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "rgba(42, 77, 105, 0.35)",
    borderRadius: 5,
    padding: 10,
    color: "#F5F5F5",
    fontSize: 20,
    marginBottom: 10,
    width: "100%",
    fontFamily: 'BebasNeue',
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  icon: {
    position: "absolute",
    paddingBottom: 10,
    right: 10,
  },
  recoverText: {
    paddingTop: 10,
    paddingBottom: 20,
    fontSize: 18,
    fontFamily: 'BebasNeue',
    color: "#F5F5F5",
  },
  recoverLink: {
    fontFamily: 'BebasNeue',
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: "#5D9B9B",
    marginLeft: 60,
    padding: 10,
    borderRadius: 60,
    width: "60%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonText: {
    fontSize: 25,
    fontFamily: 'BebasNeue',
    color: "#F5F5F5",
  },
  registerContainer: {
    alignItems: "center",
  },
  registerText: {
    fontSize: 20,
    fontFamily: 'BebasNeue',
    color: "#F5F5F5",
  },
  registerSubText: {
    fontSize: 20,
    fontFamily: 'BebasNeue',
    color: "#F5F5F5",
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: "#F5A623",
    padding: 10,
    borderRadius: 60,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    width: 170,
    alignItems: "center",
  },
  registerButtonText: {
    fontSize: 25,
    fontFamily: 'BebasNeue',
    color: "#F5F5F5",
  },
  blurOverlay: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 25,
  },
});