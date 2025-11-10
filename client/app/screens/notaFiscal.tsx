/*
 * ARQUIVO: notaFiscal.tsx (Atualizado)
 *
 * O que mudou:
 * 1. Importado `cancelInvoice` em vez de `deleteInvoice`.
 * 2. Atualizada a interface `Invoice` para incluir o `status`.
 * 3. A função `handleDeleteInvoice` foi renomeada (no código) para
 * `handleCancelInvoice` e agora chama `cancelInvoice(invoiceId)`.
 * 4. O ícone de exclusão foi mantido, mas agora aciona o *cancelamento*.
 */
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
import { getInvoices, cancelInvoice } from "../services/api";
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

// Interface atualizada para refletir os dados do novo banco
interface Invoice {
  id: number;
  numero: string;
  razao_social_tomador: string; // Campo novo do DB
  status: string;
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

  // Função atualizada para CANCELAR em vez de DELETAR
  const handleCancelInvoice = async (invoiceId: number) => {
    Alert.alert(
      "Confirmar Cancelamento",
      "Tem certeza que deseja solicitar o cancelamento desta nota fiscal? Esta ação não pode ser desfeita.",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Cancelar Nota",
          onPress: async () => {
            try {
              // Não precisamos mais do 'usuario_id' aqui, o backend resolve pelo token
              await cancelInvoice(invoiceId); // Chama a nova função da API

              Alert.alert("Sucesso", "Solicitação de cancelamento enviada!");
              fetchInvoices(); // Recarrega a lista para mostrar o novo status
            } catch (error: any) {
              Alert.alert("Erro", error.message || "Erro ao cancelar a nota fiscal.");
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
        <Text style={styles.cardTitle}>{item.numero || `ID Interno: ${item.id}`}</Text>
        <Text style={styles.cardSubtitle}>
          {item.razao_social_tomador} {/* Usando o novo campo */}
        </Text>
        <Text style={[styles.cardStatus, getStatusStyle(item.status)]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => router.push({ pathname: '/screens/detalhesNota', params: { invoiceId: item.id } })}>
          <AntDesign name="info-circle" size={22} color={PALETTE.CinzaClaro} />
        </TouchableOpacity>
        {/* O botão de "delete" agora chama o cancelamento */}
        {item.status !== 'cancelado' && ( // Só mostra se não estiver cancelada
          <TouchableOpacity onPress={() => handleCancelInvoice(item.id)} style={{ marginLeft: 15 }}>
            <MaterialIcons name="cancel" size={22} color={PALETTE.VermelhoErro} />
          </TouchableOpacity>
        )}
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

// Função auxiliar para colorir o status
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'autorizado':
      return { color: '#2ecc71' }; // Verde
    case 'processando':
    case 'processando_autorizacao':
      return { color: '#f1c40f' }; // Amarelo
    case 'erro':
    case 'erro_autorizacao':
    case 'cancelado':
      return { color: '#e74c3c' }; // Vermelho
    default:
      return { color: PALETTE.CinzaClaro };
  }
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
  cardStatus: {
    fontSize: 12,
    fontFamily: "Montserrat_400Regular",
    fontWeight: 'bold',
    marginTop: 4,
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