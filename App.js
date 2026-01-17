import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// IMPORT FILE-FILE YANG KAMU BUAT
import { getUserSession } from './database'; // Pastikan database.js ada
import LoginScreen from './LoginScreen';     // Pastikan LoginScreen.js ada
import RegisterScreen from './RegisterScreen'; // Pastikan RegisterScreen.js ada
import HomeScreen from './HomeScreen';       // Pastikan HomeScreen.js ada
import ProfileScreen from './ProfileScreen'; // Pastikan ProfileScreen.js ada

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  // Cek apakah user sudah login sebelumnya (Auto-Login)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await getUserSession();
        if (user && user.isLoggedIn) {
          setInitialRoute('Home'); // Kalau ada sesi, langsung ke Home
        } else {
          setInitialRoute('Login'); // Kalau belum, ke Login
        }
      } catch (e) {
        setInitialRoute('Login');
      }
    };
    checkSession();
  }, []);

  // Tampilkan Loading bulat-bulat saat ngecek sesi login
  if (!initialRoute) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" color="#4338ca" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        {/* DAFTAR SEMUA HALAMAN DI SINI */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}