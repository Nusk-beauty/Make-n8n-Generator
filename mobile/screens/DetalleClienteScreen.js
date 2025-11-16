import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import { deleteCliente, getProgress, addProgress } from '../api/pepcoach';
import { LineChart } from 'react-native-chart-kit';

const DetalleClienteScreen = ({ route, navigation }) => {
  const { cliente } = route.params;
  const [progress, setProgress] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [newWeight, setNewWeight] = useState('');

  const fetchProgress = async () => {
    setLoadingProgress(true);
    try {
      const response = await getProgress(cliente.id);
      // Ordenar por fecha para el gráfico
      const sortedProgress = response.data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      setProgress(sortedProgress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      Alert.alert("Error", "No se pudo cargar el progreso del cliente.");
    } finally {
      setLoadingProgress(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  // Para refrescar si se edita el cliente en la pantalla de edición
  useEffect(() => {
    if (route.params?.refresh) {
      // Podrías recargar los datos del cliente aquí si fuera necesario
      navigation.setParams({ refresh: false });
    }
  }, [route.params?.refresh]);

  const handleDelete = () => {
    Alert.alert(
      "Confirmar Eliminación",
      `¿Estás seguro de que quieres eliminar a ${cliente.nombre}? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              await deleteCliente(cliente.id);
              Alert.alert("Éxito", "Cliente eliminado correctamente.");
              navigation.navigate('Clientes', { refresh: true });
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar al cliente.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('EditarCliente', { cliente });
  };

  const handleAddProgress = async () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) {
      Alert.alert("Error", "Por favor, introduce un peso válido.");
      return;
    }
    try {
      const progressData = {
        clienteId: cliente.id,
        fecha: new Date().toISOString().split('T')[0],
        peso: newWeight,
      };
      await addProgress(progressData);
      setNewWeight('');
      fetchProgress(); // Recargar el progreso y el gráfico
    } catch (error) {
      Alert.alert("Error", "No se pudo añadir el progreso.");
    }
  };

  const renderDetailRow = (label, value) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '—'}</Text>
    </View>
  );

  const chartData = {
    labels: progress.length > 1 ? progress.map(p => new Date(p.fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })) : [],
    datasets: [{
      data: progress.length > 0 ? progress.map(p => parseFloat(p.peso) || 0) : [0]
    }]
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {renderDetailRow('Nombre', cliente.nombre)}
        {renderDetailRow('Email', cliente.email)}
        {renderDetailRow('Objetivo', cliente.objetivo)}
        {renderDetailRow('Nivel', cliente.nivel)}
      </View>
      <View style={styles.actionsContainer}>
        <Button title="Editar Cliente" onPress={handleEdit} />
        <Button title="Eliminar Cliente" onPress={handleDelete} color="#E53935" />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Seguimiento de Progreso (Peso)</Text>
        {loadingProgress ? <ActivityIndicator color="#0A66C2" /> : (
          progress.length > 0 ? (
            <LineChart
              data={chartData}
              width={Dimensions.get("window").width - 60}
              height={220}
              yAxisSuffix=" kg"
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text style={styles.noDataText}>No hay datos de progreso para mostrar.</Text>
          )
        )}
        <View style={styles.addProgressContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nuevo peso (ej: 75.5)"
            keyboardType="numeric"
            value={newWeight}
            onChangeText={setNewWeight}
          />
          <Button title="Añadir" onPress={handleAddProgress} />
        </View>
      </View>
    </ScrollView>
  );
};

const chartConfig = {
    backgroundColor: "#0A66C2",
    backgroundGradientFrom: "#0A66C2",
    backgroundGradientTo: "#0A84C2",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "6", strokeWidth: "2", stroke: "#ffa726" }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  card: { backgroundColor: 'white', borderRadius: 8, padding: 20, marginHorizontal: 15, marginTop: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  label: { fontSize: 16, color: '#333', fontWeight: '600' },
  value: { fontSize: 16, color: '#666', flexShrink: 1, textAlign: 'right' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  chart: { marginVertical: 8, borderRadius: 16 },
  noDataText: { textAlign: 'center', color: 'gray', paddingVertical: 20 },
  addProgressContainer: { marginTop: 20, flexDirection: 'row', alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', flex: 1, marginRight: 10, padding: 8, borderRadius: 8 },
});

export default DetalleClienteScreen;
