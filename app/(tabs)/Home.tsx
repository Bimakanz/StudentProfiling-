import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView, StatusBar, Text,
  TouchableOpacity, View, Modal
} from 'react-native';

const API_URL = 'http://192.168.1.5:8000/api';

type User = {
  id: number;
  name: string;
  email: string;
  jurusan?: string;
  kelas?: string;
  foto_profil?: string;
};

// ─── Komponen ─────────────────────────────────────────────────────────────────

const StatCard = ({ value, label }: { value: string | number; label: string }) => (
  <View style={{ flex: 1, position: 'relative' }}>
    {/* Shadow behind */}
    <View style={{
      position: 'absolute', top: 6, left: 6, right: -6, bottom: -6,
      backgroundColor: '#000', borderWidth: 2, borderColor: '#000'
    }} />
    {/* Main Card */}
    <View style={{
      backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#000000',
      padding: 16, gap: 8, justifyContent: 'center'
    }}>
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 28, color: '#FF7F50' }}>{value}</Text>
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: '#000', letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {label}
      </Text>
    </View>
  </View>
);

const MenuCard = ({ icon, label, onPress }: { icon: any; label: string; onPress?: () => void }) => (
  <View style={{ flex: 1, position: 'relative' }}>
    <View style={{
      position: 'absolute', top: 4, left: 4, right: -4, bottom: -4,
      backgroundColor: '#000', borderWidth: 2, borderColor: '#000'
    }} />
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#000000',
        paddingVertical: 20, alignItems: 'center', gap: 10,
      }}
    >
      <Ionicons name={icon} size={28} color="#253341" />
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#000', letterSpacing: 0.5 }}>
        {label}
      </Text>
    </TouchableOpacity>
  </View>
);

const DrawerItem = ({ icon, label, active, onPress }: { icon: string; label: string; active?: boolean; onPress?: () => void }) => {
  if (active) {
    return (
      <View style={{ paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#000' }}>
        <View style={{ position: 'relative' }}>
          {/* Shadow Background */}
          <View style={{
            position: 'absolute', top: 4, left: 4, right: -4, bottom: -4,
            backgroundColor: '#000', borderWidth: 2, borderColor: '#000'
          }} />
          {/* Main Content */}
          <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{
            flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16,
            backgroundColor: '#FF7F50', borderWidth: 2, borderColor: '#000',
          }}>
            <Ionicons name={icon as any} size={20} color="#000" />
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: '#000', letterSpacing: 1 }}>{label.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={{
      flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, paddingHorizontal: 20,
      borderBottomWidth: 1, borderBottomColor: '#000',
      backgroundColor: '#ffffff',
    }}>
      <Ionicons name={icon as any} size={20} color="#000" />
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: '#000', letterSpacing: 1 }}>{label.toUpperCase()}</Text>
    </TouchableOpacity>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [portoCount, setPortoCount] = useState(0);
  const [sertiCount, setSertiCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [menuVisible, setMenuVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [logoutModal, setLogoutModal] = useState(false);

  const toggleMenu = () => {
    const toValue = menuVisible ? 0 : 1;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setMenuVisible(!menuVisible);
  };

  const confirmLogout = async () => {
    await AsyncStorage.removeItem('user');
    setLogoutModal(false);
    router.replace('/homescreen');
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-280, 0],
  });

  const overlayOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  const fetchData = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const parsed: User = JSON.parse(stored);
        setUser(parsed);
        // Ambil jumlah portofolio
        const res = await fetch(`${API_URL}/user/${parsed.id}/portofolio-count`, {
          headers: { Accept: 'application/json' },
        });
        const json = await res.json();
        setPortoCount(json.count ?? 0);

        // Ambil jumlah sertifikasi
        const resSerti = await fetch(`${API_URL}/user/${parsed.id}/sertifikasi-count`, {
          headers: { Accept: 'application/json' },
        });
        const jsonSerti = await resSerti.json();
        setSertiCount(jsonSerti.count ?? 0);

        // Ambil fresh user data
        const resUser = await fetch(`${API_URL}/user/${parsed.id}`, { headers: { Accept: 'application/json' } });
        const jsonUser = await resUser.json();
        if (jsonUser.status === 'success') {
          setUser(jsonUser.user);
          await AsyncStorage.setItem('user', JSON.stringify(jsonUser.user));
        }
      }
    } catch { }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e8f0' }}>
        <ActivityIndicator size="large" color="#FF7F50" />
      </View>
    );
  }

  const avatarUri = user?.foto_profil;

  return (
    <View style={{ flex: 1, backgroundColor: '#e2e8f0' }}>
      <StatusBar barStyle="light-content" backgroundColor="#253341" />

      {/* ── MAIN CONTENT (TETAP DIAM) ── */}
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            {/* ── Header Bar ── */}
            <View style={{ backgroundColor: '#253341', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16, borderBottomWidth: 3, borderColor: '#000' }}>
              <TouchableOpacity onPress={toggleMenu} style={{ marginTop: 8 }}>
                <Ionicons name="menu" size={26} color="#ffffff" />
              </TouchableOpacity>
              <Text style={{ fontFamily: 'Inter_900Black', fontSize: 16, color: '#ffffff', letterSpacing: 1.5, marginTop: 8 }}>STUDENT DASHBOARD</Text>
              <Ionicons name="settings-outline" size={22} color="#FFFFFF" style={{ marginTop: 8 }} />
            </View>

            {/* ── Welcome Card (Sesuai Gambar) ── */}
            <View style={{ marginHorizontal: 20, marginTop: 24, position: 'relative' }}>
              {/* Orange Shadow Background */}
              <View style={{
                position: 'absolute', top: 8, left: 8, right: -8, bottom: -8,
                backgroundColor: '#FF7F50', borderWidth: 2, borderColor: '#000'
              }} />

              {/* Main Dark Blue Card */}
              <View style={{
                backgroundColor: '#253341', borderWidth: 2, borderColor: '#000',
                padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16,
              }}>
                {/* Avatar Box */}
                <View style={{
                  width: 76, height: 76, backgroundColor: '#ffffff',
                  borderWidth: 3, borderColor: '#FF7F50',
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  {avatarUri
                    ? <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    : <Ionicons name="person" size={40} color="#94a3b8" />
                  }
                </View>

                {/* Info Box */}
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#94a3b8' }}>
                    Selamat datang,
                  </Text>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: '#ffffff' }}>
                    {user?.name ?? 'Siswa'}
                  </Text>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: '#FF7F50', marginTop: 2 }}>
                    {user?.kelas ? user.kelas + ' - ' : ''}{user?.jurusan || 'Jurusan'}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Stat Cards ── */}
            <View style={{ paddingHorizontal: 20, marginTop: 32, gap: 16 }}>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <StatCard value={portoCount} label="PORTOFOLIO" />
                <StatCard value={sertiCount} label="SERTIFIKASI" />
              </View>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <StatCard value="0" label="PRESTASI" />
                <StatCard value="96" label="RATA NILAI" />
              </View>
            </View>

            {/* ── Kelengkapan Profil ── */}
            <View style={{ marginHorizontal: 20, marginTop: 24, position: 'relative' }}>
              <View style={{ position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, backgroundColor: '#000', borderWidth: 2, borderColor: '#000' }} />
              <View style={{ backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#000', padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: '#0f172a' }}>KELENGKAPAN PROFIL</Text>
                  <Text style={{ fontFamily: 'Inter_900Black', fontSize: 14, color: '#FF7F50' }}>80%</Text>
                </View>
                <View style={{ height: 12, backgroundColor: '#e2e8f0', borderWidth: 1, borderColor: '#000' }}>
                  <View style={{ width: '80%', height: '100%', backgroundColor: '#FF7F50', borderRightWidth: 1, borderColor: '#000' }} />
                </View>
              </View>
            </View>

            {/* ── Menu Grid ── */}
            <View style={{ paddingHorizontal: 20, marginTop: 24, gap: 16 }}>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <MenuCard icon="person-outline" label="PROFIL" onPress={() => router.push('/(tabs)/Profile')} />
                <MenuCard icon="bar-chart-outline" label="NILAI" />
              </View>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <MenuCard icon="folder-outline" label="PORTOFOLIO" onPress={() => router.push('/(tabs)/Portfolio')} />
                <MenuCard icon="trophy-outline" label="PRESTASI" />
              </View>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <MenuCard icon="ribbon-outline" label="SERTIFIKASI" onPress={() => router.push('/(tabs)/Sertifikasi')} />
                <MenuCard icon="school-outline" label="CIS" />
              </View>
            </View>

          </ScrollView>
        </View>
      </View>

      {/* ── OVERLAY (Dim Background) ── */}
      {menuVisible && (
        <Animated.View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#000', opacity: overlayOpacity, zIndex: 50 }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={toggleMenu} activeOpacity={1} />
        </Animated.View>
      )}

      {/* ── DRAWER MENU (ANIMATED, PALING ATAS) ── */}
      <Animated.View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 280, backgroundColor: '#ffffff', borderRightWidth: 3, borderRightColor: '#000', zIndex: 100, elevation: 100, transform: [{ translateX }] }}>
        {/* DRAWER HEADER */}
        <View style={{ backgroundColor: '#253341', padding: 20, paddingTop: 60, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: '#000' }}>
          <View style={{ width: 72, height: 72, borderWidth: 2, borderColor: '#FF7F50', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
            {avatarUri ? <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : <Ionicons name="person" size={32} color="#94a3b8" />}
          </View>
          <Text style={{ fontFamily: 'Inter_900Black', fontSize: 16, color: '#ffffff', textAlign: 'center' }}>
            {user?.name || 'Siswa'}
          </Text>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: '#FF7F50', marginTop: 4, letterSpacing: 1 }}>
            NIS: 12903482
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
            <View style={{ backgroundColor: '#FF7F50', paddingHorizontal: 10, paddingVertical: 6, borderWidth: 2, borderColor: '#000' }}>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#000' }}>{user?.kelas ? `Kelas ${user.kelas}` : 'Kelas'}</Text>
            </View>
            <View style={{ backgroundColor: '#253341', paddingHorizontal: 10, paddingVertical: 6, borderWidth: 2, borderColor: '#000' }}>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#fff' }}>{user?.jurusan || 'Jurusan'}</Text>
            </View>
          </View>
        </View>

        {/* DRAWER MENU ITEMS */}
        <ScrollView>
          <DrawerItem icon="grid-outline" label="Dashboard" onPress={() => { setMenuVisible(false); toggleMenu(); }} />
          <DrawerItem icon="school-outline" label="Academic Records" active />
          <DrawerItem icon="calendar-outline" label="Attendance" />
          <DrawerItem icon="construct-outline" label="Skills Lab" />
          <DrawerItem icon="folder-outline" label="Portofolio" onPress={() => { setMenuVisible(false); router.push('/(tabs)/Portfolio'); }} />
          <DrawerItem icon="trophy-outline" label="Prestasi" />
          <DrawerItem icon="ribbon-outline" label="Sertifikasi" onPress={() => { setMenuVisible(false); router.push('/(tabs)/Sertifikasi'); }} />
          <DrawerItem icon="document-text-outline" label="CIS" />
          <DrawerItem icon="key-outline" label="Ganti Password" />
        </ScrollView>

        {/* DRAWER FOOTER */}
        <View style={{ padding: 20, borderTopWidth: 2, borderTopColor: '#000' }}>
          <TouchableOpacity onPress={() => setLogoutModal(true)} style={{
            backgroundColor: '#fff', borderWidth: 2, borderColor: '#ef4444',
            paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
            shadowColor: '#ef4444', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4
          }}>
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: '#ef4444', letterSpacing: 1 }}>KELUAR</Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 9, color: '#94a3b8', textAlign: 'center', marginTop: 16, letterSpacing: 1 }}>
            v1.0.4 - BRUTAL
          </Text>
        </View>
      </Animated.View>

      {/* ── Logout Confirmation Modal ── */}
      <Modal visible={logoutModal} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#ffffff', borderWidth: 4, borderColor: '#000', width: '100%', shadowColor: '#000', shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0, elevation: 8 }}>
            <View style={{ backgroundColor: '#253341', padding: 16, borderBottomWidth: 3, borderBottomColor: '#000', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="warning-outline" size={24} color="#FF7F50" />
              <Text style={{ fontFamily: 'Inter_900Black', fontSize: 16, color: '#ffffff', letterSpacing: 1 }}>KONFIRMASI KELUAR</Text>
            </View>
            <View style={{ padding: 20 }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#0f172a', textAlign: 'center', lineHeight: 22, marginBottom: 24 }}>
                Apakah Anda yakin ingin keluar dari akun ini? Anda harus login kembali untuk mengakses data.
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={() => setLogoutModal(false)} style={{ flex: 1, backgroundColor: '#e2e8f0', borderWidth: 2, borderColor: '#000', paddingVertical: 12, alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: '#0f172a', letterSpacing: 0.5 }}>BATAL</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmLogout} style={{ flex: 1, backgroundColor: '#ef4444', borderWidth: 2, borderColor: '#000', paddingVertical: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: '#fff', letterSpacing: 0.5 }}>KELUAR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
