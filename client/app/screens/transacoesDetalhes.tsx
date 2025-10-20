import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getTransactionById, updateTransaction } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, AntDesign, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Header } from '../components/utils';

const PALETTE = {
    LaranjaPrincipal: "#F5A623",
    VerdeAgua: "#5D9B9B",
    AzulEscuro: "#2A4D69",
    Branco: "#F5F5F5",
    CinzaClaro: "#ccc",
};

interface Transaction {
    id: number;
    usuario_id: number;
    titulo: string;
    descricao?: string;
    valor: number;
    data: string;
    tipo: 'Entrada' | 'Saída';
    categoria?: string;
}

const TransacoesDetalhesScreen = () => {
    const params = useLocalSearchParams();
    const router = useRouter();

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [isEditing, setIsEditing] = useState(params.edit === 'true');
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    const [titulo, setTitulo] = useState('');
    const [categoria, setCategoria] = useState('');
    const [tipo, setTipo] = useState<'Entrada' | 'Saída' | ''>('');
    const [data, setData] = useState("");
    const [valor, setValor] = useState("");
    const [descricao, setDescricao] = useState("");

    const formatDate = (text: string) =>
        text
            .replace(/\D/g, "")
            .replace(/(\d{2})(\d)/, "$1/$2")
            .replace(/(\d{2})(\d)/, "$1/$2")
            .slice(0, 10);

    const formatCurrencyForDisplay = (num: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
    };

    const formatCurrencyForInput = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        if (!cleaned) return '';
        const number = parseFloat(cleaned) / 100;
        return formatCurrencyForDisplay(number);
    };

    const fetchTransaction = useCallback(async () => {
        setLoading(true);
        try {
            const transactionId = Number(params.id);
            if (!isNaN(transactionId)) {
                const fetchedData = await getTransactionById(transactionId);
                setTransaction(fetchedData);

                setTitulo(fetchedData.titulo);
                setCategoria(fetchedData.categoria || '');
                setTipo(fetchedData.tipo);
                setDescricao(fetchedData.descricao || '');
                setValor(formatCurrencyForDisplay(fetchedData.valor));

                const dateFromApi = new Date(fetchedData.data);
                const formattedDate = `${String(dateFromApi.getUTCDate()).padStart(2, '0')}/${String(dateFromApi.getUTCMonth() + 1).padStart(2, '0')}/${dateFromApi.getUTCFullYear()}`;
                setData(formattedDate);
            }
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Não foi possível carregar os dados da transação.');
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchTransaction();
    }, [fetchTransaction]);

    const handleUpdate = async () => {
        if (!transaction) return;

        if (!titulo.trim() || !tipo || !data.trim() || !valor.trim()) {
            Alert.alert("Erro", "Título, Tipo, Data e Valor são obrigatórios.");
            return;
        }

        const valorNumerico = parseFloat(valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
        if (isNaN(valorNumerico)) {
            Alert.alert('Erro', 'O valor inserido é inválido.');
            return;
        }

        const [dia, mes, ano] = data.split('/');
        if (!dia || !mes || !ano || dia.length !== 2 || mes.length !== 2 || ano.length !== 4) {
            Alert.alert("Erro", "Formato de data inválido. Use DD/MM/AAAA.");
            return;
        }
        const formattedData = `${ano}-${mes}-${dia}`;

        try {
            setLoading(true);
            const userIdString = await AsyncStorage.getItem('usuario_id');
            if (!userIdString) throw new Error("Usuário não autenticado.");

            const userId = Number(userIdString);

            await updateTransaction(
                transaction.id, userId, titulo, descricao, valorNumerico,
                formattedData, tipo, categoria
            );
            Alert.alert('Sucesso', 'Transação atualizada com sucesso!');
            router.back();
        } catch (error: any) {
            Alert.alert('Erro na Atualização', error.message || 'Não foi possível atualizar a transação.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        if (transaction) {
            fetchTransaction();
        }
        setIsEditing(false);
    };

    const handleSelectType = (selectedType: 'Entrada' | 'Saída') => {
        setTipo(selectedType);
        setModalVisible(false);
    };

    if (loading && !transaction) {
        return <ActivityIndicator size="large" color="#fff" style={{ flex: 1, backgroundColor: PALETTE.AzulEscuro }} />;
    }

    const pageTitle = isEditing ? 'EDITAR LANÇAMENTO' : 'DETALHES DA TRANSAÇÃO';

    return (
        <LinearGradient
            colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]}
            style={styles.container}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <Header />
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">

                    <View style={styles.header}>
                        <AntDesign name="arrow-left" size={30} color={PALETTE.Branco} onPress={() => router.back()} />
                        <MaterialCommunityIcons name="finance" size={30} color="#fff" />
                        <Text style={styles.title}>{pageTitle}</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.sectionTitle}>O Lançamento</Text>
                        <View style={styles.inputGroup}>
                            <Feather name="edit-3" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                            {isEditing ? (
                                <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Título do Lançamento" placeholderTextColor={PALETTE.CinzaClaro} />
                            ) : (
                                <Text style={styles.value}>{titulo}</Text>
                            )}
                        </View>
                        <View style={styles.inputGroup}>
                            <Feather name="tag" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                            {isEditing ? (
                                <TextInput style={styles.input} value={categoria} onChangeText={setCategoria} placeholder="Categoria (opcional)" placeholderTextColor={PALETTE.CinzaClaro} />
                            ) : (
                                <Text style={styles.value}>{categoria || 'Sem categoria'}</Text>
                            )}
                        </View>
                        <View style={[styles.inputGroup, styles.alignTop]}>
                            <Feather name="file-text" size={20} color={PALETTE.CinzaClaro} style={[styles.icon, { paddingTop: 12 }]} />
                            {isEditing ? (
                                <TextInput style={[styles.input, styles.multilineInput]} value={descricao} onChangeText={setDescricao} placeholder="Descrição (opcional)" placeholderTextColor={PALETTE.CinzaClaro} multiline />
                            ) : (
                                <Text style={styles.value}>{descricao || 'Nenhuma descrição'}</Text>
                            )}
                        </View>

                        <Text style={styles.sectionTitle}>Detalhes Financeiros</Text>
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Feather name="dollar-sign" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                                {isEditing ? (
                                    <TextInput style={styles.input} value={valor} onChangeText={(text) => setValor(formatCurrencyForInput(text))} placeholder="R$ 0,00" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="numeric" />
                                ) : (
                                    <Text style={[styles.value, { color: tipo === 'Entrada' ? '#2ecc71' : '#e74c3c' }]}>{valor}</Text>
                                )}
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", flex: 1 }} onPress={() => isEditing && setModalVisible(true)} disabled={!isEditing}>
                                    <Feather name={tipo === 'Entrada' ? 'arrow-up-circle' : 'arrow-down-circle'} size={20} color={isEditing ? PALETTE.CinzaClaro : PALETTE.Branco} style={styles.icon} />
                                    <Text style={[styles.input, styles.pickerText, !tipo && styles.placeholderText]}>{tipo || "Tipo"}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Quando?</Text>
                        <View style={styles.inputGroup}>
                            <Feather name="calendar" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                            {isEditing ? (
                                <TextInput style={styles.input} value={data} onChangeText={(text) => setData(formatDate(text))} placeholder="DD/MM/AAAA" placeholderTextColor={PALETTE.CinzaClaro} keyboardType="numeric" maxLength={10} />
                            ) : (
                                <Text style={styles.value}>{data}</Text>
                            )}
                        </View>

                        {isEditing ? (
                            <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
                                {loading ? <ActivityIndicator color={PALETTE.Branco} /> : (<><Feather name="check-circle" size={20} color={PALETTE.Branco} /><Text style={styles.buttonText}>Salvar Alterações</Text></>)}
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
                                <Feather name="edit" size={20} color={PALETTE.Branco} />
                                <Text style={styles.buttonText}>Editar Lançamento</Text>
                            </TouchableOpacity>
                        )}
                        {isEditing && (
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancelEdit}>
                                <Feather name="x-circle" size={20} color={PALETTE.Branco} />
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Selecione um Tipo</Text>
                        <TouchableOpacity style={styles.clientItem} onPress={() => handleSelectType('Entrada')}><Text style={styles.clientItemText}>Entrada</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.clientItem} onPress={() => handleSelectType('Saída')}><Text style={styles.clientItemText}>Saída</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}><Text style={styles.modalCloseButtonText}>Fechar</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContainer: { flexGrow: 1, paddingBottom: 40 },
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
        marginBottom: 15,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 12,
    },
    alignTop: { alignItems: "flex-start" },
    icon: { paddingLeft: 15, paddingRight: 10 },
    input: {
        flex: 1,
        paddingVertical: 15,
        paddingRight: 15,
        color: PALETTE.Branco,
        fontSize: 16,
        fontFamily: "Montserrat_400Regular",
    },
    value: { 
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
    cancelButton: {
        backgroundColor: '#e74c3c', 
        marginTop: 10,
    },
    buttonText: {
        color: PALETTE.Branco,
        fontSize: 20,
        fontFamily: "BebasNeue",
        marginLeft: 10,
    },
    pickerText: { paddingVertical: 15, paddingRight: 15, paddingLeft: 0, color: PALETTE.Branco },
    placeholderText: { color: PALETTE.CinzaClaro },
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    modalContainer: {
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
        textAlign: 'center',
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
});

export default TransacoesDetalhesScreen;

