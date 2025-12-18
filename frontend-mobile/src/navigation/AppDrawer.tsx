import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { HomeScreen } from '../screens/HomeScreen'
import { UsersScreen } from '../screens/UsersScreen'
import { DrawerContent } from '../components/layout/DrawerContent'

const Drawer = createDrawerNavigator()

export function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#111827',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Panel' }}
      />
      <Drawer.Screen 
        name="Users" 
        component={UsersScreen}
        options={{ title: 'Usuarios' }}
      />
    </Drawer.Navigator>
  )
}