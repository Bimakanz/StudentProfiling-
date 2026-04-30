import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator,
  SafeAreaView, StatusBar, TouchableOpacity, RefreshControl, Image, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PortfolioCard from '../../components/PortfolioCard';

const API_URL = 'http://192.168.1.5:8000/api';

type Portofolio = {
  id: number;
  judul: string;
  deskripsi: string;
  kategori: string;
  nilai: string;
  jenis_porto: string;
  tools: string;
  teknologi: string;
  link_github?: string;
  thumbnail?: string;
  user?: { id: number; name: string; email: string };
};

const PublicPortfolioDetail = ({ item, onClose }: any) => {
  const isImage = item.thumbnail && /\.(jpeg|jpg|gif|png|webp)$/i.test(item.thumbnail);
  const formattedDate = new Date(item.created_at || Date.now()).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');

  return (
    <View style={{ flex: 1, backgroundColor: '#cbd5e1' }}>
      {/* ── Sub Header ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#ffffff', borderBottomWidth: 3, borderBottomColor: '#000' }}>
        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Inter_900Black', fontSize: 16, color: '#000', letterSpacing: 1.5, textTransform: 'uppercase' }}>
          PROJECT_DETAILS
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        
        {/* Thumbnail Image Box */}
        {item.thumbnail && (
          <View style={{ position: 'relative', marginBottom: 24 }}>
            <View style={{ position: 'absolute', top: 6, left: 6, right: -6, bottom: -6, backgroundColor: '#FF7F50', borderWidth: 2, borderColor: '#000' }} />
            <View style={{ height: 200, borderWidth: 2, borderColor: '#000', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
              {isImage ? (
                 <Image source={{ uri: item.thumbnail }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
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
          {item.judul}
        </Text>

        {/* Badges Row 1 */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <View style={{ borderWidth: 2, borderColor: '#000', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#000', textTransform: 'uppercase' }}>
              DATE: {formattedDate}
            </Text>
          </View>
          <View style={{ borderWidth: 2, borderColor: '#000', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="person-circle-outline" size={14} color="#000" />
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#000', textTransform: 'uppercase' }}>
              {item.user?.name || 'Siswa'}
            </Text>
          </View>
        </View>

        {/* Badges Row 2 */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <View style={{ borderWidth: 2, borderColor: '#000', backgroundColor: '#FF7F50', paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#fff', textTransform: 'uppercase' }}>
              {item.kategori || 'ENGINEERING'}
            </Text>
          </View>
          <View style={{ borderWidth: 2, borderColor: '#000', backgroundColor: '#22c55e', paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#fff', textTransform: 'uppercase' }}>
              GRADE {item.nilai}
            </Text>
          </View>
        </View>

        {/* Deskripsi Proyek */}
        <View style={{ borderWidth: 3, borderColor: '#000', backgroundColor: '#fff', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 }}>
          <View style={{ backgroundColor: '#253341', padding: 12, borderBottomWidth: 3, borderBottomColor: '#000' }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: '#fff', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              DESKRIPSI PROYEK
            </Text>
          </View>
          <View style={{ padding: 16 }}>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#0f172a', lineHeight: 22 }}>
              {item.deskripsi || 'Tidak ada deskripsi.'}
            </Text>
          </View>
        </View>

        {/* Tools & Technology */}
        <View style={{ borderWidth: 3, borderColor: '#000', backgroundColor: '#fff', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 }}>
          <View style={{ backgroundColor: '#253341', padding: 12, borderBottomWidth: 3, borderBottomColor: '#000' }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: '#fff', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              TOOLS & TECHNOLOGY
            </Text>
          </View>
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="build-outline" size={16} color="#000" />
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#0f172a' }}>{item.tools || '-'}</Text>
            </View>
            <View style={{ paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="laptop-outline" size={16} color="#000" />
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#0f172a' }}>{item.teknologi || '-'}</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

export default function Terbuka() {
  const router = useRouter();
  const [list, setList] = useState<Portofolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState<Portofolio | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/portofolio`, { headers: { Accept: 'application/json' } });
      const json = await res.json();
      setList(json.data ?? []);
      setError('');
    } catch {
      setError('Gagal memuat data. Periksa koneksi ke server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (selectedItem) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#cbd5e1' }}>
        <StatusBar barStyle="dark-content" />
        <PublicPortfolioDetail item={selectedItem} onClose={() => setSelectedItem(null)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={{ 
        backgroundColor: '#253341', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, 
        flexDirection: 'row', alignItems: 'center', borderBottomWidth: 3, borderBottomColor: '#000' 
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12, marginTop:4 }}>
          <Text style={{ fontFamily: 'Inter_900Black', fontSize: 16, color: '#ffffff', letterSpacing: 1.5, textTransform: 'uppercase' }}>Portofolio Publik</Text>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#FF7F50', marginTop: 2 }}>SMK PESAT - TANPA LOGIN</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#253341" />
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#64748b', marginTop: 12 }}>Memuat data...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <Ionicons name="cloud-offline-outline" size={48} color="#94a3b8" />
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#374151', textAlign: 'center', marginTop: 12 }}>{error}</Text>
          <TouchableOpacity
            style={{ marginTop: 16, backgroundColor: '#253341', paddingHorizontal: 24, paddingVertical: 12, borderWidth: 2, borderColor: '#000' }}
            onPress={() => { setLoading(true); fetchData(); }}
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#fff', fontSize: 14 }}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : list.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="folder-open-outline" size={48} color="#94a3b8" />
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#64748b', marginTop: 12 }}>Belum ada portofolio.</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <PortfolioCard item={item} onPress={() => setSelectedItem(item)} />}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        />
      )}
    </SafeAreaView>
  );
}
