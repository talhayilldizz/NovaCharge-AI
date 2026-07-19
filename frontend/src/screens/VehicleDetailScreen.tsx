import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { apiClient } from '../lib/apiClient';

const COLORS = {
  background: '#131315',
  surface: '#1c1b1d',
  primary: '#00e38b',
  onSurface: '#e6e1e5',
  onSurfaceVariant: '#b9cbbc',
  error: '#ff5449',
};

export default function VehicleDetailScreen({ route, navigation }: any) {
  const [vehicle, setVehicle] = React.useState(route.params.vehicle);

  const handleSetPrimary = async () => {
    try {
      const response = await apiClient(`/vehicles/${vehicle.id}/set-primary`, { method: 'PATCH' });
      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Başarılı',
          text2: 'Araç varsayılan yapıldı.'
        });
        setVehicle({ ...vehicle, is_primary: true });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Hata',
          text2: 'İşlem başarısız oldu.'
        });
      }
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Bağlantı Hatası', text2: 'Sunucuya ulaşılamadı.' });
    }
  };

  const handleDelete = () => {
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
              const response = await apiClient(`/vehicles/${vehicle.id}`, { method: 'DELETE' });

              if (response.ok) {
                Toast.show({
                  type: 'success',
                  text1: 'Silindi',
                  text2: 'Araç garajdan kaldırıldı.'
                });
                navigation.navigate('Vehicles', { refresh: true });
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

  const handleUpdate = () => {
    navigation.navigate('AddVehicle', { editMode: true, vehicle });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Araç Detayı</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.carImagePlaceholder}>
          <Image source={require('../../assets/car.png')} style={{ width: '80%', height: '80%', resizeMode: 'contain' }} />
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.brand}>{vehicle.brand}</Text>
          <Text style={styles.model}>{vehicle.model}</Text>
          {vehicle.is_primary && (
            <View style={styles.primaryBadge}>
              <MaterialIcons name="star" size={14} color={COLORS.background} />
              <Text style={styles.primaryText}>Varsayılan Araç</Text>
            </View>
          )}
        </View>

        <View style={styles.specsContainer}>
          <View style={styles.specCard}>
            <MaterialCommunityIcons name="battery-charging-100" size={32} color={COLORS.primary} />
            <Text style={styles.specValue}>{vehicle.battery_capacity} kWh</Text>
            <Text style={styles.specLabel}>Batarya</Text>
          </View>
          <View style={styles.specCard}>
            <MaterialCommunityIcons name="map-marker-distance" size={32} color={COLORS.primary} />
            <Text style={styles.specValue}>{vehicle.range_km} km</Text>
            <Text style={styles.specLabel}>Menzil</Text>
          </View>
          <View style={styles.specCard}>
            <MaterialIcons name="electrical-services" size={32} color={COLORS.primary} />
            <Text style={styles.specValue}>{vehicle.plug_type}</Text>
            <Text style={styles.specLabel}>Soket</Text>
          </View>
        </View>

        {!vehicle.is_primary && (
          <TouchableOpacity
            style={styles.setPrimaryBlockButton}
            onPress={handleSetPrimary}
            activeOpacity={0.8}
          >
            <MaterialIcons name="star-border" size={24} color={COLORS.primary} />
            <Text style={styles.setPrimaryBlockText}>Bu Aracı Varsayılan Yap</Text>
          </TouchableOpacity>
        )}

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.updateButton]}
            onPress={handleUpdate}
            activeOpacity={0.8}
          >
            <MaterialIcons name="edit" size={20} color={COLORS.background} />
            <Text style={styles.updateButtonText}>Güncelle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <MaterialIcons name="delete-outline" size={20} color={COLORS.error} />
            <Text style={styles.deleteButtonText}>Sil</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
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
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  carImagePlaceholder: {
    height: 200,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brand: {
    fontSize: 18,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  model: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 4,
    marginBottom: 12,
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  primaryText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  specsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  specValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 12,
    marginBottom: 4,
  },
  specLabel: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  setPrimaryBlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 227, 139, 0.1)',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 227, 139, 0.2)',
    marginTop: 16,
    gap: 8,
  },
  setPrimaryBlockText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    marginTop: 32,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  updateButton: {
    backgroundColor: COLORS.primary,
  },
  updateButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 84, 73, 0.3)',
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
