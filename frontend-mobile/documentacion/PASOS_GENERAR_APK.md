# 📱 PASOS PARA GENERAR APK

## ✅ COMPLETADO

- ✅ Node.js instalado
- ✅ Dependencias instaladas (1162 paquetes)
- ✅ EAS CLI instalado

---

## 🚀 OPCIÓN 1: EAS BUILD (RECOMENDADO - MÁS FÁCIL)

### Paso 1: Crear cuenta en Expo (GRATIS)
1. Ve a: https://expo.dev/signup
2. Crea una cuenta gratuita
3. Confirma tu email

### Paso 2: Login desde terminal
Abre una terminal en: `c:\Users\usuar\Auditoria\my-app\apps\mobile`

```bash
npx eas login
```

Ingresa tu email y contraseña de Expo.

### Paso 3: Configurar proyecto
```bash
npx eas build:configure
```

Esto creará/actualizará el archivo `eas.json`.

### Paso 4: Generar APK
```bash
npx eas build --platform android --profile preview
```

**Esto hará:**
- Sube tu código a la nube de Expo
- Compila el APK en servidores de Expo (10-15 min)
- Te da un link para descargar el APK

**Ventajas:**
- ✅ No necesitas Android Studio
- ✅ No necesitas configurar SDK
- ✅ Build en la nube
- ✅ APK listo para instalar

---

## 🔧 OPCIÓN 2: BUILD LOCAL (Requiere Android Studio)

### Requisitos adicionales:
1. **Java JDK 11+**
   - Descargar: https://adoptium.net/
   - Instalar y configurar JAVA_HOME

2. **Android Studio**
   - Descargar: https://developer.android.com/studio
   - Instalar Android SDK
   - Configurar ANDROID_HOME

### Pasos:
```bash
# 1. Generar proyecto Android nativo
npx expo prebuild --platform android

# 2. Compilar APK
cd android
gradlew.bat assembleRelease

# 3. APK en:
# android\app\build\outputs\apk\release\app-release.apk
```

---

## 🎯 RECOMENDACIÓN

**USA OPCIÓN 1 (EAS BUILD)** porque:
- ✅ Más rápido de configurar
- ✅ No necesitas instalar Android Studio (varios GB)
- ✅ No necesitas configurar SDK
- ✅ El APK se genera en la nube
- ✅ Es GRATIS para uso personal

---

## 📝 COMANDOS RÁPIDOS (Opción 1)

Abre una terminal nueva en: `c:\Users\usuar\Auditoria\my-app\apps\mobile`

```bash
# 1. Login
npx eas login

# 2. Configurar
npx eas build:configure

# 3. Generar APK
npx eas build --platform android --profile preview
```

Espera 10-15 minutos y recibirás el link del APK.

---

## 🔍 VERIFICAR ESTADO DEL BUILD

Mientras se genera el APK, puedes ver el progreso en:
https://expo.dev/accounts/TU_USUARIO/projects/auditoria-mobile/builds

---

## 📱 INSTALAR APK EN TU CELULAR

### Opción A: Descarga directa
1. Abre el link del APK en tu celular
2. Descarga el archivo
3. Instala (permite "Fuentes desconocidas" si te lo pide)

### Opción B: Transferir por USB
1. Descarga el APK en tu PC
2. Conecta tu celular por USB
3. Copia el APK a tu celular
4. Abre el archivo APK en tu celular
5. Instala

### Opción C: Con ADB
```bash
adb install app-release.apk
```

---

## ⚠️ IMPORTANTE

1. **Primera vez:** El build puede tardar 15-20 minutos
2. **Builds siguientes:** Serán más rápidos (5-10 min)
3. **Límite gratuito:** 30 builds por mes en plan gratuito
4. **Tamaño APK:** ~50-80 MB aproximadamente

---

## 🎉 SIGUIENTE PASO

Ejecuta estos 3 comandos en una terminal nueva:

```bash
cd c:\Users\usuar\Auditoria\my-app\apps\mobile
npx eas login
npx eas build --platform android --profile preview
```

¡Y listo! En 15 minutos tendrás tu APK.
