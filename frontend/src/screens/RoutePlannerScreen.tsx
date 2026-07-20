import React, { useState, useEffect } from 'react';
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
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { apiClient } from '../lib/apiClient';
import Toast from 'react-native-toast-message';
import BottomMenu from '../components/BottomMenu';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#131315',
  surface: '#1c1b1d',
  primary: '#00e38b',
  onSurface: '#e6e1e5',
  onSurfaceVariant: '#b9cbbc',
  surfaceVariant: '#353437',
};

export default function RoutePlannerScreen({ navigation }: any) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [batteryPercentage, setBatteryPercentage] = useState('100');
  const [isLoading, setIsLoading] = useState(true);

  // Başlangıç konumu (GPS)
  const [startLocation, setStartLocation] = useState<any>(null);
  
  // Bitiş konumu arama ve sonuç
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      // Araçları Çek
      try {
        const vehicleRes = await apiClient('/vehicles', { method: 'GET' });
        if (vehicleRes.ok) {
          const vData = await vehicleRes.json();
          setVehicles(vData);
          if (vData.length > 0) {
            // Varsayılan olarak primary aracı seç
            const primary = vData.find((v: any) => v.is_primary);
            setSelectedVehicleId(primary ? primary.id : vData[0].id);
          }
        }
      } catch (err) {
        console.error("Araçlar yüklenemedi", err);
      }

      // Mevcut Konumu Al
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let location = await Promise.race([
            Location.getCurrentPositionAsync({}),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
          ]);
          setStartLocation((location as any).coords);
        }
      } catch (err) {
        console.warn("Konum alınamadı, test konumu kullanılıyor.");
        setStartLocation({ latitude: 40.990, longitude: 29.020 }); // Kadıköy Fallback
      }

      setIsLoading(false);
    };

    init();
  }, []);

  // OSM Nominatim ile Adres Arama
  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    setSelectedDestination(null);

    if (text.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=5&countrycodes=TR`, {
        headers: {
          'User-Agent': 'VoltPilotApp/1.0',
          'Accept-Language': 'tr-TR,tr;q=0.9'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Arama hatası:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectDestination = (item: any) => {
    setSelectedDestination({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon)
    });
    setSearchQuery(item.display_name.split(',')[0]); // Sadece başlığı göster
    setSearchResults([]);
  };

  const handleCreateRoute = () => {
    if (!startLocation) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Başlangıç konumunuz alınamadı.' });
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

    // Map sayfasına rota parametrelerini gönder
    navigation.navigate('Map', {
      routeConfig: {
        startLat: startLocation.latitude,
        startLon: startLocation.longitude,
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.headerTitle}>Yeni Rota Planla</Text>

          {/* Konum Seçimleri */}
          <View style={styles.section}>
            <View style={styles.locationContainer}>
              <View style={styles.routeLineContainer}>
                <View style={styles.startDot} />
                <View style={styles.routeLine} />
                <MaterialIcons name="location-on" size={20} color={COLORS.primary} style={{ marginTop: 2 }} />
              </View>
              
              <View style={styles.locationInputs}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Başlangıç</Text>
                  <View style={styles.inputBox}>
                    <Text style={styles.inputText}>
                      {startLocation ? "Mevcut Konumum" : "Konum Bekleniyor..."}
                    </Text>
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Varış Noktası</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nereye gitmek istiyorsunuz?"
                    placeholderTextColor={COLORS.onSurfaceVariant}
                    value={searchQuery}
                    onChangeText={handleSearch}
                  />
                  {isSearching && (
                    <ActivityIndicator style={{ position: 'absolute', right: 12, top: 38 }} color={COLORS.primary} />
                  )}
                </View>
              </View>
            </View>

            {/* Arama Sonuçları */}
            {searchResults.length > 0 && (
              <View style={styles.searchResults}>
                {searchResults.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.searchResultItem}
                    onPress={() => selectDestination(item)}
                  >
                    <MaterialIcons name="place" size={20} color={COLORS.onSurfaceVariant} />
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {vehicles.map(v => {
                  const isSelected = selectedVehicleId === v.id;
                  return (
                    <TouchableOpacity
                      key={v.id}
                      style={[styles.vehicleCard, isSelected && styles.vehicleCardSelected]}
                      onPress={() => setSelectedVehicleId(v.id)}
                    >
                      <MaterialIcons 
                        name="directions-car" 
                        size={32} 
                        color={isSelected ? COLORS.background : COLORS.onSurface} 
                      />
                      <Text style={[styles.vehicleBrand, isSelected && { color: COLORS.background }]}>
                        {v.brand}
                      </Text>
                      <Text style={[styles.vehicleModel, isSelected && { color: 'rgba(0,0,0,0.6)' }]}>
                        {v.model}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Şarj Durumu Girişi */}
            {vehicles.length > 0 && (
              <View style={{ marginTop: 24 }}>
                <Text style={styles.sectionTitle}>Mevcut Şarjınız (%)</Text>
                <TextInput
                  style={[styles.textInput, { borderBottomColor: COLORS.surfaceVariant }]}
                  placeholder="Örn: 80"
                  placeholderTextColor={COLORS.onSurfaceVariant}
                  keyboardType="numeric"
                  value={batteryPercentage}
                  onChangeText={setBatteryPercentage}
                />
              </View>
            )}
          </View>

          {/* Rota Oluştur Butonu */}
          <TouchableOpacity 
            style={[styles.createButton, (!selectedDestination || !selectedVehicleId) && styles.createButtonDisabled]} 
            activeOpacity={0.8}
            onPress={handleCreateRoute}
            disabled={!selectedDestination || !selectedVehicleId}
          >
            <Text style={styles.createButtonText}>Haritada Göster</Text>
            <MaterialIcons name="map" size={20} color={COLORS.background} />
          </TouchableOpacity>
          
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomMenu navigation={navigation} activeTab="Route" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20, paddingBottom: 120 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: COLORS.onSurface, marginBottom: 24 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.onSurface, marginBottom: 16 },
  
  locationContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  routeLineContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  startDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.onSurfaceVariant, marginTop: 10 },
  routeLine: { flex: 1, width: 2, backgroundColor: COLORS.surfaceVariant, marginVertical: 4 },
  
  locationInputs: { flex: 1, gap: 16 },
  inputWrapper: { width: '100%' },
  inputLabel: { fontSize: 12, color: COLORS.onSurfaceVariant, marginBottom: 6, fontWeight: '600' },
  inputBox: { height: 48, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.surfaceVariant },
  inputText: { color: COLORS.onSurface, fontSize: 16 },
  textInput: { 
    height: 48, 
    color: COLORS.onSurface, 
    fontSize: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.primary 
  },

  searchResults: {
    marginTop: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    overflow: 'hidden',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
    gap: 12,
  },
  searchResultText: { flex: 1, color: COLORS.onSurface, fontSize: 14 },

  emptyGarage: { padding: 20, backgroundColor: COLORS.surface, borderRadius: 16, alignItems: 'center' },
  
  vehicleCard: {
    width: 120,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    alignItems: 'center',
  },
  vehicleCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  vehicleBrand: { fontSize: 14, fontWeight: '700', color: COLORS.onSurface, marginTop: 12 },
  vehicleModel: { fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 4 },

  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginTop: 16,
  },
  createButtonDisabled: { opacity: 0.5 },
  createButtonText: { color: COLORS.background, fontSize: 16, fontWeight: '700' },
});
