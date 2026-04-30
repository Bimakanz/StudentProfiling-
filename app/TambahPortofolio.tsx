import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar, Image } from 'react-native';
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

export default function TambahPortofolio() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.id;
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);

  const [form, setForm] = useState({
    judul: '',
    deskripsi: '',
    kategori: '',
    nilai: 'A',
    jenis_porto: '',
    tools: '',
    teknologi: '',
    link_github: '',
  });

  const [thumbnailFile, setThumbnailFile] = useState<{ uri: string, name: string, mimeType?: string, file?: any } | null>(null);
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadUserAndData = async () => {
      const stored = await AsyncStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));

      if (editId) {
        setLoading(true);
        try {
          const res = await fetch(`${API_URL}/portofolio/${editId}`, { headers: { Accept: 'application/json' } });
          const json = await res.json();
          if (json.status === 'success' && json.data) {
             const p = json.data;
             setForm({
               judul: p.judul || '',
               deskripsi: p.deskripsi || '',
               kategori: p.kategori || '',
               nilai: p.nilai || 'A',
               jenis_porto: p.jenis_porto || '',
               tools: p.tools || '',
               teknologi: p.teknologi || '',
               link_github: p.link_github || '',
             });
             if (p.thumbnail) setExistingThumbnail(p.thumbnail);
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
      setThumbnailFile({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType || 'application/octet-stream',
        file: asset.file, // Tersedia di Web
      });
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(''); // Reset error
    
    if (!user) {
      setErrorMessage('Sesi pengguna tidak ditemukan. Silakan login kembali.');
      return;
    }
    
    if (!form.judul || !form.deskripsi || !form.kategori || !form.jenis_porto || !form.tools || !form.teknologi) {
      setErrorMessage('Mohon lengkapi semua field yang wajib diisi (dengan tanda *).');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('user_id', String(user.id));
      formData.append('judul', form.judul);
      formData.append('deskripsi', form.deskripsi);
      formData.append('kategori', form.kategori);
      formData.append('nilai', form.nilai);
      formData.append('jenis_porto', form.jenis_porto);
      formData.append('tools', form.tools);
      formData.append('teknologi', form.teknologi);
      if (form.link_github) formData.append('link_github', form.link_github);

      if (thumbnailFile) {
        if (thumbnailFile.file) {
          // Khusus untuk platform Web
          formData.append('thumbnail', thumbnailFile.file);
        } else {
          // Untuk platform Mobile (Android/iOS)
          formData.append('thumbnail', {
            uri: thumbnailFile.uri,
            name: thumbnailFile.name,
            type: thumbnailFile.mimeType,
          } as any);
        }
      }

      if (editId) {
        formData.append('_method', 'PUT'); // Laravel method spoofing for multipart update
      }

      console.log('Sending formData...');
      const url = editId ? `${API_URL}/portofolio/${editId}` : `${API_URL}/portofolio`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await res.json();
      console.log('Response:', data);
      
      if (res.ok || res.status === 201 || res.status === 200) {
        await AsyncStorage.setItem('portfolio_toast', editId ? 'PROYEK BERHASIL DI EDIT' : 'PROYEK BERHASIL DITAMBAHKAN');
        router.back();
      } else {
        let errorMsg = data.message || 'Gagal menambahkan portofolio.';
        if (data.errors) {
          const errorDetails = Object.values(data.errors).flat().join('\n');
          errorMsg += '\n' + errorDetails;
        }
        setErrorMessage(errorMsg);
      }
    } catch (error: any) {
      console.log("Fetch Error:", error);
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
          {editId ? 'EDIT PORTOFOLIO' : 'TAMBAH PORTOFOLIO'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Pesan Error (Ditampilkan langsung di layar jika ada) */}
      {errorMessage !== '' && (
        <View style={{ backgroundColor: '#fee2e2', padding: 12, borderWidth: 2, borderColor: '#ef4444', marginHorizontal: 20, marginTop: 16 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#b91c1c', fontSize: 13 }}>
            Peringatan: {errorMessage}
          </Text>
        </View>
      )}

      {/* Form */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Input Gambar/Dokumen (Thumbnail) */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#000000', marginBottom: 10 }}>
            File Format (Gambar / PDF)
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
            {thumbnailFile ? (
              <View style={{ alignItems: 'center', gap: 10, width: '100%' }}>
                {thumbnailFile.mimeType?.startsWith('image/') || thumbnailFile.name.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                  <View style={{ width: '100%', height: 180, borderWidth: 2, borderColor: '#000000', marginBottom: 6 }}>
                    <Image source={{ uri: thumbnailFile.uri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                  </View>
                ) : (
                  <Ionicons name="document-text" size={64} color="#FF7F50" />
                )}
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: '#000000', textAlign: 'center' }}>
                  {thumbnailFile.name}
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#3b82f6' }}>
                  Ketuk untuk mengganti file
                </Text>
              </View>
            ) : existingThumbnail ? (
              <View style={{ alignItems: 'center', gap: 10, width: '100%' }}>
                {existingThumbnail.match(/\.(jpeg|jpg|png|gif|webp)$/i) || !existingThumbnail.includes('.pdf') ? (
                  <View style={{ width: '100%', height: 180, borderWidth: 2, borderColor: '#000000', marginBottom: 6 }}>
                    <Image source={{ uri: existingThumbnail }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                  </View>
                ) : (
                  <Ionicons name="document-text" size={64} color="#FF7F50" />
                )}
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: '#000000', textAlign: 'center' }}>
                  Thumbnail Tersimpan
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

                {/* Teks Petunjuk */}
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#000000', marginBottom: 6 }}>
                  Seret & Lepas File
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                  atau klik untuk menelusuri
                </Text>

                {/* Tag Format */}
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

        <InputField label="Judul Proyek" value={form.judul} onChangeText={(text: string) => setForm({ ...form, judul: text })} placeholder="Misal: Website E-Commerce" />
        <InputField label="Kategori" value={form.kategori} onChangeText={(text: string) => setForm({ ...form, kategori: text })} placeholder="Misal: Web Development" />
        <InputField label="Jenis Portofolio" value={form.jenis_porto} onChangeText={(text: string) => setForm({ ...form, jenis_porto: text })} placeholder="Misal: Tugas Sekolah / Project Mandiri" />
        <InputField label="Tools (Alat)" value={form.tools} onChangeText={(text: string) => setForm({ ...form, tools: text })} placeholder="Misal: VS Code, Figma" />
        <InputField label="Teknologi" value={form.teknologi} onChangeText={(text: string) => setForm({ ...form, teknologi: text })} placeholder="Misal: React Native, Laravel" />
        <InputField label="Deskripsi" value={form.deskripsi} onChangeText={(text: string) => setForm({ ...form, deskripsi: text })} placeholder="Ceritakan tentang proyek ini..." multiline />
        
        {/* Nilai Picker */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#000000', marginBottom: 6 }}>
            Nilai <Text style={{ color: '#ef4444' }}>*</Text>
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {['A', 'B', 'C', 'D'].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setForm({ ...form, nilai: n })}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  backgroundColor: form.nilai === n ? '#FF7F50' : '#ffffff',
                  borderWidth: 2,
                  borderColor: '#000000',
                }}
              >
                <Text style={{ fontFamily: 'Inter_700Bold', color: '#000000' }}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <InputField label="Link GitHub" value={form.link_github} onChangeText={(text: string) => setForm({ ...form, link_github: text })} placeholder="https://github.com/..." required={false} />

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
            }}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={{ fontFamily: 'Inter_900Black', fontSize: 15, color: '#000000', letterSpacing: 1 }}>
                {editId ? 'SIMPAN PERUBAHAN' : 'TAMBAH PORTOFOLIO'}
              </Text>
            )}
          </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
