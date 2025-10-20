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
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, AntDesign, FontAwesome6, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { useRouter, useLocalSearchParams } from "expo-router";
import { Header } from "../components/utils";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createProduct, updateProduct, getProductsByUserId } from "../services/api";

const PALETTE = {
  LaranjaPrincipal: "#F5A623",
  VerdeAgua: "#5D9B9B",
  AzulEscuro: "#2A4D69",
  Branco: "#F5F5F5",
  CinzaClaro: "#ccc",
};

const AddEstoquePage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const productId = params.productId ? Number(params.productId) : undefined;
  const isEditing = productId !== undefined;

  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [quantidadeMinima, setQuantidadeMinima] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [precoCusto, setPrecoCusto] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular, Montserrat: Montserrat_400Regular });

  useEffect(() => {
    const fetchProductData = async () => {
      if (isEditing && productId) {
        try {
          const userIdString = await AsyncStorage.getItem('usuario_id');
          if (!userIdString) throw new Error("ID do usuário não encontrado.");
          const products = await getProductsByUserId(Number(userIdString));
          const productData = products.find((p: any) => p.id === productId);

          if (productData) {
            setNome(productData.nome);
            setQuantidade(String(productData.quantidade));
            setQuantidadeMinima(String(productData.quantidade_minima));
            setFornecedor(productData.fornecedor || '');
            setPrecoCusto(formatCurrencyForDisplay(productData.preco_custo));
            setPrecoVenda(formatCurrencyForDisplay(productData.preco_venda));
            setDescricao(productData.descricao || '');
          }
        } catch (error) {
          Alert.alert("Erro", "Não foi possível carregar os dados do produto.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProductData();
  }, [productId, isEditing]);

  const formatCurrencyForDisplay = (num: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  const formatCurrencyForInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (!cleaned) return '';
    const number = parseFloat(cleaned) / 100;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);
  };

  const handleCustoChange = (text: string) => {
    setPrecoCusto(formatCurrencyForInput(text));
  };

  const handleVendaChange = (text: string) => {
    setPrecoVenda(formatCurrencyForInput(text));
  };

  const handleSalvarItem = async () => {
    if (!nome.trim() || !quantidade.trim() || !precoVenda.trim() || !precoCusto.trim()) {
      Alert.alert("Erro", "Nome, Quantidade, Preço de Custo e Preço de Venda são obrigatórios.");
      return;
    }

    const quantidadeNum = parseInt(quantidade, 10);
    const precoCustoNum = parseFloat(precoCusto.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
    const precoVendaNum = parseFloat(precoVenda.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
    const quantidadeMinimaNum = parseInt(quantidadeMinima, 10) || 5;

    if (isNaN(quantidadeNum) || isNaN(precoCustoNum) || isNaN(precoVendaNum) || quantidadeNum < 0) {
      Alert.alert("Erro", "Valores numéricos inválidos.");
      return;
    }

    setSaving(true);
    try {
      const userIdString = await AsyncStorage.getItem('usuario_id');
      if (!userIdString) throw new Error("ID do usuário não encontrado.");
      const usuario_id = Number(userIdString);

      const productData = {
        usuario_id,
        nome,
        descricao,
        quantidade: quantidadeNum,
        quantidade_minima: quantidadeMinimaNum,
        preco_custo: precoCustoNum,
        preco_venda: precoVendaNum,
        fornecedor,
      };

      if (isEditing && productId) {
        await updateProduct(productId, usuario_id, nome, descricao, quantidadeNum, quantidadeMinimaNum, precoCustoNum, precoVendaNum, fornecedor);
        Alert.alert("Sucesso", "Item atualizado com sucesso!");
      } else {
        await createProduct(usuario_id, nome, descricao, quantidadeNum, quantidadeMinimaNum, precoCustoNum, precoVendaNum, fornecedor);
        Alert.alert("Sucesso", "Item salvo com sucesso!");
      }
      router.back();
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao salvar item.");
    } finally {
      setSaving(false);
    }
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
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.headerSection}>
            <AntDesign name="arrow-left" size={30} color={PALETTE.Branco} onPress={() => router.back()} />
            <FontAwesome6 name="boxes-stacked" size={30} color={PALETTE.Branco} />
            <Text style={styles.title}>{isEditing ? "Editar Item" : "Novo Item"}</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={PALETTE.Branco} style={{ marginTop: 50 }} />
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Informações do Produto</Text>
              <View style={styles.inputGroup}>
                <Feather name="box" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome do item" placeholderTextColor={PALETTE.CinzaClaro} />
              </View>
              <View style={[styles.inputGroup, styles.alignTop]}>
                <Feather name="file-text" size={20} color={PALETTE.CinzaClaro} style={[styles.icon, { paddingTop: 12 }]} />
                <TextInput style={[styles.input, styles.multilineInput]} value={descricao} onChangeText={setDescricao} placeholder="Descrição (opcional)" placeholderTextColor={PALETTE.CinzaClaro} multiline />
              </View>

              <Text style={styles.sectionTitle}>Detalhes do Estoque</Text>
              <View style={styles.inputGroup}>
                <Feather name="package" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                <TextInput style={styles.input} value={quantidade} onChangeText={setQuantidade} placeholder="Quantidade" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="numeric" />
              </View>
              <View style={styles.inputGroup}>
                <MaterialIcons name="local-shipping" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                <TextInput style={styles.input} value={fornecedor} onChangeText={setFornecedor} placeholder="Fornecedor (opcional)" placeholderTextColor={PALETTE.CinzaClaro} />
              </View>
              <View style={styles.inputGroup}>
                <MaterialCommunityIcons name="alert-circle-outline" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                <TextInput style={styles.input} value={quantidadeMinima} onChangeText={setQuantidadeMinima} placeholder="Qtd. Mínima para Alerta" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="numeric" />
              </View>

              <Text style={styles.sectionTitle}>Valores</Text>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <MaterialIcons name="attach-money" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                  <TextInput style={styles.input} value={precoCusto} onChangeText={handleCustoChange} placeholder="Preço de Custo" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="numeric" />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <MaterialIcons name="attach-money" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                  <TextInput style={styles.input} value={precoVenda} onChangeText={handleVendaChange} placeholder="Preço de Venda" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="numeric" />
                </View>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleSalvarItem} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={PALETTE.Branco} />
                ) : (
                  <>
                    <Feather name="check-circle" size={20} color={PALETTE.Branco} />
                    <Text style={styles.buttonText}>{isEditing ? "Atualizar Item" : "Salvar Item"}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, paddingBottom: 40 },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 20,
    paddingTop: 10,
    alignSelf: "flex-start",
  },
  title: { color: PALETTE.Branco, fontSize: 25, fontFamily: "BebasNeue_400Regular" },
  formContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    color: PALETTE.Branco,
    fontSize: 22,
    fontFamily: "BebasNeue_400Regular",
    marginBottom: 15,
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
  alignTop: { alignItems: "flex-start" },
  icon: { paddingLeft: 15, paddingRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 15,
    paddingRight: 15,
    color: PALETTE.Branco,
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
  },
  multilineInput: { height: 100, textAlignVertical: "top", paddingTop: 15 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  button: {
    flexDirection: "row",
    backgroundColor: PALETTE.VerdeAgua,
    borderRadius: 30,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: PALETTE.Branco,
    fontSize: 20,
    fontFamily: "BebasNeue_400Regular",
    marginLeft: 10,
  },
});

export default AddEstoquePage;