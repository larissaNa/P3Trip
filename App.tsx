import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigator/AppNavigator";
import { NetworkBanner } from "./src/view/components/NetworkBanner";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <NetworkBanner />
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
