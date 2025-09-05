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
    Ionicons, // Ícone adicionado para editar
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { Nav, addButton, Header } from "../components/utils";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTransactionsByUserId, deleteTransaction } from "../services/api"; // Importa a função de exclusão

interface Transaction {
    id: number;
    usuario_id: number;
    titulo: string;
    valor: number;
    data: string;
    tipo: 'Entrada' | 'Saída';
    categoria: string;
}

const FinanceScreen = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [caixa, setCaixa] = useState(0);
    const [faturamento, setFaturamento] = useState(0);
    const [despesas, setDespesas] = useState(0);
    const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular });

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const userIdString = await AsyncStorage.getItem('usuario_id');
            if (userIdString) {
                const userId = Number(userIdString);
                const fetchedTransactions = await getTransactionsByUserId(userId);
                const sortedTransactions = fetchedTransactions.sort((a: Transaction, b: Transaction) => new Date(b.data).getTime() - new Date(a.data).getTime());
                setTransactions(sortedTransactions);
                calculateTotals(fetchedTransactions);
            }
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Não foi possível carregar os dados financeiros.");
        } finally {
            setLoading(false);
        }
    }, []);

    const calculateTotals = (transacoes: Transaction[]) => {
        let totalFaturamento = 0;
        let totalDespesas = 0;

        transacoes.forEach(transacao => {
            const valor = Number(transacao.valor);
            if (transacao.tipo === 'Entrada') {
                totalFaturamento += valor;
            } else if (transacao.tipo === 'Saída') {
                totalDespesas += valor;
            }
        });

        setCaixa(totalFaturamento - totalDespesas);
        setFaturamento(totalFaturamento);
        setDespesas(totalDespesas);
    };

    useFocusEffect(
        useCallback(() => {
            fetchTransactions();
        }, [fetchTransactions])
    );

    const formatCurrencyBRL = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const handleTransactionPress = (transactionId: number) => {
        router.push(`/screens/transacoesDetalhes?id=${transactionId}`);
    };

    // Função para deletar uma transação
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
                            if (userIdString) {
                                const userId = Number(userIdString);
                                await deleteTransaction(transactionId, userId);
                                Alert.alert("Sucesso", "Transação excluída com sucesso.");
                                fetchTransactions(); // Atualiza a lista
                            }
                        } catch (error: any) {
                            Alert.alert("Erro", error.message || "Não foi possível excluir a transação.");
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    // Função para navegar para a tela de edição
    const handleEdit = (transactionId: number) => {
        // Supondo que você tenha uma tela de edição em /screens/editarTransacao
        router.push(`/screens/transacoesDetalhes?id=${transactionId}&edit=true`);
    };
    
    // Componente para renderizar cada item da lista de transações
    const renderTransactionItem = ({ item }: { item: Transaction }) => (
        <TouchableOpacity onPress={() => handleTransactionPress(item.id)} style={styles.transactionItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Feather
                    name={item.tipo === 'Entrada' ? 'arrow-up-circle' : 'arrow-down-circle'}
                    size={30}
                    color={item.tipo === 'Entrada' ? '#06402B' : '#722F37'}
                    style={{ marginRight: 15 }}
                />
                <View style={{ flex: 1 }}>
                    <Text style={styles.transactionTitle} numberOfLines={1}>{item.titulo}</Text>
                    <Text style={styles.transactionDate}>
                        {new Date(item.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </Text>
                </View>
            </View>
            <View style={styles.transactionActions}>
                <Text style={[styles.transactionValue, { color: item.tipo === 'Entrada' ? '#06402B' : '#722F37' }]}>
                    {formatCurrencyBRL(item.valor)}
                </Text>
                <TouchableOpacity onPress={() => handleEdit(item.id)} style={styles.actionButton}>
                    <Ionicons name="pencil" size={20} color="#F5F5F5" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
                    <Ionicons name="trash-bin" size={20} color="#F5F5F5" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    if (!fontsLoaded) {
        return null;
    }

    return (
        <LinearGradient colors={["#2A4D69", "#5D9B9B"]} style={styles.container}>
            <Header />
            <View style={styles.section}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialCommunityIcons name="finance" size={30} color="#fff" />
                    <Text style={styles.sectionTitle}>FINANCEIRO</Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />
            ) : (
                <FlatList
                    data={transactions}
                    renderItem={renderTransactionItem}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.list}
                    contentContainerStyle={{ paddingBottom: 150 }} 
                    ListHeaderComponent={
                        <>
                            <View style={styles.summaryContainer}>
                                <View style={styles.boxContainer}>
                                    <View style={styles.titleContainer}>
                                        <Text style={styles.textContainer}>Caixa:</Text>
                                        <Text style={styles.textValue}>{formatCurrencyBRL(caixa)}</Text>
                                    </View>
                                    <FontAwesome6 name="money-bill" size={50} color="#fff" />
                                </View>
                                <View style={styles.boxContainer}>
                                    <View style={styles.titleContainer}>
                                        <Text style={styles.textContainer}>Faturamento:</Text>
                                        <Text style={styles.textValue}>{formatCurrencyBRL(faturamento)}</Text>
                                    </View>
                                    <MaterialCommunityIcons name="trending-up" size={50} color="#fff" />
                                </View>
                                <View style={styles.boxContainer}>
                                    <View style={styles.titleContainer}>
                                        <Text style={styles.textContainer}>Despesas:</Text>
                                        <Text style={styles.textValue}>{formatCurrencyBRL(despesas)}</Text>
                                    </View>
                                    <MaterialCommunityIcons name="trending-down" size={50} color="#fff" />
                                </View>
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
                <TouchableOpacity style={styles.chartButton} onPress={() => router.push("/screens/graficos")}>
                    <MaterialIcons name="bar-chart" size={25} color="#F5F5F5" />
                </TouchableOpacity>
                {addButton({ activeRoute: "/screens/addFinan" })}
            </View>

            <Nav style={styles.navBar} />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
    },
    section: {
        width: '90%',
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 10,
        justifyContent: 'flex-start'
    },
    sectionTitle: {
        fontFamily: "BebasNeue",
        padding: 10,
        color: "#fff",
        marginLeft: 5,
        fontSize: 35,
    },
    summaryContainer: {
        alignItems: 'center',
    },
    boxContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 15,
        width: 320,
        height: 100,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        padding: 15,
        borderRadius: 10,
    },
    titleContainer: {
        justifyContent: "center",
    },
    textContainer: {
        fontFamily: "BebasNeue",
        fontSize: 35,
        color: "#fff",
    },
    textValue: {
        fontFamily: "BebasNeue",
        fontSize: 30,
        color: "#fff",
    },
    footerButtons: {
        position: 'absolute',
        bottom: 40,
        right: 5,
        alignItems: 'flex-end',
    },
    chartButton: {
        bottom: 40,
        right: 20,
        backgroundColor: "#2A4D69",
        borderRadius: 50,
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
    },
    navBar: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 0,
    },
    list: {
        width: '100%',
    },
    listHeader: {
        fontFamily: 'BebasNeue',
        fontSize: 24,
        color: '#F5F5F5',
        marginTop: 20,
        marginBottom: 10,
        paddingHorizontal: '5%',
    },
    transactionItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        marginHorizontal: '5%',
    },
    transactionTitle: {
        color: '#F5F5F5',
        fontSize: 16,
        fontWeight: 'bold',
    },
    transactionDate: {
        color: '#E0E0E0',
        fontSize: 12,
    },
    transactionValue: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'monospace'
    },
    emptyListContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyListText: {
        color: '#F5F5F5',
        fontSize: 16,
    },
    transactionActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        marginLeft: 15,
    }
});

export default FinanceScreen;