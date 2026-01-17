import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// --- IMPORT SEMUA LAYAR ---
import HomeScreen from './HomeScreen';
import StatsScreen from './StatsScreen';
import ProfileScreen from './ProfileScreen';
import AuthScreen from './AuthScreen'; 
import ScanScreen from './ScanScreen'; // <--- INI FITUR KAMERA BARU

// --- IMPORT DATABASE ---
import { getUserSession } from './database';

// --- NAVIGASI UTAMA (TABS) ---
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainApp() {
  const [user, setUser] = useState({username: 'User'});

  // Ambil nama user saat aplikasi dibuka
  useEffect(()=>{ 
      getUserSession().then(u => {
          if(u) setUser(u)
      }) 
  }, []);

  return (
    <Tab.Navigator 
        screenOptions={({route})=>({
            headerShown:false, 
            tabBarActiveTintColor:'#4338ca',
            tabBarStyle: { 
                paddingBottom: 5, 
                paddingTop: 5, 
                height: 60,
                backgroundColor: 'white',
                borderTopWidth: 0,
                elevation: 10 // Shadow di Android
            }
        })}
    >
       {/* 1. HOME */}
       <Tab.Screen 
            name="Home" 
            children={()=><HomeScreen username={user.username}/>} 
            options={{tabBarIcon:({color})=><Ionicons name="home" size={24} color={color}/>}}
       />
       
       {/* 2. SCANNER (TOMBOL MELAYANG DI TENGAH) */}
       <Tab.Screen 
            name="Scan" 
            component={ScanScreen} 
            options={{
                tabBarIcon: ({focused}) => (
                    <View style={{
                        top: -20, // Membuat tombol naik ke atas (Floating)
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: '#4338ca', // Warna Ungu Utama
                        justifyContent: 'center',
                        alignItems: 'center',
                        elevation: 5, // Bayangan
                        shadowColor: '#4338ca',
                        shadowOpacity: 0.3,
                        shadowRadius: 5,
                        shadowOffset: { width: 0, height: 4 }
                    }}>
                        <Ionicons name="scan" size={30} color="white" />
                    </View>
                ),
                tabBarLabel: () => null // Hilangkan tulisan "Scan" biar bersih
            }}
       />
       
       {/* 3. LAPORAN/STATS */}
       <Tab.Screen 
            name="Laporan" 
            component={StatsScreen} 
            options={{tabBarIcon:({color})=><Ionicons name="stats-chart" size={24} color={color}/>}}
       />
       
       {/* 4. PROFIL */}
       <Tab.Screen 
            name="Profil" 
            component={ProfileScreen} 
            options={{tabBarIcon:({color})=><Ionicons name="person" size={24} color={color}/>}}
       />
    </Tab.Navigator>
  )
}

// --- ROOT APP ---
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Halaman Login/Register */}
        <Stack.Screen name="Login" component={AuthScreen} />
        
        {/* Aplikasi Utama (Home, Scan, Stats, Profil) */}
        <Stack.Screen name="MainApp" component={MainApp} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}