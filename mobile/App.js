import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importar las pantallas
import ClientesScreen from './screens/ClientesScreen';
import DetalleClienteScreen from './screens/DetalleClienteScreen';
import PlanesScreen from './screens/PlanesScreen';
import ChatIAScreen from './screens/ChatIAScreen';
import DashboardScreen from './screens/DashboardScreen';
import EntrenamientoScreen from './screens/EntrenamientoScreen';
import EditarClienteScreen from './screens/EditarClienteScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'PepCoach Dashboard' }}
        />
        <Stack.Screen
          name="Clientes"
          component={ClientesScreen}
          options={{ title: 'PepCoach Clientes' }}
        />
        <Stack.Screen
          name="DetalleCliente"
          component={DetalleClienteScreen}
          options={{ title: 'Detalle del Cliente' }}
        />
        <Stack.Screen
          name="Planes"
          component={PlanesScreen}
          options={{ title: 'Generador de Planes' }}
        />
        <Stack.Screen
          name="ChatIA"
          component={ChatIAScreen}
          options={{ title: 'Asistente IA' }}
        />
        <Stack.Screen
          name="Entrenamiento"
          component={EntrenamientoScreen}
          options={{ title: 'Plan de Entrenamiento' }}
        />
        <Stack.Screen
          name="EditarCliente"
          component={EditarClienteScreen}
          options={{ title: 'Editar Cliente' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
