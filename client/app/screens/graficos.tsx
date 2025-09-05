import React, { useState, useCallback, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    ActivityIndicator,
    Alert,
    Animated,
} from "react-native";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Header } from "../components/utils";
import { LineChart, PieChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";
import { Dataset } from "react-native-chart-kit/dist/HelperTypes";
import { useRouter, useFocusEffect } from "expo-router";
import { getTransactionsByUserId } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- Paleta de Cores ---
const PALETTE = {
    LaranjaPrincipal: "#F5A623",
    LaranjaSecundario: "#FFBC42",
    VerdeAgua: "#5D9B9B",
    AzulEscuro: "#2A4D69",
    Branco: "#F5F5F5",
    Cinza: "#8E8E8E",
};

// --- Interfaces ---
interface Transaction {
    id: number;
    usuario_id: number;
    titulo: string;
    valor: number;
    data: string;
    tipo: "Entrada" | "Saída";
    categoria: string;
}

// CORREÇÃO: Alinhado com a biblioteca, color é opcional
interface ChartDataset extends Dataset {
    data: number[];
    color?: (opacity: number) => string;
}

interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
    legend?: string[];
}

interface PieChartData {
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
}

interface TooltipData {
    x: number;
    y: number;
    visible: boolean;
    value: number;
    datasetIndex?: number;
}

const screenWidth = Dimensions.get("window").width;
const gradientColors = [PALETTE.AzulEscuro, PALETTE.VerdeAgua] as const;

// --- Dados Iniciais ---
const initialChartData: ChartData = {
    labels: [],
    datasets: [{ data: [], color: () => PALETTE.Branco }],
};

// --- Funções de Formatação ---
const formatYAxisLabel = (value: string): string => {
    const numValue = Number(value);
    if (Math.abs(numValue) >= 1000000)
        return `${(numValue / 1000000).toFixed(1)}M`;
    if (Math.abs(numValue) >= 1000) return `${(numValue / 1000).toFixed(0)}k`;
    return String(Math.round(numValue));
};

const formatCurrencyBRL = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
};

const ChartsScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [tooltip, setTooltip] = useState<TooltipData>({
        x: 0,
        y: 0,
        visible: false,
        value: 0,
    });

    const chartOpacity = useRef(new Animated.Value(0)).current;
    const chartPosition = useRef(new Animated.Value(20)).current;

    const [cashFlowData, setCashFlowData] = useState<ChartData>(initialChartData);
    const [monthlyComparison, setMonthlyComparison] =
        useState<ChartData>(initialChartData);
    const [categoryBreakdown, setCategoryBreakdown] = useState<PieChartData[]>(
        []
    );

    const processDataForCharts = (data: Transaction[]) => {
        const today = new Date();

        // Fluxo de Caixa (Últimos 7 dias)
        const last7DaysLabels: string[] = [];
        const last7DaysValues = Array(7).fill(0);
        for (let i = 6; i >= 0; i--) {
            const day = new Date(today);
            day.setDate(today.getDate() - i);
            last7DaysLabels.push(
                day.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
            );
            const dayString = day.toISOString().split("T")[0];
            data.forEach((t) => {
                if (t.data.startsWith(dayString)) {
                    if (t.tipo === "Entrada") last7DaysValues[6 - i] += Number(t.valor);
                    else last7DaysValues[6 - i] -= Number(t.valor);
                }
            });
        }
        setCashFlowData({
            labels: last7DaysLabels,
            datasets: [
                {
                    data: last7DaysValues,
                    strokeWidth: 3,
                    color: (opacity = 1) => `rgba(245, 166, 35, ${opacity})`,
                },
            ],
        });

        // Receitas vs Despesas (Últimos 6 meses)
        const last6MonthsLabels: string[] = [];
        const revenueData = Array(6).fill(0);
        const expenseData = Array(6).fill(0);
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            last6MonthsLabels.push(
                date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")
            );
            const month = date.getMonth();
            const year = date.getFullYear();
            data.forEach((t) => {
                const tDate = new Date(t.data);
                if (tDate.getMonth() === month && tDate.getFullYear() === year) {
                    if (t.tipo === "Entrada") revenueData[5 - i] += Number(t.valor);
                    else expenseData[5 - i] -= Number(t.valor);
                }
            });
        }
        setMonthlyComparison({
            labels: last6MonthsLabels,
            legend: ["Receitas", "Despesas"],
            datasets: [
                {
                    data: revenueData,
                    strokeWidth: 3,
                    color: (opacity = 1) => `rgba(245, 245, 245, ${opacity})`,
                }, // Branco
                {
                    data: expenseData,
                    strokeWidth: 3,
                    color: (opacity = 1) => `rgba(255, 188, 66, ${opacity})`,
                }, // Laranja Secundário
            ],
        });

        // Distribuição de Despesas (Mês Atual)
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const monthlyExpenses = data.filter(
            (t) =>
                new Date(t.data).getMonth() === currentMonth &&
                new Date(t.data).getFullYear() === currentYear &&
                t.tipo === "Saída"
        );
        const totalMonthlyExpense = monthlyExpenses.reduce(
            (sum, t) => sum + Number(t.valor),
            0
        );

        const expenseByCategory: { [key: string]: number } = {};
        monthlyExpenses.forEach((t) => {
            const category = t.categoria || "Outros";
            expenseByCategory[category] =
                (expenseByCategory[category] || 0) + Number(t.valor);
        });

        const processedCategories: { [key: string]: number } = {};
        let othersValue = 0;
        if (totalMonthlyExpense > 0) {
            for (const category in expenseByCategory) {
                if (expenseByCategory[category] / totalMonthlyExpense < 0.04) {
                    // Limite de 4%
                    othersValue += expenseByCategory[category];
                } else {
                    processedCategories[category] = expenseByCategory[category];
                }
            }
        }
        if (othersValue > 0) {
            processedCategories["Outros"] = othersValue;
        }

        const pieColors = [
            PALETTE.LaranjaPrincipal,
            PALETTE.LaranjaSecundario,
            PALETTE.Branco,
            PALETTE.Cinza,
            PALETTE.VerdeAgua,
        ];
        const categoryData = Object.keys(processedCategories).map((key, index) => ({
            name: key,
            population: processedCategories[key],
            color: pieColors[index % pieColors.length],
            legendFontColor: PALETTE.Branco,
            legendFontSize: 15,
        }));
        setCategoryBreakdown(categoryData);
    };

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const userIdString = await AsyncStorage.getItem("usuario_id");
                    if (!userIdString) throw new Error("ID do usuário não encontrado.");

                    const userId = Number(userIdString);
                    const fetchedTransactions = await getTransactionsByUserId(userId);
                    setTransactions(fetchedTransactions);

                    if (fetchedTransactions.length > 0)
                        processDataForCharts(fetchedTransactions);
                    else setCategoryBreakdown([]);
                } catch (error: any) {
                    Alert.alert(
                        "Erro",
                        error.message ||
                        "Não foi possível carregar os dados para os gráficos."
                    );
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }, [])
    );

    useEffect(() => {
        if (!loading && transactions.length > 0) {
            chartOpacity.setValue(0);
            chartPosition.setValue(20);
            Animated.parallel([
                Animated.timing(chartOpacity, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(chartPosition, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [loading, transactions]);

    // CORREÇÃO: Tipagem do parâmetro 'data' alinhada com a biblioteca
    const handleDataPointClick = (data: {
        value: number;
        x: number;
        y: number;
        dataset: Dataset;
        index: number;
    }) => {
        const { value, x, y, dataset } = data;
        const tooltipX = x > screenWidth / 2 ? x - 120 : x + 20;
        const datasetIndex = monthlyComparison.datasets.findIndex(
            (ds) => ds.data === dataset.data
        );
        setTooltip({
            visible: true,
            x: tooltipX,
            y: y - 15,
            value,
            datasetIndex: datasetIndex !== -1 ? datasetIndex : undefined,
        });
    };

    if (loading) {
        return (
            <ActivityIndicator size="large" color="#fff" style={styles.loader} />
        );
    }

    return (
        <LinearGradient colors={gradientColors} style={styles.container}>
            <Header />
            <ScrollView
                contentContainerStyle={styles.scroll}
                onScrollBeginDrag={() => setTooltip({ ...tooltip, visible: false })}
                showsHorizontalScrollIndicator={false}
            >
                <View style={styles.sectionHeader}>
                    <AntDesign
                        name="arrowleft"
                        size={30}
                        color={PALETTE.Branco}
                        onPress={() => router.back()}
                    />
                    <MaterialCommunityIcons name="finance" size={30} color="#fff" />
                    <Text style={styles.title}>Gráficos Financeiros</Text>
                </View>

                {transactions.length > 0 ? (
                    <Animated.View
                        style={[
                            styles.chartsWrapper,
                            {
                                opacity: chartOpacity,
                                transform: [{ translateY: chartPosition }],
                            },
                        ]}
                    >
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>
                                Fluxo de Caixa (últimos 7 dias)
                            </Text>
                            <LineChart
                                data={cashFlowData}
                                width={screenWidth * 0.85}
                                height={200}
                                chartConfig={chartConfig}
                                bezier
                                style={styles.chart}
                                formatYLabel={formatYAxisLabel}
                                onDataPointClick={handleDataPointClick}
                            />
                            {tooltip.visible && tooltip.datasetIndex === undefined && (
                                <View
                                    style={[styles.tooltip, { left: tooltip.x, top: tooltip.y }]}
                                >
                                    <Text style={styles.tooltipText}>
                                        {formatCurrencyBRL(tooltip.value)}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>
                                Receitas vs Despesas (últimos 6 meses)
                            </Text>
                            <LineChart
                                data={monthlyComparison}
                                width={screenWidth * 0.85}
                                height={230}
                                chartConfig={chartConfig}
                                fromZero
                                style={styles.chart}
                                formatYLabel={formatYAxisLabel}
                                onDataPointClick={handleDataPointClick}
                                // CORREÇÃO: getDotColor movido para uma prop do componente e com tipagem explícita
                                getDotColor={(dataPoint: number, dataPointIndex: number) => {
                                    // A lógica aqui pode ser simplificada pois a cor do ponto herda da linha
                                    return PALETTE.AzulEscuro;
                                }}
                            />
                            {tooltip.visible && tooltip.datasetIndex !== undefined && (
                                <View
                                    style={[styles.tooltip, { left: tooltip.x, top: tooltip.y }]}
                                >
                                    <Text style={styles.tooltipText}>
                                        {formatCurrencyBRL(tooltip.value)}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>
                                Distribuição de Despesas (Mês Atual)
                            </Text>
                            <PieChart
                                data={categoryBreakdown}
                                width={screenWidth * 0.85}
                                height={200}
                                chartConfig={pieChartConfig}
                                accessor="population"
                                backgroundColor="transparent"
                                paddingLeft="0"
                                hasLegend={categoryBreakdown.length > 0}
                            />
                        </View>
                    </Animated.View>
                ) : (
                    <View style={styles.noDataContainer}>
                        <Text style={styles.noDataText}>
                            Não há dados suficientes para exibir os gráficos.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </LinearGradient>
    );
};

// CORREÇÃO: Removido o getDotColor da configuração principal
const chartConfig: AbstractChartConfig = {
    backgroundGradientFrom: PALETTE.AzulEscuro,
    backgroundGradientTo: PALETTE.VerdeAgua,
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    fillShadowGradientFrom: PALETTE.VerdeAgua,
    fillShadowGradientFromOpacity: 0.2,
    fillShadowGradientTo: PALETTE.AzulEscuro,
    fillShadowGradientToOpacity: 0.05,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(245, 245, 245, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(245, 245, 245, ${opacity})`,
    propsForDots: { r: "5" },
    propsForBackgroundLines: { stroke: "rgba(255, 255, 255, 0.15)" },
};

const pieChartConfig: AbstractChartConfig = {
    ...chartConfig,
    color: () => "transparent",
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loader: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: PALETTE.AzulEscuro,
    },
    scroll: { alignItems: "center", paddingBottom: 30 },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        alignSelf: "flex-start",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 30,
        color: PALETTE.Branco,
        marginLeft: 10,
        fontFamily: "BebasNeue",
    },
    chartsWrapper: {
        width: "100%",
        alignItems: "center",
    },
    chartContainer: {
        width: screenWidth * 0.9,
        marginTop: 30,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 16,
        paddingVertical: 15,
        alignItems: "center",
    },
    chartTitle: {
        fontFamily: "BebasNeue",
        fontSize: 20,
        color: PALETTE.Branco,
        marginBottom: 10,
        textAlign: "center",
    },
    chart: { borderRadius: 10 },
    noDataContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 50,
        padding: 20,
    },
    noDataText: { color: PALETTE.Branco, fontSize: 18, textAlign: "center" },
    tooltip: {
        position: "absolute",
        backgroundColor: PALETTE.AzulEscuro,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: PALETTE.LaranjaSecundario,
    },
    tooltipText: { color: PALETTE.Branco, fontSize: 14, fontWeight: "bold" },
});

export default ChartsScreen;
