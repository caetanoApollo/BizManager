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
import {
  MaterialCommunityIcons,
  FontAwesome6,
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import { Nav, Header } from "../components/utils";
import { useFonts, BebasNeue_400Regular as BebasNeue } from "@expo-google-fonts/bebas-neue";
import { Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProductsByUserId, deleteProduct } from "../services/api";

const PALETTE = {
  AzulEscuro: "#2A4D69",
  VerdeAgua: "#5D9B9B",
  Branco: "#F5F5F5",
  LaranjaPrincipal: "#F5A623",
  VermelhoErro: "#e74c3c",
  CinzaClaro: "rgba(255, 255, 255, 0.8)",
  FundoCard: "rgba(255, 255, 255, 0.1)",
};

interface Product {
  id: number;
  nome: string;
  quantidade: number;
  quantidade_minima: number;
}

const EstoqueScreen = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular: BebasNeue, Montserrat_400Regular });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const userIdString = await AsyncStorage.getItem('usuario_id');
      if (!userIdString) throw new Error("ID do usuário não encontrado.");
      const usuario_id = Number(userIdString);
      const fetchedProducts = await getProductsByUserId(usuario_id);
      setProducts(fetchedProducts);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível carregar o estoque.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    fetchProducts();
  }, [fetchProducts]));

  const handleDeleteProduct = async (productId: number) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este produto do estoque?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              const userIdString = await AsyncStorage.getItem('usuario_id');
              if (!userIdString) throw new Error("ID do usuário não encontrado.");
              await deleteProduct(productId, Number(userIdString));
              Alert.alert("Sucesso", "Produto excluído com sucesso!");
              fetchProducts();
            } catch (error: any) {
              Alert.alert("Erro", error.message || "Erro ao excluir produto.");
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Product }) => {
    const isLowStock = item.quantidade <= item.quantidade_minima;
    return (
      <View style={styles.card}>
        <View style={[styles.statusIndicator, isLowStock && styles.lowStock]} />
        <View style={styles.cardIcon}>
          <Feather name="box" size={24} color={PALETTE.VerdeAgua} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.nome}</Text>
          <Text style={styles.cardSubtitle}>
            Quantidade: {item.quantidade} {isLowStock ? '(Estoque Baixo)' : ''}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => router.push({ pathname: '/screens/addEstoque', params: { productId: item.id } })}>
            <Ionicons name="pencil-outline" size={22} color={PALETTE.CinzaClaro} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteProduct(item.id)} style={{ marginLeft: 15 }}>
            <Ionicons name="trash-outline" size={22} color={PALETTE.VermelhoErro} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient colors={[PALETTE.AzulEscuro, PALETTE.VerdeAgua]} style={styles.container}>
      <Header />

      <View style={styles.headerSection}>
        <FontAwesome6 name="boxes-stacked" size={30} color={PALETTE.Branco} />
        <Text style={styles.sectionTitle}>ESTOQUE</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={PALETTE.Branco} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 180 }}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum item em estoque.</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/screens/addEstoque")}>
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
  statusIndicator: {
    width: 8,
    height: '100%',
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    top: 0,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  lowStock: {
    backgroundColor: PALETTE.LaranjaPrincipal,
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
    backgroundColor: "#FFA500",
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

export default EstoqueScreen;