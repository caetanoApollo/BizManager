import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import {
    MaterialIcons,
    MaterialCommunityIcons,
    FontAwesome6,
    Feather,
    Ionicons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { Nav, Header } from "../components/utils";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTransactionsByUserId, deleteTransaction } from "../services/api";


const PALETTE = {
    AzulEscuro: "#2A4D69",
    VerdeAgua: "#5D9B9B",
    Branco: "#F5F5F5",
    VerdeSucesso: "#2ecc71",
    LaranjaAlerta: "#f39c12",
    VermelhoErro: "#e74c3c",
    CinzaClaro: "rgba(255, 255, 255, 0.8)",
    FundoCard: "rgba(255, 255, 255, 0.1)",
};

interface Transaction {
    id: number;
    usuario_id: number;
    titulo: string;
    valor: number;
    data: string;
    tipo: 'Entrada' | 'Saída';
    categoria?: string;
}

const FinanceScreen = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [caixa, setCaixa] = useState(0);
    const [faturamento, setFaturamento] = useState(0);
    const [despesas, setDespesas] = useState(0);
    const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular, Montserrat: Montserrat_400Regular });

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const userIdString = await AsyncStorage.getItem('usuario_id');
            if (!userIdString) throw new Error("Usuário não encontrado");
            const usuario_id = Number(userIdString);
            const fetchedTransactions = await getTransactionsByUserId(usuario_id);
            const sortedTransactions = fetchedTransactions.sort((a: Transaction, b: Transaction) => new Date(b.data).getTime() - new Date(a.data).getTime());
            setTransactions(sortedTransactions);
            calculateTotals(fetchedTransactions);
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Não foi possível carregar os dados financeiros.");
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchTransactions();
        }, [fetchTransactions])
    );

    const calculateTotals = (transacoes: Transaction[]) => {
        let totalFaturamento = 0;
        let totalDespesas = 0;
        transacoes.forEach(transacao => {
            const valor = Number(transacao.valor);
            if (transacao.tipo === 'Entrada') totalFaturamento += valor;
            else if (transacao.tipo === 'Saída') totalDespesas += valor;
        });
        setCaixa(totalFaturamento - totalDespesas);
        setFaturamento(totalFaturamento);
        setDespesas(totalDespesas);
    };

    const formatCurrencyBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const handleTransactionPress = (item: Transaction) => {
        router.push({ pathname: '/screens/transacoesDetalhes', params: { id: item.id } });
    };

    const handleDelete = (transactionId: number) => {
        Alert.alert(
            "Confirmar Exclusão",
            "Você tem certeza que deseja excluir esta transação?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    onPress: async () => {
                        try {
                            const userIdString = await AsyncStorage.getItem('usuario_id');
                            if (!userIdString) throw new Error("Usuário não encontrado");
                            await deleteTransaction(transactionId, Number(userIdString));
                            Alert.alert("Sucesso", "Transação excluída.");
                            fetchTransactions();
                        } catch (error: any) {
                            Alert.alert("Erro", error.message || "Não foi possível excluir a transação.");
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    const handleEdit = (transactionId: number) => {
        router.push({ pathname: '/screens/transacoesDetalhes', params: { id: transactionId, edit: 'true' } });
    };

    const SummaryCard = ({ title, value, iconName, color }: { title: string; value: number; iconName: any; color: string }) => (
        <View style={styles.summaryCard}>
            <View style={[styles.summaryIconContainer, { backgroundColor: color }]}>
                <MaterialCommunityIcons name={iconName} size={30} color={PALETTE.Branco} />
            </View>
            <View>
                <Text style={styles.summaryTitle}>{title}</Text>
                <Text style={styles.summaryValue}>{formatCurrencyBRL(value)}</Text>
            </View>
        </View>
    );

    const renderTransactionItem = ({ item }: { item: Transaction }) => (
        <TouchableOpacity onPress={() => handleTransactionPress(item)} style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
                <Feather
                    name={item.tipo === 'Entrada' ? 'arrow-up-circle' : 'arrow-down-circle'}
                    size={28}
                    color={item.tipo === 'Entrada' ? PALETTE.VerdeSucesso : PALETTE.LaranjaAlerta}
                />
            </View>
            <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle} numberOfLines={1}>{item.titulo}</Text>
                <Text style={styles.transactionCategory}>
                    {item.categoria || new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}
                </Text>
            </View>
            <View style={styles.transactionValueContainer}>
                <Text style={[styles.transactionValue, { color: item.tipo === 'Entrada' ? PALETTE.VerdeSucesso : PALETTE.VermelhoErro }]}>
                    {formatCurrencyBRL(item.valor)}
                </Text>
                <View style={styles.transactionActions}>
                    <TouchableOpacity onPress={() => handleEdit(item.id)} style={styles.actionButton}>
                        <Ionicons name="pencil-outline" size={18} color={PALETTE.CinzaClaro} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
                        <Ionicons name="trash-outline" size={18} color={PALETTE.CinzaClaro} />
                    </TouchableOpacity>
                </View>
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
                <MaterialCommunityIcons name="finance" size={30} color={PALETTE.Branco} />
                <Text style={styles.sectionTitle}>Financeiro</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={PALETTE.Branco} style={{ flex: 1 }} />
            ) : (
                <FlatList
                    data={transactions}
                    renderItem={renderTransactionItem}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.list}
                    contentContainerStyle={{ paddingBottom: 180, paddingTop: 10 }}
                    ListHeaderComponent={
                        <>
                            <View style={styles.summaryContainer}>
                                <SummaryCard title="Saldo em Caixa" value={caixa} iconName="wallet" color={PALETTE.AzulEscuro} />
                                <SummaryCard title="Faturamento Total" value={faturamento} iconName="trending-up" color={PALETTE.VerdeSucesso} />
                                <SummaryCard title="Despesas Totais" value={despesas} iconName="trending-down" color={PALETTE.VermelhoErro} />
                            </View>
                            <Text style={styles.listHeader}>Últimos Lançamentos</Text>
                        </>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyListContainer}>
                            <Text style={styles.emptyListText}>Nenhum lançamento encontrado.</Text>
                        </View>
                    }
                />
            )}

            <View style={styles.footerButtons}>
                <TouchableOpacity style={styles.actionButtonContainer} onPress={() => router.push("/screens/graficos")}>
                    <MaterialIcons name="bar-chart" size={25} color={PALETTE.Branco} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.addButton} onPress={() => router.push("/screens/addFinan")}>
                    <FontAwesome6 name="plus" size={20} color={PALETTE.Branco} />
                </TouchableOpacity>
            </View>

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
        alignSelf: 'center'
    },
    sectionTitle: {
        fontFamily: "BebasNeue",
        color: PALETTE.Branco,
        marginLeft: 10,
        fontSize: 35,
    },
    summaryContainer: {
        paddingHorizontal: '5%',
        marginBottom: 20,
    },
    summaryCard: {
        backgroundColor: PALETTE.FundoCard,
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryIconContainer: {
        padding: 12,
        borderRadius: 50,
        marginRight: 15,
    },
    summaryTitle: {
        color: PALETTE.CinzaClaro,
        fontSize: 14,
        fontFamily: "Montserrat_400Regular",
    },
    summaryValue: {
        color: PALETTE.Branco,
        fontSize: 22,
        fontFamily: "BebasNeue",
    },
    list: { width: '100%' },
    listHeader: {
        fontFamily: 'BebasNeue',
        fontSize: 24,
        color: PALETTE.Branco,
        marginBottom: 15,
        paddingHorizontal: '5%',
    },
    transactionItem: {
        backgroundColor: PALETTE.FundoCard,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginHorizontal: '5%',
        padding: 12,
    },
    transactionIcon: {
        marginRight: 12,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionTitle: {
        color: PALETTE.Branco,
        fontSize: 16,
        fontFamily: "Montserrat_400Regular",
        fontWeight: 'bold',
    },
    transactionCategory: {
        color: PALETTE.CinzaClaro,
        fontSize: 12,
        fontFamily: "Montserrat_400Regular",
    },
    transactionValueContainer: {
        alignItems: 'flex-end',
    },
    transactionValue: {
        fontSize: 16,
        fontFamily: "BebasNeue",
        marginBottom: 4,
    },
    transactionActions: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 15,
    },
    emptyListContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyListText: {
        color: PALETTE.Branco,
        fontSize: 16,
        fontFamily: "Montserrat_400Regular"
    },
    footerButtons: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    actionButtonContainer: {
        backgroundColor: "#2A4D69",
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
    addButton: {
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

export default FinanceScreen;