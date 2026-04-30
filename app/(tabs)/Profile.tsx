import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  StatusBar, TextInput, ActivityIndicator, Modal, Image,
  Animated, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';

const API_URL = 'http://192.168.1.5:8000/api';

type User = {
  id: number;
  name: string;
  email: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  agama?: string;
  jenis_kelamin?: string;
  alamat?: string;
  sosmed?: string;
  github?: string;
  instagram?: string;
  linkedin?: string;
  jurusan?: string;
  kelas?: string;
  foto_profil?: string;
};

// ── Brutalist Toast Notification ─────────────────────────────────────────────
const BrutalistToast = ({ message, visible }: { message: string; visible: boolean }) => {
  const opacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2200),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;
  return (
    <Animated.View style={{
      position: 'absolute', top: 60, left: 16, right: 16, zIndex: 999,
      backgroundColor: '#22c55e',
      borderWidth: 3, borderColor: '#000',
      padding: 14,
      shadowColor: '#000', shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0, elevation: 8,
      opacity,
      flexDirection: 'row', alignItems: 'center', gap: 10,
    }}>
      <Ionicons name="checkmark-circle" size={22} color="#000" />
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: '#000', flex: 1, letterSpacing: 0.5 }}>
        {message}
      </Text>
    </Animated.View>
  );
};

// ── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <View style={{ marginBottom: 0 }}>
    <View style={{ backgroundColor: '#e2e8f0', paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#cbd5e1' }}>
      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#475569', letterSpacing: 1, textTransform: 'uppercase' }}>
        {label}
      </Text>
    </View>
    <View style={{ backgroundColor: '#ffffff', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#cbd5e1' }}>
      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#0f172a' }}>
        {value || '-'}
      </Text>
    </View>
  </View>
);

// ── Sosmed Row ────────────────────────────────────────────────────────────────
const SosmedRow = ({ icon, label, value }: { icon: any; label: string; value?: string }) => (
  <View style={{ backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', padding: 14, margin: 12, borderWidth: 2, borderColor: '#000' }}>
    <View style={{ width: 38, height: 38, borderWidth: 2, borderColor: '#000', justifyContent: 'center', alignItems: 'center', marginRight: 12, backgroundColor: '#f1f5f9' }}>
      <Ionicons name={icon} size={18} color="#000" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: '#0f172a', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</Text>
      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#475569' }} numberOfLines={1}>{value || '-'}</Text>
    </View>
  </View>
);

// ── Edit Field ────────────────────────────────────────────────────────────────
const EditField = ({ label, value, onChangeText, multiline = false }: any) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#0f172a', marginBottom: 6, letterSpacing: 0.8 }}>
      {label.toUpperCase()}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={label}
      placeholderTextColor="#94a3b8"
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      style={{
        backgroundColor: '#ffffff',
        borderWidth: 2, borderColor: '#000000',
        paddingHorizontal: 12, paddingVertical: 10,
        fontFamily: 'Inter_500Medium', fontSize: 14, color: '#0f172a',
        textAlignVertical: multiline ? 'top' : 'center',
        minHeight: multiline ? 80 : undefined,
      }}
    />
  </View>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [localFoto, setLocalFoto] = useState<{ uri: string; name: string; mimeType?: string; file?: any } | null>(null);
  const [form, setForm] = useState({
    name: '', tempat_lahir: '', tanggal_lahir: '', agama: '',
    jenis_kelamin: '', alamat: '', sosmed: '', github: '', instagram: '', linkedin: '', jurusan: '', kelas: '',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const loadUser = useCallback(async () => {
    const stored = await AsyncStorage.getItem('user');
    if (stored) {
      const parsed: User = JSON.parse(stored);
      setUser(parsed);
      try {
        const res = await fetch(`${API_URL}/user/${parsed.id}`, { headers: { Accept: 'application/json' } });
        const data = await res.json();
        if (data.status === 'success') {
          setUser(data.user);
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch { }
    }
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { loadUser(); }, [loadUser]));

  const openEdit = () => {
    if (!user) return;
    setLocalFoto(null);
    setForm({
      name: user.name || '',
      tempat_lahir: user.tempat_lahir || '',
      tanggal_lahir: user.tanggal_lahir?.split('T')[0] || '',
      agama: user.agama || '',
      jenis_kelamin: user.jenis_kelamin || '',
      alamat: user.alamat || '',
      sosmed: user.sosmed || '',
      github: user.github || user.sosmed || '',
      instagram: user.instagram || '',
      linkedin: user.linkedin || '',
      jurusan: user.jurusan || '',
      kelas: user.kelas || '',
    });
    setEditModal(true);
  };

  const pickPhoto = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      setLocalFoto({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType, file: asset.file });
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    
    // Validasi: Harus mengisi minimal satu sosial media
    if (!form.github && !form.instagram && !form.linkedin && !form.sosmed) {
      showToast('✗ Mohon isi setidaknya 1 sosial media (Github/IG/LinkedIn)');
      setSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
      formData.append('_method', 'PUT'); // Laravel method spoofing for multipart

      if (localFoto) {
        if (localFoto.file) {
          formData.append('foto_profil', localFoto.file);
        } else {
          formData.append('foto_profil', {
            uri: localFoto.uri, name: localFoto.name, type: localFoto.mimeType || 'image/jpeg',
          } as any);
        }
      }

      const res = await fetch(`${API_URL}/user/${user.id}`, {
        method: 'POST', // Use POST with _method=PUT for multipart
        headers: { Accept: 'application/json' },
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUser(data.user);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        setEditModal(false);
        showToast('✓ PROFIL BERHASIL DIPERBARUI!');
      } else {
        const errMsg = data.errors
          ? Object.values(data.errors).flat().join('\n')
          : data.message || 'Gagal menyimpan.';
        showToast('✗ ' + errMsg);
      }
    } catch (e: any) {
      showToast('✗ Tidak dapat terhubung ke server.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutClick = () => {
    setLogoutModal(true);
  };

  const confirmLogout = async () => {
    await AsyncStorage.removeItem('user');
    setLogoutModal(false);
    router.replace('/homescreen');
  };

  const formatTTL = () => {
    const parts = [];
    if (user?.tempat_lahir) parts.push(user.tempat_lahir);
    if (user?.tanggal_lahir) {
      try {
        const d = new Date(user.tanggal_lahir);
        parts.push(d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
      } catch { parts.push(user.tanggal_lahir); }
    }
    return parts.join(', ') || '-';
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF7F50" />
      </View>
    );
  }

  const avatarUri = user?.foto_profil;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#cbd5e1' }}>
      <StatusBar barStyle="light-content" backgroundColor="#253341" />

      {/* Brutalist Toast */}
      <BrutalistToast message={toastMsg} visible={toastVisible} />

      {/* Header */}
      <View style={{
        backgroundColor: '#253341', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 10, paddingTop: 10, paddingBottom: 16, borderBottomWidth: 3, borderColor: '#000'
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 8 }}>
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Inter_900Black', fontSize: 16, color: '#ffffff', letterSpacing: 1.5, marginTop: 8 }}>STUDENT PROFILE</Text>
        <TouchableOpacity style={{ marginTop: 8 }}>
          <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── Avatar + Name Card ── */}
        <View style={{
          backgroundColor: '#ffffff', margin: 16,
          borderWidth: 3, borderColor: '#000',
          shadowColor: '#000', shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0, elevation: 6,
          padding: 24, alignItems: 'center', gap: 10,
        }}>
          {/* Avatar */}
          <View style={{ position: 'relative', marginBottom: 4 }}>
            <View style={{
              width: 96, height: 96, borderWidth: 3, borderColor: '#FF7F50',
              overflow: 'hidden', backgroundColor: '#e2e8f0',
              justifyContent: 'center', alignItems: 'center',
            }}>
              {avatarUri
                ? <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                : <Ionicons name="person" size={52} color="#94a3b8" />
              }
            </View>
          </View>

          {/* Nama */}
          <Text style={{ fontFamily: 'Inter_900Black', fontSize: 22, color: '#000000', textTransform: 'uppercase', textAlign: 'center', marginTop: 8 }}>
            {user?.name || 'Admin'}
          </Text>

          {/* Jurusan & Kelas badges */}
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
            <View style={{ backgroundColor: '#FF7F50', borderWidth: 2, borderColor: '#000', paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#000', textTransform: 'uppercase' }}>
                {user?.jurusan || 'Jurusan'}
              </Text>
            </View>
            <View style={{ backgroundColor: '#253341', borderWidth: 2, borderColor: '#000', paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#fff', textTransform: 'uppercase' }}>
                {user?.kelas ? `KELAS ${user.kelas}` : 'Kelas'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Data Diri ── */}
        <View style={{
          backgroundColor: '#ffffff', marginHorizontal: 16, marginBottom: 16,
          borderWidth: 3, borderColor: '#000',
          shadowColor: '#000', shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0, elevation: 6,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderBottomWidth: 3, borderBottomColor: '#000', backgroundColor: '#253341' }}>
            <Ionicons name="person-circle-outline" size={18} color="#FF7F50" />
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: '#ffffff', letterSpacing: 1.5 }}>DATA DIRI</Text>
          </View>
          <InfoRow label="Tempat, Tgl Lahir" value={formatTTL()} />
          <InfoRow label="Agama" value={user?.agama} />
          <InfoRow label="Jenis Kelamin" value={user?.jenis_kelamin} />
          <InfoRow label="Alamat" value={user?.alamat} />
        </View>

        {/* ── Sosial Media ── */}
        <View style={{
          backgroundColor: '#ffffff', marginHorizontal: 16, marginBottom: 16,
          borderWidth: 3, borderColor: '#000',
          shadowColor: '#000', shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0, elevation: 6,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderBottomWidth: 3, borderBottomColor: '#000', backgroundColor: '#253341' }}>
            <Ionicons name="share-social-outline" size={18} color="#FF7F50" />
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: '#ffffff', letterSpacing: 1.5 }}>SOSIAL MEDIA</Text>
          </View>
          <SosmedRow icon="logo-github" label="GITHUB" value={form.github || user?.github || user?.sosmed} />
          <SosmedRow icon="logo-instagram" label="INSTAGRAM" value={form.instagram || user?.instagram} />
          <SosmedRow icon="logo-linkedin" label="LINKEDIN" value={form.linkedin || user?.linkedin} />
        </View>

        {/* ── Logout ── */}
        <View style={{ marginHorizontal: 16 }}>
          <TouchableOpacity onPress={handleLogoutClick} activeOpacity={0.9}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              backgroundColor: '#ef4444', paddingVertical: 14,
              borderWidth: 3, borderColor: '#000',
              shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
            }}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: '#fff', letterSpacing: 1 }}>KELUAR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── FAB Tambah / Edit ── */}
      <View style={{ position: 'absolute', bottom: 16, right: 20 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={openEdit}
          style={{
            width: 56, height: 56, backgroundColor: '#FF7F50',
            borderWidth: 2, borderColor: '#000',
            justifyContent: 'center', alignItems: 'center',
            shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5,
          }}>
          <Ionicons name="pencil" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* ── Edit Modal ── */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#f1f5f9', borderTopWidth: 4, borderColor: '#000000', maxHeight: '92%' }}>

            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 3, borderBottomColor: '#000', backgroundColor: '#253341' }}>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: '#ffffff', letterSpacing: 1.5 }}>EDIT PROFIL</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>

              {/* Ganti Foto */}
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#0f172a', marginBottom: 8, letterSpacing: 0.8 }}>
                FOTO PROFIL
              </Text>
              <TouchableOpacity onPress={pickPhoto} style={{
                borderWidth: 2, borderColor: '#000', borderStyle: 'dashed',
                backgroundColor: '#ffffff', padding: 16, alignItems: 'center',
                marginBottom: 18, gap: 8,
              }}>
                {localFoto ? (
                  <Image source={{ uri: localFoto.uri }} style={{ width: 80, height: 80, borderWidth: 2, borderColor: '#FF7F50' }} resizeMode="cover" />
                ) : (
                  <View style={{ width: 60, height: 60, borderWidth: 2, borderColor: '#000', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e8f0' }}>
                    {user?.foto_profil
                      ? <Image source={{ uri: user.foto_profil }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      : <Ionicons name="camera" size={28} color="#475569" />
                    }
                  </View>
                )}
                <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#475569' }}>
                  {localFoto ? localFoto.name : 'Klik untuk ganti foto'}
                </Text>
              </TouchableOpacity>

              <EditField label="Nama Lengkap" value={form.name} onChangeText={(v: string) => setForm(f => ({ ...f, name: v }))} />
              <EditField label="Tempat Lahir" value={form.tempat_lahir} onChangeText={(v: string) => setForm(f => ({ ...f, tempat_lahir: v }))} />
              <EditField label="Tanggal Lahir (YYYY-MM-DD)" value={form.tanggal_lahir} onChangeText={(v: string) => setForm(f => ({ ...f, tanggal_lahir: v }))} />
              <EditField label="Agama" value={form.agama} onChangeText={(v: string) => setForm(f => ({ ...f, agama: v }))} />
              <EditField label="Jenis Kelamin" value={form.jenis_kelamin} onChangeText={(v: string) => setForm(f => ({ ...f, jenis_kelamin: v }))} />
              <EditField label="Alamat" value={form.alamat} onChangeText={(v: string) => setForm(f => ({ ...f, alamat: v }))} multiline />
              <EditField label="Jurusan" value={form.jurusan} onChangeText={(v: string) => setForm(f => ({ ...f, jurusan: v }))} />
              <EditField label="Kelas" value={form.kelas} onChangeText={(v: string) => setForm(f => ({ ...f, kelas: v }))} />
              <EditField label="GitHub" value={form.github} onChangeText={(v: string) => setForm(f => ({ ...f, github: v }))} />
              <EditField label="Instagram" value={form.instagram} onChangeText={(v: string) => setForm(f => ({ ...f, instagram: v }))} />
              <EditField label="LinkedIn" value={form.linkedin} onChangeText={(v: string) => setForm(f => ({ ...f, linkedin: v }))} />

              {/* Save */}
              <TouchableOpacity onPress={saveProfile} disabled={saving}
                style={{
                  backgroundColor: '#FF7F50', paddingVertical: 15,
                  borderWidth: 3, borderColor: '#000', alignItems: 'center', marginTop: 8,
                  shadowColor: '#000', shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5,
                }}>
                {saving
                  ? <ActivityIndicator color="#000" />
                  : <Text style={{ fontFamily: 'Inter_900Black', fontSize: 14, color: '#000', letterSpacing: 1.5 }}>SIMPAN PERUBAHAN</Text>
                }
              </TouchableOpacity>

              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

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

    </SafeAreaView>
  );
}
