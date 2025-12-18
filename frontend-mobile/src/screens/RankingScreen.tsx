import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { reportesService } from '../services/reportesService'

export const RankingScreen = () => {
  const [ranking, setRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRanking()
  }, [])

  const loadRanking = async () => {
    try {
      setLoading(true)
      const data = await reportesService.getRankingInstituciones()
      setRanking(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMedalIcon = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `${index + 1}°`
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Ranking de Instituciones</Text>
        <Text style={styles.subtitle}>Por cantidad de visitas</Text>
      </View>

      <FlatList
        data={ranking}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={[styles.card, index < 3 && styles.cardTop]}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{getMedalIcon(index)}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.institucion__nombre}</Text>
              <Text style={styles.cardSubtitle}>{item.institucion__tipo}</Text>
            </View>
            <View style={styles.visitasCount}>
              <Text style={styles.visitasNumber}>{item.total_visitas}</Text>
              <Text style={styles.visitasLabel}>visitas</Text>
            </View>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#F59E0B', padding: 24, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 14, color: '#FEF3C7', marginTop: 4 },
  card: { backgroundColor: 'white', marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardTop: { borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  rankBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rankText: { fontSize: 24 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: '#6B7280', textTransform: 'capitalize' },
  visitasCount: { alignItems: 'center' },
  visitasNumber: { fontSize: 24, fontWeight: 'bold', color: '#F59E0B' },
  visitasLabel: { fontSize: 10, color: '#6B7280' },
})
