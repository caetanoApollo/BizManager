import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import AppLoading from "expo-app-loading";

const CadastroPage: React.FC = () => {
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmarSenhaVisivel, setConfirmarSenhaVisivel] = useState(false);

  let [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular });
  if (!fontsLoaded) return <AppLoading />;

  return (
    <LinearGradient colors={["#5D9B9B", "#2A4D69"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BIZMANAGER</Text>
      </View>
      <Text style={styles.subtitle}>CADASTRO</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>CNPJ:</Text>
        <TextInput
          style={styles.input}
          value={cnpj}
          onChangeText={setCnpj}
          placeholder="Digite seu CNPJ"
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
        />
        <Text style={styles.label}>SENHA:</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!senhaVisivel}
            placeholder="Digite sua senha"
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
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>CRIAR CONTA</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.recoverContainer}>
        <Text style={styles.recoverText}>PARA RECUPERAR SUA CONTA</Text>
        <Text style={styles.recoverText}>CLIQUE NO BOTÃO ABAIXO</Text>
        <TouchableOpacity style={styles.recoverButton}>
          <Text style={styles.recoverButtonText}>RECUPERAR CONTA</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center" },
  header: {
    width: "100%",
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "#2A4D69",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: { fontSize: 50, fontFamily: "BebasNeue", color: "#F5F5F5" },
  subtitle: {
    fontSize: 40,
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
    fontSize: 20,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "rgba(42, 77, 105, 0.35)",
    borderRadius: 5,
    padding: 10,
    color: "#F5F5F5",
    fontSize: 18,
    marginBottom: 10,
    width: "100%",
    fontFamily: "BebasNeue",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  icon: { position: "absolute", right: 10 },
  button: {
    backgroundColor: "#5D9B9B",
    padding: 10,
    borderRadius: 60,
    width: "60%",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 10,
  },
  buttonText: { fontSize: 22, fontFamily: "BebasNeue", color: "#F5F5F5" },
  recoverContainer: { alignItems: "center", marginTop: 30 },
  recoverText: { fontSize: 18, fontFamily: "BebasNeue", color: "#F5F5F5" },
  recoverButton: {
    backgroundColor: "#5D9B9B",
    padding: 10,
    borderRadius: 60,
    width: "60%",
    alignItems: "center",
    marginTop: 10,
  },
  recoverButtonText: {
    fontSize: 22,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
  },
});

export default CadastroPage;
