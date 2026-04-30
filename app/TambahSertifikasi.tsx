import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';

const API_URL = 'http://192.168.1.5:8000/api';

const InputField = ({ label, value, onChangeText, placeholder, required = true, multiline = false }: any) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#000000', marginBottom: 6 }}>
      {label} {required && <Text style={{ color: '#ef4444' }}>*</Text>}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      multiline={multiline}
      style={{
        borderWidth: 2,
        borderColor: '#000000',
        backgroundColor: '#ffffff',
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: '#000000',
        minHeight: multiline ? 100 : 'auto',
        textAlignVertical: multiline ? 'top' : 'center',
      }}
    />
  </View>
);

export default function TambahSertifikasi() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.id;
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);

  const [form, setForm] = useState({
    nama_sertifikat: '',
    lembaga_penerbit: '',
    tanggal_terbit: '',
    nomor_sertifikat: '',
    deskripsi: '',
    tools: '',
    kategori: '',
    jurusan: '',
  });

  const [fileSertifikat, setFileSertifikat] = useState<{ uri: string, name: string, mimeType?: string, file?: any } | null>(null);
  const [existingFile, setExistingFile] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // State for Custom Date Picker
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth() + 1);
  const [pickerDay, setPickerDay] = useState(new Date().getDate());

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();

  useEffect(() => {
    const daysInMonth = getDaysInMonth(pickerYear, pickerMonth);
    if (pickerDay > daysInMonth) setPickerDay(daysInMonth);
  }, [pickerMonth, pickerYear]);

  const openDatePicker = () => {
    let d = new Date();
    if (form.tanggal_terbit) {
      const parsed = new Date(form.tanggal_terbit);
      if (!isNaN(parsed.getTime())) d = parsed;
    }
    setPickerYear(d.getFullYear());
    setPickerMonth(d.getMonth() + 1);
    setPickerDay(d.getDate());
    setDateModalVisible(true);
  };

  const saveDate = () => {
    const m = pickerMonth < 10 ? `0${pickerMonth}` : pickerMonth;
    const d = pickerDay < 10 ? `0${pickerDay}` : pickerDay;
    setForm({ ...form, tanggal_terbit: `${pickerYear}-${m}-${d}` });
    setDateModalVisible(false);
  };

  useEffect(() => {
    const loadUserAndData = async () => {
      const stored = await AsyncStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));

      if (editId) {
        setLoading(true);
        try {
          const res = await fetch(`${API_URL}/sertifikasi/${editId}`, { headers: { Accept: 'application/json' } });
          const json = await res.json();
          if (json.status === 'success' && json.data) {
             const p = json.data;
             setForm({
               nama_sertifikat: p.nama_sertifikat || '',
               lembaga_penerbit: p.lembaga_penerbit || '',
               tanggal_terbit: p.tanggal_terbit || '',
               nomor_sertifikat: p.nomor_sertifikat || '',
               deskripsi: p.deskripsi || '',
               tools: p.tools || '',
               kategori: p.kategori || '',
               jurusan: p.jurusan || '',
             });
             if (p.file_sertifikat) setExistingFile(p.file_sertifikat);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    };
    loadUserAndData();
  }, [editId]);

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setFileSertifikat({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType || 'application/octet-stream',
        file: asset.file, 
      });
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(''); 
    
    if (!user) {
      setErrorMessage('Sesi pengguna tidak ditemukan. Silakan login kembali.');
      return;
    }
    
    if (!form.nama_sertifikat || !form.lembaga_penerbit || !form.tanggal_terbit || !form.nomor_sertifikat || !form.deskripsi || !form.tools || !form.kategori || !form.jurusan) {
      setErrorMessage('Mohon lengkapi semua field yang wajib diisi (dengan tanda *).');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('user_id', String(user.id));
      formData.append('nama_sertifikat', form.nama_sertifikat);
      formData.append('lembaga_penerbit', form.lembaga_penerbit);
      formData.append('tanggal_terbit', form.tanggal_terbit);
      formData.append('nomor_sertifikat', form.nomor_sertifikat);
      formData.append('deskripsi', form.deskripsi);
      formData.append('tools', form.tools);
      formData.append('kategori', form.kategori);
      formData.append('jurusan', form.jurusan);

      if (fileSertifikat) {
        if (fileSertifikat.file) {
          formData.append('file_sertifikat', fileSertifikat.file);
        } else {
          formData.append('file_sertifikat', {
            uri: fileSertifikat.uri,
            name: fileSertifikat.name,
            type: fileSertifikat.mimeType,
          } as any);
        }
      }

      if (editId) {
        formData.append('_method', 'PUT'); 
      }

      const url = editId ? `${API_URL}/sertifikasi/${editId}` : `${API_URL}/sertifikasi`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok || res.status === 201 || res.status === 200) {
        await AsyncStorage.setItem('sertifikasi_toast', editId ? 'SERTIFIKAT BERHASIL DI EDIT' : 'SERTIFIKAT BERHASIL DITAMBAHKAN');
        router.back();
      } else {
        let errorMsg = data.message || 'Gagal menambahkan sertifikat.';
        if (data.errors) {
          const errorDetails = Object.values(data.errors).flat().join('\n');
          errorMsg += '\n' + errorDetails;
        }
        setErrorMessage(errorMsg);
      }
    } catch (error: any) {
      console.error("Fetch Error:", error);
      setErrorMessage('Tidak dapat terhubung ke server: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={{
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#000000',
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Inter_900Black', fontSize: 16, color: '#000000', letterSpacing: 1 }}>
          {editId ? 'EDIT SERTIFIKASI' : 'TAMBAH SERTIFIKASI'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {errorMessage !== '' && (
        <View style={{ backgroundColor: '#fee2e2', padding: 12, borderWidth: 2, borderColor: '#ef4444', marginHorizontal: 20, marginTop: 16 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#b91c1c', fontSize: 13 }}>
            Peringatan: {errorMessage}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Input Gambar/Dokumen */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#000000', marginBottom: 10 }}>
            File Sertifikat (Gambar / PDF)
          </Text>
          <TouchableOpacity 
            onPress={pickDocument}
            activeOpacity={0.8}
            style={{
              borderWidth: 2,
              borderColor: '#000000',
              backgroundColor: '#ffffff',
              borderStyle: 'dashed',
              paddingVertical: 30,
              paddingHorizontal: 20,
              alignItems: 'center',
            }}
          >
            {fileSertifikat ? (
              <View style={{ alignItems: 'center', gap: 10, width: '100%' }}>
                {fileSertifikat.mimeType?.startsWith('image/') || fileSertifikat.name.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                  <View style={{ width: '100%', height: 180, borderWidth: 2, borderColor: '#000000', marginBottom: 6 }}>
                    <Image source={{ uri: fileSertifikat.uri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                  </View>
                ) : (
                  <Ionicons name="document-text" size={64} color="#FF7F50" />
                )}
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: '#000000', textAlign: 'center' }}>
                  {fileSertifikat.name}
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#3b82f6' }}>
                  Ketuk untuk mengganti file
                </Text>
              </View>
            ) : existingFile ? (
              <View style={{ alignItems: 'center', gap: 10, width: '100%' }}>
                {existingFile.match(/\.(jpeg|jpg|png|gif|webp)$/i) || !existingFile.includes('.pdf') ? (
                  <View style={{ width: '100%', height: 180, borderWidth: 2, borderColor: '#000000', marginBottom: 6 }}>
                    <Image source={{ uri: existingFile }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                  </View>
                ) : (
                  <Ionicons name="document-text" size={64} color="#FF7F50" />
                )}
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: '#000000', textAlign: 'center' }}>
                  File Tersimpan
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#3b82f6' }}>
                  Ketuk untuk mengganti file
                </Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  width: 60, height: 60,
                  backgroundColor: '#ffffff',
                  borderWidth: 2,
                  borderColor: '#000000',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                  shadowColor: '#000000',
                  shadowOffset: { width: 4, height: 4 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 4,
                }}>
                  <Ionicons name="cloud-upload-outline" size={32} color="#000000" />
                </View>

                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#000000', marginBottom: 6 }}>
                  Seret & Lepas File
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                  atau klik untuk menelusuri
                </Text>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {['JPG', 'PNG', 'PDF'].map((format) => (
                    <View key={format} style={{
                      borderWidth: 2,
                      borderColor: '#000000',
                      backgroundColor: '#ffffff',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#000000' }}>
                        {format}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <InputField label="Nama Sertifikat" value={form.nama_sertifikat} onChangeText={(text: string) => setForm({ ...form, nama_sertifikat: text })} placeholder="Misal: AWS Certified Solutions Architect" />
        <InputField label="Lembaga Penerbit" value={form.lembaga_penerbit} onChangeText={(text: string) => setForm({ ...form, lembaga_penerbit: text })} placeholder="Misal: Amazon Web Services" />
        <InputField label="Nomor Sertifikat" value={form.nomor_sertifikat} onChangeText={(text: string) => setForm({ ...form, nomor_sertifikat: text })} placeholder="Misal: AWS-123456" />
        
        {/* Tanggal Terbit - Custom Brutalist Picker & Text Input */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#000000', marginBottom: 6 }}>
            Tanggal Terbit <Text style={{ color: '#ef4444' }}>*</Text>
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              value={form.tanggal_terbit}
              onChangeText={(text: string) => setForm({ ...form, tanggal_terbit: text })}
              placeholder="YYYY-MM-DD (Misal: 2024-05-01)"
              placeholderTextColor="#94a3b8"
              style={{
                flex: 1, borderWidth: 2, borderColor: '#000000', backgroundColor: '#ffffff',
                paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#000000'
              }}
            />

            <TouchableOpacity 
              onPress={openDatePicker}
              style={{
                backgroundColor: '#FF7F50', borderWidth: 2, borderColor: '#000000',
                paddingHorizontal: 10, paddingVertical: 9.7, marginLeft: -4,
                justifyContent: 'center', alignItems: 'center'
              }}
            >
              <Ionicons name="calendar-outline" size={20} color="#000" />
            </TouchableOpacity>

          </View>
        </View>
        <InputField label="Kategori" value={form.kategori} onChangeText={(text: string) => setForm({ ...form, kategori: text })} placeholder="Misal: Internasional, Nasional, BNSP" />
        <InputField label="Jurusan Relevan" value={form.jurusan} onChangeText={(text: string) => setForm({ ...form, jurusan: text })} placeholder="Misal: RPL, TKJ" />
        <InputField label="Tools yang Dipelajari" value={form.tools} onChangeText={(text: string) => setForm({ ...form, tools: text })} placeholder="Misal: AWS EC2, S3, RDS" />
        <InputField label="Deskripsi Kompetensi" value={form.deskripsi} onChangeText={(text: string) => setForm({ ...form, deskripsi: text })} placeholder="Jelaskan kompetensi yang diuji..." multiline />

        <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: '#FF7F50',
              paddingVertical: 14,
              borderWidth: 3,
              borderColor: '#000000',
              alignItems: 'center',
              shadowColor: '#000000',
              shadowOffset: { width: 5, height: 5 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 6,
              opacity: loading ? 0.7 : 1,
              marginTop: 10
            }}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={{ fontFamily: 'Inter_900Black', fontSize: 15, color: '#000000', letterSpacing: 1 }}>
                {editId ? 'SIMPAN PERUBAHAN' : 'TAMBAH SERTIFIKASI'}
              </Text>
            )}
          </TouchableOpacity>
      </ScrollView>

      {/* ── Brutalist Date Picker Modal ── */}
      <Modal visible={dateModalVisible} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#ffffff', borderWidth: 4, borderColor: '#000', width: '100%', shadowColor: '#000', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 1, shadowRadius: 0, elevation: 10 }}>
            {/* Header */}
            <View style={{ backgroundColor: '#FF7F50', padding: 16, borderBottomWidth: 3, borderBottomColor: '#000', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="calendar" size={24} color="#000" />
              <Text style={{ fontFamily: 'Inter_900Black', fontSize: 18, color: '#000', textTransform: 'uppercase' }}>Pilih Tanggal</Text>
            </View>
            
            {/* Controls */}
            <View style={{ padding: 24, gap: 20 }}>
              
              {/* TAHUN */}
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: '#64748b', marginBottom: 8, letterSpacing: 1 }}>TAHUN</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <TouchableOpacity onPress={() => setPickerYear(y => Math.max(y - 1, 1950))} style={{ borderWidth: 2, borderColor: '#000', backgroundColor: '#e2e8f0', padding: 8 }}>
                    <Ionicons name="chevron-back" size={20} color="#000" />
                  </TouchableOpacity>
                  <Text style={{ fontFamily: 'Inter_900Black', fontSize: 20, color: '#000', width: 70, textAlign: 'center' }}>{pickerYear}</Text>
                  <TouchableOpacity onPress={() => setPickerYear(y => Math.min(y + 1, 2100))} style={{ borderWidth: 2, borderColor: '#000', backgroundColor: '#e2e8f0', padding: 8 }}>
                    <Ionicons name="chevron-forward" size={20} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* BULAN */}
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: '#64748b', marginBottom: 8, letterSpacing: 1 }}>BULAN</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <TouchableOpacity onPress={() => setPickerMonth(m => m > 1 ? m - 1 : 12)} style={{ borderWidth: 2, borderColor: '#000', backgroundColor: '#e2e8f0', padding: 8 }}>
                    <Ionicons name="chevron-back" size={20} color="#000" />
                  </TouchableOpacity>
                  <Text style={{ fontFamily: 'Inter_900Black', fontSize: 15, color: '#000', width: 90, textAlign: 'center', textTransform: 'uppercase' }}>
                    {monthNames[pickerMonth - 1]}
                  </Text>
                  <TouchableOpacity onPress={() => setPickerMonth(m => m < 12 ? m + 1 : 1)} style={{ borderWidth: 2, borderColor: '#000', backgroundColor: '#e2e8f0', padding: 8 }}>
                    <Ionicons name="chevron-forward" size={20} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* TANGGAL */}
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: '#64748b', marginBottom: 8, letterSpacing: 1 }}>TANGGAL</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <TouchableOpacity onPress={() => setPickerDay(d => d > 1 ? d - 1 : getDaysInMonth(pickerYear, pickerMonth))} style={{ borderWidth: 2, borderColor: '#000', backgroundColor: '#e2e8f0', padding: 8 }}>
                    <Ionicons name="chevron-back" size={20} color="#000" />
                  </TouchableOpacity>
                  <Text style={{ fontFamily: 'Inter_900Black', fontSize: 20, color: '#000', width: 50, textAlign: 'center' }}>
                    {pickerDay < 10 ? `0${pickerDay}` : pickerDay}
                  </Text>
                  <TouchableOpacity onPress={() => setPickerDay(d => d < getDaysInMonth(pickerYear, pickerMonth) ? d + 1 : 1)} style={{ borderWidth: 2, borderColor: '#000', backgroundColor: '#e2e8f0', padding: 8 }}>
                    <Ionicons name="chevron-forward" size={20} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ marginTop: 10, gap: 12 }}>
                <TouchableOpacity onPress={saveDate} activeOpacity={0.8} style={{ backgroundColor: '#253341', borderWidth: 2, borderColor: '#000', paddingVertical: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 }}>
                  <Text style={{ fontFamily: 'Inter_900Black', fontSize: 14, color: '#fff', letterSpacing: 1 }}>SIMPAN TANGGAL</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDateModalVisible(false)} activeOpacity={0.8} style={{ backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#000', paddingVertical: 14, alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: '#000', letterSpacing: 1 }}>BATAL</Text>
                </TouchableOpacity>
              </View>
              
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
