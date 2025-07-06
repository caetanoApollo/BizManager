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
  Alert,
} from "react-native";
import { MaterialIcons, AntDesign, FontAwesome6 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";
import { Header, Nav } from "../components/utils";

const AddEstoquePage: React.FC = () => {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [valorProduto, setValorProduto] = useState("");
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

  const formatCurrency = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length === 0) return "";
    const integerPart = cleaned.slice(0, -2) || "0";
    const decimalPart = cleaned.slice(-2);
    return `R$ ${parseInt(integerPart, 10).toLocaleString("pt-BR")},${decimalPart}`;
  };

  const handleSalvarItem = () => {
    if (!titulo.trim()) {
      Alert.alert("Erro", "O título é obrigatório");
      return;
    }

    if (!/^\d+$/.test(quantidade)) {
      Alert.alert("Erro", "Quantidade inválida");
      return;
    }

    if (!fornecedor.trim()) {
      Alert.alert("Erro", "O fornecedor é obrigatório");
      return;
    }

    if (!/^\d+([,.]\d{1,2})?$/.test(valorProduto.replace("R$ ", "").replace(/\./g, "").replace(",", "."))) {
      Alert.alert("Erro", "Valor do produto inválido");
      return;
    }

    Alert.alert("Sucesso", "Item salvo com sucesso!");
    router.push("/");
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#2A4D69" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient colors={["#5D9B9B", "#2A4D69"]} style={styles.container}>
          <Header />

          <View style={styles.subtitle}>
            <AntDesign
              name="arrowleft"
              size={30}
              color="#F5F5F5"
              onPress={() => router.back()}
            />
            <FontAwesome6 name="boxes-stacked" size={30} color="#fff" />
            <Text style={{ fontSize: 25, color: "#F5F5F5", fontFamily: "BebasNeue" }}>ESTOQUE</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.boxTitle}>
              <MaterialIcons
                name="all-inbox"
                size={30}
                color="#F5F5F5"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.sectionTitle}>NOVO ITEM</Text>
            </View>

            <Text style={styles.label}>Título:</Text>
            <TextInput
              style={styles.input}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Digite o título do item"
              placeholderTextColor="#ccc"
            />

            <Text style={styles.label}>Quantidade:</Text>
            <TextInput
              style={styles.input}
              value={quantidade}
              onChangeText={setQuantidade}
              placeholder="Digite a quantidade"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Fornecedor:</Text>
            <TextInput
              style={styles.input}
              value={fornecedor}
              onChangeText={setFornecedor}
              placeholder="Digite o fornecedor"
              placeholderTextColor="#ccc"
            />

            <Text style={styles.label}>Valor do Produto (R$):</Text>
            <TextInput
              style={styles.input}
              value={valorProduto}
              onChangeText={(text) => setValorProduto(formatCurrency(text))}
              placeholder="R$ 0,00"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSalvarItem}
          >
            <Text style={styles.buttonText}>Salvar Item</Text>
          </TouchableOpacity>
          <Nav />
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center" },
  subtitle: {
    gap: 10,
    padding: 5,
    paddingTop: 10,
    marginRight: "45%",
    alignItems: "center",
    flexDirection: "row",
  },
  sectionTitle: {
    fontFamily: "BebasNeue",
    color: "#fff",
    fontSize: 25,
  },
  inputContainer: {
    width: "90%",
    backgroundColor: "rgba(245, 245, 245, 0.09)",
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
  },
  input: {
    backgroundColor: "rgba(42, 77, 105, 0.35)",
    borderRadius: 5,
    padding: 10,
    color: "#F5F5F5",
    fontSize: 20,
    marginBottom: 10,
    width: "100%",
    fontFamily: "Montserrat",
  },
  boxTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    color: "#F5F5F5",
    fontSize: 25,
    fontFamily: "BebasNeue",
    marginBottom: 5,
    marginTop: 10,
  },
  button: {
    backgroundColor: "#5D9B9B",
    borderRadius: 100,
    padding: 15,
    width: "60%",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    fontFamily: "BebasNeue",
    fontSize: 20,
    color: "#fff",
  },
});

export default AddEstoquePage;