import { Stack } from 'expo-router'
import { StyleSheet } from 'react-native'

const ProtectedLayout = () => {
  return (
      <Stack>
          <Stack.Screen name='(tabs)' />
          <Stack.Screen name='(stack)' />
    </Stack>
  )
}

export default ProtectedLayout

const styles = StyleSheet.create({})