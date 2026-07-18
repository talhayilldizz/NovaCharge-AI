import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { apiClient } from '../lib/apiClient';
import Toast from 'react-native-toast-message';
import BottomMenu from '../components/BottomMenu';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#131315',
  surface: '#1c1b1d',
  primary: '#00e38b',
  surfaceVariant: '#353437',
  onSurface: '#e6e1e5',
  onSurfaceVariant: '#b9cbbc',
};

const ACTION_BUTTONS = [
  { id: 'map', icon: 'map', label: 'Harita', screen: 'Map' },
  { id: 'route', icon: 'alt-route', label: 'Akıllı Rota', screen: 'SmartRoute' },
  { id: 'favorites', icon: 'star-outline', label: 'Favoriler', screen: 'Favorites' },
  { id: 'garage', icon: 'directions-car', label: 'Garaj', screen: 'Garage' },
];

export default function HomeScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Canlı Veri Stateleri
  const [userName, setUserName] = useState<string>('Yükleniyor...');
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [vehicle, setVehicle] = useState<any>(null);

  useEffect(() => {
    // 1. Animasyonları Başlat
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();

    // 2. Kullanıcı Verisini Çek
    const fetchUserData = async () => {
      try {
        // Supabase'den güncel oturumu al
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          console.log("Oturum bulunamadı");
          setUserName('Misafir Kullanıcı');
          setIsUserLoading(false);
          return;
        }

        const response = await apiClient('/users/', { method: 'GET' });

        if (response.ok) {
          const data = await response.json();
          if (data.first_name) {
            setUserName(`${data.first_name} ${data.last_name || ''}`);
          } else {
            setUserName(data.email.split('@')[0]);
          }
        } else {
          console.error("Kullanıcı verisi çekilemedi. Status:", response.status);
          const errData = await response.json();
          Toast.show({
            type: 'error',
            text1: 'Veri Hatası',
            text2: `Veri çekilemedi: ${response.status} - ${errData.detail || ''}`
          });
          setUserName('Şarj Sever');
        }

        const favResponse = await apiClient('/favorites/me', { method: 'GET' });

        if (favResponse.ok) {
          const favData = await favResponse.json();
          setFavorites(favData)
        }

        const vehicleResponse = await apiClient('/vehicles', { method: 'GET' });

        if (vehicleResponse.ok) {
          const vehicleData = await vehicleResponse.json();

          if (vehicleData.length > 0) {
            setVehicle(vehicleData[0]);
          }
        }


      } catch (error: any) {
        console.error("API Bağlantı Hatası:", error);
        Toast.show({
          type: 'error',
          text1: 'Bağlantı Hatası',
          text2: `Sunucuya bağlanılamadı: ${error.message}`
        });
        setUserName('Şarj Sever');
      } finally {
        setIsUserLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={styles.greeting}>Günaydın,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
            <MaterialIcons name="notifications-none" size={24} color={COLORS.onSurface} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </Animated.View>

        {/* Hero Card: Vehicle Status */}
        <Animated.View style={[styles.heroCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={[COLORS.surface, '#1a1a1c']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {vehicle ? (
              // ARAÇ VARSA GÖSTERİLECEK KISIM
              <>
                <View style={styles.heroHeader}>
                  <Text style={styles.carName}>{vehicle.brand} {vehicle.model}</Text>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Hazır</Text>
                  </View>
                </View>

                <View style={styles.carImagePlaceholder}>
                  <MaterialIcons name="directions-car" size={100} color={COLORS.surfaceVariant} />
                </View>

                <View style={styles.batteryRow}>
                  <View>
                    <Text style={styles.plugType}>{vehicle.plug_type}</Text>
                    <Text style={styles.batteryLabel}>{vehicle.battery_capacity} kWh Kapasite</Text>
                  </View>
                  <View style={styles.rangeInfo}>
                    <Text style={styles.rangeValue}>{vehicle.range_km}<Text style={styles.rangeUnit}> km</Text></Text>
                    <Text style={styles.batteryLabel}>Maks. Menzil</Text>
                  </View>
                </View>
              </>
            ) : (
              // ARAÇ YOKSA GÖSTERİLECEK "ARAÇ EKLE" KISMI
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <MaterialIcons name="no-crash" size={60} color={COLORS.surfaceVariant} style={{ marginBottom: 16 }} />
                <Text style={{ color: COLORS.onSurface, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
                  Garajınız Boş
                </Text>
                <Text style={{ color: COLORS.onSurfaceVariant, fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
                  Akıllı rota ve size uygun istasyonları bulabilmemiz için aracınızı ekleyin.
                </Text>
                <TouchableOpacity
                  style={{ backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 }}
                  onPress={() => navigation.navigate('AddVehicle')}
                >
                  <Text style={{ color: '#000', fontWeight: 'bold' }}>Araç Ekle</Text>
                </TouchableOpacity>
              </View>
            )}

          </LinearGradient>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[styles.actionsGrid, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {ACTION_BUTTONS.map((action, index) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={() => action.screen && navigation.navigate(action.screen)}
            >
              <View style={styles.actionIconWrapper}>
                <MaterialIcons name={action.icon as any} size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Smart Insights (AI) */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Akıllı Öneriler</Text>
          <View style={styles.insightCard}>
            <View style={styles.insightIconWrapper}>
              <MaterialIcons name="auto-awesome" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightText}>
                Yarınki İzmir seyahatiniz için mevcut şarjınız yetersiz olabilir. Gece şarja takmanız önerilir.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Favorite Stations Preview */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favori İstasyonlar</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Tümü</Text>
            </TouchableOpacity>
          </View>

          {favorites.length > 0 ? (
            favorites.map((fav) => (
              <View key={fav.id} style={[styles.favoriteCard, { marginBottom: 8 }]}>
                <View style={styles.favoriteInfo}>
                  <Text style={styles.stationName}>{fav.custom_name || `İstasyon (${fav.external_station_id})`}</Text>
                  <Text style={styles.stationDistance}>Favori İstasyon</Text>
                </View>
                <View style={styles.availabilityBadge}>
                  <Text style={styles.availabilityText}>Git</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={[styles.favoriteCard, { justifyContent: 'center' }]}>
              <Text style={{ color: COLORS.onSurfaceVariant }}>Henüz favori istasyonun yok.</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <BottomMenu navigation={navigation} activeTab="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  heroCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  heroGradient: {
    padding: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  carImagePlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  batteryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  plugType: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    lineHeight: 40,
  },
  batteryLabel: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },
  rangeInfo: {
    alignItems: 'flex-end',
  },
  rangeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  rangeUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  actionButton: {
    width: (width - 52) / 2, // 20 padding left/right + 12 gap = 52
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 20,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  actionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 227, 139, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 227, 139, 0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 227, 139, 0.2)',
    alignItems: 'center',
  },
  insightIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 227, 139, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: 14,
    color: COLORS.onSurface,
    lineHeight: 20,
  },
  favoriteCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  favoriteInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  stationDistance: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  availabilityBadge: {
    backgroundColor: 'rgba(0, 227, 139, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 227, 139, 0.2)',
  },
  availabilityText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
