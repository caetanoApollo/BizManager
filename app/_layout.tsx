import React, { useState } from "react";
import { Stack } from "expo-router";
import LoadingScreen from "./components/loading";

export default function Layout() {
  const [loading, setLoading] = useState(true);

  return loading ? (
    <LoadingScreen onFinish={() => setLoading(false)} />
  ) : (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tela inicial */}
      <Stack.Screen name="(screens)/index" />

      {/* Tela de cadastro */}
      <Stack.Screen name="(screens)/signup" />

      {/* Tela de recuperação de senha */}
      <Stack.Screen name="(screens)/passwordReset" />

      {/* Tela Principal */}
      <Stack.Screen name="(screens)/main" />
      
      {/* Tela de configurações */}
      <Stack.Screen name="(screens)/config" />
    </Stack>
  );
}
