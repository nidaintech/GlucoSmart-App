import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Switch, Modal, TextInput, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { clearUserSession, getUserSession } from './database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = { 
  primary: '#4338ca', secondary: '#f472b6', bg: '#f8fafc', text: '#1e293b', 
  white: '#FFF', danger: '#ef4444', success: '#22c55e', warning: '#f59e0b' 
};

export default function ProfileScreen({ navigation }) {
  const [username, setUsername] = useState('User');
  const [isNotifOn, setIsNotifOn] = useState(true);
  
  // STATE STANDAR AMERIKA (ACCESSIBILITY)
  const [isLargeText, setIsLargeText] = useState(false); // Mode Huruf Besar (Untuk Retinopati)
  const [medicalIdVisible, setMedicalIdVisible] = useState(false); // Kartu Medis Digital

  // STATE BMR
  const [targetModal, setTargetModal] = useState(false);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [dailyTarget, setDailyTarget] = useState(2000);
  const [sosNumber, setSosNumber] = useState('08123456789'); 

  useEffect(() => { loadUserData(); }, []);

  const loadUserData = async () => {
    const u = await getUserSession();
    if (u) setUsername(u.username);
    const savedTarget = await AsyncStorage.getItem('@daily_target');
    if(savedTarget) setDailyTarget(parseInt(savedTarget));
  };

  const handleLogout = () => {
    Alert.alert("Konfirmasi", "Yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      { text: "Ya, Keluar", onPress: async () => {
          await clearUserSession();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }}
    ]);
  };

  const calculateBMR = async () => {
      if(!weight || !height || !age) return Alert.alert("Isi Data", "Mohon isi berat, tinggi, dan usia.");
      let bmr = (10 * parseInt(weight)) + (6.25 * parseInt(height)) - (5 * parseInt(age)) + 5;
      let total = Math.floor(bmr * 1.2);
      setDailyTarget(total);
      await AsyncStorage.setItem('@daily_target', total.toString());
      setTargetModal(false);
      Alert.alert("Berhasil!", `Target harianmu disesuaikan menjadi ${total} kkal.`);
  };

  const sendSOS = () => {
      const message = `TOLONG! Saya hipoglikemia. Lokasi saya di sini. Hubungi medis segera.`;
      const url = `whatsapp://send?text=${message}&phone=${sosNumber}`;
      Linking.openURL(url).catch(() => Alert.alert("Error", "WhatsApp tidak terinstall."));
  };

  // STYLE DINAMIS (Bisa membesar kalau mode aksesibilitas aktif)
  const dynamicFontSize = (size) => isLargeText ? size * 1.3 : size;

  return (
    <View style={styles.container}>
      {/* HEADER PROFIL */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: 'https://i.pravatar.cc/300?img=32' }} style={styles.avatar} />
          <TouchableOpacity onPress={()=>setTargetModal(true)} style={styles.badgeEdit}>
            <Ionicons name="pencil" size={14} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.name, {fontSize: dynamicFontSize(22)}]}>{username}</Text>
        <Text style={[styles.role, {fontSize: dynamicFontSize(14)}]}>Patient ID: #GS-2024-ID</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* FITUR 1: MEDICAL ID CARD (PROFESSOR LOVE THIS) */}
        <TouchableOpacity style={styles.medicalIdBtn} onPress={() => setMedicalIdVisible(true)}>
            <LinearGradient colors={['#ef4444', '#b91c1c']} style={styles.medicalIdGradient}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <Ionicons name="medical" size={30} color="white" />
                    <View style={{marginLeft: 15}}>
                        <Text style={[styles.cardTitle, {fontSize: dynamicFontSize(18)}]}>MEDICAL ID CARD</Text>
                        <Text style={{color:'rgba(255,255,255,0.8)', fontSize: dynamicFontSize(12)}}>Tap to show for paramedics</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" color="white" size={24}/>
            </LinearGradient>
        </TouchableOpacity>

        {/* FITUR 2: SOS BUTTON */}
        <TouchableOpacity style={styles.sosButton} onPress={sendSOS}>
            <View style={styles.sosIcon}><Ionicons name="alert-circle" size={30} color="white" /></View>
            <View>
                <Text style={[styles.sosTitle, {fontSize: dynamicFontSize(18)}]}>SOS EMERGENCY</Text>
                <Text style={[styles.sosSub, {fontSize: dynamicFontSize(12)}]}>Kirim sinyal darurat ke keluarga</Text>
            </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>PENGATURAN MEDIS</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={()=>setTargetModal(true)}>
            <View style={[styles.iconBox, {backgroundColor:'#dcfce7'}]}><Ionicons name="calculator" size={20} color={COLORS.success} /></View>
            <Text style={[styles.menuText, {fontSize: dynamicFontSize(16)}]}>Kalibrasi Target Kalori</Text>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* FITUR 3: ACCESSIBILITY (RETINOPATHY SUPPORT) */}
        <Text style={styles.sectionTitle}>AKSESIBILITAS (MATA)</Text>
        <View style={styles.menuCard}>
          <View style={[styles.menuItem, {borderBottomWidth:0}]}>
            <View style={[styles.iconBox, {backgroundColor:'#e0e7ff'}]}><Ionicons name="eye" size={20} color={COLORS.primary} /></View>
            <View style={{flex:1}}>
                <Text style={[styles.menuText, {fontSize: dynamicFontSize(16)}]}>Mode Teks Besar</Text>
                <Text style={{fontSize: 10, color:'#64748b'}}>Untuk penderita Retinopati</Text>
            </View>
            <Switch value={isLargeText} onValueChange={setIsLargeText} trackColor={{false: "#cbd5e1", true: "#818cf8"}} thumbColor={isLargeText ? COLORS.primary : "#f4f3f4"}/>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={[styles.logoutText, {fontSize: dynamicFontSize(16)}]}>Keluar Akun</Text>
        </TouchableOpacity>
        
        <View style={{height:100}}/>
      </ScrollView>

      {/* MODAL 1: DIGITAL MEDICAL ID (TAMPILAN PROFESIONAL) */}
      <Modal visible={medicalIdVisible} animationType="slide">
          <View style={styles.idCardContainer}>
              <View style={styles.idCardHeader}>
                  <Text style={{color:'white', fontWeight:'bold', fontSize:18}}>EMERGENCY MEDICAL ID</Text>
                  <TouchableOpacity onPress={()=>setMedicalIdVisible(false)}>
                      <Ionicons name="close-circle" size={30} color="white" />
                  </TouchableOpacity>
              </View>
              
              <View style={styles.idCardContent}>
                  <View style={{flexDirection:'row', marginBottom:20}}>
                       <Image source={{ uri: 'https://i.pravatar.cc/300?img=32' }} style={{width:80, height:80, borderRadius:10, borderWidth:1, borderColor:'#ddd'}} />
                       <View style={{marginLeft:15, justifyContent:'center'}}>
                           <Text style={{fontSize:22, fontWeight:'bold'}}>{username}</Text>
                           <Text style={{color:'gray'}}>Born: 12 Jan 1999</Text>
                           <Text style={{color:'gray'}}>Blood Type: <Text style={{fontWeight:'bold', color:'red'}}>O+</Text></Text>
                       </View>
                  </View>

                  <View style={styles.idRow}>
                      <Text style={styles.idLabel}>KONDISI MEDIS</Text>
                      <Text style={styles.idValueRed}>TYPE 2 DIABETES</Text>
                  </View>
                  <View style={styles.idRow}>
                      <Text style={styles.idLabel}>ALERGI</Text>
                      <Text style={styles.idValue}>Penicillin, Kacang</Text>
                  </View>
                  <View style={styles.idRow}>
                      <Text style={styles.idLabel}>PENGOBATAN</Text>
                      <Text style={styles.idValue}>Metformin (500mg), Insulin</Text>
                  </View>
                  <View style={styles.idRow}>
                      <Text style={styles.idLabel}>KONTAK DARURAT</Text>
                      <Text style={styles.idValue}>Ibu (+62 812-3456-7890)</Text>
                  </View>

                  <View style={{marginTop:30, padding:15, backgroundColor:'#fef2f2', borderRadius:10, borderWidth:1, borderColor:'#fca5a5'}}>
                      <Text style={{color:'#b91c1c', fontWeight:'bold', textAlign:'center'}}>
                          JIKA PINGSAN: Berikan gula/permen jika sadar. Jika tidak, segera bawa ke RS.
                      </Text>
                  </View>
              </View>
          </View>
      </Modal>

      {/* MODAL 2: HITUNG KALORI */}
      <Modal visible={targetModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Kalibrasi Target 🧮</Text>
                  <View style={{flexDirection:'row', gap:10}}>
                      <View style={{flex:1}}>
                          <Text style={styles.label}>Berat (kg)</Text>
                          <TextInput style={styles.input} keyboardType="numeric" placeholder="60" value={weight} onChangeText={setWeight}/>
                      </View>
                      <View style={{flex:1}}>
                          <Text style={styles.label}>Tinggi (cm)</Text>
                          <TextInput style={styles.input} keyboardType="numeric" placeholder="170" value={height} onChangeText={setHeight}/>
                      </View>
                  </View>
                  <Text style={styles.label}>Usia (tahun)</Text>
                  <TextInput style={styles.input} keyboardType="numeric" placeholder="20" value={age} onChangeText={setAge}/>

                  <TouchableOpacity onPress={calculateBMR} style={styles.btnSave}>
                      <Text style={{color:'white', fontWeight:'bold'}}>HITUNG & SIMPAN</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>setTargetModal(false)} style={{marginTop:15, alignSelf:'center'}}>
                      <Text style={{color:'#ef4444'}}>Batal</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 30, backgroundColor: 'white', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 2 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: COLORS.primary },
  badgeEdit: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, padding: 6, borderRadius: 20, borderWidth: 2, borderColor: 'white' },
  name: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  role: { fontSize: 14, color: '#64748b', marginTop:5 },
  content: { padding: 20 },

  // MEDICAL ID BUTTON
  medicalIdBtn: { marginBottom: 15, borderRadius: 20, overflow:'hidden', elevation:5 },
  medicalIdGradient: { flexDirection:'row', padding: 20, alignItems:'center', justifyContent:'space-between' },
  cardTitle: { color:'white', fontWeight:'900', fontSize:18 },

  // SOS BUTTON
  sosButton: { flexDirection:'row', backgroundColor:'white', padding:15, borderRadius:20, alignItems:'center', marginBottom:25, borderWidth:2, borderColor: '#fee2e2', elevation:2 },
  sosIcon: { width:50, height:50, backgroundColor: COLORS.danger, borderRadius:25, justifyContent:'center', alignItems:'center', marginRight:15 },
  sosTitle: { color: COLORS.danger, fontWeight:'900', fontSize:18 },
  sosSub: { color: '#b91c1c', fontSize:12 },

  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#94a3b8', marginBottom: 10, marginLeft: 5 },
  menuCard: { backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 20, marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { flex: 1, fontSize: 16, color: COLORS.text, fontWeight: '500' },

  logoutButton: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom:20 },
  logoutText: { color: COLORS.danger, fontWeight: 'bold', marginLeft: 10 },

  // MODAL MEDICAL ID
  idCardContainer: { flex:1, backgroundColor:'white' },
  idCardHeader: { backgroundColor: '#b91c1c', padding: 20, paddingTop: 50, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  idCardContent: { padding: 25 },
  idRow: { marginBottom: 15, borderBottomWidth:1, borderColor:'#f1f5f9', paddingBottom:10 },
  idLabel: { color:'#64748b', fontSize:12, fontWeight:'bold', marginBottom:5 },
  idValue: { fontSize:18, color: COLORS.text, fontWeight:'500' },
  idValueRed: { fontSize:18, color: '#b91c1c', fontWeight:'900' },

  // MODAL BMR
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding:20 },
  modalContent: { backgroundColor: 'white', padding: 25, borderRadius: 20 },
  modalTitle: { fontSize:20, fontWeight:'bold', textAlign:'center', marginBottom:10 },
  label: { fontWeight:'bold', color: COLORS.text, marginBottom:5, marginTop:10 },
  input: { backgroundColor:'#f1f5f9', padding:12, borderRadius:10, fontSize:16 },
  btnSave: { backgroundColor: COLORS.primary, padding:15, borderRadius:12, alignItems:'center', marginTop:20 }
});