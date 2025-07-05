import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, AntDesign, FontAwesome } from "@expo/vector-icons";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import * as SplashScreen from "expo-splash-screen";
import { useRouter, useFocusEffect } from "expo-router";
import { Nav, addButton, Header } from "../components/utils";
import { getClients, deleteClient } from "../services/api";

interface Client {
    id: number;
    usuario_id: number;
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
    data_cadastro: string;
}

const ClientsScreen: React.FC = () => {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular }); 

    const fetchClients = useCallback(async () => { 
        const userId = 1; // TODO: Obtenha o ID do usuário logado de forma segura
        try {
            const fetchedClients = await getClients(userId);
            setClients(fetchedClients);
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Não foi possível carregar os clientes.");
        }
    }, []);

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

    useFocusEffect( // Hook 5
        useCallback(() => {
            fetchClients();
        }, [fetchClients])
    );

    const handleEditClient = (client: Client) => {
        router.push({
            pathname: "/screens/addCliente",
            params: { clientId: client.id, clientName: client.nome, clientEmail: client.email, clientPhone: client.telefone, clientAddress: client.endereco },
        });
    };

    const handleDeleteClient = async (clientId: number) => {
        Alert.alert(
            "Confirmar Exclusão",
            "Tem certeza que deseja excluir este cliente?",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Excluir",
                    onPress: async () => {
                        const userId = 1; // TODO: Obtenha o ID do usuário logado de forma segura
                        try {
                            await deleteClient(clientId, userId);
                            Alert.alert("Sucesso", "Cliente excluído com sucesso!");
                            fetchClients();
                        } catch (error: any) {
                            Alert.alert("Erro", error.message || "Erro ao excluir cliente.");
                        }
                    },
                },
            ]
        );
    };

    if (!fontsLoaded) {
        return null; 
    }

    return (
        <LinearGradient colors={["#2A4D69", "#5D9B9B"]} style={styles.container}>
            <View style={styles.container}>
                <Header />

                <View style={styles.section}>
                    <MaterialCommunityIcons name="account-group" size={30} color="#fff" />
                    <Text style={styles.sectionTitle}>CLIENTES</Text>
                </View>

                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableHeaderText}>Nome</Text>
                        <Text style={styles.tableHeaderText}>Contato</Text>
                        <Text style={styles.tableHeaderText}>Ações</Text>
                    </View>
                    <FlatList
                        data={clients}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.tableRow}>
                                <Text style={styles.tableCell}>{item.nome}</Text>
                                <Text style={styles.tableCell}>{item.telefone}</Text>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity onPress={() => handleEditClient(item)}>
                                        <FontAwesome name="edit" size={20} color="#F5A623" style={styles.actionIcon} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDeleteClient(item.id)}>
                                        <FontAwesome name="trash" size={20} color="#FF6347" style={styles.actionIcon} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={() => (
                            <Text style={styles.emptyListText}>Nenhum cliente cadastrado.</Text>
                        )}
                    />
                </View>

                {addButton({ activeRoute: "/screens/addCliente" })}

                <Nav style={{ marginTop: 125 }} />
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
    },
    section: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 20,
        marginRight: 200,
        width: "80%",
        justifyContent: "flex-start",
        marginBottom: 20,
    },
    sectionTitle: {
        fontFamily: "BebasNeue",
        paddingLeft: 10,
        color: "#fff",
        fontSize: 35,
    },
    tableContainer: {
        width: 320,
        height: 430,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 8, height: 5 },
    },
    tableHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#fff",
        paddingBottom: 5,
    },
    tableHeaderText: {
        fontFamily: "BebasNeue",
        fontSize: 25,
        fontWeight: "bold",
        color: "#fff",
        flex: 1,
        textAlign: "center",
    },
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(255, 255, 255, 0.3)",
    },
    tableCell: {
        fontFamily: "BebasNeue",
        fontSize: 20,
        color: "#fff",
        flex: 1,
        textAlign: "center",
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flex: 1,
    },
    actionIcon: {
        paddingHorizontal: 5,
    },
    emptyListText: {
        fontFamily: "BebasNeue",
        fontSize: 20,
        color: "#F5F5F5",
        textAlign: "center",
        marginTop: 20,
    },
});

export default ClientsScreen;