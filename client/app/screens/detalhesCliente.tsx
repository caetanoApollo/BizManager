import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { getClientById } from "../services/api";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { Header, Nav } from "../components/utils";
import { useFonts, Montserrat_400Regular } from "@expo-google-fonts/montserrat";

const ClienteDetalhes: React.FC = () => {
    const router = useRouter();
    const { clientId } = useLocalSearchParams();

    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [fontsLoaded] = useFonts({ Montserrat: Montserrat_400Regular });

    useEffect(() => {
        async function prepare() {
            if (fontsLoaded) {
            }
        }
        prepare();
    }, [fontsLoaded]);

    useEffect(() => {
        const fetchClient = async () => {
            try {
                if (!clientId) {
                    Alert.alert("Erro", "ID do cliente ausente.");
                    setLoading(false);
                    return;
                }
                const id = Number(clientId);
                if (id) {
                    const data = await getClientById(id);
                    setClient(data);
                }
            } catch (err) {
                console.error("Erro ao buscar cliente:", err);
                Alert.alert("Erro", "Não foi possível carregar os dados do cliente.");
            } finally {
                setLoading(false);
            }
        };
        fetchClient();
    }, [clientId]);

    if (loading || !fontsLoaded) {
        return (
            <ActivityIndicator
                size="large"
                color="#fff"
                style={{ flex: 1, justifyContent: "center", backgroundColor: "#2A4D69" }}
            />
        );
    }

    if (!client) {
        return (
            <View style={[styles.container, { justifyContent: "center" }]}>
                <Text style={styles.error}>Cliente não encontrado.</Text>
            </View>
        );
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
                        <MaterialCommunityIcons name="account-group" size={30} color="#fff" />
                        <Text style={{ fontSize: 25, color: "#F5F5F5", fontFamily: "BebasNeue" }}>CLIENTES</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.boxTitle}>
                            <MaterialCommunityIcons
                                name={"account-details"}
                                size={30}
                                color="#F5F5F5"
                                style={{ marginRight: 10 }}
                            />
                            <Text style={styles.sectionTitle}>DETALHES DO CLIENTE</Text>
                        </View>

                        <Text style={styles.label}>Nome:</Text>
                        <Text style={styles.value}>{client.nome}</Text>

                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.value}>{client.email || "Não informado"}</Text>

                        <Text style={styles.label}>Telefone:</Text>
                        <Text style={styles.value}>{client.telefone}</Text>

                        <Text style={styles.label}>Observações:</Text>
                        <Text style={styles.value}>{client.observacoes || "Nenhuma"}</Text>

                        <Text style={styles.label}>Data de Cadastro:</Text>
                        <Text style={styles.value}>
                            {client.data_cadastro ? new Date(client.data_cadastro).toLocaleDateString() : "—"}
                        </Text>
                    </View>
                    <Nav style={styles.nav} />
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
    nav: {
        bottom: 30,
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
    label: {
        color: "#F5F5F5",
        fontSize: 25,
        fontFamily: "BebasNeue",
        marginBottom: 5,
        marginTop: 10,
    },
    value: {
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
    error: {
        fontSize: 20,
        color: "red",
        textAlign: "center"
    }
});

export default ClienteDetalhes;