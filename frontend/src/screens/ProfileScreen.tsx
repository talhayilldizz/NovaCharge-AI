import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { apiClient } from '../lib/apiClient';
import BottomMenu from '../components/BottomMenu';
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

export default function ProfileScreen({ navigation }: any) {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await apiClient('/users/', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error("Kullanıcı verisi alınamadı. Status:", response.status);
      }
    } catch (error) {
      console.error("Kullanıcı verisi çekilirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Toast.show({
                type: 'error',
                text1: 'Çıkış Yapılamadı',
                text2: error.message
              });
            } else {
              navigation.replace('Auth');
            }
          }
        }
      ]
    );
  };

  const getInitials = () => {
    if (!userData) return "US";
    const fName = userData.first_name || "";
    const lName = userData.last_name || "";
    if (fName && lName) {
      return `${fName.charAt(0)}${lName.charAt(0)}`.toUpperCase();
    }
    if (fName) return fName.substring(0, 2).toUpperCase();
    return "US";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Profilim</Text>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <Text style={styles.fullName}>
              {userData?.first_name} {userData?.last_name}
            </Text>
            <Text style={styles.emailText}>{userData?.email}</Text>
          </View>

          {/* Menu Sections */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Hesap Yönetimi</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('PersonalInfo')}
            >
              <View style={styles.menuIconWrapper}>
                <Ionicons name="person-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuText}>Kişisel Bilgiler</Text>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('Security')}
            >
              <View style={styles.menuIconWrapper}>
                <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuText}>Şifre ve Güvenlik</Text>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconWrapper}>
                <MaterialCommunityIcons name="map-marker-path" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuText}>Rotalarım</Text>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Diğer</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <View style={styles.menuIconWrapper}>
                <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuText}>Yardım ve Destek</Text>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              <View style={styles.menuIconWrapper}>
                <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuText}>Gizlilik Sözleşmesi</Text>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>

        </ScrollView>
      )}

      <BottomMenu navigation={navigation} activeTab="Profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // BottomMenu için boşluk
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0, 227, 139, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(0, 227, 139, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  fullName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 227, 139, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 84, 73, 0.1)',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 84, 73, 0.2)',
    marginTop: 16,
    gap: 8,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '700',
  },
});
