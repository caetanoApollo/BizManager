import React, { useState, useEffect, useRef } from "react";
import { Stack, router } from "expo-router";
import LoadingScreen from "./components/loading"; 
import * as Notifications from 'expo-notifications'; 
import { savePushToken } from './services/api'; 

// --- Configuração do Handler de Notificação em Foreground ---
// Garante que a notificação apareça mesmo quando o app estiver aberto.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Função para registrar o token de notificação push e enviá-lo ao backend.
 */
async function registerForPushNotificationsAsync() {
    let token;
    
    // 1. Verifica permissão
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Se a permissão não foi concedida, solicita
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Falha ao obter token de push: permissão não concedida.');
        return;
    }
    
    // 2. Obtém o token do dispositivo
    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo Push Token:', token);
    } catch (error) {
        console.error('Erro ao obter Expo Push Token:', error);
        return;
    }

    // 3. Envia o token para o backend (onde será salvo no campo push_token do usuário)
    if (token) {
        try {
            await savePushToken(token); // Função que você deve criar em services/api.ts
            console.log('Token de notificação salvo no servidor.');
        } catch (e) {
            console.warn('Não foi possível salvar o token de notificação no servidor.', e);
        }
    }

    return token;
}


export default function Layout() {
  const [loading, setLoading] = useState(true);
  
  // Referências para os listeners de notificação (opcional, mas recomendado para limpeza)
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);


  // --- Efeito para Gerenciar Notificações ---
  useEffect(() => {
    // Garante que o registro só ocorra após o LoadingScreen finalizar
    // (Assumindo que o usuário só passa do LoadingScreen se estiver autenticado ou pronto para o login)
    if (!loading) { 
        registerForPushNotificationsAsync(); 
    }

    // Opcional: Adicionar listeners para notificação em foreground e cliques
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificação Recebida:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Resposta de Notificação (clique):', response);
      router.push('/screens/estoque');
    });
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [loading]);


  return loading ? (
    <LoadingScreen onFinish={() => setLoading(false)} /> 
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
      <Stack.Screen name="screens/detalhesEventos" />
    </Stack>
  );
}