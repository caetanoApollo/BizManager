// _layout.tsx
import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs>
      {/* Tela inicial */}
      <Tabs.Screen
        name="index" // Nome do arquivo (app/(tabs)/index.tsx)
        options={{ title: 'Início' }} // Título da aba
      />

      {/* Tela de cadastro */}
      <Tabs.Screen
        name="signup" // Nome do arquivo (app/(tabs)/signup.tsx)
        options={{ title: 'Cadastro' }} // Título da aba
      />
    </Tabs>
  );
}