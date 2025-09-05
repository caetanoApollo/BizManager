import React, { useState } from "react";
import { Stack } from "expo-router";
import LoadingScreen from "./components/loading"; //

export default function Layout() {
  const [loading, setLoading] = useState(true);

  return loading ? (
    <LoadingScreen onFinish={() => setLoading(false)} /> //
  ) : (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="screens/login" />
      <Stack.Screen name="screens/signup" />  
      <Stack.Screen name="screens/passwordReset" />
      <Stack.Screen name="screens/main" />
      <Stack.Screen name="screens/config" />
      <Stack.Screen name="screens/notaFiscal" />
      <Stack.Screen name="screens/addNota" />
      <Stack.Screen name="screens/financeiro" />
      <Stack.Screen name="screens/addFinan" />
      <Stack.Screen name="screens/addEvento" />
      <Stack.Screen name="screens/agenda" />
      <Stack.Screen name="screens/estoque" />
      <Stack.Screen name="screens/addEstoque" />
      <Stack.Screen name="screens/graficos" />
      <Stack.Screen name="screens/clientes" />
      <Stack.Screen name="screens/addCliente" />
      <Stack.Screen name="screens/transacoesDetalhes" />
      <Stack.Screen name="screens/detalhesEvento" />
    </Stack>
  );
}
