import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const invoices = [
  { id: '1', number: 'NF 01', company: 'EMPRESA 01' },
  { id: '2', number: 'NF 01', company: 'EMPRESA 01' },
  { id: '3', number: 'NF 01', company: 'EMPRESA 01' },
  { id: '4', number: 'NF 01', company: 'EMPRESA 01' },
];

const InvoiceScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BIZMANAGER</Text>
        <MaterialIcons name="settings" size={24} color="#fff" />
      </View>
      <View style={styles.section}>
        <MaterialIcons name="folder" size={20} color="#fff" />
        <Text style={styles.sectionTitle}>NOTAS FISCAIS</Text>
      </View>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Nº DA NOTA</Text>
          <Text style={styles.tableHeaderText}>TOMADOR</Text>
        </View>
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.number}</Text>
              <Text style={styles.tableCell}>{item.company}</Text>
            </View>
          )}
        />
      </View>
      <TouchableOpacity style={styles.addButton}>
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>
      <View style={styles.bottomNav}>
        <MaterialIcons name="inventory" size={24} color="#fff" />
        <MaterialIcons name="home" size={24} color="#fff" />
        <MaterialIcons name="savings" size={24} color="#fff" />
        <MaterialIcons name="calendar-today" size={24} color="#fff" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F4F4F',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
  },
  sectionTitle: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
  tableContainer: {
    backgroundColor: '#3E6D6D',
    borderRadius: 10,
    padding: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    paddingBottom: 5,
  },
  tableHeaderText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  tableCell: {
    color: '#fff',
  },
  addButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#FFA500',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1E3C3C',
    paddingVertical: 10,
    borderRadius: 10,
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
  },
});

export default InvoiceScreen;
