import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { getDB } from '../database/db'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import syncService from '../services/syncService'

export const NuevaInstitucionScreen = ({ navigation }: any) => {
    const [nombre, setNombre] = useState('')
    const [tipo, setTipo] = useState('escuela')
    const [direccion, setDireccion] = useState('')
    const [barrio, setBarrio] = useState('')
    const [comuna, setComuna] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        if (!nombre || !tipo) {
            Alert.alert('Error', 'El nombre y el tipo son obligatorios.')
            return
        }

        setLoading(true)
        try {
            const db = getDB()
            const now = new Date().toISOString()

            await db.runAsync(
                `INSERT INTO instituciones (nombre, tipo, direccion, barrio, comuna, created_at, updated_at, pending_sync) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
                [nombre, tipo, direccion, barrio, comuna, now, now]
            )

            Alert.alert('Éxito', 'Institución creada localmente. Se sincronizará en breve.', [
                {
                    text: 'OK',
                    onPress: () => {
                        syncService.sync() // Trigger sync
                        navigation.goBack()
                    }
                }
            ])
        } catch (error) {
            console.error('Error saving institution:', error)
            Alert.alert('Error', 'No se pudo guardar la institución localmente.')
        } finally {
            setLoading(false)
        }
    }

    const tipoOptions = [
        { label: 'Escuela', value: 'escuela', icon: 'school' },
        { label: 'CDI', value: 'cdi', icon: 'business' },
        { label: 'Hogar', value: 'hogar', icon: 'home' },
        { label: 'Geriátrico', value: 'geriatrico', icon: 'medical' },
        { label: 'Otro', value: 'otro', icon: 'cube' }
    ]

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Nueva Institución</Text>
            <Text style={styles.subtitle}>Completa los datos para registrar un nuevo centro</Text>

            <View style={styles.form}>
                <Text style={styles.label}>Nombre de la Institución *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: Escuela Nro 123"
                    value={nombre}
                    onChangeText={setNombre}
                />

                <Text style={styles.label}>Tipo de Centro *</Text>
                <View style={styles.optionsContainer}>
                    {tipoOptions.map((opt) => (
                        <TouchableOpacity
                            key={opt.value}
                            style={[styles.option, tipo === opt.value && styles.optionSelected]}
                            onPress={() => setTipo(opt.value)}
                        >
                            <Ionicons
                                name={opt.icon as any}
                                size={20}
                                color={tipo === opt.value ? '#FFFFFF' : '#6B7280'}
                            />
                            <Text style={[styles.optionLabel, tipo === opt.value && styles.optionLabelSelected]}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Dirección</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: Av. Rivadavia 1234"
                    value={direccion}
                    onChangeText={setDireccion}
                />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.label}>Barrio</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: Palermo"
                            value={barrio}
                            onChangeText={setBarrio}
                        />
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.label}>Comuna</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: 14"
                            value={comuna}
                            onChangeText={setComuna}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.btn, loading && styles.btnDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={['#3B82F6', '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.btnGradient}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.btnText}>GUARDAR INSTITUCIÓN</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { padding: 24, paddingBottom: 40 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
    subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, marginBottom: 32 },
    form: { gap: 16 },
    label: { fontSize: 13, fontWeight: 'bold', color: '#374151', marginBottom: 8, textTransform: 'uppercase' },
    input: {
        backgroundColor: 'white',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        height: 54,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1F2937',
        marginBottom: 8,
    },
    optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        gap: 8,
    },
    optionSelected: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    optionLabel: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
    optionLabelSelected: { color: '#FFFFFF' },
    row: { flexDirection: 'row' },
    btn: { marginTop: 24, borderRadius: 16, overflow: 'hidden' },
    btnDisabled: { opacity: 0.7 },
    btnGradient: { height: 56, alignItems: 'center', justifyContent: 'center' },
    btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
})
