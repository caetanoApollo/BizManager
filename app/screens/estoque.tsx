import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";
import {
  MaterialIcons,
  FontAwesome6,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Nav, addButton, Header } from "../components/utils";

const invoices = [
  { id: "1", quant: "12", item: "Camiseta" },
  { id: "2", quant: "15", item: "Camiseta" },
  { id: "3", quant: "25", item: "Camiseta" },
  { id: "4", quant: "14", item: "Camiseta" },
];

const InvoiceScreen = () => {
  return (
    <LinearGradient colors={["#2A4D69", "#5D9B9B"]} style={styles.container}>
      <View style={styles.container}>

        <Header />

        <View style={styles.section}>
          <View style={{ flexDirection: "row", alignItems: "center", marginRight: "40%" }}>
            <FontAwesome6 name="boxes-stacked" size={30} color="#fff" />
            <Text style={styles.sectionTitle}>ESTOQUE</Text>
          </View>
        </View>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Quantidade</Text>
            <Text style={styles.tableHeaderText}>Item</Text>
          </View>
          <FlatList
            data={invoices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.quant}</Text>
                <Text style={styles.tableCell}>{item.item}</Text>
              </View>
            )}
          />
        </View>

        {addButton({ activeRoute: "/screens/addEstoque" })}

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
  tableContainer: {
    width: 300,
    height: 430,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 8, height: 5 },
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    paddingBottom: 5,
  },
  tableHeaderText: {
    fontFamily: "BebasNeue",
    fontSize: 25,
    fontWeight: "bold",
    color: "#fff",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  tableCell: {
    fontFamily: "BebasNeue",
    fontSize: 20,
    color: "#fff",
  }
});

export default InvoiceScreen;
