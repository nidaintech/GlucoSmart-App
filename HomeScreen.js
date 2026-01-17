import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, FlatList, Modal, TextInput, 
  StyleSheet, Dimensions, Image, Animated, Alert, ActivityIndicator, Share 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti'; 
import moment from 'moment';
import 'moment/locale/id';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import foodData from './foodData.json';
import { 
  getJournalEntries, getHealthLogs, getMedications, 
  saveJournalEntry, saveHealthLog, saveMedication, deleteMedication, deleteJournalEntry 
} from './database';

const COLORS = { 
  primary: '#4338ca', accent: '#0ea5e9', bg: '#F8FAFC', 
  text: '#1e293b', success: '#10b981', warning: '#f59e0b', danger: '#ef4444',
  white: '#FFFFFF', subText: '#64748b', chartBase: '#e2e8f0'
};

const RECIPES = [
  { id: 1, title: "Salad Ayam Grilled", cal: "320 kkal", time: "15 mnt", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60", desc: "Dada ayam panggang dengan sayuran segar." },
  { id: 2, title: "Smoothie Berry", cal: "150 kkal", time: "5 mnt", image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=500&auto=format&fit=crop&q=60", desc: "Campuran strawberry dan blueberry segar." },
  { id: 3, title: "Ikan Tim Jahe", cal: "280 kkal", time: "20 mnt", image: "https://images.unsplash.com/photo-1580476262716-6c3693166863?w=500&auto=format&fit=crop&q=60", desc: "Ikan dori dikukus dengan jahe." }
];

export default function HomeScreen({ username }) {
  const [journal, setJournal] = useState([]);
  const [healthLogs, setHealthLogs] = useState([]);
  const [meds, setMeds] = useState([]);
  const [dailyTarget, setDailyTarget] = useState(2000);
  
  // STATE GRAFIK (DINAMIS)
  const [chartData, setChartData] = useState([]);

  const [greeting, setGreeting] = useState('Halo');
  const [greetingSub, setGreetingSub] = useState('Semoga harimu menyenangkan!');
  
  const [water, setWater] = useState(0);
  const [plantEmoji, setPlantEmoji] = useState('🥀');
  const [plantMsg, setPlantMsg] = useState('Aku haus...');

  const [healthStatus, setHealthStatus] = useState('normal');
  const [insightMsg, setInsightMsg] = useState('Semangat sehat hari ini!');

  // MODALS
  const [foodModal, setFoodModal] = useState(false);
  const [healthModal, setHealthModal] = useState(false);
  const [medModal, setMedModal] = useState(false);
  const [recipeModal, setRecipeModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  const [scanModal, setScanModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [filteredFood, setFilteredFood] = useState([]);
  const [sugar, setSugar] = useState('');
  const [systole, setSystole] = useState('');
  const [diastole, setDiastole] = useState('');
  const [medName, setMedName] = useState('');
  const [medTime, setMedTime] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(useCallback(() => { refreshData(); determineGreeting(); }, []));

  const determineGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 11) { setGreeting('Selamat Pagi'); setGreetingSub('Awali dengan sarapan sehat! 🍳'); } 
      else if (hour < 15) { setGreeting('Selamat Siang'); setGreetingSub('Jangan lupa minum air! ☀️'); } 
      else if (hour < 19) { setGreeting('Selamat Sore'); setGreetingSub('Tetap aktif bergerak ya! 👟'); } 
      else { setGreeting('Selamat Malam'); setGreetingSub('Istirahat yang cukup 🌙'); }
  };

  useEffect(() => {
    if (water < 3) { setPlantEmoji('🥀'); setPlantMsg("Kering... butuh air 🥺"); } 
    else if (water < 6) { setPlantEmoji('🌱'); setPlantMsg("Tumbuh! Lanjut! 🌱"); } 
    else if (water < 8) { setPlantEmoji('🪴'); setPlantMsg("Makin segar! 🌿"); } 
    else { setPlantEmoji('🌻'); setPlantMsg("Target Tercapai! 🎉"); }
  }, [water]);

  useEffect(() => {
      if (healthStatus === 'danger') {
          Animated.loop(Animated.sequence([
              Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
              Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
          ])).start();
      } else { pulseAnim.setValue(1); }
  }, [healthStatus]);

  const refreshData = async () => {
    setJournal(await getJournalEntries());
    const h = await getHealthLogs();
    setHealthLogs(h);
    setMeds(await getMedications());
    const savedTarget = await AsyncStorage.getItem('@daily_target');
    if (savedTarget) setDailyTarget(parseInt(savedTarget));
    
    // --- LOGIKA CHART DINAMIS ---
    // Mengambil 7 data terakhir dari database
    let rawData = h.slice(0, 7).reverse(); // Ambil 7 terakhir, balik urutannya (lama ke baru)
    
    // Kalau data kosong/sedikit, isi dengan dummy biar grafik gak kosong melompong
    if (rawData.length < 7) {
        const dummyNeeded = 7 - rawData.length;
        for(let i=0; i<dummyNeeded; i++) {
            rawData.unshift({ sugar: 100, date: '-' }); // Nilai default 100 (normal)
        }
    }

    const formattedChart = rawData.map((item) => ({
        val: parseInt(item.sugar),
        label: item.date.split(' ')[0] // Ambil tanggalnya aja (misal "12")
    }));
    setChartData(formattedChart);

    // Insight Logic
    if(h.length > 0) {
        if(parseInt(h[0].sugar) > 200) { setHealthStatus('danger'); setInsightMsg('🚨 GULA DARAH TINGGI! Segera periksa.'); } 
        else if (parseInt(h[0].sugar) < 70) { setHealthStatus('danger'); setInsightMsg('🚨 HIPOGLIKEMIA! Makan yang manis.'); }
        else { setHealthStatus('normal'); setInsightMsg('✅ Kondisi tubuh stabil. Pertahankan!'); }
    }
  };

  const confirmDelete = () => {
      if(!selectedItem) return;
      deleteJournalEntry(selectedItem.id).then(() => {
          refreshData();
          setDetailModal(false); 
          setSelectedItem(null);
      });
  };

  const openDetail = (item) => {
      setSelectedItem(item);
      setDetailModal(true);
  }

  const handleAddFood = async (item) => {
    const newEntry = {
      id: Math.random().toString(), foodName: item["Food Name"], calories: item["Calories"], gi: item["Glycemic Index"],
      time: moment().format('HH:mm'), type: 'Makan', isSafe: item["Suitable for Diabetes"] === 1
    };
    await saveJournalEntry(newEntry);
    refreshData(); setFoodModal(false); setSearchText('');
  };

  const handleSaveHealth = async () => {
    if(!sugar) return;
    const log = { id: Math.random().toString(), sugar: sugar, bp: systole ? `${systole}/${diastole}` : '-', date: moment().format('DD MMM') };
    await saveHealthLog(log);
    refreshData(); setHealthModal(false); setSugar('');
  };

  const handleAddMed = async () => {
      if(!medName || !medTime) { Alert.alert("Eits!", "Data tidak lengkap."); return; }
      await saveMedication({ id: Math.random().toString(), name: medName, time: medTime });
      refreshData(); setMedModal(false); setMedName(''); setMedTime('');
  }

  const startScan = () => {
      setScanModal(true); setIsScanning(true); setScanResult(null);
      setTimeout(() => {
          setIsScanning(false);
          setScanResult({
              foodName: "Nasi Goreng Spesial", calories: 450, gi: "Tinggi (70)",
              advice: "⚠️ Porsi ini mengandung karbohidrat tinggi. Sarankan tambah timun/tomat."
          });
      }, 3000);
  }

  // FITUR: EXPORT LAPORAN MEDIS (SIMULASI)
  const handleExportPDF = () => {
      Alert.alert(
          "Generate Laporan Medis",
          "Membuat file PDF dari riwayat kesehatan 30 hari terakhir...",
          [
              { text: "Batal", style: 'cancel' },
              { text: "Unduh", onPress: () => {
                  setTimeout(() => {
                      Alert.alert("Berhasil! 📄", "Laporan 'Medical_Report_Nida.pdf' telah disimpan di folder Download.");
                  }, 1500);
              }}
          ]
      );
  }

  const totalCalories = journal.reduce((sum, item) => sum + item.calories, 0);
  const progressPercent = Math.min((totalCalories / dailyTarget) * 100, 100);
  const getHeaderColors = () => healthStatus === 'danger' ? ['#dc2626', '#ef4444'] : [COLORS.primary, '#6366f1'];

  return (
    <View style={{flex:1, backgroundColor: COLORS.bg}}>
      <LinearGradient colors={getHeaderColors()} style={styles.headerBg}>
            <View style={styles.topBar}>
                <View style={styles.profileRow}>
                    <Image source={{uri: 'https://i.pravatar.cc/150?img=12'}} style={styles.avatar} />
                    <View style={{marginLeft: 10}}>
                        <Text style={styles.greetingText}>{greeting}, {username}</Text>
                        <Text style={styles.subGreeting}>{greetingSub}</Text>
                    </View>
                </View>
                <View style={styles.streakBadge}><Text>🔥 5</Text></View>
            </View>

            <Animated.View style={[styles.insightBox, { transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name={healthStatus === 'danger' ? "warning" : "information-circle"} size={22} color={healthStatus === 'danger' ? '#fee2e2' : 'white'} />
                <Text style={[styles.insightText, healthStatus === 'danger' && {fontWeight:'bold', color:'#fee2e2'}]}>{insightMsg}</Text>
            </Animated.View>

            <View style={{marginTop: 20}}>
                <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:5}}>
                    <Text style={{color:'white', fontSize:12, opacity:0.9}}>Kalori Masuk</Text>
                    <Text style={{color:'white', fontSize:12, fontWeight:'bold'}}>{totalCalories} / {dailyTarget} kkal</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, {width: `${progressPercent}%`}]} />
                </View>
            </View>
      </LinearGradient>

      <ScrollView style={{flex:1, marginTop: -25, borderTopLeftRadius:30, borderTopRightRadius:30, backgroundColor: COLORS.bg}} contentContainerStyle={{paddingTop: 30, paddingBottom:100}} showsVerticalScrollIndicator={false}>
         
         {/* CHART DINAMIS */}
         <View style={styles.sectionContainer}>
             <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                 <Text style={styles.sectionTitle}>Analisis Gula Darah 📊</Text>
                 <TouchableOpacity onPress={handleExportPDF}>
                     <Text style={{color: COLORS.primary, fontSize:12, fontWeight:'bold'}}>📄 Unduh PDF</Text>
                 </TouchableOpacity>
             </View>
             
             <View style={styles.chartCard}>
                 <View style={styles.chartContainer}>
                     {chartData.map((item, index) => {
                         const barHeight = Math.min((item.val / 200) * 100, 100);
                         const isHigh = item.val > 140;
                         return (
                             <View key={index} style={styles.chartCol}>
                                 <Text style={{fontSize:9, color: COLORS.subText, marginBottom:4}}>{item.val}</Text>
                                 <View style={[styles.chartBar, { height: barHeight, backgroundColor: isHigh ? COLORS.danger : COLORS.success }]} />
                                 <Text style={styles.chartLabel}>{item.label}</Text>
                             </View>
                         )
                     })}
                 </View>
                 <Text style={{fontSize:10, color: COLORS.subText, textAlign:'center', marginTop:15}}>*Tren gula darah 7 input terakhir</Text>
             </View>
         </View>

         {/* KEBUN HIDRASI */}
         <View style={styles.sectionContainer}>
             <View style={styles.plantCard}>
                 <View style={styles.plantArea}>
                     <MotiView key={plantEmoji} from={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
                        <Text style={{fontSize: 80}}>{plantEmoji}</Text>
                     </MotiView>
                     <View style={styles.plantBubble}><Text style={{fontSize: 10, fontWeight:'bold', color: COLORS.primary}}>{plantMsg}</Text></View>
                 </View>
                 <View style={{flex:1, marginLeft: 15}}>
                     <Text style={{fontSize:16, fontWeight:'bold', color: COLORS.text}}>Kebun Hidrasi</Text>
                     <Text style={{color: COLORS.subText, fontSize:12, marginBottom:10}}>Target: 8 Gelas (Skrg: <Text style={{fontWeight:'bold', color:COLORS.accent}}>{water}</Text>)</Text>
                     <View style={{flexDirection:'row', gap:10}}>
                         <TouchableOpacity onPress={()=>setWater(Math.max(0, water-1))} style={[styles.btnWater, {backgroundColor: '#e2e8f0'}]}><Ionicons name="remove" size={20} color={COLORS.text}/></TouchableOpacity>
                         <TouchableOpacity onPress={()=>setWater(water+1)} style={[styles.btnWater, {backgroundColor: COLORS.accent}]}><Ionicons name="water" size={20} color="white"/></TouchableOpacity>
                     </View>
                 </View>
             </View>
         </View>

         {/* MENU GRID */}
         <View style={styles.gridContainer}>
             <TouchableOpacity style={styles.gridBtn} onPress={()=>setFoodModal(true)}>
                 <View style={[styles.gridIcon, {backgroundColor:'#dcfce7'}]}><Text style={{fontSize:24}}>🍎</Text></View>
                 <Text style={styles.gridLabel}>Makan</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.gridBtn} onPress={()=>setHealthModal(true)}>
                 <View style={[styles.gridIcon, {backgroundColor:'#fee2e2'}]}><Text style={{fontSize:24}}>🩸</Text></View>
                 <Text style={styles.gridLabel}>Gula</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.gridBtn} onPress={()=>setMedModal(true)}>
                 <View style={[styles.gridIcon, {backgroundColor:'#e0e7ff'}]}><Text style={{fontSize:24}}>💊</Text></View>
                 <Text style={styles.gridLabel}>Obat</Text>
             </TouchableOpacity>
         </View>

         {/* RESEP */}
         <View style={{paddingLeft:20, marginBottom:25}}>
             <Text style={styles.sectionTitle}>Inspirasi Masak Sehat 🍳</Text>
             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                 {RECIPES.map((item) => (
                     <TouchableOpacity key={item.id} style={styles.recipeCard} onPress={()=>{setSelectedRecipe(item); setRecipeModal(true)}}>
                         <Image source={{uri: item.image}} style={styles.recipeImg} />
                         <View style={{padding:10}}>
                             <Text style={styles.recipeTitle}>{item.title}</Text>
                             <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:5}}>
                                 <Text style={{fontSize:10, color:COLORS.subText}}>⏱️ {item.time}</Text>
                                 <Text style={{fontSize:10, color:COLORS.success, fontWeight:'bold'}}>{item.cal}</Text>
                             </View>
                         </View>
                     </TouchableOpacity>
                 ))}
             </ScrollView>
         </View>

         {/* JADWAL OBAT */}
         {meds.length > 0 && (
             <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Jadwal Obat</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {meds.map((m) => (
                        <TouchableOpacity key={m.id} onLongPress={async()=>{await deleteMedication(m.id); refreshData()}} style={styles.medTicket}>
                            <View style={styles.medTimeBadge}><Text style={{color:'white', fontWeight:'bold', fontSize:10}}>{m.time}</Text></View>
                            <View style={{padding:10, paddingTop:5}}>
                                <Text style={styles.medName}>{m.name}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
             </View>
         )}

         {/* JURNAL */}
         <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Riwayat Makan</Text>
            {journal.length === 0 ? (
                <View style={styles.emptyJournal}><Text style={{fontSize:30}}>🍽️</Text><Text style={{color: COLORS.subText}}>Belum ada catatan.</Text></View>
            ) : (
                journal.map((item) => (
                    <TouchableOpacity key={item.id} onPress={() => openDetail(item)} activeOpacity={0.7} style={styles.timelineRow}>
                        <View style={styles.timeCol}>
                            <Text style={styles.timeText}>{item.time}</Text>
                            <View style={styles.line} />
                        </View>
                        <View style={styles.foodCard}>
                            <View style={{flex:1}}>
                                <Text style={styles.foodName}>{item.foodName}</Text>
                                <Text style={styles.foodMeta}>{item.calories} kkal • GI: {item.gi}</Text>
                            </View>
                            <View style={[styles.statusBadge, {backgroundColor: item.isSafe ? '#dcfce7' : '#fef3c7'}]}>
                                <Text style={{fontSize:10, fontWeight:'bold', color: item.isSafe ? COLORS.success : COLORS.warning}}>{item.isSafe ? 'Aman' : 'Pantau'}</Text>
                            </View>
                            <Ionicons name="chevron-forward" color="#cbd5e1" size={16} />
                        </View>
                    </TouchableOpacity>
                ))
            )}
         </View>
      </ScrollView>

      {/* FAB SCANNER */}
      <TouchableOpacity style={styles.fab} onPress={startScan}>
          <LinearGradient colors={['#2563eb', '#1d4ed8']} style={styles.fabGradient}>
            <Ionicons name="scan" size={24} color="white" />
          </LinearGradient>
      </TouchableOpacity>

      {/* DETAIL MODAL (HAPUS) */}
      <Modal visible={detailModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  {selectedItem && (
                      <View style={{alignItems:'center'}}>
                          <Text style={{fontSize:50, marginBottom:10}}>🍽️</Text>
                          <Text style={styles.modalTitle}>{selectedItem.foodName}</Text>
                          <View style={{flexDirection:'row', gap:15, marginBottom:20}}>
                              <View style={styles.detailBox}><Text style={styles.detailLabel}>KALORI</Text><Text style={styles.detailValue}>{selectedItem.calories}</Text></View>
                              <View style={styles.detailBox}><Text style={styles.detailLabel}>GI LEVEL</Text><Text style={styles.detailValue}>{selectedItem.gi}</Text></View>
                              <View style={styles.detailBox}><Text style={styles.detailLabel}>WAKTU</Text><Text style={styles.detailValue}>{selectedItem.time}</Text></View>
                          </View>
                          <TouchableOpacity onPress={confirmDelete} style={styles.btnDeleteBig}>
                              <Ionicons name="trash" color="white" size={20} />
                              <Text style={{color:'white', fontWeight:'bold', marginLeft:10}}>HAPUS DATA INI</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={()=>setDetailModal(false)} style={{marginTop:15}}><Text style={{color: COLORS.subText}}>Tutup</Text></TouchableOpacity>
                      </View>
                  )}
              </View>
          </View>
      </Modal>

      {/* LAIN-LAIN */}
      <Modal visible={scanModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>AI Food Scanner 🤖</Text>
                  {isScanning ? (
                      <View style={{alignItems:'center', padding:20}}>
                          <ActivityIndicator size="large" color={COLORS.primary} />
                          <Text style={{marginTop:15, color: COLORS.subText}}>Menganalisis nutrisi...</Text>
                      </View>
                  ) : scanResult ? (
                      <View style={{alignItems:'center'}}>
                          <Text style={{fontSize:50}}>🍛</Text>
                          <Text style={{fontSize:20, fontWeight:'bold', marginTop:10}}>{scanResult.foodName}</Text>
                          <Text style={{fontSize:16, color: COLORS.subText}}>{scanResult.calories} kkal • GI: {scanResult.gi}</Text>
                          <View style={{backgroundColor:'#fffbeb', padding:10, borderRadius:10, marginTop:15, width:'100%'}}><Text style={{color:'#b45309'}}>{scanResult.advice}</Text></View>
                          <TouchableOpacity onPress={()=>setScanModal(false)} style={[styles.btnPrimary, {marginTop:20, width:'100%'}]}><Text style={{color:'white'}}>Tutup & Catat</Text></TouchableOpacity>
                      </View>
                  ) : null}
              </View>
          </View>
      </Modal>

      <Modal visible={recipeModal} animationType="slide" transparent>
         <View style={styles.modalOverlay}>
             <View style={styles.modalContent}>
                 {selectedRecipe && (
                     <>
                        <Image source={{uri: selectedRecipe.image}} style={{width:'100%', height:150, borderRadius:15, marginBottom:15}}/>
                        <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>
                        <View style={{flexDirection:'row', gap:10, marginBottom:15, justifyContent:'center'}}>
                            <View style={styles.tag}><Text style={{fontSize:12}}>🔥 {selectedRecipe.cal}</Text></View>
                            <View style={styles.tag}><Text style={{fontSize:12}}>⏱️ {selectedRecipe.time}</Text></View>
                        </View>
                        <Text style={{lineHeight:20, color:COLORS.text}}>{selectedRecipe.desc}</Text>
                     </>
                 )}
                 <TouchableOpacity onPress={()=>setRecipeModal(false)} style={styles.btnClose}><Text>Tutup Resep</Text></TouchableOpacity>
             </View>
         </View>
      </Modal>

      <Modal visible={foodModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Catat Makanan</Text>
            <TextInput placeholder="Cari makanan..." style={styles.inputBox} autoFocus onChangeText={(t)=>{setSearchText(t); setFilteredFood(foodData.filter(f=>f["Food Name"].toLowerCase().includes(t.toLowerCase())).slice(0,5))}}/>
            <FlatList data={filteredFood} renderItem={({item})=>(
                <TouchableOpacity onPress={()=>handleAddFood(item)} style={styles.searchItem}><Text style={{fontWeight:'bold'}}>{item["Food Name"]}</Text><Ionicons name="add-circle" size={24} color={COLORS.primary}/></TouchableOpacity>
            )}/>
            <TouchableOpacity onPress={()=>setFoodModal(false)} style={styles.btnClose}><Text>Tutup</Text></TouchableOpacity>
        </View></View>
      </Modal>

      <Modal visible={healthModal} transparent animationType="fade">
          <View style={styles.modalOverlay}><View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Input Kesehatan</Text>
              <TextInput placeholder="Gula (mg/dL)" keyboardType="numeric" style={styles.inputBox} value={sugar} onChangeText={setSugar}/>
              <View style={{flexDirection:'row', gap:10}}>
                 <TextInput placeholder="Sistolik" keyboardType="numeric" style={[styles.inputBox, {flex:1}]} value={systole} onChangeText={setSystole}/>
                 <TextInput placeholder="Diastolik" keyboardType="numeric" style={[styles.inputBox, {flex:1}]} value={diastole} onChangeText={setDiastole}/>
              </View>
              <TouchableOpacity onPress={handleSaveHealth} style={styles.btnPrimary}><Text style={{color:'white'}}>SIMPAN</Text></TouchableOpacity>
              <TouchableOpacity onPress={()=>setHealthModal(false)} style={styles.btnClose}><Text>Batal</Text></TouchableOpacity>
          </View></View>
      </Modal>

      <Modal visible={medModal} transparent animationType="fade">
          <View style={styles.modalOverlay}><View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Jadwal Obat</Text>
              <TextInput placeholder="Nama Obat (Contoh: Insulin)" style={styles.inputBox} value={medName} onChangeText={setMedName}/>
              <TextInput placeholder="Jam (Contoh: 08:00)" style={styles.inputBox} value={medTime} onChangeText={setMedTime} keyboardType="numbers-and-punctuation"/>
              <TouchableOpacity onPress={handleAddMed} style={styles.btnPrimary}><Text style={{color:'white'}}>SIMPAN JADWAL</Text></TouchableOpacity>
              <TouchableOpacity onPress={()=>setMedModal(false)} style={styles.btnClose}><Text>Batal</Text></TouchableOpacity>
          </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBg: { padding: 25, paddingTop: 50, paddingBottom: 50 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 45, height: 45, borderRadius: 25, borderWidth:2, borderColor:'rgba(255,255,255,0.3)' },
  greetingText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  subGreeting: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  streakBadge: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  insightBox: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', borderWidth:1, borderColor:'rgba(255,255,255,0.1)' },
  insightText: { color: 'white', marginLeft: 10, flex: 1, fontSize: 12, fontWeight: '500' },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3 },
  progressBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },

  sectionContainer: { paddingHorizontal: 20, marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
  
  chartCard: { backgroundColor: 'white', borderRadius: 16, padding: 15, elevation: 2 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: COLORS.chartBase },
  chartCol: { alignItems: 'center', flex: 1 },
  chartBar: { width: 12, borderRadius: 6 },
  chartLabel: { fontSize: 10, color: COLORS.subText, marginTop: 5 },

  recipeCard: { width: 180, backgroundColor:'white', borderRadius:15, marginRight:15, elevation:3, overflow:'hidden' },
  recipeImg: { width:'100%', height:100 },
  recipeTitle: { fontWeight:'bold', fontSize:14, color: COLORS.text },
  tag: { backgroundColor: '#f1f5f9', paddingHorizontal:8, paddingVertical:4, borderRadius:8 },

  plantCard: { backgroundColor: 'white', borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  plantArea: { width: 100, alignItems: 'center', justifyContent: 'center' },
  plantBubble: { marginTop: 5, backgroundColor: '#f1f5f9', padding: 5, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: '#cbd5e1' },
  btnWater: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  gridContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginBottom: 25 },
  gridBtn: { alignItems: 'center' },
  gridIcon: { width: 55, height: 55, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8, elevation: 2 },
  gridLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text },

  medTicket: { backgroundColor: 'white', borderRadius: 12, marginRight: 15, width: 110, overflow:'hidden', elevation: 2, borderWidth:1, borderColor:'#f1f5f9' },
  medTimeBadge: { backgroundColor: COLORS.primary, padding: 4, alignItems:'center' },
  medName: { fontWeight:'bold', color: COLORS.text, fontSize:13 },

  timeCol: { width: 50, alignItems: 'center' },
  timeText: { fontSize: 12, fontWeight: 'bold', color: COLORS.subText, marginBottom: 5 },
  line: { width: 2, flex: 1, backgroundColor: '#e2e8f0', marginBottom: -10 },
  timelineRow: { flexDirection: 'row', marginBottom: 15 },
  foodCard: { flex: 1, backgroundColor: 'white', padding: 15, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  foodName: { fontWeight: 'bold', color: COLORS.text },
  foodMeta: { fontSize: 11, color: COLORS.subText },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  emptyJournal: { alignItems: 'center', padding: 30, backgroundColor: 'white', borderRadius: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#cbd5e1' },

  fab: { position: 'absolute', bottom: 20, right: 20, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity:0.3, shadowRadius:4, elevation:5 },
  fabGradient: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  
  detailBox: { alignItems:'center', backgroundColor:'#f8fafc', padding:10, borderRadius:10, minWidth:80 },
  detailLabel: { fontSize:10, color: COLORS.subText, fontWeight:'bold' },
  detailValue: { fontSize:16, fontWeight:'bold', color: COLORS.primary, marginTop:2 },
  btnDeleteBig: { flexDirection:'row', backgroundColor: COLORS.danger, padding:15, borderRadius:15, width:'100%', alignItems:'center', justifyContent:'center', marginTop:20, elevation:2 },

  inputBox: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, marginBottom: 15, fontSize: 16 },
  searchItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  btnPrimary: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 15, alignItems: 'center' },
  btnClose: { alignSelf: 'center', marginTop: 20 },
});