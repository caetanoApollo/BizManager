import React, { useState, useEffect } from "react";
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
import { getInvoiceById } from "../services/api";
import { AntDesign, MaterialIcons, Feather } from "@expo/vector-icons";
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

interface Invoice {
    id: number;
    numero: string;
    data_emissao: string;
    prestador_razao_social: string;
    prestador_cnpj: string;
    tomador_razao_social: string;
    tomador_cnpj: string;
    servico_discriminacao: string;
    servico_valor: number;
}

const DetalhesNotaScreen: React.FC = () => {
    const router = useRouter();
    const { invoiceId } = useLocalSearchParams();

    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [fontsLoaded] = useFonts({ Montserrat_400Regular, BebasNeue_400Regular });

    useEffect(() => {
        const fetchInvoice = async () => {
            if (!invoiceId) {
                Alert.alert("Erro", "ID da nota fiscal ausente.");
                setLoading(false);
                return;
            }
            try {
                const data = await getInvoiceById(Number(invoiceId)); 
                setInvoice(data);
            } catch (err) {
                Alert.alert("Erro", "Não foi possível carregar os dados da nota fiscal.");
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [invoiceId]);

    const InfoRow = ({ icon, label, value }: { icon: any, label: string, value: string | number }) => (
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

    if (!invoice) {
        return (
            <LinearGradient colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]} style={styles.container}>
                <Header />
                <View style={styles.headerSection}>
                    <AntDesign name="arrow-left" size={30} color={PALETTE.Branco} onPress={() => router.back()} />
                    <MaterialIcons name="folder-off" size={30} color={PALETTE.Branco} />
                    <Text style={styles.title}>Erro</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={styles.errorText}>Nota Fiscal não encontrada.</Text>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]} style={styles.container}>
            <Header />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.headerSection}>
                    <AntDesign name="arrow-left" size={30} color={PALETTE.Branco} onPress={() => router.back()} />
                    <MaterialIcons name="folder-open" size={30} color={PALETTE.Branco} />
                    <Text style={styles.title}>Detalhes da Nota</Text>
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.invoiceNumber}>{invoice.numero}</Text>

                    <InfoRow icon="calendar" label="Data de Emissão" value={new Date(invoice.data_emissao).toLocaleDateString('pt-BR')} />

                    <Text style={styles.sectionHeading}>Dados do Tomador</Text>
                    <InfoRow icon="user" label="Razão Social" value={invoice.tomador_razao_social} />
                    <InfoRow icon="hash" label="CNPJ" value={invoice.tomador_cnpj} />

                    <Text style={styles.sectionHeading}>Dados do Serviço</Text>
                    <InfoRow icon="dollar-sign" label="Valor do Serviço" value={`R$ ${invoice.servico_valor.toFixed(2)}`} />
                    <Text style={styles.notesTitle}>Discriminação</Text>
                    <Text style={styles.notesValue}>{invoice.servico_discriminacao || 'Nenhuma discriminação.'}</Text>
                </View>

                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => Alert.alert("Funcionalidade", "Edição de notas fiscais ainda não implementada.")}
                >
                    <Feather name="edit" size={20} color={PALETTE.Branco} />
                    <Text style={styles.editButtonText}>Editar Nota</Text>
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
    invoiceNumber: {
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
    sectionHeading: {
        fontFamily: 'BebasNeue_400Regular',
        fontSize: 22,
        color: PALETTE.Branco,
        marginTop: 10,
        marginBottom: 15,
        borderLeftWidth: 3,
        borderLeftColor: PALETTE.LaranjaPrincipal,
        paddingLeft: 10,
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

export default DetalhesNotaScreen;