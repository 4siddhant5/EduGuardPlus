// src/navigation/RootNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../services/AuthContext';

import LoginScreen        from '../screens/auth/LoginScreen';
import SuperAdminDashboard from '../screens/superadmin/SuperAdminDashboard';
import AdminDashboard     from '../screens/admin/AdminDashboard';
import TeacherDashboard   from '../screens/teacher/TeacherDashboard';
import ParentDashboard    from '../screens/parent/ParentDashboard';
import { LoadingScreen }  from '../components';

const Stack = createNativeStackNavigator();

// Map Firebase roles → dashboard components
const ROLE_SCREENS = {
  superadmin: SuperAdminDashboard,
  admin:      AdminDashboard,
  educator:   TeacherDashboard,
  teacher:    TeacherDashboard,
  parent:     ParentDashboard,
};

export default function RootNavigator() {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingScreen message="Starting EduGuard…" />;

  const DashboardComponent = user && role ? ROLE_SCREENS[role] : null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user || !DashboardComponent ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Dashboard" component={DashboardComponent} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
