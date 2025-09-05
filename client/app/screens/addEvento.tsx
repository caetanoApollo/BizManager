import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Platform,
    Modal,
    FlatList,
    KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, AntDesign, Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { Header } from "../components/utils";
import { createScheduledService, getClients } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- Paleta de Cores ---
const PALETTE = {
    LaranjaPrincipal: "#F5A623",
    LaranjaSecundario: "#FFBC42",
    VerdeAgua: "#5D9B9B",
    AzulEscuro: "#2A4D69",
    Branco: "#F5F5F5",
    CinzaClaro: "#ccc",
};

// Interface para tipar os clientes
interface Cliente {
    id: number;
    nome: string;
}

const NovoEventoScreen = () => {
    const router = useRouter();
    const [titulo, setTitulo] = useState("");
    const [data, setData] = useState("");
    const [horario, setHorario] = useState("");
    const [descricao, setDescricao] = useState("");
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
    const [loading, setLoading] = useState(false);
    const [clientesLoading, setClientesLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchClientes = async () => {
                setClientesLoading(true);
                try {
                    const userIdString = await AsyncStorage.getItem("usuario_id");
                    if (!userIdString) throw new Error("ID do usuário não encontrado.");

                    const userId = Number(userIdString);
                    const data = await getClients(userId);
                    setClientes(data);
                } catch (error: any) {
                    Alert.alert("Erro", "Não foi possível carregar a lista de clientes.");
                } finally {
                    setClientesLoading(false);
                }
            };

            fetchClientes();
            return () => { };
        }, [])
    );

    const handleSalvar = async () => {
        if (!titulo || !data || !horario || !selectedClient) {
            Alert.alert("Erro", "Título, cliente, data e horário são obrigatórios.");
            return;
        }

        const [dia, mes, ano] = data.split("/");
        const formattedData = `${ano}-${mes}-${dia}`;

        setLoading(true);
        try {
            await createScheduledService({
                cliente_id: selectedClient.id,
                titulo,
                descricao,
                data: formattedData,
                horario,
            });
            Alert.alert("Sucesso", "Evento salvo com sucesso!");
            router.back();
        } catch (error: any) {
            Alert.alert(
                "Erro ao salvar",
                error.message || "Não foi possível salvar o evento."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSelectClient = (cliente: Cliente) => {
        setSelectedClient(cliente);
        setModalVisible(false);
    };

    const formatDate = (text: string) =>
        text
            .replace(/\D/g, "")
            .replace(/(\d{2})(\d)/, "$1/$2")
            .replace(/(\d{2})(\d)/, "$1/$2")
            .slice(0, 10);
    const formatTime = (text: string) =>
        text
            .replace(/\D/g, "")
            .replace(/(\d{2})(\d)/, "$1:$2")
            .slice(0, 5);

    return (
        <LinearGradient
            colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]}
            style={styles.container}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <Header />

                    <View style={styles.header}>
                        <AntDesign
                            name="arrowleft"
                            size={30}
                            color={PALETTE.Branco}
                            onPress={() => router.back()}
                        />
                        <MaterialIcons name="event" size={30} color={PALETTE.Branco} />
                        <Text style={styles.title}>NOVO EVENTO</Text>
                    </View>

                    <View style={styles.formContainer}>
                        {/* Seção O Quê? */}
                        <Text style={styles.sectionTitle}>O Quê?</Text>
                        <View style={styles.inputGroup}>
                            <Feather
                                name="edit-3"
                                size={20}
                                color={PALETTE.CinzaClaro}
                                style={styles.icon}
                            />
                            <TextInput
                                style={styles.input}
                                value={titulo}
                                onChangeText={setTitulo}
                                placeholder="Título do Evento"
                                placeholderTextColor={PALETTE.CinzaClaro}
                            />
                        </View>
                        <View style={[styles.inputGroup, styles.alignTop]}>
                            <Feather
                                name="file-text"
                                size={20}
                                color={PALETTE.CinzaClaro}
                                style={[styles.icon, { paddingTop: 12 }]}
                            />
                            <TextInput
                                style={[styles.input, styles.multilineInput]}
                                value={descricao}
                                onChangeText={setDescricao}
                                placeholder="Descrição (opcional)"
                                placeholderTextColor={PALETTE.CinzaClaro}
                                multiline
                            />
                        </View>

                        {/* Seção Para Quem? */}
                        <Text style={styles.sectionTitle}>Para Quem?</Text>
                        <TouchableOpacity
                            style={styles.inputGroup}
                            onPress={() => setModalVisible(true)}
                        >
                            <Feather
                                name="user"
                                size={20}
                                color={PALETTE.CinzaClaro}
                                style={styles.icon}
                            />
                            <Text
                                style={[
                                    styles.input,
                                    styles.pickerText,
                                    !selectedClient && styles.placeholderText,
                                ]}
                            >
                                {selectedClient
                                    ? selectedClient.nome
                                    : "Selecione um cliente..."}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push("/screens/addCliente")}
                        >
                            <Text style={styles.linkText}>
                                Não encontrou o cliente? Cadastre um novo.
                            </Text>
                        </TouchableOpacity>

                        {/* Seção Quando? */}
                        <Text style={styles.sectionTitle}>Quando?</Text>
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Feather
                                    name="calendar"
                                    size={20}
                                    color={PALETTE.CinzaClaro}
                                    style={styles.icon}
                                />
                                <TextInput
                                    style={styles.input}
                                    value={data}
                                    onChangeText={(text) => setData(formatDate(text))}
                                    placeholder="DD/MM/AAAA"
                                    placeholderTextColor={PALETTE.CinzaClaro}
                                    keyboardType="numeric"
                                    maxLength={10}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Feather
                                    name="clock"
                                    size={20}
                                    color={PALETTE.CinzaClaro}
                                    style={styles.icon}
                                />
                                <TextInput
                                    style={styles.input}
                                    value={horario}
                                    onChangeText={(text) => setHorario(formatTime(text))}
                                    placeholder="HH:MM"
                                    placeholderTextColor={PALETTE.CinzaClaro}
                                    keyboardType="numeric"
                                    maxLength={5}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSalvar}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={PALETTE.Branco} />
                            ) : (
                                <>
                                    <Feather
                                        name="check-circle"
                                        size={20}
                                        color={PALETTE.Branco}
                                    />
                                    <Text style={styles.buttonText}>Salvar Evento</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modal de Seleção de Cliente */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Selecione um Cliente</Text>
                        {clientesLoading ? (
                            <ActivityIndicator color={PALETTE.Branco} />
                        ) : (
                            <FlatList
                                data={clientes}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.clientItem}
                                        onPress={() => handleSelectClient(item)}
                                    >
                                        <Text style={styles.clientItemText}>{item.nome}</Text>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <Text style={styles.emptyText}>
                                        Nenhum cliente cadastrado.
                                    </Text>
                                }
                            />
                        )}
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalCloseButtonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContainer: { flexGrow: 1, paddingBottom: 50 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 20,
        paddingTop: 10,
        alignSelf: "flex-start",
    },
    title: { color: PALETTE.Branco, fontSize: 25, fontFamily: "BebasNeue" },
    formContainer: {
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        padding: 20,
        marginHorizontal: 20,
        borderRadius: 16,
    },
    sectionTitle: {
        color: PALETTE.Branco,
        fontSize: 22,
        fontFamily: "BebasNeue",
        marginBottom: 15,
        borderLeftWidth: 3,
        borderLeftColor: PALETTE.LaranjaPrincipal,
        paddingLeft: 10,
    },
    inputGroup: {
        marginBottom: 20,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 12,
    },
    alignTop: { alignItems: "flex-start", },
    icon: { paddingLeft: 15, paddingRight: 10 },
    input: {
        flex: 1,
        paddingVertical: 15,
        paddingRight: 15,
        color: PALETTE.Branco,
        fontSize: 16,
        fontFamily: "Montserrat_400Regular",
    },
    multilineInput: { height: 100, textAlignVertical: "top", paddingTop: 15 },
    row: { flexDirection: "row", justifyContent: "space-between" },
    button: {
        flexDirection: "row",
        backgroundColor: PALETTE.VerdeAgua,
        borderRadius: 30,
        padding: 15,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    buttonText: {
        color: PALETTE.Branco,
        fontSize: 20,
        fontFamily: "BebasNeue",
        marginLeft: 10,
    },
    pickerText: { paddingVertical: 15, paddingRight: 15 },
    placeholderText: { color: PALETTE.CinzaClaro },
    linkText: {
        color: PALETTE.LaranjaSecundario,
        marginTop: -10,
        textAlign: "center",
        fontFamily: "Montserrat_400Regular",
        marginBottom: 20,
    },
    // Estilos do Modal
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalContainer: {
        height: "50%",
        backgroundColor: PALETTE.AzulEscuro,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalTitle: {
        color: PALETTE.Branco,
        fontSize: 22,
        fontFamily: "BebasNeue",
        textAlign: "center",
        marginBottom: 20,
    },
    clientItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.2)",
    },
    clientItemText: {
        color: PALETTE.Branco,
        fontSize: 16,
        fontFamily: "Montserrat_400Regular",
    },
    modalCloseButton: {
        backgroundColor: PALETTE.LaranjaPrincipal,
        borderRadius: 25,
        padding: 15,
        alignItems: "center",
        marginTop: 20,
    },
    modalCloseButtonText: {
        color: PALETTE.Branco,
        fontSize: 16,
        fontFamily: "BebasNeue",
    },
    emptyText: { color: PALETTE.CinzaClaro, textAlign: "center", marginTop: 20 },
});

export default NovoEventoScreen;
