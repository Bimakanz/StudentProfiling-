import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, SafeAreaView, StatusBar, TouchableOpacity,
  FlatList, ActivityIndicator, Image, Animated, ScrollView, Alert, Platform,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.5:8000/api';

// ── Lazy Image: fade-in setelah load ─────────────────────────────────────────
const LazyImage = ({ uri, style }: { uri: string; style: any }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  const onLoad = () => {
    Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  };

  return (
    <Animated.Image
      source={{ uri }}
      style={[style, { opacity }]}
      resizeMode="cover"
      onLoad={onLoad}
    />
  );
};

// ── Sertifikasi Card ────────────────────────────────────────────────────────────
const SertifikasiCard = React.memo(({ item, onPress }: { item: any, onPress: () => void }) => {
  const isImage = item.file_sertifikat && /\.(jpeg|jpg|gif|png|webp)$/i.test(item.file_sertifikat);

  return (
    <View style={{
      borderWidth: 4, borderColor: '#000',
      backgroundColor: '#fff', padding: 10, marginBottom: 20,
      shadowColor: '#000', shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0, elevation: 6,
    }}>
      {/* Thumbnail */}
      <View style={{
        height: 200, backgroundColor: '#e2e8f0',
        borderWidth: 2, borderColor: '#000', marginBottom: 14, overflow: 'hidden',
      }}>
        {item.file_sertifikat ? (
          isImage ? (
            <LazyImage uri={item.file_sertifikat} style={{ width: '100%', height: '100%' }} />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e8f0', gap: 8 }}>
              <Ionicons name="document-text-outline" size={56} color="#64748b" />
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#64748b' }}>PDF / Dokumen</Text>
            </View>
          )
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="ribbon-outline" size={40} color="#94a3b8" />
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Tidak ada file sertifikat</Text>
          </View>
        )}

        {/* Kategori badge */}
        <View style={{
          position: 'absolute', top: 10, right: 10,
          backgroundColor: '#FF7F50', borderWidth: 2, borderColor: '#000',
          paddingHorizontal: 8, paddingVertical: 4,
        }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#000', textTransform: 'uppercase' }}>
            {item.kategori}
          </Text>
        </View>
      </View>

      {/* Judul / Nama Sertifikat */}
      <Text style={{ fontFamily: 'Inter_900Black', fontSize: 18, color: '#000', textTransform: 'uppercase', marginBottom: 10 }} numberOfLines={2}>
        {item.nama_sertifikat}
      </Text>

      {/* Lembaga + Tanggal */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#475569' }}>
          {new Date(item.tanggal_terbit).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </Text>
        <View style={{ backgroundColor: '#253341', paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#fff', textTransform: 'uppercase' }}>
            {item.lembaga_penerbit}
          </Text>
        </View>
      </View>

      {/* View Button */}
      <TouchableOpacity 
        onPress={onPress}
        style={{
          borderWidth: 2, borderColor: '#000', paddingVertical: 11,
          flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, backgroundColor: '#fff',
        }}
      >
        <Ionicons name="eye-outline" size={15} color="#000" />
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: '#000', letterSpacing: 1 }}>LIHAT DETAIL</Text>
      </TouchableOpacity>
    </View>
  );
});

// ── Detail View Component ─────────────────────────────────────────────────────
const SertifikasiDetail = ({ item, user, onClose, onDelete, onEdit }: any) => {
  const isImage = item.file_sertifikat && /\.(jpeg|jpg|gif|png|webp)$/i.test(item.file_sertifikat);
  const formattedDate = new Date(item.tanggal_terbit).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');

  return (
    <View style={{ flex: 1, backgroundColor: '#cbd5e1' }}>
      {/* ── Sub Header ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#ffffff', borderBottomWidth: 3, borderBottomColor: '#000' }}>
        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Inter_900Black', fontSize: 16, color: '#000', letterSpacing: 1.5, textTransform: 'uppercase' }}>
          DETAIL_SERTIFIKAT
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => onEdit(item)}>
            <Ionicons name="create-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item.id)}>
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        
        {/* Thumbnail Image Box */}
        {item.file_sertifikat && (
          <View style={{ position: 'relative', marginBottom: 24 }}>
            <View style={{ position: 'absolute', top: 6, left: 6, right: -6, bottom: -6, backgroundColor: '#FF7F50', borderWidth: 2, borderColor: '#000' }} />
            <View style={{ height: 200, borderWidth: 2, borderColor: '#000', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
              {isImage ? (
                 <LazyImage uri={item.file_sertifikat} style={{ width: '100%', height: '100%' }} />
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="document-text-outline" size={64} color="#64748b" />
                </View>
              )}
            </View>
          </View>
        )}

        {/* Title */}
        <Text style={{ fontFamily: 'Inter_900Black', fontSize: 32, color: '#000', textTransform: 'uppercase', marginBottom: 16, lineHeight: 36 }}>
          {item.nama_sertifikat}
        </Text>

        {/* Badges Row 1 */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <View style={{ borderWidth: 2, borderColor: '#000', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#000', textTransform: 'uppercase' }}>
              TERBIT: {formattedDate}
            </Text>
          </View>
          <View style={{ borderWidth: 2, borderColor: '#000', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#000', textTransform: 'uppercase' }}>
              NO: {item.nomor_sertifikat}
            </Text>
          </View>
        </View>

        {/* Badges Row 2 */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <View style={{ borderWidth: 2, borderColor: '#000', backgroundColor: '#FF7F50', paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#fff', textTransform: 'uppercase' }}>
              {item.jurusan || 'JURUSAN'}
            </Text>
          </View>
          <View style={{ borderWidth: 2, borderColor: '#000', backgroundColor: '#22c55e', paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#fff', textTransform: 'uppercase' }}>
              {item.kategori}
            </Text>
          </View>
        </View>

        {/* Deskripsi */}
        <View style={{ borderWidth: 3, borderColor: '#000', backgroundColor: '#fff', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 }}>
          <View style={{ backgroundColor: '#253341', padding: 12, borderBottomWidth: 3, borderBottomColor: '#000' }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: '#fff', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              PENJELASAN KOMPETENSI
            </Text>
          </View>
          <View style={{ padding: 16 }}>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#0f172a', lineHeight: 22 }}>
              {item.deskripsi || 'Tidak ada deskripsi.'}
            </Text>
          </View>
        </View>

        {/* Tools & Provider */}
        <View style={{ borderWidth: 3, borderColor: '#000', backgroundColor: '#fff', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 }}>
          <View style={{ backgroundColor: '#253341', padding: 12, borderBottomWidth: 3, borderBottomColor: '#000' }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: '#fff', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              INFO TAMBAHAN
            </Text>
          </View>
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="build-outline" size={16} color="#000" />
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#0f172a' }}>Tools: {item.tools || '-'}</Text>
            </View>
            <View style={{ paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="business-outline" size={16} color="#000" />
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#0f172a' }}>Lembaga: {item.lembaga_penerbit || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        {item.file_sertifikat && (
          <View style={{ gap: 12 }}>
            <TouchableOpacity style={{
              backgroundColor: '#ffffff', borderWidth: 3, borderColor: '#000', paddingVertical: 14,
              flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
              shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4
            }}>
              <Ionicons name="download-outline" size={18} color="#000" />
              <Text style={{ fontFamily: 'Inter_900Black', fontSize: 12, color: '#000', letterSpacing: 1 }}>UNDUH SERTIFIKAT</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function Sertifikasi() {
  const router = useRouter();
  const [sertifikasis, setSertifikasis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedSertifikasi, setSelectedSertifikasi] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [sertifikasiToDelete, setSertifikasiToDelete] = useState<number | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    toastOpacity.setValue(1);
    
    // Perlahan menghilang
    Animated.sequence([
      Animated.delay(2000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start(() => {
      setToastVisible(false);
      setToastMsg('');
    });
  };

  const fetchSertifikasis = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const stored = await AsyncStorage.getItem('user');
      const currentUser = stored ? JSON.parse(stored) : null;
      setUser(currentUser);

      const res = await fetch(`${API_URL}/sertifikasi`, {
        headers: { Accept: 'application/json' },
      });
      const json = await res.json();
      const all: any[] = json.data || [];

      // Filter hanya milik user yang login
      const mine = currentUser
        ? all.filter((p) => p.user_id === currentUser.id)
        : all;

      setSertifikasis(mine);
    } catch (error) {
      console.error('Fetch sertifikasi error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { 
    fetchSertifikasis(); 
    const checkFlashMessage = async () => {
      const msg = await AsyncStorage.getItem('sertifikasi_toast');
      if (msg) {
        setSelectedSertifikasi(null); // Force back to main list
        showToast(msg);
        await AsyncStorage.removeItem('sertifikasi_toast');
      }
    };
    checkFlashMessage();
  }, [fetchSertifikasis]));

  const handleDeleteClick = (id: number) => {
    setSertifikasiToDelete(id);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (sertifikasiToDelete === null) return;
    setDeleteModal(false);
    
    try {
      const res = await fetch(`${API_URL}/sertifikasi/${sertifikasiToDelete}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSelectedSertifikasi(null);
        fetchSertifikasis();
        showToast("SERTIFIKAT BERHASIL DIHAPUS");
      } else {
        if (Platform.OS === 'web') window.alert("Gagal: " + (data.message || "Gagal menghapus sertifikat."));
        else Alert.alert("Gagal", data.message || "Gagal menghapus sertifikat.");
      }
    } catch (error) {
      if (Platform.OS === 'web') window.alert("Gagal terhubung ke server.");
      else Alert.alert("Error", "Gagal terhubung ke server.");
    }
  };

  const handleEdit = (item: any) => {
    router.push({ pathname: '/TambahSertifikasi', params: { id: item.id } } as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar barStyle="light-content" backgroundColor="#253341" />

      {/* ── Toast Notification ── */}
      {toastVisible && (
        <Animated.View style={{
          position: 'absolute', top: 50, left: 20, right: 20, zIndex: 9999,
          backgroundColor: '#22c55e', borderWidth: 3, borderColor: '#000',
          paddingVertical: 12, paddingHorizontal: 16,
          flexDirection: 'row', alignItems: 'center', gap: 10,
          shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5,
          opacity: toastOpacity
        }} pointerEvents="none">
          <Ionicons name="checkmark-circle" size={24} color="#000" />
          <Text style={{ fontFamily: 'Inter_900Black', fontSize: 13, color: '#000', letterSpacing: 0.5 }}>
            {toastMsg}
          </Text>
        </Animated.View>
      )}

      {/* ── Top Bar ── */}
      <View style={{
        backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14,
      }}>
        <Ionicons name="menu" size={24} color="#FF7F50" />
        <View style={{
          backgroundColor: '#FF7F50', borderWidth: 2, borderColor: '#000',
          paddingHorizontal: 16, paddingVertical: 6,
          shadowColor: '#000', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
        }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: '#000', letterSpacing: 1 }}>SERTIFIKASI_SYSTEM</Text>
        </View>
        <View style={{
          width: 36, height: 36, backgroundColor: '#253341',
          borderWidth: 2, borderColor: '#FF7F50',
          justifyContent: 'center', alignItems: 'center', borderRadius: 4,
          overflow: 'hidden',
        }}>
          {user?.foto_profil ? (
            <Image source={{ uri: user.foto_profil }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <Ionicons name="person" size={20} color="#fff" />
          )}
        </View>
      </View>

      {/* Divider */}
      <View style={{ height: 4, backgroundColor: '#000' }} />

      {selectedSertifikasi ? (
        <SertifikasiDetail 
          item={selectedSertifikasi} 
          user={user} 
          onClose={() => setSelectedSertifikasi(null)}
          onDelete={handleDeleteClick}
          onEdit={handleEdit}
        />
      ) : (
        <>
          {/* Title */}
          <View style={{ backgroundColor: '#fff', paddingVertical: 16, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter_900Black', fontSize: 34, color: '#000', letterSpacing: 1 }}>SERTIFIKASI</Text>
            <View style={{ height: 4, backgroundColor: '#000', width: 240, marginTop: 6 }} />
          </View>

          {/* Content */}
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#FF7F50" />
            </View>
          ) : sertifikasis.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 32 }}>
              <Ionicons name="ribbon-outline" size={56} color="#cbd5e1" />
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: '#94a3b8' }}>Belum ada sertifikasi</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#cbd5e1', textAlign: 'center' }}>
                Tekan tombol + untuk menambahkan sertifikasi baru.
              </Text>
            </View>
          ) : (
            <FlatList
              data={sertifikasis}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <SertifikasiCard item={item} onPress={() => setSelectedSertifikasi(item)} />}
              contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              windowSize={5}
              removeClippedSubviews={true}
              onRefresh={() => fetchSertifikasis(true)}
              refreshing={refreshing}
            />
          )}

          {/* Tombol + */}
          <View style={{ position: 'absolute', bottom: 16, left: 20 }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/TambahSertifikasi' as any)}
              style={{
                width: 56, height: 56, backgroundColor: '#FF7F50',
                borderWidth: 2, borderColor: '#000',
                justifyContent: 'center', alignItems: 'center',
                shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5,
              }}>
              <Ionicons name="add" size={32} color="#000" />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── Delete Confirmation Modal ── */}
      <Modal visible={deleteModal} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#ffffff', borderWidth: 4, borderColor: '#000', width: '100%', shadowColor: '#000', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 1, shadowRadius: 0, elevation: 10 }}>
            {/* Header */}
            <View style={{ backgroundColor: '#b91c1c', padding: 16, borderBottomWidth: 3, borderBottomColor: '#000', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ backgroundColor: '#FF7F50', borderWidth: 2, borderColor: '#000', padding: 8 }}>
                <Ionicons name="trash" size={24} color="#fff" />
              </View>
              <Text style={{ fontFamily: 'Inter_900Black', fontSize: 22, color: '#ffffff', flex: 1, textTransform: 'uppercase' }}>Hapus Sertifikat?</Text>
            </View>
            
            {/* Body */}
            <View style={{ padding: 24 }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#0f172a', lineHeight: 22 }}>
                Apakah kamu yakin ingin menghapus sertifikat ini? Tindakan ini <Text style={{ fontFamily: 'Inter_900Black', textDecorationLine: 'underline' }}>tidak dapat dibatalkan</Text>.
              </Text>
              
              {/* Sertifikasi Name Box */}
              <View style={{ marginTop: 20, backgroundColor: '#f1f5f9', borderWidth: 3, borderColor: '#000000', paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="ribbon-outline" size={20} color="#475569" />
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#0f172a' }} numberOfLines={1}>
                  {sertifikasis.find(p => p.id === sertifikasiToDelete)?.nama_sertifikat || 'Sertifikat'}
                </Text>
              </View>

              {/* Buttons */}
              <View style={{ marginTop: 32, gap: 14 }}>
                <TouchableOpacity onPress={confirmDelete} activeOpacity={0.85} style={{ backgroundColor: '#253341', borderWidth: 2, borderColor: '#000', paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 }}>
                  <Ionicons name="trash-outline" size={16} color="#fff" />
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: '#fff', letterSpacing: 1 }}>HAPUS SERTIFIKAT</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => setDeleteModal(false)} activeOpacity={0.85} style={{ backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#000', paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: '#0f172a', letterSpacing: 1 }}>BATAL</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
