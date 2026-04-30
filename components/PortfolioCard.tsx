import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PortfolioCard({ item, onPress }: { item: any, onPress?: () => void }) {
  // Mengecek apakah thumbnail adalah gambar atau dokumen lain (misal PDF)
  // Jika thumbnail adalah URL dan berakhiran jpg/png/jpeg/webp dll, tampilkan gambar
  // Jika bukan (misal pdf) tampilkan icon document
  const isImage = item.thumbnail && item.thumbnail.match(/\.(jpeg|jpg|gif|png|webp)$/i);

  return (
    <View style={{
      borderWidth: 4,
      borderColor: '#000000',
      backgroundColor: '#ffffff',
      padding: 10,
      marginBottom: 20,
      shadowColor: '#000000',
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 6,
    }}>
      <View style={{
        height: 220, // Diperbesar sedikit agar mirip referensi
        backgroundColor: '#e2e8f0',
        borderWidth: 2,
        borderColor: '#000000',
        marginBottom: 16,
        overflow: 'hidden'
      }}>
        {item.thumbnail ? (
          isImage ? (
            <Image source={{ uri: item.thumbnail }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e8f0' }}>
              <Ionicons name="document-text-outline" size={64} color="#64748b" />
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#64748b', marginTop: 8 }}>
                PDF / Dokumen
              </Text>
            </View>
          )
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="image-outline" size={40} color="#94a3b8" />
          </View>
        )}
        
        <View style={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: '#FF7F50',
          borderWidth: 2,
          borderColor: '#000000',
          paddingHorizontal: 8,
          paddingVertical: 4
        }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#000000' }}>
            {item.nilai}+ GRADED
          </Text>
        </View>
      </View>
      
      <Text style={{ fontFamily: 'Inter_900Black', fontSize: 20, color: '#000000', textTransform: 'uppercase', marginBottom: 12 }}>
        {item.judul}
      </Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#475569' }}>
          {new Date(item.created_at || Date.now()).toLocaleDateString('id-ID')}
        </Text>
        <View style={{ backgroundColor: '#253341', paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#ffffff', textTransform: 'uppercase' }}>
            {item.kategori}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity onPress={onPress} style={{
        borderWidth: 2,
        borderColor: '#000000',
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ffffff'
      }}>
        <Ionicons name="eye-outline" size={16} color="#000000" />
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: '#000000', letterSpacing: 1 }}>
          VIEW PROJECT
        </Text>
      </TouchableOpacity>
    </View>
  );
}
