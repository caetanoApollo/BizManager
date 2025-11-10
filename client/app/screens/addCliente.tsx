/*
 * ARQUIVO: client/app/screens/addCliente.tsx (Corrigido)
 *
 * O que mudou:
 * 1. CORRIGIDO: A chamada da função `updateClient` agora passa (clientId, clientData)
 * (2 argumentos) como definido na api.ts.
 * 2. CORRIGIDO: A chamada da função `createClient` agora passa (clientData)
 * (1 argumento) como definido na api.ts.
 */
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
    ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons, AntDesign, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from "expo-router";
import { Header, Nav } from "../components/utils";
// As importações da api.ts estão corretas
import { createClient, updateClient, getClientById } from "../services/api"; 

const PALETTE = {
    LaranjaPrincipal: "#F5A623",
    VerdeAgua: "#5D9B9B",
    AzulEscuro: "#2A4D69",
    Branco: "#F5F5F5",
    CinzaClaro: "#ccc",
};

// Função de formatação de CNPJ/CPF
const formatCpfCnpj = (value: string) => {
    const cleanedValue = value.replace(/\D/g, "");
    let formatted = cleanedValue;

    if (cleanedValue.length <= 11) { // CPF
        formatted = cleanedValue;
        if (cleanedValue.length > 3) formatted = formatted.replace(/^(\d{3})(\d)/, "$1.$2");
        if (cleanedValue.length > 6) formatted = formatted.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
        if (cleanedValue.length > 9) formatted = formatted.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
        return formatted.slice(0, 14); 
    }

    if (cleanedValue.length > 11) { // CNPJ
        formatted = cleanedValue;
        if (cleanedValue.length > 2) formatted = formatted.replace(/^(\d{2})(\d)/, "$1.$2");
        if (cleanedValue.length > 5) formatted = formatted.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        if (cleanedValue.length > 8) formatted = formatted.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4");
        if (cleanedValue.length > 12) formatted = formatted.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
        return formatted.slice(0, 18); 
    }
    return formatted;
};

const formatCEP = (value: string) => {
    return value
        .replace(/\D/g, "")
        .replace(/^(\d{5})(\d)/, "$1-$2")
        .slice(0, 9);
};

const AddClientPage: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const clientId = params.clientId ? Number(params.clientId) : undefined;
    const isEditing = clientId !== undefined;

    // Dados principais
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [observacao, setObservacao] = useState("");

    // Novos campos (Tomador NF-e)
    const [cnpj, setCnpj] = useState("");
    const [logradouro, setLogradouro] = useState("");
    const [numero, setNumero] = useState("");
    const [complemento, setComplemento] = useState("");
    const [bairro, setBairro] = useState("");
    const [cep, setCep] = useState("");
    const [uf, setUf] = useState("");
    const [codMunicipio, setCodMunicipio] = useState("");

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular, Montserrat: Montserrat_400Regular });

    useEffect(() => {
        const fetchClientData = async () => {
            if (isEditing && clientId) {
                try {
                    const clientData = await getClientById(clientId);
                    setName(clientData.nome);
                    setEmail(clientData.email || "");
                    setPhone(clientData.telefone || "");
                    setObservacao(clientData.observacoes || "");
                    // Carrega novos dados
                    setCnpj(clientData.cnpj ? formatCpfCnpj(clientData.cnpj) : "");
                    setLogradouro(clientData.endereco_logradouro || "");
                    setNumero(clientData.endereco_numero || "");
                    setComplemento(clientData.endereco_complemento || "");
                    setBairro(clientData.endereco_bairro || "");
                    setCep(clientData.endereco_cep ? formatCEP(clientData.endereco_cep) : "");
                    setUf(clientData.endereco_uf || "");
                    setCodMunicipio(clientData.endereco_codigo_municipio || "");

                } catch (error) {
                    Alert.alert("Erro", "Não foi possível carregar os dados do cliente.");
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchClientData();
    }, [clientId, isEditing]);
    
    const handleSaveClient = async () => {
        if (!name.trim() || !phone.trim()) {
            Alert.alert("Erro", "Nome e Telefone são obrigatórios.");
            return;
        }
        setSaving(true);
        try {
            const usuarioIdString = await AsyncStorage.getItem('usuario_id');
            if (!usuarioIdString) throw new Error("ID do usuário não encontrado.");
            const usuarioId = Number(usuarioIdString);

            // Objeto completo com todos os dados do cliente
            const clientData = {
                usuario_id: usuarioId,
                nome: name,
                email,
                telefone: phone,
                observacoes: observacao,
                cnpj: cnpj.replace(/[^\d]/g, ''), // Salva CNPJ/CPF sem máscara
                endereco_logradouro: logradouro,
                endereco_numero: numero,
                endereco_complemento: complemento,
                endereco_bairro: bairro,
                endereco_cep: cep.replace(/[^\d]/g, ''), // Salva CEP sem máscara
                endereco_uf: uf,
                endereco_codigo_municipio: codMunicipio
            };

            // ===================================================================
            // CORREÇÃO APLICADA AQUI
            // ===================================================================

            if (isEditing && clientId) {
                // Chamada correta: (clientId, clientData)
                await updateClient(clientId, clientData);
                Alert.alert("Sucesso", "Cliente atualizado com sucesso!");
            } else {
                // Chamada correta: (clientData)
                await createClient(clientData);
                Alert.alert("Sucesso", "Cliente cadastrado com sucesso!");
            }
            router.back();
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Erro ao salvar cliente.");
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
                        <MaterialCommunityIcons name="account-group" size={30} color={PALETTE.Branco} />
                        <Text style={styles.title}>{isEditing ? "Editar Cliente" : "Novo Cliente"}</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={PALETTE.Branco} style={{ marginTop: 50 }} />
                    ) : (
                        <View style={styles.formContainer}>
                            <Text style={styles.sectionTitle}>Informações Principais</Text>
                            <View style={styles.inputGroup}>
                                <Feather name="user" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nome / Razão Social" placeholderTextColor={PALETTE.CinzaClaro} />
                            </View>
                            <View style={styles.inputGroup}>
                                <Feather name="hash" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                                <TextInput style={styles.input} value={cnpj} onChangeText={(text) => setCnpj(formatCpfCnpj(text))} placeholder="CPF / CNPJ (Opcional)" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="numeric" maxLength={18} />
                            </View>
                            <View style={styles.inputGroup}>
                                <Feather name="mail" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                                <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="E-mail (opcional)" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="email-address" />
                            </View>
                            <View style={styles.inputGroup}>
                                <Feather name="phone" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                                <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Telefone" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="phone-pad" />
                            </View>

                            <Text style={styles.sectionTitle}>Endereço (Opcional - para NF-e)</Text>
                            <View style={styles.inputGroup}>
                                <Feather name="map-pin" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                                <TextInput style={styles.input} value={logradouro} onChangeText={setLogradouro} placeholder="Logradouro (Rua, Av...)" placeholderTextColor={PALETTE.CinzaClaro} />
                            </View>
                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                    <Feather name="home" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                                    <TextInput style={styles.input} value={numero} onChangeText={setNumero} placeholder="Nº" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="numeric" />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Feather name="plus" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                                    <TextInput style={styles.input} value={complemento} onChangeText={setComplemento} placeholder="Complemento" placeholderTextColor={PALETTE.CinzaClaro} />
                                </View>
                            </View>
                             <View style={styles.inputGroup}>
                                <Feather name="layers" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                                <TextInput style={styles.input} value={bairro} onChangeText={setBairro} placeholder="Bairro" placeholderTextColor={PALETTE.CinzaClaro} />
                            </View>
                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 2, marginRight: 10 }]}>
                                    <Feather name="send" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                                    <TextInput style={styles.input} value={cep} onChangeText={(text) => setCep(formatCEP(text))} placeholder="CEP" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="numeric" maxLength={9} />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Feather name="map" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                                    <TextInput style={styles.input} value={uf} onChangeText={(text) => setUf(text.toUpperCase())} placeholder="UF" placeholderTextColor={PALETTE.CinzaClaro} maxLength={2} autoCapitalize="characters" />
                                </View>
                            </View>
                             <View style={styles.inputGroup}>
                                <Feather name="map" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                                <TextInput style={styles.input} value={codMunicipio} onChangeText={setCodMunicipio} placeholder="Cód. Município (IBGE)" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="numeric" />
                            </View>


                            <Text style={styles.sectionTitle}>Informações Adicionais</Text>
                            <View style={[styles.inputGroup, { alignItems: 'flex-start' }]}>
                                <Feather name="file-text" size={20} color={PALETTE.CinzaClaro} style={[styles.icon, { paddingTop: 15 }]} />
                                <TextInput style={[styles.input, { height: 100, textAlignVertical: "top" }]} value={observacao} onChangeText={setObservacao} placeholder="Observações (opcional)" placeholderTextColor={PALETTE.CinzaClaro} multiline />
                            </View>

                            <TouchableOpacity style={styles.button} onPress={handleSaveClient} disabled={saving}>
                                {saving ? (
                                    <ActivityIndicator color={PALETTE.Branco} />
                                ) : (
                                    <>
                                        <Feather name="check-circle" size={20} color={PALETTE.Branco} />
                                        <Text style={styles.buttonText}>{isEditing ? "Atualizar Cliente" : "Salvar Cliente"}</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
            <Nav style={styles.nav} />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center" },
    scrollContainer: { flexGrow: 1, paddingBottom: 120 },
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
        marginTop: 10, // Adicionado para separar seções
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
        minHeight: 55, // Garante altura mínima
    },
    icon: { paddingHorizontal: 15 },
    input: {
        flex: 1,
        paddingVertical: 15,
        paddingRight: 15,
        color: PALETTE.Branco,
        fontSize: 16,
        fontFamily: "Montserrat_400Regular",
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    alignTop: {
        alignItems: 'flex-start'
    },
    button: {
        flexDirection: "row",
        backgroundColor: PALETTE.VerdeAgua,
        borderRadius: 30,
        padding: 15,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    buttonText: {
        color: PALETTE.Branco,
        fontSize: 20,
        fontFamily: "BebasNeue_400Regular",
        marginLeft: 10,
    },
    nav: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center'
    }
});

export default AddClientPage;