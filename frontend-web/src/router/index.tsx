import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { Layout } from '../components/layout/Layout'
import { LoginPage } from '../pages/LoginPage'
import { HomePage } from '../pages/HomePage'
import { UsersPage } from '../pages/UsersPage'
import { InstitucionesPage } from '../pages/InstitucionesPage'
import { VisitasPage } from '../pages/VisitasPage'
import { VisitaDetallePage } from '../pages/VisitaDetallePage'
import { DashboardPage } from '../pages/DashboardPage'
import { RankingPage } from '../pages/RankingPage'
import { ReporteInstitucionPage } from '../pages/ReporteInstitucionPage'
import { CategoriasPage } from '../pages/CategoriasPage'
import { AlimentosPage } from '../pages/AlimentosPage'
import { FormularioRelevamientoPage } from '../pages/FormularioRelevamientoPage'
import { InstitucionDetallePage } from '../pages/InstitucionDetallePage'
import PlatosPlantillaPage from '../pages/PlatosPlantillaPage'
import PlatoPlantillaDetallePage from '../pages/PlatoPlantillaDetallePage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Navigate to="/home" replace />,
  },
  {
    path: '/home',
    element: (
      <PrivateRoute>
        <Layout>
          <HomePage />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <PrivateRoute>
        <Layout>
          <UsersPage />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '/instituciones',
    element: (
      <PrivateRoute>
        <Layout>
          <InstitucionesPage />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '/instituciones/:id',
    element: (
      <PrivateRoute>
        <Layout>
          <InstitucionDetallePage />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '/visitas',
    element: (
      <PrivateRoute>
        <Layout>
          <VisitasPage />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '/visitas/:id',
    element: (
      <PrivateRoute>
        <Layout>
          <VisitaDetallePage />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '/visitas/:id/formulario',
    element: (
      <PrivateRoute>
        <FormularioRelevamientoPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <Layout>
          <DashboardPage />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '/reportes/ranking',
    element: (
      <PrivateRoute>
        <Layout>
          <RankingPage />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '/reportes/instituciones',
    element: (
      <PrivateRoute>
        <Layout>
          <ReporteInstitucionPage />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '/categorias',
    element: (
      <PrivateRoute>
        <Layout>
          <CategoriasPage />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '/alimentos',
    element: (
      <PrivateRoute>
        <Layout>
          <AlimentosPage />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '/platos-plantilla',
    element: (
      <PrivateRoute>
        <Layout>
          <PlatosPlantillaPage />
        </Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '/platos-plantilla/:id',
    element: (
      <PrivateRoute>
        <Layout>
          <PlatoPlantillaDetallePage />
        </Layout>
      </PrivateRoute>
    ),
  },
])