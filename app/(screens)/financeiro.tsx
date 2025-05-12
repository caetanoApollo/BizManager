import React from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
} from "react-native";
import {
    MaterialIcons,
    MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Nav, addButton, Header } from "../components/utils";

const FinanceScreen = () => {
    return (
        <LinearGradient colors={["#2A4D69", "#5D9B9B"]} style={styles.container}>
            <View style={styles.container}>

                <Header />

                <View style={styles.section}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginRight: "50%" }}>
                        <MaterialCommunityIcons name="finance" size={30} color="#fff" />
                        <Text style={styles.sectionTitle}>FINANCEIRO</Text>
                    </View>
                </View>
                <View style={styles.boxContainer}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.textContainer}>Caixa:</Text>
                        <Text style={styles.textValue}>R$ 0,00</Text>
                    </View>
                </View>
                <View style={styles.boxContainer}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.textContainer}>Faturamento:</Text>
                        <Text style={styles.textValue}>R$ 0,00</Text>
                    </View>
                </View>
                <View style={styles.boxContainer}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.textContainer}>Despesas:</Text>
                        <Text style={styles.textValue}>R$ 0,00</Text>
                    </View>
                </View>

                {addButton({activeRoute: "/(screens)/addFinan"})}

                <Nav style={{ marginTop: 125 }} />
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        paddingVertical: 20,
        paddingTop: 50,
        backgroundColor: "#2A4D69",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        width: "100%",
    },
    title: {
        fontSize: 50,
        fontFamily: "BebasNeue",
        color: "#F5F5F5",
        marginLeft: 90,
    },
    section: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 20,
    },
    sectionTitle: {
        fontFamily: "BebasNeue",
        padding: 10,
        color: "#fff",
        marginLeft: 5,
        fontSize: 35,
    },
    boxContainer: {
        marginTop: 20,
        width: 300,
        height: 120,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 8, height: 5 },
    },
    titleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 5,
    },
    textContainer: {
        fontFamily: "BebasNeue",
        fontSize: 40,
        fontWeight: "bold",
        color: "#fff",
    },
    textValue: {
        marginTop: "18%",
        fontFamily: "BebasNeue",
        fontSize: 40,
        fontWeight: "bold",
        color: "#fff",
    },
});

export default FinanceScreen;
