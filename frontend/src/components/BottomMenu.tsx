import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
const COLORS = {
  background: '#0d0d0f',
  baseBackground: '#0d0d0f',
  surface: '#151518',
  surfaceVariant: '#222226',
  surfaceContainerLow: '#151518',
  surfaceContainerHigh: '#222226',
  surfaceContainerHighest: '#2a2a30',
  surfaceTint: '#00e38b',
  primary: '#00e38b',
  primaryDim: 'rgba(0, 227, 139, 0.15)',
  secondary: '#00c477',
  secondaryContainer: 'rgba(0, 196, 119, 0.15)',
  onSurface: '#ffffff',
  onSurfaceVariant: '#a1a1aa',
  danger: '#ff5449',
  error: '#ff5449',
  star: '#FFC107'
};

type BottomMenuProps = {
  navigation: any;
  activeTab: 'Home' | 'SavedRoutes' | 'Route' | 'Vehicles' | 'Profile';
};

export default function BottomMenu({ navigation, activeTab }: BottomMenuProps) {
  const handlePress = (tab: string, routeName?: string) => {
    if (routeName) {
      navigation.navigate(routeName);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Hazırlanıyor',
        text2: `${tab} sayfası henüz hazır değil.`
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Ev (Home) */}
      <TouchableOpacity style={styles.tab} onPress={() => handlePress('Ev', 'Home')}>
        <Ionicons
          name={activeTab === 'Home' ? "home" : "home-outline"}
          size={24}
          color={activeTab === 'Home' ? COLORS.primary : COLORS.onSurfaceVariant}
        />
        <Text style={[styles.tabText, activeTab === 'Home' && styles.activeTabText]}>Ev</Text>
      </TouchableOpacity>

      {/* Rotalar */}
      <TouchableOpacity style={styles.tab} onPress={() => handlePress('Rotalar', 'SavedRoutes')}>
        <MaterialCommunityIcons
          name="format-list-bulleted"
          size={24}
          color={activeTab === 'SavedRoutes' ? COLORS.primary : COLORS.onSurfaceVariant}
        />
        <Text style={[styles.tabText, activeTab === 'SavedRoutes' && styles.activeTabText]}>Rotalar</Text>
      </TouchableOpacity>

      {/* Rota (Center, Larger) */}
      <View style={styles.centerTabContainer}>
        <TouchableOpacity style={styles.centerTab} onPress={() => handlePress('Rota', 'RoutePlanner')}>
          <MaterialCommunityIcons name="map-marker-path" size={32} color="#000" />
        </TouchableOpacity>
        <Text style={[styles.tabText, styles.centerTabText, activeTab === 'Route' && styles.activeTabText]}>Rota</Text>
      </View>

      {/* Araçlar (Vehicles) */}
      <TouchableOpacity style={styles.tab} onPress={() => handlePress('Araçlar', 'Vehicles')}>
        <MaterialIcons
          name={activeTab === 'Vehicles' ? "directions-car" : "directions-car"}
          size={24}
          color={activeTab === 'Vehicles' ? COLORS.primary : COLORS.onSurfaceVariant}
        />
        <Text style={[styles.tabText, activeTab === 'Vehicles' && styles.activeTabText]}>Araçlar</Text>
      </TouchableOpacity>

      {/* Profil (Profile) */}
      <TouchableOpacity style={styles.tab} onPress={() => handlePress('Profil', 'Profile')}>
        <Ionicons
          name={activeTab === 'Profile' ? "person" : "person-outline"}
          size={24}
          color={activeTab === 'Profile' ? COLORS.primary : COLORS.onSurfaceVariant}
        />
        <Text style={[styles.tabText, activeTab === 'Profile' && styles.activeTabText]}>Profil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    height: 80,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
    zIndex: 1000,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  centerTabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -30, // Yükseltme efekti
  },
  centerTab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  centerTabText: {
    marginTop: 8,
  },
});
