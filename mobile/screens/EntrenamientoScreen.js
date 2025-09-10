import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';

const EntrenamientoScreen = ({ route }) => {
  // Recibe el objeto 'entrenamiento' de los parámetros de navegación
  const { entrenamiento } = route.params;

  const renderItem = ({ item }) => (
    <View style={styles.diaContainer}>
      <Text style={styles.diaTitle}>{item.dia}</Text>
      {item.ejercicios.map((ejercicio, index) => (
        <View key={index} style={styles.ejercicioCard}>
          <Image source={{ uri: ejercicio.imageUrl }} style={styles.exerciseImage} />
          <View style={styles.ejercicioDetails}>
            <Text style={styles.ejercicioNombre}>{ejercicio.ejercicio}</Text>
            <Text style={styles.ejercicioSeries}>{ejercicio.series}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={entrenamiento}
      renderItem={renderItem}
      keyExtractor={(item, index) => `dia-${index}`}
      ListHeaderComponent={<Text style={styles.headerTitle}>Plan de Entrenamiento</Text>}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  diaContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  diaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  ejercicioCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    overflow: 'hidden',
  },
  exerciseImage: {
    width: 100,
    height: 100,
  },
  ejercicioDetails: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  ejercicioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ejercicioSeries: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
});

export default EntrenamientoScreen;
