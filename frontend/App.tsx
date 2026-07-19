import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingScreen from './src/screens/OnboardingScreen';
import SmartRouteScreen from './src/screens/SmartRouteScreen';
import StationOptimizationScreen from './src/screens/StationOptimizationScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddVehicleScreen from './src/screens/AddVehicleScreen';
import VehiclesScreen from './src/screens/VehiclesScreen';
import VehicleDetailScreen from './src/screens/VehicleDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PersonalInfoScreen from './src/screens/PersonalInfoScreen';
import SecurityScreen from './src/screens/SecurityScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import MapScreen from './src/screens/MapScreen';
import RoutePlannerScreen from './src/screens/RoutePlannerScreen';

import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

// VoltPilot özel Toast bildirim konfigürasyonu
const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#00e38b',
        backgroundColor: '#1c1b1d',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 227, 139, 0.3)',
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 17,
        fontWeight: '700',
        color: '#ffffff'
      }}
      text2Style={{
        fontSize: 15,
        color: '#b9cbbc'
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#ff5449',
        backgroundColor: '#1c1b1d',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 84, 73, 0.3)',
      }}
      text1Style={{
        fontSize: 17,
        fontWeight: '700',
        color: '#ffffff'
      }}
      text2Style={{
        fontSize: 15,
        color: '#b9cbbc'
      }}
    />
  )
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="SmartRoute" component={SmartRouteScreen} />
        <Stack.Screen name="StationOptimization" component={StationOptimizationScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Vehicles" component={VehiclesScreen} />
        <Stack.Screen 
          name="AddVehicle" 
          component={AddVehicleScreen} />
        <Stack.Screen 
          name="VehicleDetail" 
          component={VehicleDetailScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        <Stack.Screen name="Security" component={SecurityScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="RoutePlanner" component={RoutePlannerScreen} />
      </Stack.Navigator>
      <Toast config={toastConfig} />
    </NavigationContainer>
  );
}
