cd "c:\Users\PauL\Desktop\Repositorios Ciudad\Auditoria\my-app\apps\mobile"
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
npm install
npx expo start --clear