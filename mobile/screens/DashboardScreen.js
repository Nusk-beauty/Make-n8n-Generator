import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getClientes } from '../api/pepcoach';

const DashboardScreen = ({ navigation }) => {
  const [numClientes, setNumClientes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getClientes();
        setNumClientes(response.data.length);
      } catch (error) {
        console.error("Error cargando clientes para el dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const NavButton = ({ title, screenName }) => (
    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate(screenName)}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PepCoach Dashboard</Text>

      <View style={styles.statBox}>
        <Text style={styles.statNumber}>{loading ? <ActivityIndicator /> : numClientes}</Text>
        <Text style={styles.statLabel}>Clientes Activos</Text>
      </View>

      <View style={styles.navContainer}>
        <NavButton title="Gestionar Clientes" screenName="Clientes" />
        <NavButton title="Crear Planes" screenName="Planes" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 30,
  },
  statNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0A66C2',
  },
  statLabel: {
    fontSize: 18,
    color: 'gray',
    marginTop: 5,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#0A66C2',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
