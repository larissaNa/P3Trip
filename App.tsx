import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import AppNavigator from "./src/navigator/AppNavigator";
import { NetworkBanner } from "./src/view/components/NetworkBanner";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { NotificationService } from "./src/model/services/NotificationService";
import * as Notifications from "expo-notifications";
import { TravelService } from "./src/model/services/TravelService";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const navigationRef = createNavigationContainerRef<any>();

export default function App() {
  const [fontsLoaded] = useFonts({
    "Nunito-Regular": require("./assets/fonts/Nunito-Regular.ttf"),
    "Nunito-Medium": require("./assets/fonts/Nunito-Medium.ttf"),
    "Nunito-SemiBold": require("./assets/fonts/Nunito-SemiBold.ttf"),
    "Nunito-Bold": require("./assets/fonts/Nunito-Bold.ttf"),
    "Nunito-ExtraBold": require("./assets/fonts/Nunito-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const notificationService = new NotificationService();
    notificationService.registerAndSavePushToken();
  }, []);

  useEffect(() => {
    const notificationService = new NotificationService();
    const travelService = new TravelService();

    const cleanup = notificationService.setupNotificationListeners(
      async (notification) => {
        await notificationService.appendNotificationToHistory(notification);
      },
      async (response) => {
        const data: any = response.notification.request.content.data;
        console.log("🔔 Notificação tocada, dados:", data);
        
        await notificationService.appendNotificationToHistory(response.notification);

        const type = data?.type;
        const travelId = data?.travelId;

        if (type === "NEW_TRAVEL" && travelId && navigationRef.isReady()) {
          try {
            const travel = await travelService.getTravelById(String(travelId));
            if (travel) {
              navigationRef.navigate("TravelDetails", { travel });
            }
          } catch (error) {
             console.log("Erro ao navegar via notificação:", error);
          }
        }
      }
    );

    return cleanup;
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <NetworkBanner />
        <NavigationContainer ref={navigationRef}>
          <AppNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
