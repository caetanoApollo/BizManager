import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { Nav, addButton, Header } from "../components/utils";

const eventos = [
    {
        id: "1",
        titulo: "REUNIÃO FINANCEIRA",
        horario: "08:30 AM",
        data: "11.11.24",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
    },
    {
        id: "2",
        titulo: "SERVIÇO FULANO",
        horario: "13:00 PM",
        data: "11.11.24",
        descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
    },
];

const AgendaScreen = () => {
    return (
        <LinearGradient colors={["#2A4D69", "#5D9B9B"]} style={styles.container}>
            <View style={styles.container}>
                <Header />

                <View style={styles.header}>
                    <MaterialIcons name="event" size={30} color="#f5f5f5" />
                    <Text style={styles.title}>AGENDA</Text>
                </View>

                <FlatList
                    data={eventos}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    renderItem={({ item }) => (
                        <View style={styles.eventoContainer}>
                            <View style={styles.eventoHeader}>
                                <Text style={styles.eventoTitulo}>{item.titulo}</Text>
                                <Text style={styles.eventoHorario}>{item.horario}</Text>
                            </View>
                            <Text style={styles.eventoData}>{item.data}</Text>
                            <Text style={styles.eventoDescricao}>{item.descricao}</Text>
                            <View style={styles.separator} />
                        </View>
                    )}
                />

                {addButton({ activeRoute: "/screens/addEvento" })}
                <Nav style={styles.nav} />
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        paddingTop: 40,
    },
    nav:{
        position: "absolute",
        bottom: 45,
        left: 20,
    },
    title: {
        color: "#f5f5f5",
        fontSize: 35,
        fontFamily: "BebasNeue",
        marginLeft: 15,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    eventoContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    eventoHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    eventoTitulo: {
        color: "#f5f5f5",
        fontSize: 20,
        fontFamily: "BebasNeue",
        flex: 2,
    },
    eventoHorario: {
        color: "#f5f5f5",
        fontSize: 18,
        fontFamily: "BebasNeue",
    },
    eventoData: {
        color: "#ccc",
        fontSize: 16,
        marginBottom: 10,
    },
    eventoDescricao: {
        color: "#f5f5f5",
        fontSize: 14,
        lineHeight: 20,
    },
    separator: {
        height: 1,
        backgroundColor: "#5D9B9B",
        marginVertical: 15,
    },
});

export default AgendaScreen;