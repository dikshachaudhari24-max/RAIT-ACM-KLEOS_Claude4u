import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../theme';
import { FloatingTabBar } from '../components';
import { useAuthStore } from '../store/authStore';
import { useLangStore } from '../store/langStore';

import {
  LandingScreen,
  LoginScreen,
  DashboardScreen,
  InvoiceUploadScreen,
  InvoiceDetailScreen,
  GSTR2BScreen,
  ITCDashboardScreen,
  TasksScreen,
  VoiceScreen,
  SupplierScreen,
  ProfileScreen,
} from '../screens';

const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="ITCDashboard" component={ITCDashboardScreen} />
    <Stack.Screen name="Suppliers" component={SupplierScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    tabBar={(props) => <FloatingTabBar {...props} />}
  >
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Invoice" component={InvoiceUploadScreen} />
    <Tab.Screen name="GSTR2B" component={GSTR2BScreen} />
    <Tab.Screen name="Tasks" component={TasksScreen} />
    <Tab.Screen name="Voice" component={VoiceScreen} />
  </Tab.Navigator>
);

const MainStack = () => (
  <RootStack.Navigator screenOptions={{ headerShown: false }}>
    <RootStack.Screen name="Tabs" component={MainTabs} />
    <RootStack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
    <RootStack.Screen name="Profile" component={ProfileScreen} />
  </RootStack.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Landing" component={LandingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  const { user, loading, initialize } = useAuthStore();
  const loadLang = useLangStore((s) => s.loadLang);

  useEffect(() => {
    initialize();
    loadLang();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
