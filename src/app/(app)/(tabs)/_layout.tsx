import { Tabs } from 'expo-router'
import { StyleSheet } from 'react-native'

const TabLayout = () => {
    return (
        <Tabs>
            <Tabs.Screen name='home' />
        </Tabs>
    )
}

export default TabLayout

const styles = StyleSheet.create({})