import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { apiClient } from '../lib/apiClient';
import Toast from 'react-native-toast-message';
import BottomMenu from '../components/BottomMenu';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#0d0d0f',
  baseBackground: '#0d0d0f',
  surface: '#151518',
  surfaceVariant: '#222226',
  surfaceSolid: '#1c1b1d',
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

export default function RoutePlannerScreen({ navigation, route }: any) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [batteryPercentage, setBatteryPercentage] = useState('100');
  const [isLoading, setIsLoading] = useState(true);

  // Arama State'leri
  const [activeInput, setActiveInput] = useState<'start' | 'end' | null>(null);
  
  // Başlangıç Konumu
  const [startLocation, setStartLocation] = useState<any>(null); // {lat, lon, name}
  const [startSearchQuery, setStartSearchQuery] = useState('Mevcut Konumum');
  const [isUsingGPS, setIsUsingGPS] = useState(true);

  // Varış Konumu
  const [selectedDestination, setSelectedDestination] = useState<any>(null); // {lat, lon, name}
  const [endSearchQuery, setEndSearchQuery] = useState('');

  // Ortak Arama
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const init = async () => {
      // Araçları Çek
      try {
        const vehicleRes = await apiClient('/vehicles', { method: 'GET' });
        if (vehicleRes.ok) {
          const vData = await vehicleRes.json();
          setVehicles(vData);
          if (vData.length > 0) {
            const primary = vData.find((v: any) => v.is_primary);
            setSelectedVehicleId(primary ? primary.id : vData[0].id);
          }
        }
      } catch (err) {
        console.error("Araçlar yüklenemedi", err);
      }

      await getCurrentLocation();

      if (route?.params?.destination) {
        const dest = route.params.destination;
        setSelectedDestination({
          lat: dest.latitude,
          lon: dest.longitude,
          name: dest.name || 'Seçilen İstasyon'
        });
        setEndSearchQuery(dest.name || 'Seçilen İstasyon');
      }

      setIsLoading(false);
    };

    init();
  }, [route?.params?.destination]);

  const getCurrentLocation = async () => {
    setIsSearching(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Promise.race([
          Location.getCurrentPositionAsync({}),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
        ]) as any;
        
        setStartLocation({ lat: location.coords.latitude, lon: location.coords.longitude, name: "Mevcut Konumum" });
        setStartSearchQuery("Mevcut Konumum");
        setIsUsingGPS(true);
        setSearchResults([]);
        setActiveInput(null);
      }
    } catch (err) {
      console.warn("Konum alınamadı, test konumu kullanılıyor.");
      setStartLocation({ lat: 40.990, lon: 29.020, name: "Kadıköy (Test)" }); 
      setStartSearchQuery("Kadıköy (Test)");
      setIsUsingGPS(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Dinamik Arama
  const handleSearch = (text: string, type: 'start' | 'end') => {
    setActiveInput(type);
    if (type === 'start') {
      setStartSearchQuery(text);
      if (text !== 'Mevcut Konumum') {
        setIsUsingGPS(false);
        setStartLocation(null);
      }
    } else {
      setEndSearchQuery(text);
      setSelectedDestination(null);
    }

    if (text.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=5&countrycodes=TR`, {
          headers: { 'User-Agent': 'VoltPilotApp/1.0', 'Accept-Language': 'tr-TR,tr;q=0.9' }
        });
        const data = await response.json();
        setSearchResults(data);
      } catch (err) {
        console.error("Arama hatası:", err);
      } finally {
        setIsSearching(false);
      }
    }, 600);
  };

  const selectLocation = (item: any) => {
    const locData = {
      name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon)
    };
    const shortName = item.display_name.split(',')[0];

    if (activeInput === 'start') {
      setStartLocation(locData);
      setStartSearchQuery(shortName);
    } else {
      setSelectedDestination(locData);
      setEndSearchQuery(shortName);
    }
    
    setSearchResults([]);
    setActiveInput(null);
    Keyboard.dismiss();
  };

  const handleCreateRoute = () => {
    if (!startLocation) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Lütfen bir başlangıç noktası belirleyin.' });
      return;
    }
    if (!selectedDestination) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Lütfen bir varış noktası seçin.' });
      return;
    }
    if (!selectedVehicleId) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Lütfen garajınızdan bir araç seçin.' });
      return;
    }

    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

    navigation.navigate('Map', {
      routeConfig: {
        startLat: startLocation.lat,
        startLon: startLocation.lon,
        endLat: selectedDestination.lat,
        endLon: selectedDestination.lon,
        vehicleId: selectedVehicleId,
        vehicleModel: selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : "Bilinmiyor",
        batteryCapacity: selectedVehicle ? selectedVehicle.battery_capacity : 60,
        rangeKm: selectedVehicle ? selectedVehicle.range_km : 350,
        batteryPercentage: parseInt(batteryPercentage) || 100
      }
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <Text style={styles.headerTitle}>Rotanızı Planlayın</Text>
          <Text style={styles.headerSubtitle}>Yolculuğunuz için en uygun şarj noktalarını yapay zeka ile optimize edelim.</Text>

          {/* Konum Seçimleri - Glassmorphism */}
          <View style={styles.glassCard}>
            <View style={styles.locationContainer}>
              <View style={styles.routeLineContainer}>
                <View style={[styles.dot, { backgroundColor: COLORS.onSurfaceVariant }]} />
                <View style={styles.routeLine} />
                <MaterialIcons name="location-on" size={24} color={COLORS.primary} style={{ marginTop: 2, marginLeft: -2 }} />
              </View>
              
              <View style={styles.locationInputs}>
                {/* Başlangıç Inputu */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Nereden?</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.textInput, activeInput === 'start' && styles.textInputActive]}
                      placeholder="Başlangıç noktası..."
                      placeholderTextColor={COLORS.onSurfaceVariant}
                      value={startSearchQuery}
                      onChangeText={(t) => handleSearch(t, 'start')}
                      onFocus={() => { setActiveInput('start'); setSearchResults([]); }}
                    />
                    <TouchableOpacity 
                      style={styles.gpsButton}
                      onPress={getCurrentLocation}
                    >
                      <MaterialIcons name="my-location" size={20} color={isUsingGPS ? COLORS.primary : COLORS.onSurfaceVariant} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Bitiş Inputu */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Nereye?</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.textInput, activeInput === 'end' && styles.textInputActive]}
                      placeholder="Varış noktası..."
                      placeholderTextColor={COLORS.onSurfaceVariant}
                      value={endSearchQuery}
                      onChangeText={(t) => handleSearch(t, 'end')}
                      onFocus={() => { setActiveInput('end'); setSearchResults([]); }}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Arama Sonuçları */}
            {isSearching && (
              <ActivityIndicator style={{ marginTop: 16 }} color={COLORS.primary} />
            )}
            
            {searchResults.length > 0 && (
              <View style={styles.searchResults}>
                {searchResults.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.searchResultItem}
                    onPress={() => selectLocation(item)}
                  >
                    <View style={styles.searchIconBox}>
                      <MaterialIcons name="place" size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.searchResultText} numberOfLines={2}>
                      {item.display_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Araç Seçimi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aracınızı Seçin</Text>
            {vehicles.length === 0 ? (
              <View style={styles.emptyGarage}>
                <Text style={{ color: COLORS.onSurfaceVariant }}>Garajınızda araç bulunmuyor.</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AddVehicle')}>
                  <Text style={{ color: COLORS.primary, marginTop: 8, fontWeight: 'bold' }}>Araç Ekle</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingVertical: 8 }}>
                {vehicles.map(v => {
                  const isSelected = selectedVehicleId === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      style={[styles.vehicleCard, isSelected && styles.vehicleCardSelected]}
                      onPress={() => setSelectedVehicleId(v.id)}
                      activeOpacity={0.9}
                    >
                      <MaterialIcons 
                        name="directions-car" 
                        size={36} 
                        color={isSelected ? COLORS.background : COLORS.onSurface} 
                      />
                      <Text style={[styles.vehicleBrand, isSelected && { color: COLORS.background }]}>
                        {v.brand}
                      </Text>
                      <Text style={[styles.vehicleModel, isSelected && { color: 'rgba(0,0,0,0.7)' }]}>
                        {v.model}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Şarj Durumu Girişi */}
            {vehicles.length > 0 && (
              <View style={styles.glassCardMini}>
                <View>
                  <Text style={styles.sectionTitleMini}>Mevcut Şarjınız (%)</Text>
                  <Text style={styles.sectionSubtitleMini}>Yola çıkarkenki batarya seviyeniz</Text>
                </View>
                <View style={styles.batteryInputBox}>
                  <TextInput
                    style={styles.batteryInput}
                    keyboardType="numeric"
                    value={batteryPercentage}
                    onChangeText={setBatteryPercentage}
                    maxLength={3}
                  />
                  <Text style={{color: COLORS.primary, fontWeight: 'bold'}}>%</Text>
                </View>
              </View>
            )}
          </View>

          {/* Rota Oluştur Butonu */}
          <TouchableOpacity 
            style={[styles.createButton, (!startLocation || !selectedDestination || !selectedVehicleId) && styles.createButtonDisabled]} 
            activeOpacity={0.8}
            onPress={handleCreateRoute}
            disabled={!startLocation || !selectedDestination || !selectedVehicleId}
          >
            <LinearGradient
              colors={['#00e38b', '#00b36e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.createButtonText}>Haritada Göster</Text>
              <MaterialIcons name="map" size={24} color={COLORS.background} />
            </LinearGradient>
          </TouchableOpacity>
          
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomMenu navigation={navigation} activeTab="Route" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 24, paddingBottom: 120 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: COLORS.onSurface, marginBottom: 8, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: COLORS.onSurfaceVariant, marginBottom: 28, lineHeight: 20 },
  
  section: { marginTop: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.onSurface, marginBottom: 16 },
  sectionTitleMini: { fontSize: 16, fontWeight: '700', color: COLORS.onSurface, marginBottom: 4 },
  sectionSubtitleMini: { fontSize: 12, color: COLORS.onSurfaceVariant },

  glassCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  glassCardMini: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  locationContainer: {
    flexDirection: 'row',
  },
  routeLineContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 16,
    marginTop: 12,
  },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.onSurfaceVariant },
  routeLine: { flex: 1, width: 2, backgroundColor: COLORS.surfaceVariant, marginVertical: 8 },
  
  locationInputs: { flex: 1, gap: 20 },
  inputWrapper: { width: '100%' },
  inputLabel: { fontSize: 13, color: COLORS.onSurfaceVariant, marginBottom: 8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  
  textInput: { 
    flex: 1,
    height: 52, 
    color: COLORS.onSurface, 
    fontSize: 16, 
    backgroundColor: COLORS.surfaceSolid,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1, 
    borderColor: 'transparent' 
  },
  textInputActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 227, 139, 0.05)'
  },
  
  gpsButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSolid,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent'
  },

  searchResults: {
    marginTop: 16,
    backgroundColor: COLORS.surfaceSolid,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  searchIconBox: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0, 227, 139, 0.1)', justifyContent: 'center', alignItems: 'center'
  },
  searchResultText: { flex: 1, color: COLORS.onSurface, fontSize: 14, lineHeight: 20 },

  emptyGarage: { padding: 24, backgroundColor: COLORS.surface, borderRadius: 20, alignItems: 'center' },
  
  vehicleCard: {
    width: 140,
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  vehicleCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8
  },
  vehicleBrand: { fontSize: 16, fontWeight: '800', color: COLORS.onSurface, marginTop: 16 },
  vehicleModel: { fontSize: 13, color: COLORS.onSurfaceVariant, marginTop: 4, fontWeight: '500' },

  batteryInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSolid,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    width: 80,
  },
  batteryInput: {
    flex: 1,
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  createButton: {
    marginTop: 40,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
  },
  createButtonDisabled: { opacity: 0.4, shadowOpacity: 0, elevation: 0 },
  createButtonText: { color: COLORS.background, fontSize: 18, fontWeight: '800' },
});
