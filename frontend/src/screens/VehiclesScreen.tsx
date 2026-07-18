import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { supabase } from '../lib/supabase';
import { apiClient } from '../lib/apiClient';
import BottomMenu from '../components/BottomMenu';


const COLORS = {
  background: '#131315',
  surface: '#1c1b1d',
  primary: '#00e38b',
  primaryDark: '#00b368',
  surfaceVariant: '#353437',
  onSurface: '#e6e1e5',
  onSurfaceVariant: '#b9cbbc',
  error: '#ff5449',
};

export default function VehiclesScreen({ navigation }: any) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchMyVehicles();
    }, [])
  );

  const fetchMyVehicles = async () => {
    try {
      const response = await apiClient('/vehicles/', { method: 'GET' });

      if (response.ok) {
        const vehiclesData = await response.json();

        if (vehiclesData) {
          setVehicles(vehiclesData);
        }
      } else {
        console.error("Araçları getirirken bir hata oluştu. Status:", response.status);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    Alert.alert(
      "Aracı Sil",
      "Bu aracı garajınızdan kaldırmak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Evet, Sil", 
          style: "destructive",
          onPress: async () => {
            try {
              const response = await apiClient(`/vehicles/${vehicleId}`, { method: 'DELETE' });

              if (response.ok) {
                Toast.show({
                  type: 'success',
                  text1: 'Silindi',
                  text2: 'Araç garajdan kaldırıldı.'
                });
                fetchMyVehicles();
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Hata',
                  text2: 'Araç silinemedi.'
                });
              }
            } catch (error) {
              console.error(error);
              Toast.show({ type: 'error', text1: 'Bağlantı Hatası', text2: 'Sunucuya ulaşılamadı.' });
            }
          }
        }
      ]
    );
  };

  const renderVehicleItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.vehicleCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('VehicleDetail', { vehicle: item })}
    >
      <View style={styles.vehicleHeader}>
        <View style={styles.brandBadge}>
          <MaterialCommunityIcons name="car-electric" size={24} color={COLORS.surface} />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleBrand}>{item.brand}</Text>
          <Text style={styles.vehicleModel}>{item.model}</Text>
        </View>
        {item.is_primary && (
          <View style={styles.primaryBadge}>
            <MaterialIcons name="star" size={14} color={COLORS.background} />
            <Text style={styles.primaryText}>Varsayılan</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteVehicle(item.id)}
        >
          <MaterialIcons name="delete-outline" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.vehicleDetails}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="battery-charging-100" size={20} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.battery_capacity} kWh</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="map-marker-distance" size={20} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.range_km} km</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons name="electrical-services" size={20} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.plug_type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Araçlarım</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddVehicle')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={24} color={COLORS.background} />
          <Text style={styles.addButtonText}>Yeni Ekle</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : vehicles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons name="car-off" size={48} color={COLORS.onSurfaceVariant} />
          </View>
          <Text style={styles.emptyTitle}>Henüz Aracınız Yok</Text>
          <Text style={styles.emptySubtitle}>
            Şarj ağından faydalanmak ve rotalar oluşturmak için hemen bir elektrikli araç ekleyin.
          </Text>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderVehicleItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomMenu navigation={navigation} activeTab="Vehicles" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 4,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 120, // BottomMenu için boşluk
  },
  vehicleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleBrand: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  vehicleModel: {
    fontSize: 18,
    color: COLORS.onSurface,
    fontWeight: '700',
    marginTop: 2,
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  primaryText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  deleteButton: {
    marginLeft: 12,
    padding: 4,
  },
  vehicleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 16,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailText: {
    color: COLORS.onSurface,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -60,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },
});
