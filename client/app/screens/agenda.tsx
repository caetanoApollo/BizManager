import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  GestureResponderEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { Nav, addButton, Header } from '../components/utils';
import { getScheduledServices, deleteScheduledService } from '../services/api';

// Interface para tipar os eventos, com ID como número
interface Evento {
  id: number;
  titulo: string;
  horario: string;
  data: string;
  descricao: string;
  nome_cliente: string | null;
  status: 'agendado' | 'concluido' | 'cancelado';
}

const AgendaScreen = () => {
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar eventos
  const fetchEventos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getScheduledServices();
      setEventos(data); 
    } catch (error: any) {
      Alert.alert('Erro ao buscar eventos', error.message || 'Não foi possível carregar a agenda.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEventos();
    }, [fetchEventos])
  );

  // Navega para a tela de edição
  const handleEdit = (eventoId: number) => {
    router.push({ pathname: "/screens/detalhesEventos", params: { id: eventoId, edit: "true" } });
  };

  // Exibe um alerta de confirmação antes de excluir
  const handleDelete = (eventoId: number) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Você tem certeza que deseja excluir este agendamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteScheduledService(eventoId);
              Alert.alert('Sucesso', 'Agendamento excluído com sucesso.');
              fetchEventos();
            } catch (error: any)
{
              Alert.alert('Erro', error.message || 'Não foi possível excluir o agendamento.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'concluido':
        return styles.statusConcluido;
      case 'cancelado':
        return styles.statusCancelado;
      default:
        return styles.statusAgendado;
    }
  };

  const renderItem = ({ item }: { item: Evento }) => {
    const onEditPress = (e: GestureResponderEvent) => {
        e.stopPropagation();
        handleEdit(item.id);
    };
    const onDeletePress = (e: GestureResponderEvent) => {
        e.stopPropagation();
        handleDelete(item.id);
    };

    return (
        <TouchableOpacity onPress={() => router.push({ pathname: "/screens/detalhesEventos", params: { id: item.id } })} style={styles.eventoContainer}>
            <View style={[styles.statusIndicator, getStatusStyle(item.status)]} />
            <View style={styles.eventoInfo}>
                <View style={styles.eventoHeader}>
                    <Text style={styles.eventoTitulo} numberOfLines={1}>{item.titulo}</Text>
                    <Text style={styles.eventoHorario}>{item.horario.substring(0, 5)}</Text>
                </View>
                <Text style={styles.eventoData}>{formatDate(item.data)}</Text>
                {item.nome_cliente && <Text style={styles.eventoCliente}>Cliente: {item.nome_cliente}</Text>}
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity onPress={onEditPress} style={styles.iconButton}>
                    <Ionicons name="pencil" size={22} color="#F5A623" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDeletePress} style={styles.iconButton}>
                    <Ionicons name="trash-bin" size={22} color="#e74c3c" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#2A4D69', '#5D9B9B']} style={styles.container}>
      <Header />
      <View style={styles.header}>
        <MaterialIcons name="event" size={30} color="#f5f5f5" />
        <Text style={styles.title}>AGENDA</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#FFF" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum evento agendado.</Text>
            </View>
          }
        />
      )}
      {addButton({ activeRoute: '/screens/addEvento' })}
      <Nav style={styles.nav} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 5,
    },
    nav: { position: "absolute", bottom: 20, left: 20 },
    title: {
        color: "#f5f5f5",
        fontSize: 35,
        fontFamily: "BebasNeue",
        marginLeft: 15,
    },
    listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
    eventoContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 10,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden', // Garante que a barra de status não saia do container
    },
    statusIndicator: {
        width: 8,
        height: '100%',
    },
    statusAgendado: { backgroundColor: '#3498db' }, // Azul
    statusConcluido: { backgroundColor: '#2ecc71' }, // Verde
    statusCancelado: { backgroundColor: '#e74c3c' }, // Vermelho
    eventoInfo: {
        flex: 1,
        padding: 15,
    },
    eventoHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 5,
    },
    eventoTitulo: {
        color: "#f5f5f5",
        fontSize: 22,
        fontFamily: "BebasNeue",
        flex: 1,
        marginRight: 10,
    },
    eventoHorario: { color: "#f5f5f5", fontSize: 18, fontFamily: "BebasNeue" },
    eventoData: { color: "#ccc", fontSize: 16, marginBottom: 5 },
    eventoCliente: {
        color: "#ddd",
        fontSize: 15,
        fontStyle: "italic",
    },
    actionButtons: {
        marginTop: 50,
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 10,
    },
    iconButton: {
        marginLeft: 10,
        padding: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 50,
    },
    emptyText: { color: "#f5f5f5", fontSize: 18, fontFamily: "BebasNeue" },
});

export default AgendaScreen;

