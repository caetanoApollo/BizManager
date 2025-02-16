import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";

const Dashboard = () => {
  const [fontsLoaded] = useFonts({ BebasNeue: BebasNeue_400Regular });

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient colors={["#2A4D69", "#5D9B9B"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BIZMANAGER</Text>
        <TouchableOpacity onPress={() => router.push("/(screens)/config")}>
          <MaterialCommunityIcons name="cog" size={24} color="#F5F5F5" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          <MaterialCommunityIcons name="folder" size={24} color="#F5F5F5" />{" "}
          NOTAS FISCAIS
        </Text>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Nº NOTA</Text>
          <Text style={styles.tableHeaderText}>DATA DA NOTA</Text>
          <Text style={styles.tableHeaderText}>VALOR TOTAL</Text>
        </View>
        {["NF 01", "NF 02", "NF 03", "NF 04"].map((nota, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableText}>{nota}</Text>
            <Text style={styles.tableText}>25.06.2024</Text>
            <Text style={styles.tableText}>R$ 200,00</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          <MaterialCommunityIcons name="finance" size={24} color="#F5F5F5" />{" "}
          FINANCEIRO
        </Text>
        <View style={styles.contendFinanAgenda}>
        <Text style={styles.agendaFinanText}>FATURAMENTO</Text>
        <Text style={styles.agendaFinanText}>R$ 100.000</Text>
        </View>
        <View style={styles.contendFinanAgenda}>
        <Text style={styles.agendaFinanText}>DESPESAS</Text>
        <Text style={styles.agendaFinanText}>R$ 32.000</Text>
        </View>
        <View style={styles.contendFinanAgenda}>
        <Text style={styles.agendaFinanText}>CAIXA</Text>
        <Text style={styles.agendaFinanText}>R$ 68.000</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          <MaterialCommunityIcons name="calendar" size={24} color="#F5F5F5" />{" "}
          AGENDA
        </Text>
        <View style={styles.contendFinanAgenda}>
          <Text style={styles.agendaFinanText}>REUNIÃO FINANCEIRA</Text>
          <Text style={styles.agendaFinanText}>08:30 AM</Text>
        </View>
        <View style={styles.contendFinanAgenda}>
          <Text style={styles.agendaFinanText}>SERVIÇO FULANO</Text>
          <Text style={styles.agendaFinanText}>13:00 PM</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity>
          <FontAwesome6
            name="boxes-stacked"
            size={25}
            color="#F5F5F5"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(screens)/notaFiscal")}>
          <MaterialCommunityIcons
            name="folder"
            size={30}
            color="#F5F5F5"
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialCommunityIcons name="home" size={30} color="#F5F5F5" />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialCommunityIcons
            name="finance"
            size={30}
            color="#F5F5F5"
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialCommunityIcons name="calendar" size={30} color="#F5F5F5" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center" },
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
  card: {
    width: "80%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 15,
    borderRadius: 10,
    marginTop: 35,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 8, height: 5},
  },
  cardTitle: {
    fontSize: 25,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    paddingBottom: 5,
  },
  tableHeaderText: { fontSize: 20, fontFamily: "BebasNeue", color: "#F5F5F5" },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  tableText: { fontSize: 18, fontFamily: "BebasNeue", color: "#F5F5F5" },
  agendaFinanText: {
    fontSize: 20,
    fontFamily: "BebasNeue",
    color: "#F5F5F5",
    marginTop: 5,
    textAlign: "center",
  },
  contendFinanAgenda: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
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
    shadowOffset: { width: 8, height: 5},
  },
});

export default Dashboard;
