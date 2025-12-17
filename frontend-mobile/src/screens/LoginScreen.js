import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!username || !password) {
            setError('Por favor complete todos los campos');
            return;
        }

        setLoading(true);
        setError('');

        const success = await login(username, password);

        if (!success) {
            setError('Usuario o contraseña incorrectos');
        }
        setLoading(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 justify-center">
            <StyledView className="px-8">
                <StyledView className="items-center mb-10">
                    <StyledView className="bg-blue-100 p-4 rounded-full mb-4">
                        <Ionicons name="lock-closed" size={40} color="#2563EB" />
                    </StyledView>
                    <StyledText className="text-3xl font-bold text-gray-800">Bienvenido</StyledText>
                    <StyledText className="text-gray-500 mt-2">Auditoría Alimenticia App</StyledText>
                </StyledView>

                <StyledView className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                    <StyledView>
                        <StyledText className="text-gray-700 font-medium mb-2 ml-1">Usuario</StyledText>
                        <StyledInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                            placeholder="Ingrese su usuario"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </StyledView>

                    <StyledView className="mt-4">
                        <StyledText className="text-gray-700 font-medium mb-2 ml-1">Contraseña</StyledText>
                        <StyledInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                            placeholder="Ingrese su contraseña"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </StyledView>

                    {error ? (
                        <StyledText className="text-red-500 text-sm text-center mt-2">{error}</StyledText>
                    ) : null}

                    <StyledTouchableOpacity
                        onPress={handleLogin}
                        disabled={loading}
                        className={`mt-6 py-4 rounded-xl items-center shadow-sm ${loading ? 'bg-blue-400' : 'bg-blue-600 active:bg-blue-700'}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <StyledText className="text-white font-bold text-lg">Iniciar Sesión</StyledText>
                        )}
                    </StyledTouchableOpacity>
                </StyledView>
            </StyledView>
        </SafeAreaView>
    );
}
