import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { useFocusEffect, useRouter } from "expo-router";
import { Nav, Header } from "../components/utils";
import { getTransactionsByUserId, getScheduledServices } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- Paleta de Cores Otimizada ---
// Cores ajustadas para maior vibração e legibilidade
const PALETTE = {
    AzulEscuro: "#2A4D69",
    VerdeAgua: "#5D9B9B",
    Branco: "#F5F5F5",
    VerdeSucesso: "#28a745", // Verde mais vivo para faturamento
    LaranjaClaro: "#FD8D14", // Laranja mais claro para despesas
    CinzaClaro: "rgba(255, 255, 255, 0.8)", // Aumentado a opacidade para melhor leitura
};

// --- Interfaces ---
interface Transaction {
    valor: number;
    data: string;
    tipo: "Entrada" | "Saída";
}

interface Evento {
    id: string;
    titulo: string;
    horario: string;
    data: string;
}

const Dashboard = () => {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular });
    const [faturamento, setFaturamento] = useState(0);
    const [despesas, setDespesas] = useState(0);
    const [proximosEventos, setProximosEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("");

    // --- Funções Auxiliares ---
    const formatCurrencyBRL = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    // Nova função para formatar a data dos eventos da agenda
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        // Formata para DD/MM
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
        });
    };

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const name = await AsyncStorage.getItem("user_name");
                    setUserName(name || "Usuário");

                    const userIdString = await AsyncStorage.getItem("usuario_id");
                    if (!userIdString) throw new Error("ID do usuário não encontrado.");

                    const userId = Number(userIdString);

                    const [transactions, eventos] = await Promise.all([
                        getTransactionsByUserId(userId),
                        getScheduledServices(),
                    ]);

                    // Processamento Financeiro
                    const today = new Date();
                    const currentMonth = today.getMonth();
                    const currentYear = today.getFullYear();
                    let totalFaturamento = 0;
                    let totalDespesas = 0;

                    transactions.forEach((transacao: Transaction) => {
                        const tDate = new Date(transacao.data);
                        if (
                            tDate.getMonth() === currentMonth &&
                            tDate.getFullYear() === currentYear
                        ) {
                            const valor = Number(transacao.valor);
                            if (transacao.tipo === "Entrada") totalFaturamento += valor;
                            else totalDespesas += valor;
                        }
                    });

                    setFaturamento(totalFaturamento);
                    setDespesas(totalDespesas);

                    // Processamento da Agenda
                    const sortedEventos = eventos
                        .map((e: Evento) => ({
                            ...e,
                            fullDate: new Date(`${e.data.split("T")[0]}T${e.horario}`),
                        }))
                        .filter((e: any) => e.fullDate >= today)
                        .sort((a: any, b: any) => a.fullDate - b.fullDate);

                    setProximosEventos(sortedEventos.slice(0, 3)); // Exibindo até 3 eventos
                } catch (error) {
                    console.error("Erro ao buscar dados do dashboard:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
            return () => { };
        }, [])
    );

    if (!fontsLoaded || loading) {
        return (
            <LinearGradient
                colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]}
                style={styles.loaderContainer}
            >
                <ActivityIndicator size="large" color={PALETTE.Branco} />
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]}
            style={styles.container}
        >
            <Header />
            {/* O ScrollView agora tem mais espaçamento interno para um layout mais limpo */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.welcomeTitle}>Olá, {userName}!</Text>
                <Text style={styles.welcomeSubtitle}>
                    Aqui está um resumo do seu negócio.
                </Text>

                {/* Card Financeiro - Agora ocupa a largura total para mais destaque */}
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => router.push("/screens/financeiro")}
                >
                    <Text style={styles.cardTitle}>
                        <Feather name="dollar-sign" size={22} color={PALETTE.Branco} />{" "}
                        Financeiro
                    </Text>
                    <View style={styles.financeRow}>
                        <View style={styles.financeItem}>
                            <Text style={styles.financeLabel}>Faturamento (Mês)</Text>
                            {/* Cor de Faturamento atualizada para VerdeSucesso */}
                            <Text
                                style={[styles.financeValue, { color: PALETTE.VerdeSucesso }]}
                            >
                                {formatCurrencyBRL(faturamento)}
                            </Text>
                        </View>
                        <View style={styles.financeItem}>
                            <Text style={styles.financeLabel}>Despesas (Mês)</Text>
                            {/* Cor de Despesas atualizada para LaranjaClaro */}
                            <Text
                                style={[styles.financeValue, { color: PALETTE.LaranjaClaro }]}
                            >
                                {formatCurrencyBRL(despesas)}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Card da Agenda - Também ocupa a largura total */}
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => router.push("/screens/agenda")}
                >
                    <Text style={styles.cardTitle}>
                        <Feather name="calendar" size={22} color={PALETTE.Branco} />{" "}
                        Agenda
                    </Text>
                    {proximosEventos.length > 0 ? (
                        proximosEventos.map((evento) => (
                            <View key={evento.id} style={styles.eventoItem}>
                                <Text style={styles.eventoTitulo} numberOfLines={1}>
                                    {evento.titulo}
                                </Text>
                                {/* Data e Hora agora são exibidas juntas para mais contexto */}
                                <Text style={styles.eventoDataHora}>
                                    {formatDate(evento.data)} às {evento.horario.substring(0, 5)}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noEventText}>Nenhum compromisso futuro.</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.card}
                    onPress={() => router.push("/screens/notaFiscal")}
                >
                    <Text style={styles.cardTitle}>
                        <Feather name="file-text" size={22} color={PALETTE.Branco} /> Notas
                        Fiscais
                    </Text>
                    <Text style={styles.cardDescription}>
                        Acesse e gerencie suas notas fiscais emitidas.
                    </Text>
                </TouchableOpacity>
            </ScrollView>
            <Nav style={{ marginLeft: 20, marginBottom: 20 }} />
        </LinearGradient>
    );
};

// --- Folha de Estilos Reestruturada ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    // Mais padding para um visual mais 'arejado'
    scrollContainer: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        paddingBottom: 120,
    },
    welcomeTitle: {
        fontSize: 36,
        fontFamily: "BebasNeue",
        color: PALETTE.Branco,
        marginBottom: 4,
    },
    welcomeSubtitle: {
        fontSize: 18,
        color: PALETTE.CinzaClaro,
        marginBottom: 24,
    },
    // Estilo de card principal, agora maior e mais espaçoso
    card: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        padding: 24, // Mais padding interno
        borderRadius: 20, // Bordas mais arredondadas
        marginBottom: 20, // Espaçamento entre os cards
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 24,
        fontFamily: "BebasNeue",
        color: PALETTE.Branco,
        marginBottom: 20,
        flexDirection: "row",
        alignItems: "center",
    },
    cardDescription: { fontSize: 15, color: PALETTE.CinzaClaro },
    // Estilos para o card financeiro
    financeRow: { flexDirection: "row", justifyContent: "space-around" },
    financeItem: { alignItems: "center" },
    financeLabel: { fontSize: 14, color: PALETTE.CinzaClaro, marginBottom: 4 },
    financeValue: { fontSize: 26, fontFamily: "BebasNeue" },
    // Estilos para o card da agenda
    eventoItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.2)",
        paddingVertical: 12,
    },
    eventoTitulo: {
        fontSize: 16,
        color: PALETTE.Branco,
        flex: 1,
        marginRight: 8,
    },
    eventoDataHora: { fontSize: 15, color: PALETTE.CinzaClaro }, // Novo estilo para data e hora
    noEventText: {
        color: PALETTE.CinzaClaro,
        fontStyle: "italic",
        marginTop: 10,
        fontSize: 15,
    },
});

export default Dashboard;
