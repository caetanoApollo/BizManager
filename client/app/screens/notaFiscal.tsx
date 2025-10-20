import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { useFonts, BebasNeue_400Regular as BebasNeue } from "@expo-google-fonts/bebas-neue";
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { Nav, Header } from "../components/utils";
import { getInvoices } from "../services/api"; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const PALETTE = {
  AzulEscuro: "#2A4D69",
  VerdeAgua: "#5D9B9B",
  Branco: "#F5F5F5",
  LaranjaPrincipal: "#F5A623",
  VermelhoErro: "#e74c3c",
  CinzaClaro: "rgba(255, 255, 255, 0.8)",
  FundoCard: "rgba(255, 255, 255, 0.1)",
};

interface Invoice {
  id: number;
  numero: string;
  tomador_razao_social: string;
}

const InvoiceScreen = () => {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular: BebasNeue, Montserrat_400Regular });

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const userIdString = await AsyncStorage.getItem('usuario_id');
      if (!userIdString) throw new Error("ID do usuário não encontrado.");
      const usuario_id = Number(userIdString);
      const fetchedInvoices = await getInvoices(usuario_id); 
      setInvoices(fetchedInvoices);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível carregar as notas fiscais.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    fetchInvoices();
  }, [fetchInvoices]));

  const handleDeleteInvoice = async (invoiceId: number) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir esta nota fiscal?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              const userIdString = await AsyncStorage.getItem('usuario_id');
              if (!userIdString) throw new Error("ID do usuário não encontrado.");
              Alert.alert("Sucesso", "Nota Fiscal excluída com sucesso!");
              fetchInvoices();
            } catch (error: any) {
              Alert.alert("Erro", error.message || "Erro ao excluir a nota fiscal.");
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Invoice }) => (
    <View style={styles.card}>
      <View style={styles.cardIcon}>
        <MaterialIcons name="folder" size={24} color={PALETTE.VerdeAgua} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.numero}</Text>
        <Text style={styles.cardSubtitle}>
          Tomador: {item.tomador_razao_social}
        </Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => router.push({ pathname:'/screens/detalhesNota', params: { invoiceId: item.id } })}>
          <AntDesign name="info-circle" size={22} color={PALETTE.CinzaClaro} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteInvoice(item.id)} style={{ marginLeft: 15 }}>
          <MaterialIcons name="delete-outline" size={22} color={PALETTE.VermelhoErro} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]} style={styles.container}>
      <Header />
      <View style={styles.headerSection}>
        <MaterialIcons name="folder" size={30} color={PALETTE.Branco} />
        <Text style={styles.sectionTitle}>NOTAS FISCAIS</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={PALETTE.Branco} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 180 }}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma nota fiscal emitida.</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/screens/addNota")}>
        <MaterialIcons name="add" size={30} color={PALETTE.Branco} />
      </TouchableOpacity>

      <Nav style={styles.navBar} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    width: '90%',
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 15,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontFamily: "BebasNeue_400Regular",
    color: PALETTE.Branco,
    marginLeft: 10,
    fontSize: 35,
  },
  card: {
    backgroundColor: PALETTE.FundoCard,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: '5%',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    marginRight: 15,
    backgroundColor: 'rgba(93, 155, 155, 0.2)',
    padding: 10,
    borderRadius: 50,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: PALETTE.Branco,
    fontSize: 16,
    fontFamily: "Montserrat_400Regular",
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: PALETTE.CinzaClaro,
    fontSize: 14,
    fontFamily: "Montserrat_400Regular",
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 16,
    color: PALETTE.CinzaClaro,
  },
  addButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: PALETTE.LaranjaPrincipal,
    borderRadius: 16,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  navBar: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
});

export default InvoiceScreen;