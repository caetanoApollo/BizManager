import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Header, Nav } from "../components/utils";

const NovoEventoScreen = () => {
    const router = useRouter();
    const [titulo, setTitulo] = useState("");
    const [data, setData] = useState("");
    const [horario, setHorario] = useState("");
    const [descricao, setDescricao] = useState("");

    const handleSalvar = () => {
        if (!titulo || !data || !horario) {
            Alert.alert("Erro", "Preencha todos os campos obrigatórios");
            return;
        }

        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
            Alert.alert("Erro", "Data inválida (DD/MM/AAAA)");
            return;
        }

        if (!/^\d{2}:\d{2}$/.test(horario)) {
            Alert.alert("Erro", "Horário inválido (HH:MM)");
            return;
        }

        Alert.alert("Sucesso", `Evento salvo com sucesso!\nData: ${data}\nHorário: ${horario}`);
        router.back();
    };

    const formatDate = (text: string) => {
        const cleaned = text.replace(/\D/g, "");
        return cleaned
            .replace(/(\d{2})(\d)/, "$1/$2")
            .replace(/(\d{2})(\d)/, "$1/$2")
            .slice(0, 10);
    };

    const formatTime = (text: string) => {
        const cleaned = text.replace(/\D/g, "");
        return cleaned
            .replace(/(\d{2})(\d)/, "$1:$2")
            .slice(0, 5);
    };

    return (
        <LinearGradient colors={["#2A4D69", "#5D9B9B"]} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Header />

                <View style={styles.header}>
                    <MaterialIcons name="arrow-back" size={30} color="#fff" onPress={() => router.back()} />
                    <MaterialIcons name="event" size={30} color="#f5f5f5" />
                    <Text style={styles.title}>NOVO EVENTO</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Título:</Text>
                        <TextInput
                            style={styles.input}
                            value={titulo}
                            onChangeText={setTitulo}
                            placeholder="Digite o título"
                            placeholderTextColor="#ccc"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>Data:</Text>
                            <TextInput
                                style={styles.input}
                                value={data}
                                onChangeText={(text) => setData(formatDate(text))}
                                placeholder="DD/MM/AAAA"
                                placeholderTextColor="#ccc"
                                keyboardType="numeric"
                                maxLength={10}
                            />
                        </View>

                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Horário:</Text>
                            <TextInput
                                style={styles.input}
                                value={horario}
                                onChangeText={(text) => setHorario(formatTime(text))}
                                placeholder="HH:MM"
                                placeholderTextColor="#ccc"
                                keyboardType="numeric"
                                maxLength={5}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Descrição:</Text>
                        <TextInput
                            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
                            value={descricao}
                            onChangeText={setDescricao}
                            placeholder="Digite a descrição"
                            placeholderTextColor="#ccc"
                            multiline
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSalvar}>
                        <Text style={styles.buttonText}>Salvar Evento</Text>
                    </TouchableOpacity>
                </View>

                <Nav style={styles.nav} />
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContainer: { flexGrow: 1, paddingBottom: 100 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 20,
        paddingTop: 40,
    },
    nav: {
        position: "absolute",
        bottom: 45,
        left: 20,
    },
    title: {
        color: "#fff",
        fontSize: 25,
        fontFamily: "BebasNeue",
    },
    formContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        padding: 15,
        margin: 20,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 8, height: 5 },
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: "#fff",
        fontSize: 20,
        fontFamily: "BebasNeue",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 8,
        padding: 12,
        color: "#fff",
        fontSize: 18,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    button: {
        backgroundColor: "#5D9B9B",
        borderRadius: 25,
        padding: 15,
        alignItems: "center",
        marginTop: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 20,
        fontFamily: "BebasNeue",
    },
});

export default NovoEventoScreen;