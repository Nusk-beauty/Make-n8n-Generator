import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button, ActivityIndicator } from 'react-native';
import { getClientes } from '../api/pepcoach';

const ClientesScreen = ({ navigation, route }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClientes = async () => {
    // No reiniciar el loading a true si ya estamos mostrando datos,
    // para una actualización más suave.
    // setLoading(true);
    setError(null);
    try {
      const response = await getClientes();
      setClientes(response.data);
    } catch (err) {
      setError('No se pudieron cargar los clientes. Asegúrate de que el backend está funcionando.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    setLoading(true);
    fetchClientes();
  }, []);

  // Refrescar cuando se navega de vuelta con el parámetro 'refresh'
  useEffect(() => {
    if (route.params?.refresh) {
      fetchClientes();
      // Limpiar el parámetro para evitar refrescos innecesarios
      navigation.setParams({ refresh: false });
    }
  }, [route.params?.refresh]);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('DetalleCliente', { cliente: item })}
    >
      <Text style={styles.itemTitle}>{item.nombre}</Text>
      <Text style={styles.itemSubtitle}>{item.email}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={clientes}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text>No hay clientes para mostrar.</Text>}
      />
      <View style={styles.navButtons}>
        <Button title="Generar Plan" onPress={() => navigation.navigate('Planes')} />
        <Button title="Asistente IA" onPress={() => navigation.navigate('ChatIA')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 14,
    color: 'gray',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  }
});

export default ClientesScreen;
