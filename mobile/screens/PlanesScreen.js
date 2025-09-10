import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getClientes, generarPlan } from '../api/pepcoach';
import { useNavigation } from '@react-navigation/native';

const PlanesScreen = () => {
  const navigation = useNavigation();
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await getClientes();
        setClientes(response.data);
        if (response.data.length > 0) {
          setSelectedCliente(response.data[0]);
        }
      } catch (err) {
        setError('No se pudieron cargar los clientes.');
      }
    };
    fetchClientes();
  }, []);

  const handleGenerarPlan = async () => {
    if (!selectedCliente) {
      Alert.alert('Error', 'Por favor, selecciona un cliente.');
      return;
    }
    setLoading(true);
    setPlan(null);
    setError('');
    try {
      const response = await generarPlan(selectedCliente.id, selectedCliente);
      setPlan(response.data.plan);
    } catch (err) {
      setError('Error al generar el plan. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.controls}>
        <Text style={styles.label}>Selecciona un Cliente:</Text>
        <Picker
          selectedValue={selectedCliente?.id}
          onValueChange={(itemValue) => {
            const cliente = clientes.find(c => c.id === itemValue);
            setSelectedCliente(cliente);
          }}
          style={styles.picker}
        >
          {clientes.map(c => (
            <Picker.Item key={c.id} label={c.nombre} value={c.id} />
          ))}
        </Picker>
        <Button title="Generar Plan Nutricional" onPress={handleGenerarPlan} disabled={loading} />
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }}/>}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {plan && (
        <View style={styles.planContainer}>
          <Text style={styles.planTitle}>Plan para {selectedCliente.nombre}</Text>
          <View style={styles.entrenamientoButtonContainer}>
            <Button
              title="Ver Plan de Entrenamiento"
              onPress={() => navigation.navigate('Entrenamiento', { entrenamiento: plan.entreno })}
            />
          </View>
          {plan.nutricion.map(dia => (
            <View key={dia.dia} style={styles.diaContainer}>
              <Text style={styles.diaTitle}>Día {dia.dia}</Text>
              {dia.menu.map(comida => (
                <View key={comida.momento} style={styles.comidaCard}>
                  <Image source={{ uri: comida.imageUrl }} style={styles.recipeImage} />
                  <View style={styles.comidaDetails}>
                    <Text style={styles.comidaMomento}>{comida.momento}</Text>
                    <Text style={styles.comidaReceta}>{comida.receta}</Text>
                    <Text style={styles.ingredientesTitle}>Ingredientes:</Text>
                    <Text style={styles.ingredientes}>{comida.ingredientes.join(', ')}</Text>
                    <Text style={styles.consejoTitle}>Consejo del Chef:</Text>
                    <Text style={styles.consejo}>{comida.consejoDelChef}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    controls: { padding: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ddd' },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
    picker: { backgroundColor: '#f9f9f9', marginBottom: 10 },
    errorText: { color: 'red', textAlign: 'center', margin: 10 },
    planContainer: { padding: 15 },
    planTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    entrenamientoButtonContainer: {
        marginVertical: 10,
        marginHorizontal: 20,
    },
    diaContainer: { marginBottom: 20 },
    diaTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', borderBottomWidth: 2, borderBottomColor: '#0A66C2', paddingBottom: 5, marginBottom: 10 },
    comidaCard: { backgroundColor: 'white', borderRadius: 8, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3, overflow: 'hidden' },
    recipeImage: { width: '100%', height: 180 },
    comidaDetails: { padding: 15 },
    comidaMomento: { fontSize: 14, color: 'gray', fontWeight: 'bold' },
    comidaReceta: { fontSize: 18, fontWeight: 'bold', marginVertical: 5 },
    ingredientesTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
    ingredientes: { fontSize: 14, fontStyle: 'italic', color: '#555' },
    consejoTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
    consejo: { fontSize: 14, color: '#555' },
});

export default PlanesScreen;
