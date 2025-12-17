# Guía de Inicio - Sistema de Auditoría

Este proyecto consta de 3 partes: Backend (Django), Frontend Web (React) y App Móvil (React Native).

## 1. Backend (Django + MySQL)

El núcleo del sistema. Debe estar corriendo para que la Web y la App funcionen (aunque la App funciona offline, necesita el backend para login inicial y sync).

```bash
# En la raíz del proyecto
docker-compose up --build
```
*   El backend estará en: `http://localhost:8000`
*   Admin panel: `http://localhost:8000/admin`

## 2. Frontend Web (Panel Administrativo)

Para los gestores en la oficina.

```bash
cd frontend-web
npm install
npm run dev
```
*   Accede a: `http://localhost:3000`
*   Credenciales: Crea un superusuario en Django (`docker-compose exec backend python manage.py createsuperuser`) para entrar.

## 3. App Móvil (Auditores)

Para los auditores en campo.

**IMPORTANTE:**
1.  Abre `frontend-mobile/src/services/sync.js`.
2.  Cambia `const API_URL = 'http://192.168.1.X:8000/api';` por la IP local de tu computadora (no uses localhost, el emulador/celular no lo entenderá).

```bash
cd frontend-mobile
npm install
npx expo start
```
*   Escanea el código QR con tu celular (usando la app Expo Go) o presiona 'a' para abrir en emulador Android.

## Flujo de Prueba Recomendado

1.  Levanta el Backend.
2.  Crea un usuario admin.
3.  Entra a la Web (`localhost:3000`) y logueate. Verás la lista vacía.
4.  Abre la App Móvil.
5.  **Desconecta internet del celular** (o modo avión).
6.  Crea una auditoría en la App. Verás que dice "Pendiente" (rojo).
7.  **Conecta internet**.
8.  Presiona "Sincronizar Ahora". Debería cambiar a "Sincronizado" (verde).
9.  Recarga la Web. ¡La auditoría debería aparecer ahí!
