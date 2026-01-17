import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { registerUser } from './database';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if(!username || !password) return Alert.alert("Error", "Isi semua data!");
    
    const res = await registerUser(username, password);
    if (res.success) {
      Alert.alert("Sukses", "Akun berhasil dibuat! Silakan login.");
      navigation.goBack(); // Balik ke Login
    } else {
      Alert.alert("Gagal", res.msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buat Akun Baru</Text>
      <Text style={styles.subtitle}>Mulai hidup sehat hari ini.</Text>

      <View style={{marginTop: 30}}>
        <Text style={styles.label}>Username Baru</Text>
        <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none"/>
        
        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry/>

        <TouchableOpacity style={styles.btnReg} onPress={handleRegister}>
          <Text style={styles.btnText}>DAFTAR SEKARANG</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop:20}}>
          <Text style={{color:'#64748b', textAlign:'center'}}>Sudah punya akun? <Text style={{color:'#4338ca', fontWeight:'bold'}}>Login</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 30, justifyContent:'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4338ca' },
  subtitle: { color: '#64748b', marginTop: 5 },
  label: { fontWeight: 'bold', color: '#1e293b', marginBottom: 5, marginTop: 20 },
  input: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1' },
  btnReg: { backgroundColor: '#0ea5e9', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  btnText: { color: 'white', fontWeight: 'bold' }
});