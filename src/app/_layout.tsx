import { Stack } from "expo-router";

export default function RootLayout() {
  return <RootNavigator />;
}

const RootNavigator = () => {
  return (
    <Stack>
      <Stack.Protected guard={true}  >
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={false}  >
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  )
}