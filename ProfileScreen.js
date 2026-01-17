import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Switch, Modal, TextInput, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { clearUserSession, getUserSession } from './database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native'; // Wajib untuk navigasi

const COLORS = { 
  primary: '#4338ca', secondary: '#f472b6', bg: '#f8fafc', text: '#1e293b', 
  white: '#FFF', danger: '#ef4444', success: '#22c55e', warning: '#f59e0b', subText: '#64748b' 
};

export default function ProfileScreen() {
  const navigation = useNavigation(); // Hook navigasi
  const [username, setUsername] = useState('User');
  const [isLargeText, setIsLargeText] = useState(false); 
  const [medicalIdVisible, setMedicalIdVisible] = useState(false);
  const [targetModal, setTargetModal] = useState(false);
  
  // Data BMR
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');

  useEffect(() => { loadUserData(); }, []);

  const loadUserData = async () => {
    const u = await getUserSession();
    if (u) setUsername(u.username);
  };

  // --- FUNGSI LOGOUT YANG BENAR ---
  const handleLogout = async () => {
    Alert.alert("Keluar Aplikasi", "Yakin ingin keluar akun?", [
      { text: "Batal", style: "cancel" },
      { text: "Keluar", style: "destructive", onPress: async () => {
          await clearUserSession(); // Hapus sesi
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); // Tendang ke Login
      }}
    ]);
  };

  const calculateBMR = async () => {
      if(!weight || !height || !age) return Alert.alert("Isi Data", "Mohon isi berat, tinggi, dan usia.");
      let bmr = (10 * parseInt(weight)) + (6.25 * parseInt(height)) - (5 * parseInt(age)) + 5;
      let total = Math.floor(bmr * 1.2);
      await AsyncStorage.setItem('@daily_target', total.toString());
      setTargetModal(false);
      Alert.alert("Sukses", `Target kalori diupdate: ${total} kkal`);
  };

  const dynamicFontSize = (size) => isLargeText ? size * 1.3 : size;

  // Navigasi Balik ke Home
  const goHome = () => navigation.navigate('Home');

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: 'https://i.pravatar.cc/300?img=12' }} style={styles.avatar} />
          <TouchableOpacity onPress={()=>setTargetModal(true)} style={styles.badgeEdit}><Ionicons name="pencil" size={14} color="white" /></TouchableOpacity>
        </View>
        <Text style={[styles.name, {fontSize: dynamicFontSize(22)}]}>{username}</Text>
        <Text style={[styles.role, {fontSize: dynamicFontSize(14)}]}>Pasien Diabetes Tipe 2</Text>
      </View>

      {/* CONTENT */}
      <ScrollView style={styles.content} contentContainerStyle={{paddingBottom: 120}} showsVerticalScrollIndicator={false}>
        
        {/* MEDICAL ID */}
        <TouchableOpacity style={styles.medicalIdBtn} onPress={() => setMedicalIdVisible(true)}>
            <LinearGradient colors={['#ef4444', '#b91c1c']} style={styles.medicalIdGradient}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Ionicons name="medical" size={30} color="white" />
                    <View style={{marginLeft: 15}}>
                        <Text style={[styles.cardTitle, {fontSize: dynamicFontSize(18)}]}>MEDICAL ID CARD</Text>
                        <Text style={{color:'rgba(255,255,255,0.8)', fontSize: dynamicFontSize(12)}}>Klik untuk keadaan darurat</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" color="white" size={24}/>
            </LinearGradient>
        </TouchableOpacity>

        {/* SOS BUTTON */}
        <TouchableOpacity style={styles.sosButton} onPress={() => Linking.openURL('tel:112')}>
            <View style={styles.sosIcon}><Ionicons name="alert-circle" size={30} color="white" /></View>
            <View>
                <Text style={[styles.sosTitle, {fontSize: dynamicFontSize(18)}]}>SOS CALL</Text>
                <Text style={[styles.sosSub, {fontSize: dynamicFontSize(12)}]}>Panggilan Darurat (112)</Text>
            </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>PENGATURAN</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={()=>setTargetModal(true)}>
            <View style={[styles.iconBox, {backgroundColor:'#dcfce7'}]}><Ionicons name="calculator" size={20} color={COLORS.success} /></View>
            <Text style={[styles.menuText, {fontSize: dynamicFontSize(16)}]}>Target Kalori (BMR)</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
          
          <View style={[styles.menuItem, {borderBottomWidth:0}]}>
            <View style={[styles.iconBox, {backgroundColor:'#e0e7ff'}]}><Ionicons name="eye" size={20} color={COLORS.primary} /></View>
            <View style={{flex:1}}>
                <Text style={[styles.menuText, {fontSize: dynamicFontSize(16)}]}>Teks Besar (Mata)</Text>
            </View>
            <Switch value={isLargeText} onValueChange={setIsLargeText} trackColor={{false: "#cbd5e1", true: "#818cf8"}} thumbColor={isLargeText ? COLORS.primary : "#f4f3f4"}/>
          </View>
        </View>

        {/* TOMBOL LOGOUT */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={[styles.logoutText, {fontSize: dynamicFontSize(16)}]}>Keluar Akun</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* --- BOTTOM NAVBAR (SAMA SEPERTI HOME) --- */}
      <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={goHome}>
              <Ionicons name="home-outline" size={24} color={COLORS.subText} />
              <Text style={{fontSize:10, color: COLORS.subText}}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={goHome}>
              <Ionicons name="stats-chart-outline" size={24} color={COLORS.subText} />
              <Text style={{fontSize:10, color: COLORS.subText}}>Analisis</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navScanBtn} onPress={goHome}>
              <LinearGradient colors={['#94a3b8', '#64748b']} style={styles.scanGradient}>
                  <Ionicons name="scan" size={28} color="white" />
              </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
              <Ionicons name="person" size={24} color={COLORS.primary} />
              <Text style={{fontSize:10, color: COLORS.primary, fontWeight:'bold'}}>Profil</Text>
          </TouchableOpacity>
      </View>

      {/* MODALS (Medical ID & BMR) */}
      <Modal visible={medicalIdVisible} animationType="slide"><View style={styles.idCardContainer}><View style={styles.idCardHeader}><Text style={{color:'white', fontWeight:'bold', fontSize:18}}>EMERGENCY ID</Text><TouchableOpacity onPress={()=>setMedicalIdVisible(false)}><Ionicons name="close-circle" size={30} color="white" /></TouchableOpacity></View><View style={styles.idCardContent}><Text style={{fontSize:20, fontWeight:'bold', marginBottom:10}}>{username}</Text><Text>Golongan Darah: O+</Text><Text>Alergi: Kacang</Text><Text style={{marginTop:20, color:'red', fontWeight:'bold'}}>DIABETES TIPE 2</Text></View></View></Modal>
      <Modal visible={targetModal} transparent animationType="slide"><View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>Hitung BMR</Text><TextInput style={styles.input} placeholder="Berat (kg)" keyboardType="numeric" onChangeText={setWeight}/><TextInput style={styles.input} placeholder="Tinggi (cm)" keyboardType="numeric" onChangeText={setHeight}/><TextInput style={styles.input} placeholder="Usia" keyboardType="numeric" onChangeText={setAge}/><TouchableOpacity onPress={calculateBMR} style={styles.btnSave}><Text style={{color:'white'}}>Simpan</Text></TouchableOpacity><TouchableOpacity onPress={()=>setTargetModal(false)} style={{marginTop:10, alignSelf:'center'}}><Text>Batal</Text></TouchableOpacity></View></View></Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { alignItems: 'center', paddingTop: 50, paddingBottom: 20, backgroundColor: 'white', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 2 },
  avatarContainer: { position: 'relative', marginBottom: 10 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: COLORS.primary },
  badgeEdit: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, padding: 5, borderRadius: 20, borderWidth: 2, borderColor: 'white' },
  name: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  role: { fontSize: 14, color: '#64748b' },
  content: { padding: 20 },
  
  medicalIdBtn: { marginBottom: 15, borderRadius: 20, overflow:'hidden', elevation:3 },
  medicalIdGradient: { flexDirection:'row', padding: 20, alignItems:'center', justifyContent:'space-between' },
  cardTitle: { color:'white', fontWeight:'900', fontSize:18 },
  sosButton: { flexDirection:'row', backgroundColor:'white', padding:15, borderRadius:20, alignItems:'center', marginBottom:25, borderWidth:2, borderColor: '#fee2e2', elevation:2 },
  sosIcon: { width:50, height:50, backgroundColor: COLORS.danger, borderRadius:25, justifyContent:'center', alignItems:'center', marginRight:15 },
  sosTitle: { color: COLORS.danger, fontWeight:'900', fontSize:18 },
  sosSub: { color: '#b91c1c', fontSize:12 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#94a3b8', marginBottom: 10, marginLeft: 5 },
  menuCard: { backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 20, marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { flex: 1, fontSize: 16, color: COLORS.text, fontWeight: '500' },
  logoutButton: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth:1, borderColor:'#fee2e2' },
  logoutText: { color: COLORS.danger, fontWeight: 'bold', marginLeft: 10 },

  // BOTTOM NAV
  bottomNav: { position:'absolute', bottom:20, left:20, right:20, backgroundColor:'white', borderRadius:30, flexDirection:'row', justifyContent:'space-around', alignItems:'center', paddingVertical:10, elevation:10, shadowColor:'#000', shadowOffset:{width:0, height:5}, shadowOpacity:0.15, shadowRadius:10 },
  navItem: { alignItems:'center', justifyContent:'center', flex:1 },
  navScanBtn: { marginTop:-45 },
  scanGradient: { width:60, height:60, borderRadius:30, justifyContent:'center', alignItems:'center', elevation:5 },

  // MODALS
  idCardContainer: { flex:1, backgroundColor:'white' },
  idCardHeader: { backgroundColor: '#b91c1c', padding: 20, paddingTop: 50, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  idCardContent: { padding: 25 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding:20 },
  modalContent: { backgroundColor: 'white', padding: 25, borderRadius: 20 },
  modalTitle: { fontSize:20, fontWeight:'bold', textAlign:'center', marginBottom:15 },
  input: { backgroundColor:'#f1f5f9', padding:12, borderRadius:10, fontSize:16, marginBottom:10 },
  btnSave: { backgroundColor: COLORS.primary, padding:15, borderRadius:12, alignItems:'center', marginTop:10 }
});