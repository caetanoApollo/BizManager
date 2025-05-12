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
      
      {/* Tela de Configurações */}
      <Stack.Screen name="(screens)/config" />
      
      {/* Tela de Notas Fiscais */}
      <Stack.Screen name="(screens)/notaFiscal" />

      {/* Tela de adicionar Notas Fiscais */}
      <Stack.Screen name="(screens)/addNota" />

      {/* Tela de Financeiro */}
      <Stack.Screen name="(screens)/financeiro" />
      
      {/* Tela de Adicionar entrada/saída */}
      <Stack.Screen name="(screens)/addFinan" />
    </Stack>
  );
}
