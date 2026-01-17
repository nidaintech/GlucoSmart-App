import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { verifyLogin, saveUserSession } from './database';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if(!username || !password) return Alert.alert("Error", "Isi username dan password!");
    
    const res = await verifyLogin(username, password);
    if (res.success) {
      await saveUserSession(username); // Simpan sesi biar gak login terus
      navigation.replace('Home', { username }); // Pindah ke Home & gak bisa back
    } else {
      Alert.alert("Gagal", res.msg);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4338ca', '#6366f1']} style={styles.header}>
          <Text style={{fontSize:50}}>🩸</Text>
          <Text style={styles.title}>GlucoSmart</Text>
          <Text style={styles.subtitle}>Kelola Diabetes dengan Cerdas</Text>
      </LinearGradient>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} placeholder="Contoh: Nida" value={username} onChangeText={setUsername} autoCapitalize="none"/>
        
        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} placeholder="******" value={password} onChangeText={setPassword} secureTextEntry/>

        <TouchableOpacity style={styles.btnLogin} onPress={handleLogin}>
          <Text style={styles.btnText}>MASUK</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{marginTop:20}}>
          <Text style={{color:'#64748b', textAlign:'center'}}>Belum punya akun? <Text style={{color:'#4338ca', fontWeight:'bold'}}>Daftar</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { height: 300, justifyContent: 'center', alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginTop: 10 },
  subtitle: { color: '#e0e7ff', marginTop: 5 },
  formContainer: { flex: 1, padding: 30, marginTop: -50, backgroundColor: 'white', marginHorizontal: 20, borderRadius: 20, marginBottom: 50, elevation: 5 },
  label: { fontWeight: 'bold', color: '#1e293b', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#f1f5f9', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1' },
  btnLogin: { backgroundColor: '#4338ca', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30, elevation: 3 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});