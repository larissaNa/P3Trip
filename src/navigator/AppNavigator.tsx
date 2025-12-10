import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../view/HomeScreen";
import NotificationsScreen from "../view/NotificationsScreen";
import SavedTripsScreen from "../view/SavedTripsScreen";
import TravelDetailsScreen from "../view/TravelDetailsScreen";

const Stack = createNativeStackNavigator();

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
