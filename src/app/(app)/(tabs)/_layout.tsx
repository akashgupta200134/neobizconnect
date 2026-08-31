import { colors } from '@/constants/theme'
import Feather from '@react-native-vector-icons/feather/static'
import { Tabs } from 'expo-router'

const TabLayout = () => {
    return (
        <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary }}>
            <Tabs.Screen
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name='bar-chart' size={size} color={color} />
                    )
                }}
                name='index' />
            <Tabs.Screen
                options={{
                    title: "Sales Order",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name='shopping-bag' size={size} color={color} />
                    )
                }}
                name='sales-order' />
            <Tabs.Screen
                options={{
                    title: "Order History",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name='rotate-ccw' size={size} color={color} />
                    )
                }}
                name='order-history' />
            <Tabs.Screen
                options={{
                    title: "Customer Ledger",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Feather name={focused ? 'book-open' : 'book'} size={size} color={color} />
                    )
                }}
                name='customer-ledger' />

            <Tabs.Screen
                options={{
                    title: "Queries",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name='message-square' size={size} color={color} />
                    )
                }}
                name='dealer-query' />
        </Tabs>
    )
}

export default TabLayout
