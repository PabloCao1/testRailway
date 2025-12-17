import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { initDB, getDB } from './src/database/db';
import { syncData } from './src/services/sync';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

function MainApp() {
    const [audits, setAudits] = useState([]);
    const [newAuditName, setNewAuditName] = useState('');
    const [isDbReady, setIsDbReady] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const { userToken, logout } = useAuth();

    useEffect(() => {
        initDB()
            .then(() => {
                setIsDbReady(true);
                loadAudits();
            })
            .catch(e => console.error("Failed to init DB", e));
    }, []);

    const loadAudits = async () => {
        try {
            const db = getDB();
            const result = await db.getAllAsync('SELECT * FROM audits ORDER BY created_at DESC');
            setAudits(result);
        } catch (error) {
            console.error("Error loading audits", error);
        }
    };

    const addAudit = async () => {
        if (!newAuditName.trim()) return;

        try {
            const db = getDB();
            const id = uuidv4();
            const now = new Date().toISOString();

            await db.runAsync(
                'INSERT INTO audits (id, establishment_id, date, status, created_at, updated_at, synced) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, newAuditName, now, 'DRAFT', now, now, 0]
            );

            setNewAuditName('');
            loadAudits();
        } catch (error) {
            console.error("Error adding audit", error);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        await syncData();
        await loadAudits();
        setIsSyncing(false);
    };

    if (!userToken) {
        return <LoginScreen />;
    }

    if (!isDbReady) {
        return (
            <StyledView className="flex-1 justify-center items-center bg-gray-50">
                <StyledText className="text-lg text-gray-600">Iniciando sistema...</StyledText>
            </StyledView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <StyledView className="bg-white px-6 py-4 shadow-sm flex-row justify-between items-center">
                <View>
                    <StyledText className="text-2xl font-bold text-gray-800">Auditorías</StyledText>
                    <StyledText className="text-sm text-gray-500">Modo Offline Activo</StyledText>
                </View>
                <View className="flex-row gap-3">
                    <StyledTouchableOpacity
                        onPress={handleSync}
                        disabled={isSyncing}
                        className={`p-2 rounded-full ${isSyncing ? 'bg-gray-200' : 'bg-blue-50'}`}
                    >
                        <Ionicons name={isSyncing ? "sync" : "cloud-upload-outline"} size={24} color={isSyncing ? "#9CA3AF" : "#2563EB"} />
                    </StyledTouchableOpacity>
                    <StyledTouchableOpacity
                        onPress={logout}
                        className="p-2 rounded-full bg-red-50"
                    >
                        <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                    </StyledTouchableOpacity>
                </View>
            </StyledView>

            <StyledView className="flex-1 px-4 pt-6">
                {/* Input Card */}
                <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-6">
                    <StyledText className="text-sm font-medium text-gray-700 mb-2">Nueva Auditoría</StyledText>
                    <StyledView className="flex-row gap-2">
                        <StyledInput
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                            placeholder="Nombre del establecimiento..."
                            value={newAuditName}
                            onChangeText={setNewAuditName}
                        />
                        <StyledTouchableOpacity
                            onPress={addAudit}
                            className="bg-blue-600 justify-center px-4 rounded-lg shadow-sm active:bg-blue-700"
                        >
                            <Ionicons name="add" size={24} color="white" />
                        </StyledTouchableOpacity>
                    </StyledView>
                </StyledView>

                {/* List */}
                <FlatList
                    data={audits}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <StyledView className="bg-white p-4 rounded-xl shadow-sm mb-3 border-l-4 border-l-blue-500">
                            <StyledView className="flex-row justify-between items-start mb-2">
                                <StyledText className="text-lg font-bold text-gray-800 flex-1 mr-2">
                                    {item.establishment_id}
                                </StyledText>
                                <StyledView className={`px-2 py-1 rounded-full ${item.synced ? 'bg-green-100' : 'bg-orange-100'}`}>
                                    <StyledText className={`text-xs font-medium ${item.synced ? 'text-green-700' : 'text-orange-700'}`}>
                                        {item.synced ? 'Sincronizado' : 'Pendiente'}
                                    </StyledText>
                                </StyledView>
                            </StyledView>

                            <StyledView className="flex-row items-center justify-between mt-2">
                                <StyledText className="text-xs text-gray-400">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </StyledText>
                                <StyledView className="flex-row items-center">
                                    <StyledText className="text-xs text-gray-500 mr-1">{item.status}</StyledText>
                                </StyledView>
                            </StyledView>
                        </StyledView>
                    )}
                    ListEmptyComponent={
                        <StyledView className="items-center justify-center py-10">
                            <Ionicons name="clipboard-outline" size={48} color="#D1D5DB" />
                            <StyledText className="text-gray-400 mt-2">No hay auditorías registradas</StyledText>
                        </StyledView>
                    }
                />
            </StyledView>
        </SafeAreaView>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    );
}
