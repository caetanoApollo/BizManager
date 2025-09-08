import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { getClientById } from "../services/api";
import { AntDesign, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { Header, Nav } from "../components/utils";
import { useFonts, Montserrat_400Regular } from "@expo-google-fonts/montserrat";
import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";

const PALETTE = {
    AzulEscuro: "#2A4D69",
    VerdeAgua: "#5D9B9B",
    Branco: "#F5F5F5",
    LaranjaPrincipal: "#F5A623",
    CinzaClaro: "rgba(255, 255, 255, 0.8)",
};

interface Client {
    nome: string;
    email: string;
    telefone: string;
    observacoes: string;
    data_cadastro: string;
}

const ClienteDetalhes: React.FC = () => {
    const router = useRouter();
    const { clientId } = useLocalSearchParams();

    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [fontsLoaded] = useFonts({ Montserrat_400Regular, BebasNeue_400Regular });

    useEffect(() => {
        const fetchClient = async () => {
            if (!clientId) {
                Alert.alert("Erro", "ID do cliente ausente.");
                setLoading(false);
                return;
            }
            try {
                const data = await getClientById(Number(clientId));
                setClient(data);
            } catch (err) {
                Alert.alert("Erro", "Não foi possível carregar os dados do cliente.");
            } finally {
                setLoading(false);
            }
        };
        fetchClient();
    }, [clientId]);
    
    const InfoRow = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
        <View style={styles.infoRow}>
            <Feather name={icon} size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
            <View>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value || 'Não informado'}</Text>
            </View>
        </View>
    );

    if (loading || !fontsLoaded) {
        return (
            <LinearGradient colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]} style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={PALETTE.Branco} />
            </LinearGradient>
        );
    }

    if (!client) {
        return (
            <LinearGradient colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]} style={styles.container}>
                 <Header />
                <View style={styles.headerSection}>
                    <AntDesign name="arrowleft" size={30} color={PALETTE.Branco} onPress={() => router.back()} />
                    <MaterialCommunityIcons name="account-alert-outline" size={30} color={PALETTE.Branco} />
                    <Text style={styles.title}>Erro</Text>
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={styles.errorText}>Cliente não encontrado.</Text>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]} style={styles.container}>
            <Header />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.headerSection}>
                    <AntDesign name="arrowleft" size={30} color={PALETTE.Branco} onPress={() => router.back()} />
                    <MaterialCommunityIcons name="account-details" size={30} color={PALETTE.Branco} />
                    <Text style={styles.title}>Detalhes do Cliente</Text>
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.clientName}>{client.nome}</Text>
                    
                    <InfoRow icon="phone" label="Telefone" value={client.telefone} />
                    <InfoRow icon="mail" label="Email" value={client.email} />
                    <InfoRow icon="calendar" label="Cliente Desde" value={new Date(client.data_cadastro).toLocaleDateString('pt-BR')} />
                    
                    <Text style={styles.notesTitle}>Observações</Text>
                    <Text style={styles.notesValue}>{client.observacoes || 'Nenhuma observação cadastrada.'}</Text>
                </View>

                <TouchableOpacity 
                    style={styles.editButton} 
                    onPress={() => router.push({ pathname: '/screens/addCliente', params: { clientId } })}
                >
                    <Feather name="edit" size={20} color={PALETTE.Branco} />
                    <Text style={styles.editButtonText}>Editar Cliente</Text>
                </TouchableOpacity>

            </ScrollView>
            <Nav style={styles.nav} />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    detailsContainer: {
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        padding: 20,
        marginHorizontal: 20,
        borderRadius: 16,
    },
    clientName: {
        fontFamily: 'BebasNeue_400Regular',
        fontSize: 32,
        color: PALETTE.Branco,
        textAlign: 'center',
        marginBottom: 25,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    icon: {
        marginRight: 15,
        marginTop: 2,
    },
    label: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 12,
        color: PALETTE.CinzaClaro,
        textTransform: 'uppercase',
    },
    value: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: PALETTE.Branco,
    },
    notesTitle: {
        fontFamily: 'BebasNeue_400Regular',
        fontSize: 20,
        color: PALETTE.Branco,
        marginTop: 10,
        marginBottom: 5,
    },
    notesValue: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 15,
        color: PALETTE.CinzaClaro,
        lineHeight: 22,
    },
    editButton: {
        flexDirection: "row",
        backgroundColor: PALETTE.LaranjaPrincipal,
        borderRadius: 30,
        padding: 15,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        marginHorizontal: 20,
    },
    editButtonText: {
        color: PALETTE.Branco,
        fontSize: 20,
        fontFamily: "BebasNeue_400Regular",
        marginLeft: 10,
    },
    errorText: {
        fontSize: 18,
        color: PALETTE.Branco,
        textAlign: "center"
    },
    nav: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center'
    }
});

export default ClienteDetalhes;