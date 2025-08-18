// client/app/screens/addNota.tsx
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, KeyboardAvoidingView } from "react-native";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { useRouter } from "expo-router";
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header, Nav } from "../components/utils";
import { getUserProfile, getClients } from "../services/api"; 

// Interfaces para tipagem dos dados
interface Endereco {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    codigo_municipio: string;
    uf: string;
    cep: string;
}

interface Tomador {
    cnpj: string;
    razao_social: string;
    email: string;
    endereco: Endereco;
}

interface Prestador {
    cnpj: string;
    inscricao_municipal: string;
    codigo_municipio: string;
}

interface Servico {
    aliquota: number;
    discriminacao: string;
    iss_retido: boolean;
    item_lista_servico: string;
    codigo_tributario_municipio: string;
    valor_servicos: number;
}

interface Cliente {
    id: number;
    nome: string;
    cnpj?: string; // Adicionado
    email?: string;
    endereco?: string; // Simplificado por enquanto
}


const AddNotaPage: React.FC = () => {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular, Montserrat: Montserrat_400Regular });

    // Estado para o formulário
    const [data_emissao, setDataEmissao] = useState(new Date().toISOString().split('T')[0]);
    const [prestador, setPrestador] = useState<Prestador>({ cnpj: '', inscricao_municipal: '', codigo_municipio: '' });
    const [tomador, setTomador] = useState<Tomador>({
        cnpj: '', razao_social: '', email: '',
        endereco: { logradouro: '', numero: '', complemento: '', bairro: '', codigo_municipio: '', uf: '', cep: '' }
    });
    const [servico, setServico] = useState<Servico>({
        aliquota: 0,
        discriminacao: '',
        iss_retido: false,
        item_lista_servico: '',
        codigo_tributario_municipio: '',
        valor_servicos: 0
    });
    
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string | number>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usuarioIdString = await AsyncStorage.getItem('usuario_id');
                if (!usuarioIdString) throw new Error("ID do usuário não encontrado.");
                const usuario_id = parseInt(usuarioIdString, 10);

                // Buscar perfil do usuário para dados do prestador
                const userProfile = await getUserProfile(usuario_id);
                setPrestador({
                    cnpj: userProfile.cnpj || '',
                    inscricao_municipal: '12345', // Placeholder
                    codigo_municipio: '3516200' // Placeholder
                });

                // Buscar clientes
                const clientList = await getClients(usuario_id);
                setClientes(clientList);

            } catch (error: any) {
                Alert.alert("Erro ao carregar dados", error.message);
            }
        };
        fetchData();
    }, []);

    // Atualiza os dados do tomador quando um cliente é selecionado
    useEffect(() => {
        if (selectedClientId) {
            const clienteSelecionado = clientes.find(c => c.id === selectedClientId);
            if (clienteSelecionado) {
                setTomador(prev => ({
                    ...prev,
                    cnpj: clienteSelecionado.cnpj || '',
                    razao_social: clienteSelecionado.nome,
                    email: clienteSelecionado.email || '',
                    // Aqui você pode expandir para preencher o endereço completo se estiver no objeto cliente
                    endereco: {
                        ...prev.endereco,
                        logradouro: clienteSelecionado.endereco || ''
                    }
                }));
            }
        }
    }, [selectedClientId, clientes]);

    const handleSalvarNota = async () => {
        try {
            const usuarioIdString = await AsyncStorage.getItem('usuario_id');
            if (!usuarioIdString) throw new Error("Usuário não autenticado.");
            
            const notaFiscalData = { data_emissao, prestador, tomador, servico };
            
            // await createInvoice(notaFiscalData);
            
            Alert.alert("Sucesso", "Nota Fiscal salva com sucesso!");
            router.push("/screens/notaFiscal");
        } catch (error: any) {
            Alert.alert("Erro ao salvar Nota Fiscal", error.message);
        }
    };
    
    if (!fontsLoaded) return null;

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <LinearGradient colors={["#5D9B9B", "#2A4D69"]} style={styles.container}>
                <Header />
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.subtitle}>
                        <AntDesign name="arrowleft" size={30} color="#F5F5F5" onPress={() => router.back()} />
                        <MaterialIcons name="folder" size={30} color="#fff" />
                        <Text style={styles.titleText}>Nova Nota Fiscal</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Cliente (Tomador)</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedClientId}
                                onValueChange={(itemValue) => setSelectedClientId(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Selecione um cliente..." value="" />
                                {clientes.map(cliente => (
                                    <Picker.Item key={cliente.id} label={cliente.nome} value={cliente.id} />
                                ))}
                            </Picker>
                        </View>
                        
                        {/* Dados do Tomador */}
                        <Text style={styles.sectionTitle}>Dados do Tomador</Text>
                        <TextInput style={styles.input} value={tomador.razao_social} onChangeText={text => setTomador(t => ({ ...t, razao_social: text }))} placeholder="Razão Social" />
                        <TextInput style={styles.input} value={tomador.cnpj} onChangeText={text => setTomador(t => ({ ...t, cnpj: text }))} placeholder="CNPJ do Tomador" keyboardType="numeric" />
                        <TextInput style={styles.input} value={tomador.email} onChangeText={text => setTomador(t => ({ ...t, email: text }))} placeholder="Email do Tomador" keyboardType="email-address"/>
                        <TextInput style={styles.input} value={tomador.endereco.logradouro} onChangeText={text => setTomador(t => ({ ...t, endereco: { ...t.endereco, logradouro: text } }))} placeholder="Logradouro" />
                        <TextInput style={styles.input} value={tomador.endereco.numero} onChangeText={text => setTomador(t => ({ ...t, endereco: { ...t.endereco, numero: text } }))} placeholder="Número" />

                        {/* Dados do Serviço */}
                        <Text style={styles.sectionTitle}>Dados do Serviço</Text>
                        <TextInput style={styles.input} value={String(servico.valor_servicos)} onChangeText={text => setServico(s => ({ ...s, valor_servicos: parseFloat(text) || 0 }))} placeholder="Valor dos Serviços" keyboardType="numeric" />
                        <TextInput style={[styles.input, {height: 80}]} value={servico.discriminacao} onChangeText={text => setServico(s => ({ ...s, discriminacao: text }))} placeholder="Discriminação do Serviço" multiline />
                        <TextInput style={styles.input} value={String(servico.aliquota)} onChangeText={text => setServico(s => ({ ...s, aliquota: parseFloat(text) || 0 }))} placeholder="Alíquota (%)" keyboardType="numeric" />
                        <TextInput style={styles.input} value={servico.item_lista_servico} onChangeText={text => setServico(s => ({ ...s, item_lista_servico: text }))} placeholder="Item da Lista de Serviço" />
                        <TextInput style={styles.input} value={servico.codigo_tributario_municipio} onChangeText={text => setServico(s => ({ ...s, codigo_tributario_municipio: text }))} placeholder="Código Tributário do Município" />
                        
                        <TouchableOpacity style={styles.button} onPress={handleSalvarNota}>
                            <Text style={styles.buttonText}>Salvar Nota</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <Nav />
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContainer: { flexGrow: 1, alignItems: 'center', paddingBottom: 100 },
    subtitle: {
        width: '90%',
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        gap: 10,
    },
    titleText: {
        fontSize: 25,
        color: "#F5F5F5",
        fontFamily: "BebasNeue",
    },
    inputContainer: {
        width: "90%",
        backgroundColor: "rgba(245, 245, 245, 0.09)",
        borderRadius: 10,
        padding: 20,
    },
    sectionTitle: {
        fontFamily: "BebasNeue",
        color: "#fff",
        fontSize: 22,
        marginTop: 15,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderColor: '#5D9B9B',
        paddingBottom: 5,
    },
    label: {
        color: "#F5F5F5",
        fontSize: 20,
        fontFamily: "BebasNeue",
        marginBottom: 5,
        marginTop: 10,
    },
    input: {
        backgroundColor: "rgba(42, 77, 105, 0.35)",
        borderRadius: 5,
        padding: 10,
        color: "#F5F5F5",
        fontSize: 16,
        marginBottom: 10,
        width: "100%",
        fontFamily: "Montserrat",
    },
    button: {
        backgroundColor: "#5D9B9B",
        borderRadius: 100,
        padding: 15,
        alignItems: "center",
        marginTop: 20,
    },
    buttonText: {
        fontFamily: "BebasNeue",
        fontSize: 20,
        color: "#fff",
    },
    pickerWrapper: {
        backgroundColor: 'rgba(42, 77, 105, 0.35)',
        borderRadius: 5,
        marginBottom: 10,
    },
    picker: {
        color: '#F5F5F5',
    }
});

export default AddNotaPage;