import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { useRouter, useFocusEffect } from "expo-router";
import { Nav, Header } from "../components/utils";
import { getClients, deleteClient } from "../services/api";

const PALETTE = {
    AzulEscuro: "#2A4D69",
    VerdeAgua: "#5D9B9B",
    Branco: "#F5F5F5",
    LaranjaPrincipal: "#F5A623",
    VermelhoErro: "#e74c3c",
    CinzaClaro: "rgba(255, 255, 255, 0.8)",
    FundoCard: "rgba(255, 255, 255, 0.1)",
};

interface Client {
    id: number;
    nome: string;
    email: string;
    telefone: string;
}

const ClientsScreen: React.FC = () => {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular, Montserrat: Montserrat_400Regular });

    const fetchClients = useCallback(async () => {
        setLoading(true);
        try {
            const userIdString = await AsyncStorage.getItem('usuario_id');
            if (!userIdString) throw new Error("ID do usuário não encontrado.");
            const usuario_id = Number(userIdString);
            const fetchedClients = await getClients(usuario_id);
            setClients(fetchedClients);
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Não foi possível carregar os clientes.");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        fetchClients();
    }, [fetchClients]));

    const handleDeleteClient = async (clientId: number) => {
        Alert.alert(
            "Confirmar Exclusão",
            "Tem certeza que deseja excluir este cliente?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    onPress: async () => {
                        try {
                            const userIdString = await AsyncStorage.getItem('usuario_id');
                            if (!userIdString) throw new Error("ID do usuário não encontrado.");
                            await deleteClient(clientId, Number(userIdString));
                            Alert.alert("Sucesso", "Cliente excluído com sucesso!");
                            fetchClients();
                        } catch (error: any) {
                            Alert.alert("Erro", error.message || "Erro ao excluir cliente.");
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: Client }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/screens/detalhesCliente', params: { clientId: item.id } })}
        >
            <View style={styles.cardIcon}>
                <Feather name="user" size={24} color={PALETTE.VerdeAgua} />
            </View>
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.nome}</Text>
                <Text style={styles.cardSubtitle}>{item.telefone}</Text>
            </View>
            <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => router.push({ pathname: '/screens/addCliente', params: { clientId: item.id } })}>
                    <Ionicons name="pencil-outline" size={22} color={PALETTE.CinzaClaro} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteClient(item.id)} style={{ marginLeft: 15 }}>
                    <Ionicons name="trash-outline" size={22} color={PALETTE.VermelhoErro} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    if (!fontsLoaded) {
        return null;
    }

    return (
        <LinearGradient colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]} style={styles.container}>
            <Header />
            <View style={styles.headerSection}>
                <MaterialCommunityIcons name="account-group" size={30} color={PALETTE.Branco} />
                <Text style={styles.sectionTitle}>Clientes</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={PALETTE.Branco} style={{ flex: 1 }} />
            ) : (
                <FlatList
                    data={clients}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingTop: 10, paddingBottom: 180 }}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Nenhum cliente cadastrado.</Text>
                        </View>
                    )}
                />
            )}
            
            <TouchableOpacity style={styles.addButton} onPress={() => router.push('/screens/addCliente')}>
                <MaterialIcons name="add" size={30} color={PALETTE.Branco} />
            </TouchableOpacity>

            <Nav style={styles.navBar} />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerSection: {
        width: '90%',
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 10,
        paddingBottom: 15,
        alignSelf: 'center',
    },
    sectionTitle: {
        fontFamily: "BebasNeue_400Regular",
        color: PALETTE.Branco,
        marginLeft: 10,
        fontSize: 35,
    },
    card: {
        backgroundColor: PALETTE.FundoCard,
        borderRadius: 12,
        padding: 15,
        marginHorizontal: '5%',
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardIcon: {
        marginRight: 15,
        backgroundColor: 'rgba(93, 155, 155, 0.2)',
        padding: 10,
        borderRadius: 50,
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        color: PALETTE.Branco,
        fontSize: 16,
        fontFamily: "Montserrat_400Regular",
        fontWeight: 'bold',
    },
    cardSubtitle: {
        color: PALETTE.CinzaClaro,
        fontSize: 14,
        fontFamily: "Montserrat_400Regular",
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emptyContainer: {
        marginTop: 50,
        alignItems: "center",
    },
    emptyText: {
        fontFamily: "Montserrat_400Regular",
        fontSize: 16,
        color: PALETTE.CinzaClaro,
    },
    addButton: {
        position: "absolute",
        bottom: 80,
        right: 20,
        backgroundColor: "#FFA500",
        borderRadius: 16,
        width: 56,
        height: 56,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    navBar: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
    },
});

export default ClientsScreen;