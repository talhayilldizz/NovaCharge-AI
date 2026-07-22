import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiClient } from '../lib/apiClient';
import Toast from 'react-native-toast-message';
import BottomMenu from '../components/BottomMenu';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#0d0d0f', // Daha koyu, premium siyah
  surface: '#151518',
  surfaceVariant: '#222226',
  primary: '#00e38b',
  primaryDim: 'rgba(0, 227, 139, 0.15)',
  onSurface: '#ffffff',
  onSurfaceVariant: '#a1a1aa',
};

const ACTION_BUTTONS = [
  { id: 'map', icon: 'map', label: 'Harita', screen: 'Map' },
  { id: 'list', icon: 'ev-station', label: 'İstasyonlar', screen: 'StationList' },
  { id: 'favorites', icon: 'star-outline', label: 'Favoriler', screen: 'StationList', params: { initialShowFavorites: true } },
  { id: 'garage', icon: 'directions-car', label: 'Garajım', screen: 'Vehicles' },
];

export default function HomeScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const [userName, setUserName] = useState<string>('Yükleniyor...');
  const [greeting, setGreeting] = useState<string>('Merhaba,');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [vehicle, setVehicle] = useState<any>(null);
  const [recentRoute, setRecentRoute] = useState<any>(null);

  useEffect(() => {
    // Dynamic Greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Günaydın,');
    else if (hour < 18) setGreeting('Tünaydın,');
    else if (hour < 22) setGreeting('İyi Akşamlar,');
    else setGreeting('İyi Geceler,');

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true })
    ]).start();

    const fetchUserData = async () => {
      try {
        const response = await apiClient('/users/', { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          setUserName(data.first_name ? `${data.first_name} ${data.last_name || ''}` : data.email.split('@')[0]);
        } else {
          setUserName('Şarj Sever');
        }
      } catch (error) {
        setUserName('Şarj Sever');
      }
    };

    fetchUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchFavoritesAndVehicles = async () => {
        try {
          const [favRes, vehRes, routeRes] = await Promise.all([
            apiClient('/favorites/me', { method: 'GET' }),
            apiClient('/vehicles', { method: 'GET' }),
            apiClient('/routes/me', { method: 'GET' })
          ]);
          if (favRes.ok) setFavorites(await favRes.json());
          if (vehRes.ok) {
            const vData = await vehRes.json();
            setVehicle(vData.find((v: any) => v.is_primary) || null);
          }
          if (routeRes.ok) {
            const rData = await routeRes.json();
            if (rData.length > 0) {
              setRecentRoute(rData.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]);
            }
          }
        } catch (error) {
          console.error(error);
        }
      };
      fetchFavoritesAndVehicles();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
            <MaterialIcons name="notifications-none" size={26} color={COLORS.onSurface} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </Animated.View>

        {/* Hero Card */}
        <Animated.View style={[styles.heroCardContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={['#1a1a1f', '#0f0f11']}
            style={styles.heroCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Neon Accent Line */}
            <View style={styles.heroAccent} />

            {vehicle ? (
              <>
                <View style={styles.heroHeader}>
                  <Text style={styles.carName}>{vehicle.brand} {vehicle.model}</Text>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Hazır</Text>
                  </View>
                </View>
                <View style={styles.carImagePlaceholder}>
                  <Image source={require('../../assets/car.png')} style={styles.carImage} />
                </View>
                <View style={styles.batteryRow}>
                  <View>
                    <Text style={styles.plugType}>{vehicle.plug_type}</Text>
                    <Text style={styles.batteryLabel}>{vehicle.battery_capacity} kWh</Text>
                  </View>
                  <View style={styles.rangeInfo}>
                    <Text style={styles.rangeValue}>{vehicle.range_km}<Text style={styles.rangeUnit}> km</Text></Text>
                    <Text style={styles.batteryLabel}>Menzil</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.noVehicleContainer}>
                <View style={styles.noVehicleIconWrapper}>
                  <MaterialIcons name="no-crash" size={48} color={COLORS.primary} />
                </View>
                <Text style={styles.noVehicleTitle}>Garajınız Boş</Text>
                <Text style={styles.noVehicleDesc}>Akıllı rotalar ve uyumlu istasyonlar için aracınızı ekleyin.</Text>
                <TouchableOpacity
                  style={styles.addVehicleBtn}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('AddVehicle')}
                >
                  <Text style={styles.addVehicleBtnText}>Hemen Ekle</Text>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[styles.actionsGrid, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {ACTION_BUTTONS.map((btn) => (
            <TouchableOpacity
              key={btn.id}
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={() => btn.params ? navigation.navigate(btn.screen, btn.params) : navigation.navigate(btn.screen)}
            >
              <View style={styles.actionIconWrapper}>
                <MaterialIcons name={btn.icon as any} size={26} color={COLORS.primary} />
              </View>
              <Text style={styles.actionLabel}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Son Rotalar */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Rotalar</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SavedRoutes')}>
              <Text style={styles.seeAllText}>Tümü</Text>
            </TouchableOpacity>
          </View>
          
          {recentRoute ? (
            <TouchableOpacity 
              style={styles.insightCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('SavedRoutes')}
            >
              <View style={styles.insightIconWrapper}>
                <MaterialIcons name="alt-route" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Kaydedilen Rota</Text>
                <Text style={styles.insightDesc}>{recentRoute.total_distance_km ? `${recentRoute.total_distance_km} km` : '?'} • {recentRoute.total_duration_mins ? `${Math.round(recentRoute.total_duration_mins)} dk` : '?'}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.emptyCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('RoutePlanner')}
            >
              <MaterialIcons name="add-road" size={28} color={COLORS.onSurfaceVariant} style={{ marginBottom: 8 }} />
              <Text style={styles.emptyCardText}>Henüz rota planlamadınız.</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Favori İstasyonlar */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favori İstasyonlar</Text>
            <TouchableOpacity onPress={() => navigation.navigate('StationList', { initialShowFavorites: true })}>
              <Text style={styles.seeAllText}>Tümü</Text>
            </TouchableOpacity>
          </View>

          {favorites.length > 0 ? (
            favorites.slice(0, 3).map((fav) => (
              <View key={fav.id} style={styles.favoriteCard}>
                <View style={styles.favoriteInfo}>
                  <Text style={styles.stationName}>{fav.custom_name || `İstasyon (${fav.external_station_id})`}</Text>
                  <Text style={styles.stationDistance}>Favori İstasyon</Text>
                </View>
                <TouchableOpacity 
                  style={styles.goButton}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('Map', { focusStation: { id: fav.external_station_id } })}
                >
                  <Text style={styles.goButtonText}>Haritada Gör</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <MaterialIcons name="star-border" size={28} color={COLORS.onSurfaceVariant} style={{ marginBottom: 8 }} />
              <Text style={styles.emptyCardText}>Henüz favori istasyonunuz yok.</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <BottomMenu navigation={navigation} activeTab="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  greeting: { fontSize: 15, color: COLORS.onSurfaceVariant, marginBottom: 4, fontWeight: '500' },
  userName: { fontSize: 26, fontWeight: '800', color: COLORS.onSurface, letterSpacing: -0.5 },
  notificationButton: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.surfaceVariant,
  },
  badge: {
    position: 'absolute', top: 12, right: 12, width: 10, height: 10,
    borderRadius: 5, backgroundColor: COLORS.primary,
    borderWidth: 2, borderColor: COLORS.surface,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 4, elevation: 4,
  },
  heroCardContainer: {
    marginBottom: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  heroCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  heroAccent: {
    position: 'absolute', top: 0, left: 24, right: 24, height: 3,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 10,
  },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  carName: { fontSize: 20, fontWeight: '700', color: COLORS.onSurface },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primaryDim,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 12, gap: 6,
    borderWidth: 1, borderColor: 'rgba(0, 227, 139, 0.3)',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 4 },
  statusText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  carImagePlaceholder: { height: 140, justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
  carImage: { width: '100%', height: '100%', resizeMode: 'contain', opacity: 0.9 },
  batteryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 },
  plugType: { fontSize: 24, fontWeight: '800', color: COLORS.onSurface, letterSpacing: 1 },
  batteryLabel: { fontSize: 13, color: COLORS.onSurfaceVariant, marginTop: 4, fontWeight: '500' },
  rangeInfo: { alignItems: 'flex-end' },
  rangeValue: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  rangeUnit: { fontSize: 16, fontWeight: '600', color: COLORS.primary },
  noVehicleContainer: { alignItems: 'center', paddingVertical: 16 },
  noVehicleIconWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryDim, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  noVehicleTitle: { color: COLORS.onSurface, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  noVehicleDesc: { color: COLORS.onSurfaceVariant, fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20, paddingHorizontal: 10 },
  addVehicleBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 24, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  addVehicleBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 32, gap: 14 },
  actionButton: {
    width: (width - 54) / 2,
    backgroundColor: COLORS.surface,
    padding: 16, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.surfaceVariant,
  },
  actionIconWrapper: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  actionLabel: { fontSize: 15, fontWeight: '600', color: COLORS.onSurface },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 19, fontWeight: '700', color: COLORS.onSurface },
  seeAllText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  insightCard: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    padding: 16, borderRadius: 18, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.surfaceVariant,
  },
  insightIconWrapper: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: COLORS.primaryDim,
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  insightContent: { flex: 1 },
  insightTitle: { fontSize: 15, fontWeight: '700', color: COLORS.onSurface, marginBottom: 4 },
  insightDesc: { fontSize: 13, color: COLORS.onSurfaceVariant, fontWeight: '500' },
  emptyCard: {
    backgroundColor: COLORS.surface, padding: 24, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.surfaceVariant, borderStyle: 'dashed',
  },
  emptyCardText: { color: COLORS.onSurfaceVariant, fontSize: 14, fontWeight: '500' },
  favoriteCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, padding: 16, borderRadius: 18,
    borderWidth: 1, borderColor: COLORS.surfaceVariant, marginBottom: 10,
  },
  favoriteInfo: { flex: 1 },
  stationName: { fontSize: 16, fontWeight: '600', color: COLORS.onSurface, marginBottom: 4 },
  stationDistance: { fontSize: 13, color: COLORS.onSurfaceVariant },
  goButton: {
    backgroundColor: COLORS.primaryDim, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 227, 139, 0.3)',
  },
  goButtonText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
});
