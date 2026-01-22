import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import AppNavigator from "./src/navigator/AppNavigator";
import { NetworkBanner } from "./src/view/components/NetworkBanner";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { getNotificationService, getTravelUseCases } from "./src/di/container";

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
    const notificationService = getNotificationService();
    notificationService.registerAndSavePushToken();
  }, []);

  useEffect(() => {
    const notificationService = getNotificationService();
    const travelUseCases = getTravelUseCases();

    const cleanup = notificationService.setupListeners(
      async (notification: { id?: string; title?: string; body?: string; data?: unknown }) => {
        await notificationService.saveNotification(notification);
      },
      async (response: any) => {
        const data: any = response?.notification?.request?.content?.data;
        const type = data?.type;
        const travelId = data?.travelId;
        if (type === "NEW_TRAVEL" && travelId && navigationRef.isReady()) {
          try {
            const travel = await travelUseCases.getTravelById(String(travelId));
            if (travel) {
              navigationRef.navigate("TravelDetails", { travel });
            }
          } catch (_error) {}
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
