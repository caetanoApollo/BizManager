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
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";
import { Picker } from '@react-native-picker/picker';
import { Header, Nav } from "../components/utils";

const AddNotaPage: React.FC = () => {
  const router = useRouter();
  const [servicoSelecionado, setServicoSelecionado] = useState("");
  const [cnpjTomador, setCnpjTomador] = useState("");
  const [dataServico, setDataServico] = useState("");
  const [valorTotal, setValorTotal] = useState("");
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

  //! Serviços mockados, colocar via API depois
  const [servicosPrestados] = useState([
    { id: "1", nome: "Consultoria TI" },
    { id: "2", nome: "Desenvolvimento Software" },
    { id: "3", nome: "Manutenção de Sistemas" },
  ]);

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

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
    if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
  };

  const handleCNPJChange = (text: string) => {
    const formatted = formatCNPJ(text);
    setCnpjTomador(formatted);
  };

  const valorNumerico = parseFloat(
    valorTotal
      .replace('R$ ', '')
      .replace(/\./g, '')
      .replace(',', '.')
  );

  const formatDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    return cleaned
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .slice(0, 10);
  };

  const handleSalvarNota = () => {
    if (!servicoSelecionado) {
      Alert.alert("Erro", "Selecione um serviço prestado");
      return;
    }

    if (cnpjTomador.length !== 18) {
      Alert.alert("Erro", "CNPJ inválido");
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
            <MaterialIcons name="folder" size={30} color="#fff" />
            <Text style={{ fontSize: 25, color: "#F5F5F5", fontFamily: "BebasNeue" }}>Notas Fiscais</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.boxTitle}>
              <MaterialIcons
                name="note-add"
                size={30}
                color="#F5F5F5"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.sectionTitle}>Adicionar Nota</Text>
            </View>
            <Text style={styles.label}>Serviço Prestado:</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowServicos(!showServicos)}
            >
              <Text style={{
                color: servicoSelecionado ? '#F5F5F5' : '#ccc',
                fontFamily: "BebasNeue",
                fontSize: 20
              }}>
                {servicoSelecionado || "Selecione o serviço"}
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
                <Picker.Item label="Selecione um serviço" value="" />
                {servicosPrestados.map((servico) => (
                  <Picker.Item
                    key={servico.id}
                    label={servico.nome}
                    value={servico.nome}
                  />
                ))}
              </Picker>
            </Animated.View>

            <Text style={styles.label}>CNPJ do Tomador:</Text>
            <TextInput
              style={styles.input}
              value={cnpjTomador}
              onChangeText={handleCNPJChange}
              placeholder="Digite o CNPJ"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
              maxLength={18}
            />

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
              onChangeText={(text) => {
                let cleaned = text.replace(/\D/g, '');
                if (cleaned.length === 0) {
                  setValorTotal('');
                  return;
                }

                const integerPart = cleaned.slice(0, -2) || '0';
                const decimalPart = cleaned.slice(-2);

                const formattedValue = `R$ ${parseInt(integerPart, 10).toLocaleString('pt-BR')},${decimalPart}`;
                setValorTotal(formattedValue);
              }}
              placeholder="R$ 0,00"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSalvarNota}
          >
            <Text style={styles.buttonText}>Salvar Nota</Text>
          </TouchableOpacity>
          <Nav />
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
  icon: { position: "absolute", right: 10, bottom: 20 },
  boxTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  center: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
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