/*
 * ARQUIVO: addNota.tsx (Corrigido)
 *
 * O que mudou:
 * 1. CORRIGIDO: Erro de sintaxe no `useEffect` (bloco `catch` agora tem chaves {}).
 * 2. CORRIGIDO: A `interface Cliente` foi atualizada para incluir todos os
 * campos de endereço (cnpj, endereco_logradouro, etc.) do banco de dados.
 * 3. CORRIGIDO: A função `handleSelectClient` agora preenche
 * corretamente *todos* os campos de endereço do Tomador.
 */
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, KeyboardAvoidingView, ActivityIndicator, Modal, FlatList } from "react-native";
import { MaterialIcons, AntDesign, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header, Nav } from "../components/utils";
// Importa a nova função createInvoice
import { getUserProfile, getClients, createInvoice } from "../services/api";

const PALETTE = {
    LaranjaPrincipal: "#F5A623",
    LaranjaSecundario: "#FFBC42",
    VerdeAgua: "#5D9B9B",
    AzulEscuro: "#2A4D69",
    Branco: "#F5F5F5",
    CinzaClaro: "#ccc",
    FundoCard: "rgba(255, 255, 255, 0.1)",
};

interface Endereco {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    codigo_municipio: string;
    uf: string;
    cep: string;
}

interface Tomador {
    cnpj: string;
    razao_social: string;
    email: string;
    endereco: Endereco;
}

interface Prestador {
    cnpj: string;
    inscricao_municipal: string;
    codigo_municipio: string;
}

interface Servico {
    aliquota: number;
    discriminacao: string;
    iss_retido: boolean;
    item_lista_servico: string;
    codigo_tributario_municipio: string;
    valor_servicos: number; // Propriedade adicionada para o payload final
}

// ===================================================================
// INTERFACE CLIENTE ATUALIZADA (CORREÇÃO)
// ===================================================================
interface Cliente {
    id: number;
    nome: string;
    email?: string;
    telefone?: string;
    cnpj?: string;
    endereco_logradouro?: string;
    endereco_numero?: string;
    endereco_complemento?: string;
    endereco_bairro?: string;
    endereco_cep?: string;
    endereco_uf?: string;
    endereco_codigo_municipio?: string;
}

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

const formatCpfCnpj = (value: string) => {
    const cleanedValue = value.replace(/\D/g, "");
    let formatted = cleanedValue;

    if (cleanedValue.length <= 11) {
        formatted = cleanedValue;
        if (cleanedValue.length > 3) formatted = formatted.replace(/^(\d{3})(\d)/, "$1.$2");
        if (cleanedValue.length > 6) formatted = formatted.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
        if (cleanedValue.length > 9) formatted = formatted.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
        return formatted.slice(0, 14);
    }

    if (cleanedValue.length > 11) {
        formatted = cleanedValue;
        if (cleanedValue.length > 2) formatted = formatted.replace(/^(\d{2})(\d)/, "$1.$2");
        if (cleanedValue.length > 5) formatted = formatted.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        if (cleanedValue.length > 8) formatted = formatted.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4");
        if (cleanedValue.length > 12) formatted = formatted.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
        return formatted.slice(0, 18);
    }

    return formatted;
};

const formatCEP = (value: string = "") => {
    return value
        .replace(/\D/g, "")
        .replace(/^(\d{5})(\d)/, "$1-$2")
        .slice(0, 9);
};


const AddNotaPage: React.FC = () => {
    const router = useRouter();
    const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular, Montserrat: Montserrat_400Regular });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const todayDateFormatted = new Date().toLocaleDateString('pt-BR');
    const [dataEmissao, setDataEmissao] = useState(todayDateFormatted);
    const [valorServico, setValorServico] = useState(formatCurrencyForDisplay(0));
    const [aliquotaInput, setAliquotaInput] = useState('0');

    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [clienteTomadorId, setClienteTomadorId] = useState<number | null>(null);
    const [clienteNomeTomador, setClienteNomeTomador] = useState("Selecione um cliente...");
    const [modalClientesVisible, setModalClientesVisible] = useState(false);


    // O prestador é carregado do perfil, mas não é mais enviado no payload
    // O backend irá buscá-lo com base no token de autenticação
    const [prestador, setPrestador] = useState<Prestador>({ cnpj: '', inscricao_municipal: '', codigo_municipio: '' });

    const [tomador, setTomador] = useState<Tomador>({
        cnpj: '', razao_social: '', email: '',
        endereco: { logradouro: '', numero: '', complemento: '', bairro: '', codigo_municipio: '', uf: '', cep: '' }
    });
    const [servico, setServico] = useState<Omit<Servico, 'valor_servicos'>>({
        aliquota: 0,
        discriminacao: '',
        iss_retido: false,
        item_lista_servico: '',
        codigo_tributario_municipio: '',
    });

    // ===================================================================
    // BLOCO UseEffect CORRIGIDO (com chaves no catch)
    // ===================================================================
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const usuarioIdString = await AsyncStorage.getItem('usuario_id');
                if (!usuarioIdString) throw new Error("ID do usuário não encontrado.");
                const usuario_id = parseInt(usuarioIdString, 10);

                const userProfile = await getUserProfile(usuario_id);
                // Apenas guardamos para referência, não será enviado
                setPrestador({
                    cnpj: userProfile.cnpj || '',
                    inscricao_municipal: userProfile.inscricao_municipal || '',
                    codigo_municipio: userProfile.codigo_municipio || '',
                });

                const clientList = await getClients(usuario_id);
                setClientes(clientList);

            } catch (error: any) { // <--- CHAVE ADICIONADA
                Alert.alert("Erro ao carregar dados", error.message);
            } // <--- CHAVE ADICIONADA
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ===================================================================
    // FUNÇÃO handleSelectClient CORRIGIDA
    // ===================================================================
    const handleSelectClient = (cliente: Cliente) => {
        setClienteTomadorId(cliente.id);
        setClienteNomeTomador(cliente.nome);

        // Preenche os dados do Tomador com base no cliente selecionado
        setTomador(prev => ({
            ...prev,
            razao_social: cliente.nome,
            cnpj: formatCpfCnpj(cliente.cnpj || ''),
            email: cliente.email || '',
            endereco: {
                ...prev.endereco,
                logradouro: cliente.endereco_logradouro || '',
                numero: cliente.endereco_numero || '',
                complemento: cliente.endereco_complemento || '',
                bairro: cliente.endereco_bairro || '',
                cep: formatCEP(cliente.endereco_cep || ''),
                uf: cliente.endereco_uf || '',
                codigo_municipio: cliente.endereco_codigo_municipio || ''
            }
        }));

        setModalClientesVisible(false);
    };

    const handleValorChange = (text: string) => {
        const formatted = formatCurrencyForInput(text);
        setValorServico(formatted);
    };

    const handleCpfCnpjChange = (text: string) => {
        setTomador(t => ({ ...t, cnpj: formatCpfCnpj(text) }));
    };

    const handleAliquotaChange = (text: string) => {
        let cleaned = text.replace(/[^\d,.]/g, '');

        setAliquotaInput(cleaned);

        const normalized = cleaned.replace(',', '.');
        const floatValue = parseFloat(normalized) || 0;

        setServico(s => ({ ...s, aliquota: floatValue }));
    };

    // ===================================================================
    // FUNÇÃO handleSalvarNota (Esta função está correta, mas depende da api.ts)
    // ===================================================================
    const handleSalvarNota = async () => {
        // 1. Validação de dados (igual ao seu código)
        const valorNumerico = parseFloat(valorServico.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
        if (!tomador.razao_social || tomador.cnpj.replace(/\D/g, '').length < 11 || valorNumerico <= 0 || !dataEmissao) {
            Alert.alert("Erro", "Campos obrigatórios (Tomador, CPF/CNPJ válido, Valor e Data) não preenchidos corretamente.");
            return;
        }

        const [dia, mes, ano] = dataEmissao.split('/');
        if (!dia || !mes || !ano || dia.length !== 2 || mes.length !== 2 || ano.length !== 4) {
            Alert.alert("Erro", "Formato de data de emissão inválido. Use DD/MM/AAAA.");
            return;
        }
        // Formato YYYY-MM-DD exigido pela API e pelo banco
        const formattedData = `${ano}-${mes}-${dia}`;

        setSaving(true);
        try {
            // Não precisamos mais do usuarioIdString aqui, o backend pega do token

            // 2. Montar o payload do serviço
            const servicoCompleto: Servico = {
                ...servico,
                valor_servicos: valorNumerico,
            };

            // 3. Montar o payload da nota
            const notaFiscalData = {
                data_emissao: formattedData,
                cliente_id: clienteTomadorId || undefined,
                tomador: {
                    ...tomador,
                    // O backend limpará o CNPJ, mas podemos enviar limpo se quisermos
                    // cnpj: tomador.cnpj.replace(/\D/g, '') 
                },
                servico: servicoCompleto
            };

            // 4. Chamar a API
            console.log("Enviando dados da NF-e:", notaFiscalData);
            // (Cast para 'any' para simplificar, ajuste as interfaces em api.ts se preferir)
            const apiResult = await createInvoice(notaFiscalData as any);
            console.log("Resposta da API:", apiResult);

            // 5. Tratar resposta
            let title = "Sucesso!";
            let message = `Nota Fiscal ${apiResult.numero || ''} autorizada com sucesso!`;

            if (apiResult.status === 'processando_autorizacao') {
                title = "Processando";
                message = "Sua nota fiscal foi enviada e está sendo processada. O status será atualizado em breve.";
            } else if (apiResult.status === 'erro_autorizacao' || apiResult.status === 'erro') {
                title = "Erro na Nota";
                message = `Houve um erro: ${apiResult.mensagem_sefaz || apiResult.message || 'Erro desconhecido.'}`;
            }

            Alert.alert(title, message);
            router.push("/screens/notaFiscal");

        } catch (error: any) {
            console.error("Erro ao salvar Nota Fiscal:", error);
            // `error.message` aqui virá do `apiFetch` (que já extrai o erro do JSON)
            Alert.alert(
                "Erro ao Enviar Nota",
                `Falha ao enviar nota fiscal: ${error.message}. Verifique seus dados fiscais no Perfil.`
            );
        } finally {
            setSaving(false);
        }
    };


    if (!fontsLoaded || loading) {
        return (
            <LinearGradient colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]} style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={PALETTE.Branco} />
            </LinearGradient>
        );
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <LinearGradient colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]} style={styles.container}>
                <Header />
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <View style={styles.headerSection}>
                        <AntDesign name="arrow-left" size={30} color={PALETTE.Branco} onPress={() => router.back()} />
                        <MaterialIcons name="folder" size={30} color={PALETTE.Branco} />
                        <Text style={styles.sectionTitle}>Nova Nota Fiscal</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Cliente (Tomador)</Text>

                        {/* NOVO SELETOR DE CLIENTES SIMULANDO INPUT COM PLACEHOLDER */}
                        <TouchableOpacity
                            style={styles.inputGroup}
                            onPress={() => setModalClientesVisible(true)}
                        >
                            <Feather name="user" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                            <Text
                                style={[
                                    styles.input,
                                    styles.pickerText,
                                    !clienteTomadorId && styles.placeholderText
                                ]}
                            >
                                {clienteNomeTomador}
                            </Text>
                        </TouchableOpacity>


                        <Text style={styles.sectionHeading}>Data de Emissão</Text>
                        <View style={styles.inputGroup}>
                            <Feather name="calendar" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={dataEmissao}
                                onChangeText={(text) => setDataEmissao(formatDate(text))}
                                placeholder="DD/MM/AAAA"
                                placeholderTextColor={PALETTE.CinzaClaro}
                                keyboardType="numeric"
                                maxLength={10}
                            />
                        </View>


                        <Text style={styles.sectionHeading}>Dados do Tomador</Text>
                        <View style={styles.inputGroup}>
                            <Feather name="user" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={tomador.razao_social}
                                onChangeText={text => setTomador(t => ({ ...t, razao_social: text }))}
                                placeholder="Razão Social"
                                placeholderTextColor={PALETTE.CinzaClaro}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Feather name="hash" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={tomador.cnpj}
                                onChangeText={handleCpfCnpjChange}
                                placeholder="CNPJ ou CPF"
                                placeholderTextColor={PALETTE.CinzaClaro}
                                keyboardType="numeric"
                                maxLength={18}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Feather name="mail" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={tomador.email}
                                onChangeText={text => setTomador(t => ({ ...t, email: text }))}
                                placeholder="Email"
                                placeholderTextColor={PALETTE.CinzaClaro}
                                keyboardType="email-address"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Feather name="map-pin" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={tomador.endereco.logradouro}
                                onChangeText={text => setTomador(t => ({ ...t, endereco: { ...t.endereco, logradouro: text } }))}
                                placeholder="Logradouro"
                                placeholderTextColor={PALETTE.CinzaClaro}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Feather name="home" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={tomador.endereco.numero}
                                onChangeText={text => setTomador(t => ({ ...t, endereco: { ...t.endereco, numero: text } }))}
                                placeholder="Número"
                                placeholderTextColor={PALETTE.CinzaClaro}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Feather name="layers" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={tomador.endereco.bairro}
                                onChangeText={text => setTomador(t => ({ ...t, endereco: { ...t.endereco, bairro: text } }))}
                                placeholder="Bairro"
                                placeholderTextColor={PALETTE.CinzaClaro}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Feather name="send" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={tomador.endereco.cep}
                                onChangeText={text => setTomador(t => ({ ...t, endereco: { ...t.endereco, cep: formatCEP(text) } }))}
                                placeholder="CEP"
                                placeholderTextColor={PALETTE.CinzaClaro}
                                keyboardType="numeric"
                                maxLength={9}
                            />
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Feather name="map" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    value={tomador.endereco.uf}
                                    onChangeText={text => setTomador(t => ({ ...t, endereco: { ...t.endereco, uf: text.toUpperCase() } }))}
                                    placeholder="UF"
                                    placeholderTextColor={PALETTE.CinzaClaro}
                                    maxLength={2}
                                    autoCapitalize="characters"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Feather name="map" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    value={tomador.endereco.codigo_municipio}
                                    onChangeText={text => setTomador(t => ({ ...t, endereco: { ...t.endereco, codigo_municipio: text } }))}
                                    placeholder="Cód. Município"
                                    placeholderTextColor={PALETTE.CinzaClaro}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>


                        <Text style={styles.sectionHeading}>Dados do Serviço</Text>
                        <View style={styles.inputGroup}>
                            <Feather name="dollar-sign" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={valorServico}
                                onChangeText={handleValorChange}
                                placeholder="Valor dos Serviços"
                                placeholderTextColor={PALETTE.CinzaClaro}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.inputGroup, styles.alignTop]}>
                            <Feather name="file-text" size={20} color={PALETTE.CinzaClaro} style={[styles.icon, { paddingTop: 12 }]} />
                            <TextInput
                                style={[styles.input, styles.multilineInput]}
                                value={servico.discriminacao}
                                onChangeText={text => setServico(s => ({ ...s, discriminacao: text }))}
                                placeholder="Discriminação do Serviço"
                                placeholderTextColor={PALETTE.CinzaClaro}
                                multiline
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Feather name="percent" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={aliquotaInput}
                                onChangeText={handleAliquotaChange}
                                placeholder="Alíquota (%)"
                                placeholderTextColor={PALETTE.CinzaClaro}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Feather name="list" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={servico.item_lista_servico}
                                onChangeText={text => setServico(s => ({ ...s, item_lista_servico: text }))}
                                placeholder="Item da Lista de Serviço"
                                placeholderTextColor={PALETTE.CinzaClaro}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Feather name="map" size={20} color={PALETTE.CinzaClaro} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={servico.codigo_tributario_municipio}
                                onChangeText={text => setServico(s => ({ ...s, codigo_tributario_municipio: text }))}
                                placeholder="Código Tributário do Município"
                                placeholderTextColor={PALETTE.CinzaClaro}
                            />
                        </View>

                        <TouchableOpacity style={styles.button} onPress={handleSalvarNota} disabled={saving}>
                            {saving ? (
                                <ActivityIndicator color={PALETTE.Branco} />
                            ) : (
                                <>
                                    <Feather name="check-circle" size={20} color={PALETTE.Branco} />
                                    <Text style={styles.buttonText}>Salvar Nota</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                    <Nav style={{ marginLeft: 20 }} />
                </ScrollView>
            </LinearGradient>

            <Modal
                visible={modalClientesVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalClientesVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Selecione um Cliente</Text>
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
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setModalClientesVisible(false)}
                        >
                            <Text style={styles.modalCloseButtonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

// --- ESTILOS (permanecem os mesmos) ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContainer: { flexGrow: 1, paddingBottom: 100 },
    headerSection: {
        width: '90%',
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 10,
        paddingBottom: 15,
        alignSelf: 'center',
        gap: 10,
    },
    sectionTitle: {
        fontFamily: "BebasNeue_400Regular",
        color: PALETTE.Branco,
        fontSize: 35,
    },
    formContainer: {
        width: "90%",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        borderRadius: 16,
        padding: 20,
        alignSelf: 'center',
    },
    sectionHeading: {
        fontFamily: "BebasNeue_400Regular",
        color: PALETTE.Branco,
        fontSize: 22,
        marginTop: 15,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: PALETTE.LaranjaPrincipal,
        paddingLeft: 10,
    },
    label: {
        color: PALETTE.Branco,
        fontSize: 20,
        fontFamily: "BebasNeue_400Regular",
        marginBottom: 5,
    },
    inputGroup: {
        marginBottom: 20,
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
    pickerText: {
        paddingVertical: 15,
        paddingRight: 15,
        color: PALETTE.Branco,
        fontSize: 16,
        fontFamily: "Montserrat_400Regular",
    },
    placeholderText: {
        color: PALETTE.CinzaClaro,
    },
    multilineInput: { height: 100, textAlignVertical: "top", paddingTop: 15 },
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
        fontFamily: "BebasNeue_400Regular",
        marginLeft: 10,
    },
    row: { flexDirection: "row", justifyContent: "space-between" },
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
        fontFamily: "BebasNeue_400Regular",
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
        textAlign: "center",
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
        fontFamily: "BebasNeue_400Regular",
    },
    emptyText: { color: PALETTE.CinzaClaro, textAlign: "center", marginTop: 20, fontFamily: "Montserrat_400Regular" },
});

export default AddNotaPage;