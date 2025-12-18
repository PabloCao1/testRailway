import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { HomeScreen } from '../screens/HomeScreen'
import { InstitucionesScreen } from '../screens/InstitucionesScreen'
import { VisitasScreen } from '../screens/VisitasScreen'
import { VisitaDetalleScreen } from '../screens/VisitaDetalleScreen'
import { DashboardScreen } from '../screens/DashboardScreen'
import { InstitucionDetalleScreen } from '../screens/InstitucionDetalleScreen'
import { FormularioRelevamientoScreen } from '../screens/FormularioRelevamientoScreen'
import { CategoriasScreen } from '../screens/CategoriasScreen'
import { AlimentosScreen } from '../screens/AlimentosScreen'
import { RankingScreen } from '../screens/RankingScreen'
import { ReporteInstitucionScreen } from '../screens/ReporteInstitucionScreen'

const Drawer = createDrawerNavigator()

export const MainDrawer = () => {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Drawer.Screen name="Instituciones" component={InstitucionesScreen} />
      <Drawer.Screen name="Visitas" component={VisitasScreen} />
      <Drawer.Screen name="Categorias" component={CategoriasScreen} options={{ title: 'Categorías' }} />
      <Drawer.Screen name="Alimentos" component={AlimentosScreen} />
      <Drawer.Screen name="Ranking" component={RankingScreen} />
      <Drawer.Screen 
        name="VisitaDetalle" 
        component={VisitaDetalleScreen} 
        options={{ title: 'Detalle de Visita', drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen 
        name="InstitucionDetalle" 
        component={InstitucionDetalleScreen} 
        options={{ title: 'Detalle Institución', drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen 
        name="FormularioRelevamiento" 
        component={FormularioRelevamientoScreen} 
        options={{ title: 'Formulario', drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen 
        name="ReporteInstitucion" 
        component={ReporteInstitucionScreen} 
        options={{ title: 'Reporte', drawerItemStyle: { display: 'none' } }}
      />
    </Drawer.Navigator>
  )
}
