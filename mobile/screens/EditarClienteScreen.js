import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { updateCliente } from '../api/pepcoach';

const EditarClienteScreen = ({ route, navigation }) => {
  const { cliente } = route.params;
  const [formData, setFormData] = useState({ ...cliente });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateCliente(cliente.id, formData);
      Alert.alert("Éxito", "Cliente actualizado correctamente.");
      // Regresar y forzar actualización en ambas pantallas
      navigation.navigate('Clientes', { refresh: true });
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar al cliente.");
      console.error(error);
    }
  };

  const renderTextInput = (label, field, keyboardType = 'default') => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={String(formData[field] || '')}
        onChangeText={(text) => handleInputChange(field, text)}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {renderTextInput('Nombre', 'nombre')}
      {renderTextInput('Email', 'email', 'email-address')}
      {renderTextInput('Teléfono', 'telefono', 'phone-pad')}
      {renderTextInput('Objetivo', 'objetivo')}
      {renderTextInput('Nivel', 'nivel')}
      {renderTextInput('Días/semana', 'dias', 'numeric')}
      {renderTextInput('Equipo', 'equipo')}
      {renderTextInput('Sexo', 'sexo')}
      {renderTextInput('Estatura (cm)', 'estatura', 'numeric')}
      {renderTextInput('Peso (kg)', 'peso', 'numeric')}
      <View style={styles.saveButton}>
        <Button title="Guardar Cambios" onPress={handleSave} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    inputContainer: { paddingHorizontal: 20, paddingTop: 15 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#333' },
    input: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    saveButton: {
        margin: 20,
        marginTop: 30,
    }
});

export default EditarClienteScreen;
