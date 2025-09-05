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
    ActivityIndicator, // Adicionado para indicar carregamento
} from "react-native";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from "expo-router";
import { Header, Nav } from "../components/utils";
import { createClient, updateClient, getClientById } from "../services/api"; // Importa getClientById

const AddClientPage: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const clientId = params.clientId ? Number(params.clientId) : undefined;
    const isEditing = clientId !== undefined;

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [observacao, setobservacao] = useState("");
    const [loading, setLoading] = useState(true); // Novo estado de carregamento
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

    useEffect(() => {
        const fetchClientData = async () => {
            if (isEditing && clientId) {
                try {
                    const clientData = await getClientById(clientId);
                    setName(clientData.nome);
                    setEmail(clientData.email);
                    setPhone(clientData.telefone);
                    setobservacao(clientData.observacao);
                } catch (error) {
                    Alert.alert("Erro", "Não foi possível carregar os dados do cliente.");
                    console.error("Erro ao carregar cliente:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchClientData();
    }, [clientId, isEditing]);

    if (!fontsLoaded || loading) {
        return <ActivityIndicator size="large" color="#fff" style={{ flex: 1, justifyContent: "center", backgroundColor: "#2A4D69" }} />;
    }

    const handleSaveClient = async () => {
        if (!name.trim() || !phone.trim()) {
            Alert.alert("Erro", "Nome e Telefone são obrigatórios.");
            return;
        }

        try {
            const usuarioIdString = await AsyncStorage.getItem('usuario_id');
            const usuarioId = usuarioIdString ? Number(usuarioIdString) : undefined;
            if (!usuarioId) {
                Alert.alert("Erro", "ID do usuário não encontrado.");
                return;
            }
            if (isEditing && clientId) {
                await updateClient(clientId, usuarioId, name, email, phone, observacao);
                Alert.alert("Sucesso", "Cliente atualizado com sucesso!");
            } else {
                await createClient(usuarioId, name, email, phone, observacao);
                Alert.alert("Sucesso", "Cliente cadastrado com sucesso!");
            }
            router.push("/screens/clientes");
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Erro ao salvar cliente.");
        }
    };

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
                        <MaterialCommunityIcons name="account-group" size={30} color="#fff" />
                        <Text style={{ fontSize: 25, color: "#F5F5F5", fontFamily: "BebasNeue" }}>CLIENTES</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.boxTitle}>
                            <MaterialCommunityIcons
                                name={isEditing ? "account-edit" : "account-plus"}
                                size={30}
                                color="#F5F5F5"
                                style={{ marginRight: 10 }}
                            />
                            <Text style={styles.sectionTitle}>{isEditing ? "EDITAR CLIENTE" : "NOVO CLIENTE"}</Text>
                        </View>

                        <Text style={styles.label}>Nome:</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Nome do cliente"
                            placeholderTextColor="#ccc"
                        />

                        <Text style={styles.label}>Email:</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email do cliente (opcional)"
                            placeholderTextColor="#ccc"
                            keyboardType="email-address"
                        />

                        <Text style={styles.label}>Telefone:</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Telefone do cliente"
                            placeholderTextColor="#ccc"
                            keyboardType="phone-pad"
                        />

                        <Text style={styles.label}>Observações:</Text>
                        <TextInput
                            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
                            value={observacao}
                            onChangeText={setobservacao}
                            placeholder="Observações (opcional)"
                            placeholderTextColor="#ccc"
                            multiline
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSaveClient}
                    >
                        <Text style={styles.buttonText}>{isEditing ? "ATUALIZAR CLIENTE" : "SALVAR CLIENTE"}</Text>
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
        marginRight: "55%",
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

export default AddClientPage;