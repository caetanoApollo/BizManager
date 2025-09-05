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
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    observacao: string;
    data_cadastro: string;
}

const ClientsScreen: React.FC = () => {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular });

    const fetchClients = useCallback(async () => {
        try {
            const userIdString = await AsyncStorage.getItem('usuario_id');
            if (userIdString) {
                const userId = Number(userIdString);
                const fetchedClients = await getClients(userId);
                setClients(fetchedClients);
            } else {
                // Lidar com o caso onde o ID do usuário não é encontrado
                Alert.alert("Erro", "ID do usuário não encontrado. Faça o login novamente.");
            }
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

    useFocusEffect( 
        useCallback(() => {
            fetchClients();
        }, [fetchClients])
    );

    const handleViewClient = (client: Client) => {
        router.push({
            pathname: "/screens/detalhesCliente",
            params: { clientId: client.id }
        });
    };

    const handleEditClient = (client: Client) => {
        router.push({
            pathname: "/screens/addCliente",
            params: { clientId: client.id },
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
                        const userIdString = await AsyncStorage.getItem('usuario_id');
                        const userId = userIdString ? Number(userIdString) : null;

                        if (userId === null) {
                            Alert.alert("Erro", "ID do usuário não encontrado.");
                            return;
                        }

                        try {
                            // A sua função de API para deletar já está pronta para receber o ID do cliente e o ID do usuário
                            await deleteClient(clientId, userId);
                            Alert.alert("Sucesso", "Cliente excluído com sucesso!");
                            fetchClients(); // Atualiza a lista após a exclusão
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
                            <TouchableOpacity
                                onPress={() => router.push({ pathname: '/screens/detalhesCliente', params: { clientId: item.id } })}
                            >
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableCell}>{item.nome}</Text>
                                    <Text style={styles.tableCell}>{item.telefone}</Text>
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity onPress={() => handleEditClient(item)}>
                                            <FontAwesome
                                                name="edit"
                                                size={20}
                                                color="#F5A623"
                                                style={styles.actionIcon}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteClient(item.id)}>
                                            <FontAwesome
                                                name="trash"
                                                size={20}
                                                color="#FF6347"
                                                style={styles.actionIcon}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
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
        width: 370,
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