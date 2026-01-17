import AsyncStorage from '@react-native-async-storage/async-storage';

// KUNCI DATABASE
const JOURNAL_KEY = '@gluco_journal_final';
const USER_KEY = '@gluco_user_final';
const HEALTH_KEY = '@gluco_health_final';
const MEDS_KEY = '@gluco_meds_final';
const ALL_USERS_KEY = '@gluco_users_db_final';

// --- USER ---
export const saveUserSession = async (username) => { try { await AsyncStorage.setItem(USER_KEY, JSON.stringify({ username, isLoggedIn: true })); } catch (e) {} };
export const getUserSession = async () => { try { const v = await AsyncStorage.getItem(USER_KEY); return v ? JSON.parse(v) : null; } catch (e) { return null; } };
export const clearUserSession = async () => { try { await AsyncStorage.removeItem(USER_KEY); } catch (e) {} };
export const registerUser = async (username, password) => {
  try {
    const users = await getAllUsers();
    if (users.find(u => u.username === username)) return { success: false, msg: 'Username dipakai!' };
    await AsyncStorage.setItem(ALL_USERS_KEY, JSON.stringify([...users, { username, password }]));
    return { success: true };
  } catch (e) { return { success: false, msg: 'Error DB' }; }
};
export const verifyLogin = async (username, password) => {
  try {
    const users = await getAllUsers();
    return users.find(u => u.username === username && u.password === password) ? { success: true } : { success: false, msg: 'Salah!' };
  } catch (e) { return { success: false }; }
};
const getAllUsers = async () => { try { const v = await AsyncStorage.getItem(ALL_USERS_KEY); return v ? JSON.parse(v) : []; } catch (e) { return []; } };

// --- JURNAL (DENGAN DELETE) ---
export const saveJournalEntry = async (newEntry) => {
  try {
    const existing = await getJournalEntries();
    const updated = [newEntry, ...existing];
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) { return []; }
};
export const getJournalEntries = async () => { try { const v = await AsyncStorage.getItem(JOURNAL_KEY); return v ? JSON.parse(v) : []; } catch (e) { return []; } };

// *** FUNGSI HAPUS MAKANAN ***
export const deleteJournalEntry = async (id) => {
  try {
    const existing = await getJournalEntries();
    const updated = existing.filter(item => item.id !== id);
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) { return []; }
};

// --- HEALTH & MEDS ---
export const saveHealthLog = async (log) => {
  try { const ex = await getHealthLogs(); const up = [log, ...ex]; await AsyncStorage.setItem(HEALTH_KEY, JSON.stringify(up)); return up; } catch (e) { return []; }
};
export const getHealthLogs = async () => { try { const v = await AsyncStorage.getItem(HEALTH_KEY); return v ? JSON.parse(v) : []; } catch (e) { return []; } };
export const saveMedication = async (med) => {
    try { const ex = await getMedications(); const up = [...ex, med]; await AsyncStorage.setItem(MEDS_KEY, JSON.stringify(up)); return up; } catch (e) { return []; }
};
export const getMedications = async () => { try { const v = await AsyncStorage.getItem(MEDS_KEY); return v ? JSON.parse(v) : []; } catch (e) { return []; } };
export const deleteMedication = async (id) => {
    const ex = await getMedications(); const up = ex.filter(m => m.id !== id); await AsyncStorage.setItem(MEDS_KEY, JSON.stringify(up)); return up;
}