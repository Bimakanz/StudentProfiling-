import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        router.replace('/(tabs)/Home');
      } else {
        setChecking(false);
      }
    };
    checkLogin();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: '#253341', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF7F50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#253341' }}>
      <StatusBar barStyle="light-content" />
      
      {/* Top Section with Dark Background */}
      <View style={{ flex: 3, paddingHorizontal: 24, paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 60 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* Simple Orange Square for Logo with Icon */}
            <View style={{ 
              width: 25, 
              height: 25, 
              backgroundColor: '#FF7F50', 
              borderColor: '#000000', 
              borderWidth: 2, 
              shadowColor: '#000000', 
              shadowOffset: { width: 4, height: 4 }, 
              shadowOpacity: 1, 
              shadowRadius: 0, 
              elevation: 5,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Ionicons name="school" size={10} color="#000000" />
            </View>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: '#ffffff', letterSpacing: 0.5 }}>SMK Pesat</Text>
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', paddingBottom: 40 }}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 42, color: '#ffffff', lineHeight: 48, marginBottom: 16 }}>
            Profiling &{"\n"}Portofolio Siswa
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#94a3b8', lineHeight: 20, maxWidth: '80%' }}>
            Lacak prestasi, nilai dan portofolio kamu dalam satu platform.
          </Text>
        </View>
      </View>

      {/* Bottom Section with Light Background */}
      <View style={{ 
        flex: 1, 
        backgroundColor: '#E5E5E5', 
        paddingHorizontal: 24, 
        paddingTop: 40, 
        paddingBottom: 20, 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <View style={{ width: '100%', gap: 16 }}>
          {/* MASUK KE PORTAL Button */}
          <TouchableOpacity 
            style={{ 
              width: '100%', 
              height: 48, 
              justifyContent: 'center', 
              alignItems: 'center', 
              borderWidth: 2, 
              borderColor: '#000000', 
              backgroundColor: '#FF7F50',
              shadowColor: '#000000',
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 5
            }}
            onPress={() => router.push('/Login')}
            activeOpacity={0.9}
          >
            <Text style={{ fontFamily: 'Inter_700Bold', color: '#000000', fontSize: 14, letterSpacing: 0.5 }}>MASUK KE PORTAL</Text>
          </TouchableOpacity>
          
          {/* Lihat Profil Publik Siswa Button */}
          <TouchableOpacity 
            style={{ 
              width: '100%', 
              height: 48, 
              justifyContent: 'center', 
              alignItems: 'center', 
              borderWidth: 2, 
              borderColor: '#000000', 
              backgroundColor: '#ffffff',
              shadowColor: '#000000',
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 5
            }}
            onPress={() => router.push('/Terbuka')}
            activeOpacity={0.9}
          >
            <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#000000', fontSize: 14 }}>Lihat Profil Publik Siswa</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: '#64748b', marginTop: 20 }}>v1.0 - SMK Pesat</Text>
      </View>
    </SafeAreaView>
  );
}
