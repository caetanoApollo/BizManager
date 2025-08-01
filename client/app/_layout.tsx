// client/app/_layout.tsx
import React, { useState } from "react";
import { Stack } from "expo-router";
import LoadingScreen from "./components/loading"; //

export default function Layout() {
  const [loading, setLoading] = useState(true);

  return loading ? (
    <LoadingScreen onFinish={() => setLoading(false)} /> //
  ) : (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tela inicial */}
      <Stack.Screen name="screens/home" />

      {/* Tela de cadastro */}
      <Stack.Screen name="screens/signup" />  

      {/* Tela de recuperação de senha */}
      <Stack.Screen name="screens/passwordReset" />

      {/* Tela Principal */}
      <Stack.Screen name="screens/main" />
      
      {/* Tela de Configurações */}
      <Stack.Screen name="screens/config" />
      
      {/* Tela de Notas Fiscais */}
      <Stack.Screen name="screens/notaFiscal" />

      {/* Tela de adicionar Notas Fiscais */}
      <Stack.Screen name="screens/addNota" />

      {/* Tela de Financeiro */}
      <Stack.Screen name="screens/financeiro" />
      
      {/* Tela de Adicionar entrada/saída */}
      <Stack.Screen name="screens/addFinan" />
      
      {/* Tela de Adicionar evento */}
      <Stack.Screen name="screens/addEvento" />
      
      {/* Tela de Agenda */}
      <Stack.Screen name="screens/agenda" />
      
      {/* Tela de Estoque */}
      <Stack.Screen name="screens/estoque" />
      
      {/* Tela de Adicionar Estoque */}
      <Stack.Screen name="screens/addEstoque" />
      
      {/* Tela Gráficos */}
      <Stack.Screen name="screens/graficos" />

      {/* Nova Tela de Clientes */}
      <Stack.Screen name="screens/clientes" />
      
      {/* Nova Tela de Adicionar Cliente */}
      <Stack.Screen name="screens/addCliente" />
    </Stack>
  );
}