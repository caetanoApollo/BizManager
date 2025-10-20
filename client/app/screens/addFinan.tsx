import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, AntDesign, Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Header } from "../components/utils";
import { createTransaction, updateTransaction, getTransactionById } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PALETTE = {
  LaranjaPrincipal: "#F5A623",
  VerdeAgua: "#5D9B9B",
  AzulEscuro: "#2A4D69",
  Branco: "#F5F5F5",
  CinzaClaro: "#ccc",
};

const AddFinanScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = !!params.id;

  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState<'Entrada' | 'Saída' | ''>('');
  const [data, setData] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(isEditing); 
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
        const loadTransactionData = async () => {
            if (isEditing) {
                try {
                    const transactionData = await getTransactionById(Number(params.id));
                    setTitulo(transactionData.titulo || '');
                    setCategoria(transactionData.categoria || '');
                    setTipo(transactionData.tipo || '');
                    const dateFromApi = new Date(transactionData.data);
                    const formattedDate = `${String(dateFromApi.getUTCDate()).padStart(2, '0')}/${String(dateFromApi.getUTCMonth() + 1).padStart(2, '0')}/${dateFromApi.getUTCFullYear()}`;
                    setData(formattedDate);
                    setValor(formatCurrency(String(transactionData.valor) || '0'));
                    setDescricao(transactionData.descricao || '');
                } catch (error) {
                    Alert.alert("Erro", "Não foi possível carregar os dados da transação.");
                } finally {
                    setLoading(false);
                }
            }
        };
        loadTransactionData();
    }, [params.id, isEditing])
  );

  const handleSalvar = async () => {
    if (!titulo.trim() || !tipo || !data.trim() || !valor.trim()) {
      Alert.alert("Erro", "Título, Tipo, Data e Valor são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const usuarioIdString = await AsyncStorage.getItem('usuario_id');
      if (!usuarioIdString) {
        throw new Error("ID do usuário não encontrado.");
      }
      const usuario_id = Number(usuarioIdString);

      const [dia, mes, ano] = data.split('/');
      const formattedData = `${ano}-${mes}-${dia}`;
      const formattedValor = parseFloat(valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());

      if (isEditing) {
        await updateTransaction(Number(params.id), usuario_id, titulo, descricao, formattedValor, formattedData, tipo, categoria);
        Alert.alert("Sucesso", "Lançamento atualizado com sucesso!");
      } else {
        await createTransaction(usuario_id, titulo, descricao, formattedValor, formattedData, tipo, categoria);
        Alert.alert("Sucesso", "Lançamento salvo com sucesso!");
      }
      router.back();
    } catch (error: any) {
      Alert.alert("Erro ao salvar", error.message || "Não foi possível salvar o lançamento.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (text: string) =>
    text
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .slice(0, 10);

  const formatCurrency = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (!cleaned) return '';
    const number = parseFloat(cleaned) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(number);
  };
  
  const handleValorChange = (text: string) => {
    const formatted = formatCurrency(text);
    setValor(formatted);
  };

  const handleSelectType = (selectedType: 'Entrada' | 'Saída') => {
    setTipo(selectedType);
    setModalVisible(false);
  };

  const pageTitle = isEditing ? "EDITAR LANÇAMENTO" : "NOVO LANÇAMENTO";

  return (
    <LinearGradient
      colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]}
      style={styles.container}
    >
      <Header />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <AntDesign
              name="arrow-left"
              size={30}
              color={PALETTE.Branco}
              onPress={() => router.back()}
            />
            <MaterialIcons name={isEditing ? "edit" : "add-card"} size={30} color={PALETTE.Branco} />
            <Text style={styles.title}>{pageTitle}</Text>
          </View>
          
          {loading ? (
              <ActivityIndicator color={PALETTE.Branco} size="large" />
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>O Lançamento</Text>
              <View style={styles.inputGroup}>
                <Feather name="edit-3" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  value={titulo}
                  onChangeText={setTitulo}
                  placeholder="Título do Lançamento"
                  placeholderTextColor={PALETTE.CinzaClaro}
                />
              </View>
              <View style={styles.inputGroup}>
                <Feather name="tag" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  value={categoria}
                  onChangeText={setCategoria}
                  placeholder="Categoria (opcional)"
                  placeholderTextColor={PALETTE.CinzaClaro}
                />
              </View>
              <View style={[styles.inputGroup, styles.alignTop]}>
                <Feather name="file-text" size={20} color={PALETTE.CinzaClaro} style={[styles.icon, { paddingTop: 12 }]} />
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={descricao}
                  onChangeText={setDescricao}
                  placeholder="Descrição (opcional)"
                  placeholderTextColor={PALETTE.CinzaClaro}
                  multiline
                />
              </View>

              <Text style={styles.sectionTitle}>Detalhes Financeiros</Text>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Feather name="dollar-sign" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    value={valor}
                    onChangeText={handleValorChange}
                    placeholder="R$ 0,00"
                    placeholderTextColor={PALETTE.CinzaClaro}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                    onPress={() => setModalVisible(true)}
                  >
                    <Feather
                      name={tipo === 'Entrada' ? 'arrow-up-circle' : tipo === 'Saída' ? 'arrow-down-circle' : 'help-circle'}
                      size={20}
                      color={PALETTE.CinzaClaro}
                      style={styles.icon}
                    />
                    <Text style={[styles.input, styles.pickerText, !tipo && styles.placeholderText]}>
                      {tipo || "Tipo"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Quando?</Text>
              <View style={styles.inputGroup}>
                <Feather name="calendar" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  value={data}
                  onChangeText={(text) => setData(formatDate(text))}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={PALETTE.CinzaClaro}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={handleSalvar} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={PALETTE.Branco} />
                ) : (
                  <>
                    <Feather name="check-circle" size={20} color={PALETTE.Branco} />
                    <Text style={styles.buttonText}>Salvar Lançamento</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Selecione um Tipo</Text>
            <TouchableOpacity style={styles.clientItem} onPress={() => handleSelectType('Entrada')}>
              <Text style={styles.clientItemText}>Entrada</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clientItem} onPress={() => handleSelectType('Saída')}>
              <Text style={styles.clientItemText}>Saída</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoidingContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: { flexGrow: 1, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 15,
  },
  title: { color: PALETTE.Branco, fontSize: 25, fontFamily: "BebasNeue" },
  formContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    color: PALETTE.Branco,
    fontSize: 22,
    fontFamily: "BebasNeue",
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: PALETTE.LaranjaPrincipal,
    paddingLeft: 10,
  },
  inputGroup: {
    marginBottom: 20,
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
    fontFamily: "BebasNeue",
    marginLeft: 10,
  },
  pickerText: { paddingVertical: 15, paddingRight: 15, paddingLeft: 0 },
  placeholderText: { color: PALETTE.CinzaClaro },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    backgroundColor: PALETTE.AzulEscuro,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    color: PALETTE.Branco,
    fontSize: 22,
    fontFamily: "BebasNeue",
    textAlign: "center",
    marginBottom: 20,
  },
  clientItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  clientItemText: {
    color: PALETTE.Branco,
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: PALETTE.LaranjaPrincipal,
    borderRadius: 25,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  modalCloseButtonText: {
    color: PALETTE.Branco,
    fontSize: 16,
    fontFamily: "BebasNeue",
  },
});

export default AddFinanScreen;