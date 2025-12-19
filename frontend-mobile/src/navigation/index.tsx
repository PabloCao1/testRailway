import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { View, ActivityIndicator } from 'react-native'
import { useAuthStore } from '../store/authStore'
import { AuthStack } from './AuthStack'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'

import { HomeScreen } from '../screens/HomeScreen'
import { DashboardScreen } from '../screens/DashboardScreen'
import { InstitucionesScreen } from '../screens/InstitucionesScreen'
import { VisitasScreen } from '../screens/VisitasScreen'
import { CategoriasScreen } from '../screens/CategoriasScreen'
import { AlimentosScreen } from '../screens/AlimentosScreen'
import { RankingScreen } from '../screens/RankingScreen'
import { VisitaDetalleScreen } from '../screens/VisitaDetalleScreen'
import { InstitucionDetalleScreen } from '../screens/InstitucionDetalleScreen'
import { FormularioRelevamientoScreen } from '../screens/FormularioRelevamientoScreen'
import { ReporteInstitucionScreen } from '../screens/ReporteInstitucionScreen'
import { NuevaInstitucionScreen } from '../screens/NuevaInstitucionScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

export function RootNavigator() {
  const { isAuthenticated, isHydrated, loadTokens } = useAuthStore()

  useEffect(() => {
    loadTokens()
  }, [])

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    )
  }

  const MainTabs = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline'
          else if (route.name === 'Instituciones') iconName = focused ? 'business' : 'business-outline'
          else if (route.name === 'Visitas') iconName = focused ? 'clipboard' : 'clipboard-outline'
          else if (route.name === 'Dashboard') iconName = focused ? 'pie-chart' : 'pie-chart-outline'
          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Instituciones" component={InstitucionesScreen} options={{ title: 'Instituciones' }} />
      <Tab.Screen name="Visitas" component={VisitasScreen} options={{ title: 'Visitas' }} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Reportes' }} />
    </Tab.Navigator>
  )

  const AppStack = () => (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Categorias" component={CategoriasScreen} options={{ title: 'Categorías' }} />
      <Stack.Screen name="Alimentos" component={AlimentosScreen} options={{ title: 'Alimentos' }} />
      <Stack.Screen name="Ranking" component={RankingScreen} options={{ title: 'Ranking' }} />
      <Stack.Screen name="VisitaDetalle" component={VisitaDetalleScreen} options={{ title: 'Detalle Visita' }} />
      <Stack.Screen name="InstitucionDetalle" component={InstitucionDetalleScreen} options={{ title: 'Detalle Institución' }} />
      <Stack.Screen name="NuevaInstitucion" component={NuevaInstitucionScreen} options={{ title: 'Nueva Institución' }} />
      <Stack.Screen name="FormularioRelevamiento" component={FormularioRelevamientoScreen} options={{ title: 'Formulario' }} />
      <Stack.Screen name="ReporteInstitucion" component={ReporteInstitucionScreen} options={{ title: 'Reporte' }} />
    </Stack.Navigator>
  )

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  )
}