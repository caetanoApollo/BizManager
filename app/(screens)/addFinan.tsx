import React, { useState, useEffect, useRef } from "react";
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
  Animated,
} from "react-native";
import { MaterialIcons, AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";
import { Picker } from '@react-native-picker/picker';
import { Header } from "../components/utils";

const AddNotaPage: React.FC = () => {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [servicoSelecionado, setServicoSelecionado] = useState("");
  const [dataServico, setDataServico] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [showServicos, setShowServicos] = useState(false);
  const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular });
  const pickerHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(pickerHeight, {
      toValue: showServicos ? 85 : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [showServicos]);

  const handleSalvarNota = () => {
    if (!titulo.trim()) {
      Alert.alert("Erro", "O título é obrigatório");
      return;
    }

    if (!servicoSelecionado) {
      Alert.alert("Erro", "Selecione um tipo");
      return;
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dataServico)) {
      Alert.alert("Erro", "Data inválida (DD/MM/AAAA)");
      return;
    }

    if (!/^\d+([,.]\d{1,2})?$/.test(valorTotal)) {
      Alert.alert("Erro", "Valor inválido");
      return;
    }

    Alert.alert("Sucesso", "Nota salva com sucesso!");
    router.push("/");
  };

  const formatDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    return cleaned
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .slice(0, 10);
  };

  const formatCurrency = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    const integerPart = cleaned.slice(0, -2) || '0';
    const decimalPart = cleaned.slice(-2);
    return `R$ ${parseInt(integerPart, 10).toLocaleString('pt-BR')},${decimalPart}`;
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
        <LinearGradient
          colors={["#5D9B9B", "#2A4D69"]}
          style={styles.container}
        >
          <Header />

          <View style={styles.subtitle}>
            <AntDesign
              name="arrowleft"
              size={30}
              color="#F5F5F5"
              onPress={() => router.back()}
            />
            <MaterialCommunityIcons name="finance" size={30} color="#fff" />
            <Text style={{ fontSize: 25, color: "#F5F5F5", fontFamily: "BebasNeue" }}>FINANCEIRO</Text>
          </View>

          <View style={styles.inputContainer}>
          <View style={styles.boxTitle}>
              <MaterialIcons
                name="add-card"
                size={30}
                color="#F5F5F5"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.sectionTitle}>Adicionar Lançamento</Text>
            </View>
            <Text style={styles.label}>Título:</Text>
            <TextInput
              style={styles.input}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Digite o título"
              placeholderTextColor="#ccc"
            />

            <Text style={styles.label}>Tipo:</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowServicos(!showServicos)}
            >
              <Text style={{
                color: servicoSelecionado ? '#F5F5F5' : '#ccc',
                fontFamily: "BebasNeue",
                fontSize: 20
              }}>
                {servicoSelecionado || "Entrada/Saída"}
              </Text>
            </TouchableOpacity>

            <Animated.View style={[styles.pickerContainer, { height: pickerHeight }]}>
              <Picker
                selectedValue={servicoSelecionado}
                onValueChange={(value) => {
                  setServicoSelecionado(value);
                  setShowServicos(false);
                }}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Selecione um tipo" value="" />
                <Picker.Item label="Entrada" value="Entrada" />
                <Picker.Item label="Saída" value="Saída" />
              </Picker>
            </Animated.View>

            <Text style={styles.label}>Data do Serviço:</Text>
            <TextInput
              style={styles.input}
              value={dataServico}
              onChangeText={(text) => setDataServico(formatDate(text))}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
              maxLength={10}
            />

            <Text style={styles.label}>Valor Total (R$):</Text>
            <TextInput
              style={styles.input}
              value={valorTotal}
              onChangeText={(text) => setValorTotal(formatCurrency(text))}
              placeholder="R$ 0,00"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Descrição:</Text>
            <TextInput
              style={[styles.input, { maxHeight: 500, minHeight: 100 }]}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Descrição"
              placeholderTextColor="#ccc"
              multiline
              numberOfLines={4}
              textAlign="left"
              maxLength={200}
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSalvarNota}
          >
            <Text style={styles.buttonText}>Salvar Nota</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  subtitle: {
    gap: 10,
    padding: 5,
    paddingTop: 10,
    marginRight: "50%",
    alignItems: "center",
    flexDirection: "row",
  },
  boxTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
    fontFamily: "BebasNeue",
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
    marginBottom: 30,
  },
  buttonText: {
    fontFamily: "BebasNeue",
    fontSize: 20,
    color: "#fff",
  },
  pickerContainer: {
    overflow: 'hidden',
    width: '100%',
    backgroundColor: 'rgba(42, 77, 105, 0.35)',
    borderRadius: 10,
  },
  picker: {
    color: '#F5F5F5',
  },
  pickerItem: {
    marginVertical: -80,
    fontSize: 16,
    color: '#F5F5F5',
    fontFamily: "BebasNeue",
  },
});

export default AddNotaPage;