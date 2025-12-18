import React from 'react'
import { TextInput, StyleSheet } from 'react-native'

interface InputProps {
  placeholder?: string
  value: string
  onChangeText: (text: string) => void
  secureTextEntry?: boolean
}

export function Input({ placeholder, value, onChangeText, secureTextEntry = false }: InputProps) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="#9ca3af"
    />
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
})