import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

// ─── Tab definisi (key = nama file di folder tabs) ───────────────────────────
const TABS: Record<string, { label: string; icon: string }> = {
  Home:       { label: 'DASHBOARD',  icon: 'home'                    },
  Portfolio:  { label: 'PORTFOLIO',  icon: 'folder-outline'           },
  Sertifikasi: { label: 'SERTIFIKASI', icon: 'ribbon-outline' },
  Profile:    { label: 'PROFILE',    icon: 'person-outline'           },
};

// ─── Custom Tab Bar ────────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  // Hanya tampilkan route yang terdaftar di TABS (abaikan index, explore, dll)
  const visibleRoutes = state.routes.filter((r) => TABS[r.name]);

  return (
    <View style={styles.container}>
      {visibleRoutes.map((route) => {
        const tab = TABS[route.name];
        const routeIndex = state.routes.findIndex((r) => r.key === route.key);
        const isActive = state.index === routeIndex;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.8}
            style={styles.tabItem}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Ionicons
                name={tab.icon as any}
                size={22}
                color={isActive ? '#ffffff' : '#64748b'}
              />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 2,
    borderTopColor: '#000000',
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 0,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  iconWrap: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  iconWrapActive: {
    backgroundColor: '#FF7F50',
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: '#FF7F50',
  },
});

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="Home"       options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="Portfolio"  options={{ title: 'Portfolio' }} />
      <Tabs.Screen name="Sertifikasi" options={{ title: 'Sertifikasi' }} />
      <Tabs.Screen name="Profile"    options={{ title: 'Profile' }} />
    </Tabs>
  );
}
