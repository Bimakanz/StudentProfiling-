import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.5:8000/api';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Email dan password harus diisi.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Simpan data user ke AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        router.replace('/(tabs)/Home');
      } else {
        setErrorMsg(data.message ?? 'Login gagal. Periksa email dan password.');
      }
    } catch (error) {
      setErrorMsg('Tidak dapat terhubung ke server. Pastikan server Laravel berjalan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#c8cfd6', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
      <StatusBar barStyle="dark-content" />

      {/* Card */}
      <View style={{
        width: '100%',
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#000000',
        shadowColor: '#000000',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
      }}>

        {/* Card Header */}
        <View style={{
          backgroundColor: '#253341',
          paddingVertical: 18,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
          <Ionicons name="school" size={25} color="#FFFFFF" />
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 22, color: '#FFFFFF', letterSpacing: 1 }}>MASUK</Text>
        </View>

        {/* Card Body */}
        <View style={{ padding: 20, gap: 16 }}>

          {/* Error Message */}
          {errorMsg !== '' && (
            <View style={{ backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5', padding: 10 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#b91c1c' }}>{errorMsg}</Text>
            </View>
          )}

          {/* Email Field */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#000000' }}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="admin@gmail.com"
              placeholderTextColor="#aab0b8"
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                borderWidth: 2,
                borderColor: '#000000',
                paddingHorizontal: 14,
                paddingVertical: 10,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: '#000000',
                backgroundColor: '#ffffff',
              }}
            />
          </View>

          {/* Kata Sandi Field */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#000000' }}>Kata Sandi</Text>
            <View style={{
              borderWidth: 2,
              borderColor: '#000000',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              backgroundColor: '#ffffff',
            }}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#aab0b8"
                secureTextEntry={!showPassword}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: '#000000',
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Lupa Kata Sandi */}
          <TouchableOpacity onPress={() => {}}>
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FF7F50' }}>Lupa kata sandi?</Text>
          </TouchableOpacity>

          {/* MASUK Button */}
          <TouchableOpacity
            style={{
              backgroundColor: loading ? '#aab0b8' : '#FF7F50',
              borderWidth: 2,
              borderColor: '#000000',
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 4,
              shadowColor: '#000000',
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 5,
            }}
            onPress={handleLogin}
            activeOpacity={0.9}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#000000" />
              : <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: '#000000', letterSpacing: 1 }}>MASUK</Text>
            }
          </TouchableOpacity>

        </View>
      </View>

      {/* Footer Text */}
      <Text style={{
        fontFamily: 'Inter_400Regular',
        fontSize: 11,
        color: '#4f78a0',
        marginTop: 24,
        letterSpacing: 1,
      }}>
        SISTEM_PROFILING_SISWA.SMK_PESAT
      </Text>
    </SafeAreaView>
  );
}
