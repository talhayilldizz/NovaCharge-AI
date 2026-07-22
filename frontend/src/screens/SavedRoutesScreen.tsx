import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiClient } from '../lib/apiClient';
import Toast from 'react-native-toast-message';

const COLORS = {
  background: '#131315',
  surface: '#1c1b1d',
  primary: '#00e38b',
  surfaceVariant: '#353437',
  onSurface: '#e6e1e5',
  onSurfaceVariant: '#b9cbbc',
  error: '#ff5449',
};

export default function SavedRoutesScreen({ navigation }: any) {
  const [routes, setRoutes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // AI Plan Modal State
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  const openGoogleMaps = () => {
    if (!selectedRoute || !selectedRoute.ai_plan) return;

    const origin = `${selectedRoute.start_lat},${selectedRoute.start_lon}`;
    const destination = `${selectedRoute.end_lat},${selectedRoute.end_lon}`;

    const waypoints = selectedRoute.ai_plan.charging_stops
      .filter((stop: any) => stop.latitude && stop.longitude)
      .map((stop: any) => `${stop.latitude},${stop.longitude}`)
      .join('|');

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }

    Linking.openURL(url).catch(err => {
      console.error(err);
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Google Haritalar açılamadı.' });
    });
  };

  const fetchRoutes = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient('/routes/me', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        // Tarihe göre en yeniden en eskiye sıralayalım
        const sortedData = data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRoutes(sortedData);
      } else {
        if (res.status !== 404) {
          Toast.show({ type: 'error', text1: 'Hata', text2: 'Rotalar yüklenirken bir sorun oluştu.' });
        }
      }
    } catch (err) {
      console.error(err);
      Toast.show({ type: 'error', text1: 'Bağlantı Hatası', text2: 'Sunucuya ulaşılamadı.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleDeleteRoute = (routeId: string) => {
    Alert.alert(
      "Rotayı Sil",
      "Bu rotayı silmek istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await apiClient(`/routes/${routeId}`, { method: 'DELETE' });
              if (res.ok) {
                Toast.show({ type: 'success', text1: 'Başarılı', text2: 'Rota silindi.' });
                setRoutes(prev => prev.filter(r => r.id !== routeId));
              } else {
                Toast.show({ type: 'error', text1: 'Hata', text2: 'Rota silinemedi.' });
              }
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Hata', text2: 'Bağlantı hatası.' });
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kaydedilen Rotalar</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : routes.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconContainer}>
            <MaterialIcons name="alt-route" size={64} color={COLORS.surfaceVariant} />
          </View>
          <Text style={styles.emptyTitle}>Henüz Rota Yok</Text>
          <Text style={styles.emptyDesc}>Kaydettiğiniz tüm rotalar burada listelenir.</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('RoutePlanner')}
          >
            <Text style={styles.primaryButtonText}>Yeni Rota Planla</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {routes.map((route, index) => (
            <View key={route.id} style={styles.routeCard}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (route.ai_plan) {
                    setSelectedRoute(route);
                    setShowAiModal(true);
                  }
                }}
              >
                <View style={styles.routeHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={styles.routeBadge}>
                      <Text style={styles.routeBadgeText}>Rota #{routes.length - index}</Text>
                    </View>
                    {route.ai_plan && (
                      <View style={styles.aiIndicator}>
                        <Text style={styles.aiIndicatorText}>✨ AI Analizi</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.routeDate}>{formatDate(route.created_at)}</Text>
                </View>

                <View style={styles.routeDetails}>
                  <View style={styles.detailItem}>
                    <MaterialIcons name="directions-car" size={20} color={COLORS.primary} />
                    <Text style={styles.detailValue}>
                      {route.total_distance_km ? `${route.total_distance_km} km` : '?'}
                    </Text>
                    <Text style={styles.detailLabel}>Mesafe</Text>
                  </View>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailItem}>
                    <MaterialIcons name="schedule" size={20} color={COLORS.primary} />
                    <Text style={styles.detailValue}>
                      {route.total_duration_mins ? `${Math.round(route.total_duration_mins)} dk` : '?'}
                    </Text>
                    <Text style={styles.detailLabel}>Süre</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => {
                    navigation.navigate('Map', {
                      routeConfig: {
                        startLat: route.start_lat,
                        startLon: route.start_lon,
                        endLat: route.end_lat,
                        endLon: route.end_lon,
                        vehicleId: route.vehicle_id,
                      }
                    });
                  }}
                >
                  <MaterialIcons name="map" size={20} color={COLORS.background} />
                  <Text style={styles.mapButtonText}>Haritada Göster</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteRoute(route.id)}
                >
                  <MaterialIcons name="delete-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* AI Analiz Modalı */}
      {showAiModal && selectedRoute && selectedRoute.ai_plan && (
        <View style={styles.aiModalOverlay}>
          <View style={styles.aiModalContent}>
            <View style={styles.aiModalHeader}>
              <Text style={styles.aiModalTitle}>✨ Yapay Zeka Rota Analizi</Text>
              <TouchableOpacity onPress={() => setShowAiModal(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
              {/* Genel Öneriler */}
              <View style={styles.aiRecBox}>
                <MaterialIcons name="info-outline" size={20} color={COLORS.primary} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  {selectedRoute.ai_plan.general_recommendations.map((rec: string, idx: number) => (
                    <Text key={idx} style={styles.aiRecText}>• {rec}</Text>
                  ))}
                </View>
              </View>

              {/* Mola Noktaları */}
              <Text style={styles.aiSectionTitle}>Mola Noktaları</Text>
              {selectedRoute.ai_plan.charging_stops.length === 0 ? (
                <Text style={styles.aiNoStopText}>Şarj molasına gerek yok!</Text>
              ) : (
                selectedRoute.ai_plan.charging_stops.map((stop: any, index: number) => (
                  <View key={index} style={styles.aiStopCard}>
                    <View style={styles.aiStopHeader}>
                      <View style={styles.aiStopBadge}>
                        <Text style={styles.aiStopBadgeText}>{index + 1}. Mola</Text>
                      </View>
                      <Text style={styles.aiStopName}>{stop.station_name}</Text>
                    </View>

                    <View style={styles.aiStopDetails}>
                      <View style={styles.aiDetailItem}>
                        <MaterialIcons name="schedule" size={16} color={COLORS.onSurfaceVariant} />
                        <Text style={styles.aiDetailText}>~{stop.charging_time_mins} Dk</Text>
                      </View>
                      <View style={styles.aiDetailItem}>
                        <MaterialIcons name="payments" size={16} color={COLORS.onSurfaceVariant} />
                        <Text style={styles.aiDetailText}>~{stop.estimated_cost_try} ₺</Text>
                      </View>
                    </View>

                    <Text style={styles.aiStopReason}>"{stop.reason}"</Text>
                  </View>
                ))
              )}

              {/* Toplam Maliyet Özeti */}
              {selectedRoute.ai_plan.charging_stops.length > 0 && (
                <View style={styles.aiSummaryCard}>
                  <Text style={styles.aiSummaryTitle}>Tahmini Toplam Maliyet</Text>
                  <Text style={styles.aiSummaryValue}>{selectedRoute.ai_plan.total_cost} ₺</Text>
                </View>
              )}

              {/* Google Maps Butonu */}
              <TouchableOpacity
                style={styles.googleMapsButton}
                onPress={openGoogleMaps}
              >
                <MaterialCommunityIcons name="google-maps" size={24} color="#fff" />
                <Text style={styles.googleMapsButtonText}>Google Haritalar'da Navigasyon Başlat</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COLORS.surfaceVariant,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
  },
  primaryButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  routeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  routeBadge: {
    backgroundColor: 'rgba(0, 227, 139, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  routeBadgeText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  routeDate: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
  },
  routeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  detailDivider: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.surfaceVariant,
  },
  detailValue: {
    color: COLORS.onSurface,
    fontSize: 18,
    fontWeight: '700',
  },
  detailLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  mapButtonText: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 14,
  },
  deleteButton: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 84, 73, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 84, 73, 0.2)',
  },
  aiIndicator: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  aiIndicatorText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: 'bold',
  },
  aiModalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    zIndex: 999
  },
  aiModalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: '80%',
  },
  aiModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
    paddingBottom: 16,
  },
  aiModalTitle: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  aiRecBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 227, 139, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  aiRecText: {
    color: COLORS.onSurface,
    fontSize: 14,
    marginBottom: 4,
  },
  aiSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    marginBottom: 16,
  },
  aiNoStopText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  aiStopCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  aiStopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  aiStopBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiStopBadgeText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 12,
  },
  aiStopName: {
    color: COLORS.onSurface,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  aiStopDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  aiDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiDetailText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
  },
  aiStopReason: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  aiSummaryCard: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  aiSummaryTitle: {
    color: COLORS.background,
    fontSize: 14,
    marginBottom: 8,
  },
  aiSummaryValue: {
    color: COLORS.background,
    fontSize: 28,
    fontWeight: 'bold',
  },
  googleMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    gap: 12,
  },
  googleMapsButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  }
});
