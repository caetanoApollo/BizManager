import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getScheduledServiceById, updateScheduledService, getClients } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, AntDesign, Feather } from "@expo/vector-icons";
import { Header } from '../components/utils';

const PALETTE = {
  LaranjaPrincipal: "#F5A623",
  VerdeAgua: "#5D9B9B",
  AzulEscuro: "#2A4D69",
  Branco: "#F5F5F5",
  CinzaClaro: "#ccc",
};

interface Evento {
    id: number;
    cliente_id: number;
    titulo: string;
    descricao?: string;
    data: string;
    horario: string;
    status: 'agendado' | 'concluido' | 'cancelado';
    nome_cliente?: string;
}

interface Cliente {
    id: number;
    nome: string;
}

const DetalhesEventoScreen = () => {
    const params = useLocalSearchParams();
    const router = useRouter();
    
    const [evento, setEvento] = useState<Evento | null>(null);
    const [isEditing, setIsEditing] = useState(params.edit === 'true');
    const [loading, setLoading] = useState(true);
    
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [data, setData] = useState('');
    const [horario, setHorario] = useState('');
    const [clienteId, setClienteId] = useState<number | null>(null);
    const [clienteNome, setClienteNome] = useState('Nenhum cliente selecionado');

    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [modalClientesVisible, setModalClientesVisible] = useState(false);

    const formatDate = (text: string) => text.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2").slice(0, 10);
    const formatTime = (text: string) => text.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1:$2").slice(0, 5);

    const fetchEvento = useCallback(async () => {
        setLoading(true);
        try {
            const eventoId = Number(params.id);
            if (!isNaN(eventoId)) {
                const fetchedData = await getScheduledServiceById(eventoId);
                setEvento(fetchedData);
                
                setTitulo(fetchedData.titulo);
                setDescricao(fetchedData.descricao || '');
                const dateFromApi = new Date(fetchedData.data);
                setData(`${String(dateFromApi.getUTCDate()).padStart(2, '0')}/${String(dateFromApi.getUTCMonth() + 1).padStart(2, '0')}/${dateFromApi.getUTCFullYear()}`);
                setHorario(fetchedData.horario.substring(0, 5));
                setClienteId(fetchedData.cliente_id);
                setClienteNome(fetchedData.nome_cliente || 'Nenhum cliente selecionado');
            }
        } catch (error: any) {
            Alert.alert('Erro', 'Não foi possível carregar os dados do evento.');
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    const fetchClientes = async () => {
        try {
            const userIdString = await AsyncStorage.getItem('usuario_id');
            if(userIdString) {
                const data = await getClients(Number(userIdString));
                setClientes(data);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar a lista de clientes.');
        }
    };

    useEffect(() => {
        fetchEvento();
        fetchClientes();
    }, [fetchEvento]);

    const handleUpdate = async () => {
        if (!evento || !clienteId) {
            Alert.alert("Erro", "Cliente é obrigatório.");
            return;
        }

        const [dia, mes, ano] = data.split('/');
        const formattedData = `${ano}-${mes}-${dia}`;

        try {
            setLoading(true);
            await updateScheduledService(evento.id, {
                cliente_id: clienteId,
                titulo,
                descricao,
                data: formattedData,
                horario,
                status: evento.status // Mantém o status atual
            });
            Alert.alert('Sucesso', 'Agendamento atualizado com sucesso!');
            router.back();
        } catch (error: any) {
            Alert.alert('Erro na Atualização', error.message || 'Não foi possível atualizar o agendamento.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !evento) {
        return <ActivityIndicator size="large" color="#fff" style={{ flex: 1, backgroundColor: PALETTE.AzulEscuro }} />;
    }
    
    return (
        <LinearGradient colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]} style={styles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <Header />
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <AntDesign name="arrowleft" size={30} color={PALETTE.Branco} onPress={() => router.back()} />
                        <MaterialIcons name="event" size={30} color={PALETTE.Branco} />
                        <Text style={styles.title}>{isEditing ? 'EDITAR AGENDAMENTO' : 'DETALHES DO AGENDAMENTO'}</Text>
                    </View>
                    <View style={styles.formContainer}>
                        {/* Seção O Quê? */}
                        <Text style={styles.sectionTitle}>O Agendamento</Text>
                        <View style={styles.inputGroup}>
                            <Feather name="edit-3" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                            {isEditing ? <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} /> : <Text style={styles.value}>{titulo}</Text>}
                        </View>
                        <View style={[styles.inputGroup, styles.alignTop]}>
                            <Feather name="file-text" size={20} color={PALETTE.CinzaClaro} style={[styles.icon, { paddingTop: 12 }]} />
                            {isEditing ? <TextInput style={[styles.input, styles.multilineInput]} value={descricao} onChangeText={setDescricao} multiline/> : <Text style={styles.value}>{descricao || 'Nenhuma descrição'}</Text>}
                        </View>

                        {/* Seção Cliente */}
                        <Text style={styles.sectionTitle}>Para Quem?</Text>
                        <View style={styles.inputGroup}>
                            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", flex: 1 }} onPress={() => isEditing && setModalClientesVisible(true)} disabled={!isEditing}>
                                <Feather name="user" size={20} color={isEditing ? PALETTE.CinzaClaro : PALETTE.Branco} style={styles.icon}/>
                                <Text style={[styles.input, styles.pickerText]}>{clienteNome}</Text>
                            </TouchableOpacity>
                        </View>
                        
                        {/* Seção Quando? */}
                        <Text style={styles.sectionTitle}>Quando?</Text>
                        <View style={styles.row}>
                             <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Feather name="calendar" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                                {isEditing ? <TextInput style={styles.input} value={data} onChangeText={(text) => setData(formatDate(text))} keyboardType="numeric" maxLength={10}/> : <Text style={styles.value}>{data}</Text>}
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Feather name="clock" size={20} color={PALETTE.CinzaClaro} style={styles.icon}/>
                                {isEditing ? <TextInput style={styles.input} value={horario} onChangeText={(text) => setHorario(formatTime(text))} keyboardType="numeric" maxLength={5}/> : <Text style={styles.value}>{horario}</Text>}
                            </View>
                        </View>

                        {/* Botões de Ação */}
                        {isEditing ? (
                           <>
                            <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
                                {loading ? <ActivityIndicator color={PALETTE.Branco} /> : (<><Feather name="check-circle" size={20} color={PALETTE.Branco}/><Text style={styles.buttonText}>Salvar Alterações</Text></>)}
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsEditing(false)}>
                                <Feather name="x-circle" size={20} color={PALETTE.Branco}/>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                           </>
                        ) : (
                             <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
                                <Feather name="edit" size={20} color={PALETTE.Branco}/>
                                <Text style={styles.buttonText}>Editar Agendamento</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            
            <Modal visible={modalClientesVisible} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Selecione um Cliente</Text>
                        <FlatList
                            data={clientes}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.clientItem} onPress={() => {
                                    setClienteId(item.id);
                                    setClienteNome(item.nome);
                                    setModalClientesVisible(false);
                                }}>
                                    <Text style={styles.clientItemText}>{item.nome}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalClientesVisible(false)}>
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
    scrollContainer: { flexGrow: 1, paddingBottom: 40 },
    header: { flexDirection: "row", alignItems: "center", gap: 10, padding: 20, paddingTop: 10, alignSelf: "flex-start" },
    title: { color: PALETTE.Branco, fontSize: 25, fontFamily: "BebasNeue" },
    formContainer: { backgroundColor: "rgba(0, 0, 0, 0.2)", padding: 20, marginHorizontal: 20, borderRadius: 16 },
    sectionTitle: { color: PALETTE.Branco, fontSize: 22, fontFamily: "BebasNeue", marginBottom: 15, borderLeftWidth: 3, borderLeftColor: PALETTE.LaranjaPrincipal, paddingLeft: 10 },
    inputGroup: { marginBottom: 15, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: 12, minHeight: 55 },
    alignTop: { alignItems: "flex-start" },
    icon: { paddingLeft: 15, paddingRight: 10 },
    input: { flex: 1, paddingVertical: 15, paddingRight: 15, color: PALETTE.Branco, fontSize: 16, fontFamily: "Montserrat_400Regular" },
    value: { flex: 1, paddingVertical: 15, paddingRight: 15, color: PALETTE.Branco, fontSize: 16, fontFamily: "Montserrat_400Regular" },
    multilineInput: { height: 100, textAlignVertical: "top", paddingTop: 15 },
    row: { flexDirection: "row", justifyContent: "space-between" },
    button: { flexDirection: "row", backgroundColor: PALETTE.VerdeAgua, borderRadius: 30, padding: 15, alignItems: "center", justifyContent: "center", marginTop: 20 },
    cancelButton: { backgroundColor: '#e74c3c', marginTop: 10 },
    buttonText: { color: PALETTE.Branco, fontSize: 20, fontFamily: "BebasNeue", marginLeft: 10 },
    pickerText: { paddingVertical: 15, paddingRight: 15, paddingLeft: 0, color: PALETTE.Branco },
    modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0, 0, 0, 0.7)" },
    modalContainer: { backgroundColor: PALETTE.AzulEscuro, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    modalTitle: { color: PALETTE.Branco, fontSize: 22, fontFamily: "BebasNeue", textAlign: "center", marginBottom: 20 },
    clientItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.2)" },
    clientItemText: { color: PALETTE.Branco, fontSize: 16, fontFamily: "Montserrat_400Regular", textAlign: 'center' },
    modalCloseButton: { backgroundColor: PALETTE.LaranjaPrincipal, borderRadius: 25, padding: 15, alignItems: "center", marginTop: 20 },
    modalCloseButtonText: { color: PALETTE.Branco, fontSize: 16, fontFamily: "BebasNeue" },
});

export default DetalhesEventoScreen;

