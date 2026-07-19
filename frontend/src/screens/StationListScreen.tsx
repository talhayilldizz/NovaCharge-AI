import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { apiClient } from '../lib/apiClient';
import Toast from 'react-native-toast-message';

const COLORS = {
  background: '#131315',
  surface: '#1c1b1d',
  primary: '#00e38b',
  onSurface: '#e6e1e5',
  onSurfaceVariant: '#b9cbbc',
  danger: '#ff5449',
  star: '#FFC107'
};

export default function StationListScreen({ route, navigation }: any) {
  const [allStations, setAllStations] = useState<any[]>([]);
  const [filteredStations, setFilteredStations] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(route?.params?.initialShowFavorites || false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // İstasyonları ve favorileri paralel çek
      const [stationsRes, favsRes] = await Promise.all([
        apiClient('/stations/?limit=2000', { method: 'GET' }),
        apiClient('/favorites/me', { method: 'GET' })
      ]);

      if (stationsRes.ok) {
        const data = await stationsRes.json();
        setAllStations(data);
      }
      
      if (favsRes.ok) {
        const data = await favsRes.json();
        setFavorites(data);
      }
    } catch (err) {
      console.error("Veri çekme hatası:", err);
      Toast.show({ type: 'error', text1: 'Hata', text2: 'İstasyonlar yüklenemedi.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Arama ve Filtreleme (Sadece Favoriler) Efekti
  useEffect(() => {
    let result = allStations;

    // Sadece favorileri göster
    if (showOnlyFavorites) {
      const favIds = favorites.map(f => f.external_station_id);
      result = result.filter(s => favIds.includes(s.id));
    }

    // Arama yapıldıysa isme göre filtrele
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        (s.name && s.name.toLowerCase().includes(q))
      );
    }

    setFilteredStations(result);
  }, [searchQuery, showOnlyFavorites, allStations, favorites]);

  // Favori Ekle / Çıkar
  const toggleFavorite = async (stationId: string, stationName: string) => {
    const existingFav = favorites.find(f => f.external_station_id === stationId);
    
    if (existingFav) {
      // Favorilerden Çıkar
      try {
        const res = await apiClient(`/favorites/${existingFav.id}`, { method: 'DELETE' });
        if (res.ok) {
          setFavorites(prev => prev.filter(f => f.id !== existingFav.id));
          Toast.show({ type: 'success', text1: 'Favorilerden Çıkarıldı', text2: 'İstasyon favorilerden kaldırıldı.' });
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Favorilere Ekle
      try {
        const res = await apiClient(`/favorites/`, {
          method: 'POST',
          body: JSON.stringify({ 
            external_station_id: stationId,
            custom_name: stationName
          })
        });
        if (res.ok) {
          const newFav = await res.json();
          setFavorites(prev => [...prev, newFav]);
          Toast.show({ type: 'success', text1: 'Favorilere Eklendi', text2: 'İstasyon favorilere eklendi.' });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const renderStation = ({ item }: { item: any }) => {
    const isFav = favorites.some(f => f.external_station_id === item.id);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.stationName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.providerName}>{item.is_fast_charge ? 'Hızlı Şarj İstasyonu (DC)' : 'Normal Şarj İstasyonu (AC)'}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleFavorite(item.id, item.name)} style={{ padding: 4 }}>
            <Ionicons 
              name={isFav ? "star" : "star-outline"} 
              size={28} 
              color={isFav ? COLORS.star : COLORS.onSurfaceVariant} 
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.address}>Koordinat: {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}</Text>

        <View style={styles.plugsContainer}>
          <View style={[styles.plugBadge, { backgroundColor: item.available_sockets > 0 ? 'rgba(0, 227, 139, 0.15)' : 'rgba(255, 84, 73, 0.15)' }]}>
            <MaterialIcons 
              name={item.available_sockets > 0 ? "ev-station" : "block"} 
              size={16} 
              color={item.available_sockets > 0 ? COLORS.primary : COLORS.danger} 
            />
            <Text style={[styles.plugBadgeText, { color: item.available_sockets > 0 ? COLORS.primary : COLORS.danger }]}>
              {item.available_sockets > 0 ? `${item.available_sockets} Priz Müsait` : 'Tüm Prizler Dolu'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İstasyon Listesi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search & Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={COLORS.onSurfaceVariant} />
          <TextInput
            style={styles.searchInput}
            placeholder="İstasyon adı ara..."
            placeholderTextColor={COLORS.onSurfaceVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <MaterialIcons name="close" size={20} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.favFilterBtn, showOnlyFavorites && styles.favFilterBtnActive]}
          onPress={() => setShowOnlyFavorites(!showOnlyFavorites)}
        >
          <Ionicons 
            name={showOnlyFavorites ? "star" : "star-outline"} 
            size={20} 
            color={showOnlyFavorites ? COLORS.star : COLORS.onSurfaceVariant} 
          />
        </TouchableOpacity>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredStations}
          keyExtractor={(item) => item.id}
          renderItem={renderStation}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Sonuç bulunamadı.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  favFilterBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favFilterBtnActive: {
    borderColor: COLORS.star,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stationName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  providerName: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  address: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginBottom: 12,
    lineHeight: 18,
  },
  plugsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  plugBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  plugBadgeText: {
    color: COLORS.onSurface,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 15,
  }
});
