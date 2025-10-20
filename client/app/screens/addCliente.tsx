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
import { createClient, updateClient, getClientById } from "../services/api";

const PALETTE = {
    LaranjaPrincipal: "#F5A623",
    VerdeAgua: "#5D9B9B",
    AzulEscuro: "#2A4D69",
    Branco: "#F5F5F5",
    CinzaClaro: "#ccc",
};

const AddClientPage: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const clientId = params.clientId ? Number(params.clientId) : undefined;
    const isEditing = clientId !== undefined;

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [observacao, setObservacao] = useState("");
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular, Montserrat: Montserrat_400Regular });

    useEffect(() => {
        const fetchClientData = async () => {
            if (isEditing && clientId) {
                try {
                    const clientData = await getClientById(clientId);
                    setName(clientData.nome);
                    setEmail(clientData.email);
                    setPhone(clientData.telefone);
                    setObservacao(clientData.observacoes);
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

            const clientData = {
                usuario_id: usuarioId,
                nome: name,
                email,
                telefone: phone,
                observacoes: observacao
            };

            if (isEditing && clientId) {
                await updateClient(
                    clientId,
                    clientData.usuario_id, 
                    clientData.nome,
                    clientData.email,
                    clientData.telefone,
                    clientData.observacoes
                );
                Alert.alert("Sucesso", "Cliente atualizado com sucesso!");
            } else {
                await createClient(
                    clientData.usuario_id,
                    clientData.nome,
                    clientData.email,
                    clientData.telefone,
                    clientData.observacoes
                );
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
                                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nome do cliente" placeholderTextColor={PALETTE.CinzaClaro} />
                            </View>
                            <View style={styles.inputGroup}>
                                <Feather name="mail" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                                <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="E-mail (opcional)" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="email-address" />
                            </View>
                            <View style={styles.inputGroup}>
                                <Feather name="phone" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                                <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Telefone" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="phone-pad" />
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
    icon: { paddingHorizontal: 15 },
    input: {
        flex: 1,
        paddingVertical: 15,
        paddingRight: 15,
        color: PALETTE.Branco,
        fontSize: 16,
        fontFamily: "Montserrat_400Regular",
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