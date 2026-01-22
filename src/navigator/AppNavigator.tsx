import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Travel } from "../model/entities/Travel";
import HomeScreen from "../view/HomeScreen";
import NotificationsScreen from "../view/NotificationsScreen";
import SavedTripsScreen from "../view/SavedTripsScreen";
import TravelDetailsScreen from "../view/TravelDetailsScreen";

export type RootStackParamList = {
  Home: undefined;
  Notifications: undefined;
  SavedTrips: undefined;
  TravelDetails: { travel: Travel };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="SavedTrips" component={SavedTripsScreen} />
      <Stack.Screen name="TravelDetails" component={TravelDetailsScreen} />
    </Stack.Navigator>
  );
}
