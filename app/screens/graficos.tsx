import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Animated } from 'react-native';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../components/utils';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';

const screenWidth = Dimensions.get('window').width;
const gradientColors = ['#2A4D69', '#5D9B9B'] as const;
const ChartsScreen = () => {
    const router = useRouter();
    const fadeLine = useRef(new Animated.Value(0)).current;
    const fadeBar = useRef(new Animated.Value(0)).current;
    const fadePie = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(fadeLine, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(fadeBar, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(fadePie, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]).start();
    }, [fadeLine, fadeBar, fadePie]);

    // Dummy data - replace with real values from API or state
    const cashFlowData = {
        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
        datasets: [
            { data: [120, 200, 150, 300, 250, 400, 350] }
        ],
    };

    const monthlyComparison = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [
            { data: [5000, 7000, 6000, 8000, 7500, 9000], color: () => '#5D9B9B', label: 'Receitas' },
            { data: [3000, 3500, 3200, 4000, 3800, 4200], color: () => '#F5F5F5', label: 'Despesas' },
        ],
    };

    const categoryBreakdown = [
        { name: 'Vendas', population: 60, color: '#4B5D67', legendFontColor: '#F5F5F5', legendFontSize: 15 },
        { name: 'Serviços', population: 25, color: '#2A4D69', legendFontColor: '#F5F5F5', legendFontSize: 15 },
        { name: 'Outros', population: 15, color: '#F5F5F5', legendFontColor: '#F5F5F5', legendFontSize: 15 },
    ];

    return (
        <LinearGradient colors={gradientColors} style={styles.container}>
            <Header />
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.sectionHeader}>
                    <AntDesign
                        name="arrowleft"
                        size={30}
                        color="#F5F5F5"
                        onPress={() => router.back()}
                    />
                    <MaterialCommunityIcons name="finance" size={30} color="#fff" />
                    <Text style={styles.title}>Gráficos Financeiros</Text>
                </View>

                <Animated.View style={[styles.chartContainer, { opacity: fadeLine }]}>
                    <Text style={styles.chartTitle}>Fluxo de Caixa (últimos 7 dias)</Text>
                    <LineChart
                        data={cashFlowData}
                        width={screenWidth * 0.9}
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                    />
                </Animated.View>

                <Animated.View style={[styles.chartContainer, { opacity: fadeBar }]}>
                    <Text style={styles.chartTitle}>Receitas vs Despesas (últimos 6 meses)</Text>
                    <BarChart
                        data={monthlyComparison}
                        width={screenWidth * 0.9}
                        height={220}
                        yAxisLabel="R$"
                        yAxisSuffix=""
                        chartConfig={chartConfig}
                        style={styles.chart}
                    />
                </Animated.View>

                <Animated.View style={[styles.chartContainer, { opacity: fadePie }]}>
                    <Text style={styles.chartTitle}>Distribuição por Categoria</Text>
                    <PieChart
                        data={categoryBreakdown}
                        width={screenWidth * 0.9}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                    />
                </Animated.View>
            </ScrollView>
        </LinearGradient>
    );
};

const chartConfig = {
    backgroundGradientFrom: '#2A4D69',
    backgroundGradientTo: '#5D9B9B',
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0.1,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(245, 245, 245, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(245, 245, 245, ${opacity})`,
    propsForDots: { r: '6', strokeWidth: '2', stroke: '#5D9B9B' },
    propsForBackgroundLines: { strokeDasharray: '' },
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center' },
    scroll: { alignItems: 'center', paddingBottom: 30 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginRight: '30%' },
    title: { fontSize: 30, color: '#F5F5F5', marginLeft: 10, fontFamily: 'BebasNeue' },
    chartContainer: { marginTop: 30, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 10 },
    chartTitle: { fontFamily: 'BebasNeue', fontSize: 20, color: '#F5F5F5', marginBottom: 10, textAlign: 'center' },
    chart: { borderRadius: 10 },
});

export default ChartsScreen;
