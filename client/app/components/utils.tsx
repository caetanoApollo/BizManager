import React from "react";
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Text,
} from "react-native";
import {
    FontAwesome6,
    MaterialCommunityIcons,
    MaterialIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { useRouter } from "expo-router";

interface NavProps {
    style?: object;
    iconSize?: number;
    iconColor?: string;
    activeRoute?: string;
}

interface HeaderProps {
    title?: string;
}

const addButton = ({
    style = {},
    iconSize = 20,
    iconColor = "#F5F5F5",
    activeRoute = "",
}) => {
    const isActive = (route: string) => activeRoute === route;

    return (
        <TouchableOpacity style={[styles.addButton, style]} onPress={() => router.push(activeRoute as any)}>
            <FontAwesome6
                name="plus"
                size={iconSize}
                color={isActive("/add") ? "#FFFFFF" : iconColor}
            />
        </TouchableOpacity>
    );
}

const Nav: React.FC<NavProps> = ({
    style = {},
    iconSize = 30,
    iconColor = "#F5F5F5",
    activeRoute = "",
}) => {
    const isActive = (route: string) => activeRoute === route;

    return (
        <View style={[styles.footer, style]}>
            <TouchableOpacity onPress={() => router.push("/screens/estoque")}>
                <FontAwesome6
                    name="boxes-stacked"
                    size={iconSize - 5}
                    color={isActive("/boxes") ? "#FFFFFF" : iconColor}
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/screens/notaFiscal")}>
                <MaterialCommunityIcons
                    name="folder"
                    size={iconSize}
                    color={isActive("/folder") ? "#FFFFFF" : iconColor}
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/screens/main")}>
                <MaterialCommunityIcons
                    name="home"
                    size={iconSize}
                    color={isActive("/main") ? "#FFFFFF" : iconColor}
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/screens/financeiro")}>
                <MaterialCommunityIcons
                    name="finance"
                    size={iconSize}
                    color={isActive("/finance") ? "#FFFFFF" : iconColor}
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/screens/agenda")}>
                <MaterialCommunityIcons
                    name="calendar"
                    size={iconSize}
                    color={isActive("/calendar") ? "#FFFFFF" : iconColor}
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/screens/clientes")}>
                <MaterialCommunityIcons
                    name="account-group" 
                    size={iconSize}
                    color={isActive("/screens/clientes") ? "#FFFFFF" : iconColor}
                />
            </TouchableOpacity>
        </View>
    );
};

const Header: React.FC<HeaderProps> = ({ title = "BIZMANAGER" }) => {
    const router = useRouter();

    return (
        <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
                onPress={() => router.push("/screens/config")}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
                <MaterialCommunityIcons name="cog" size={24} color="#F5F5F5" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        width: "90%",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 60,
        padding: 10,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 8, height: 5 },
    },
    addButton: {
        position: "absolute",
        bottom: 80,
        right: 20,
        marginBottom: 30,
        backgroundColor: "#FFA500",
        borderRadius: 50,
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        paddingTop: 50,
        backgroundColor: "#2A4D69",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        width: "100%",
    },
    title: {
        marginLeft: 85,
        fontSize: 50,
        fontFamily: "BebasNeue",
        color: "#F5F5F5",
        letterSpacing: 1.5,
    },
});

export { Nav, addButton, Header };