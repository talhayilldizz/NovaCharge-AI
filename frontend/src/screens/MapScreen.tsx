import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  TextInput,
  Keyboard,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { apiClient } from '../lib/apiClient';

const { width, height } = Dimensions.get('window');

const COLORS = {
  background: '#131315',
  surface: '#1c1b1d',
  primary: '#00e38b',
  onSurface: '#e6e1e5',
  onSurfaceVariant: '#b9cbbc',
  surfaceVariant: '#353437',
};

// Dinamik HTML oluşturan fonksiyon
const generateLeafletHTML = (stationsData: any[], userLoc: Location.LocationObject | null, routeData: any = null) => `
<!DOCTYPE html>
<html>
<head>
    <title>VoltPilot Map</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <!-- MarkerCluster CSS & JS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css" />
    
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js"></script>
    <style>
        body { margin: 0; padding: 0; background-color: #131315; }
        #map { width: 100vw; height: 100vh; }
        
        .leaflet-tile-pane {
            /* Google Haritalar Karanlık Mod efekti */
            filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }

        .leaflet-bar a { background-color: #1c1b1d !important; color: #00e38b !important; border-bottom: 1px solid #353437 !important; border-radius: 8px !important; margin-bottom: 4px; }
        .leaflet-control-zoom { border: none !important; margin-right: 16px !important; margin-bottom: 32px !important; }
        .leaflet-control-attribution { background: rgba(28, 27, 29, 0.7) !important; color: #b9cbbc !important; border-radius: 4px; }
        .leaflet-control-attribution a { color: #00e38b !important; }
        
        /* Marker Styling */
        
        .custom-marker {
            background-color: #00e38b;
            border: 2px solid #131315;
            border-radius: 50%;
            box-shadow: 0 4px 8px rgba(0, 227, 139, 0.4);
            display: flex;
            justify-content: center;
            align-items: center;
            color: #131315;
            font-weight: bold;
            font-size: 18px;
        }
        .custom-marker.busy {
            background-color: #353437;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
            color: #b9cbbc;
        }
        
        /* Kullanıcı Konumu Styling */
        .user-marker {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .user-dot {
            width: 18px;
            height: 18px;
            background-color: #007aff;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 6px rgba(0,0,0,0.6);
            z-index: 2;
        }
        .user-pulse {
            width: 50px;
            height: 50px;
            background-color: rgba(0, 122, 255, 0.3);
            border-radius: 50%;
            position: absolute;
            animation: pulse 2s infinite ease-out;
            z-index: 1;
        }
        @keyframes pulse {
            0% { transform: scale(0.3); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
        }

        /* Route Line Styling */
        .route-glow {
            filter: drop-shadow(0 0 10px rgba(0, 227, 139, 0.9));
        }

        .dest-marker {
            font-size: 28px;
            display: flex;
            justify-content: center;
            align-items: center;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6));
        }

        /* Cluster Styling (Harita Kasmaması İçin) */
        .custom-cluster {
            background-color: rgba(0, 227, 139, 0.9);
            border: 3px solid #131315;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #131315;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(0, 227, 139, 0.5);
        }
        
        /* Popup Styling */
        .leaflet-popup-content-wrapper {
            background-color: #1c1b1d;
            color: #e6e1e5;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.1);
            padding: 4px;
        }
        .leaflet-popup-tip {
            background-color: #1c1b1d;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .popup-title { font-size: 15px; font-weight: bold; margin-bottom: 6px; text-align: center; color: #e6e1e5; }
        .popup-subtitle { font-size: 13px; color: #b9cbbc; margin-bottom: 12px; text-align: center; }
        .popup-badge { 
            background-color: rgba(0, 227, 139, 0.2); 
            border: 1px solid rgba(0, 227, 139, 0.3);
            color: #e6e1e5;
            padding: 6px 16px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            display: inline-block;
        }
        .popup-badge.busy {
            background-color: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .popup-button {
            background-color: #00e38b;
            color: #131315;
            border: none;
            padding: 8px 16px;
            border-radius: 12px;
            font-weight: bold;
            margin-top: 12px;
            width: 100%;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var userLat = ${userLoc ? userLoc.coords.latitude : 'null'};
        var userLon = ${userLoc ? userLoc.coords.longitude : 'null'};

        var defaultLat = 39.92077;
        var defaultLon = 32.85411;
        var defaultZoom = 6;

        if (userLat !== null && userLon !== null) {
            defaultLat = userLat;
            defaultLon = userLon;
            defaultZoom = 12; // Konum varsa daha yakından başlat
        }

        var map = L.map('map', {zoomControl: false}).setView([defaultLat, defaultLon], defaultZoom);
        
        // Sağ alta zoom kontrolünü ekliyoruz
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        
        // Google Maps (Standart Görünüm) + CSS Dark Mode
        L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains:['mt0','mt1','mt2','mt3']
        }).addTo(map);

        var routeData = ${routeData ? JSON.stringify(routeData) : 'null'};

        if (routeData && routeData.geometry) {
            // Rotayı haritaya çiz
            var geojsonLayer = L.geoJSON(routeData.geometry, {
                style: {
                    color: '#00e38b',
                    weight: 6,
                    opacity: 0.9,
                    className: 'route-glow'
                }
            }).addTo(map);
            
            // Haritayı rotaya odakla
            map.fitBounds(geojsonLayer.getBounds(), { padding: [50, 50] });

            // Bitiş noktasına (Varış) pin ekle
            var coords = routeData.geometry.coordinates;
            var endCoords = coords[coords.length - 1]; // [lon, lat]
            
            var destIcon = L.divIcon({
                className: 'dest-marker',
                html: '📍',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
            });
            L.marker([endCoords[1], endCoords[0]], {icon: destIcon}).addTo(map);
        }

        // Kullanıcı konumunu gösteren mavi yanıp sönen nokta
        if (userLat !== null && userLon !== null) {
            var userIcon = L.divIcon({
                className: 'user-marker',
                html: '<div class="user-pulse"></div><div class="user-dot"></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
            L.marker([userLat, userLon], {icon: userIcon, zIndexOffset: 1000})
             .bindPopup('<div style="text-align:center; font-weight:bold; color:#1c1b1d;">Buradasınız</div>')
             .addTo(map);
        }

        // Kümeleme (Clustering) objesi oluştur
        var markers = L.markerClusterGroup({
            maxClusterRadius: 60, // Kümelerin kapsama alanı
            iconCreateFunction: function(cluster) {
                return L.divIcon({ 
                    html: cluster.getChildCount(), 
                    className: 'custom-cluster', 
                    iconSize: [40, 40] 
                });
            }
        });

        var stations = ${JSON.stringify(stationsData)};

        stations.forEach(function(station) {
            var isAvailable = station.available_sockets > 0;
            var iconClass = isAvailable ? 'custom-marker' : 'custom-marker busy';
            var badgeClass = isAvailable ? 'popup-badge' : 'popup-badge busy';
            var statusText = isAvailable ? 'Müsait (' + station.available_sockets + ' Boş)' : 'Dolu';
            var speedText = station.is_fast_charge ? 'Hızlı Şarj (DC)' : 'Standart (AC)';

            var customIcon = L.divIcon({
                className: iconClass,
                html: '⚡',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
                popupAnchor: [0, -18]
            });

            var popupContent = '<div style="text-align:center; padding: 4px;">' +
                               '<div class="popup-title">' + station.name + '</div>' +
                               '<div class="popup-subtitle">' + speedText + '</div>' +
                               '<div class="' + badgeClass + '">' + statusText + '</div>' +
                               '<button class="popup-button" onclick="alert(\\'Rota oluşturuluyor...\\')">Rota Çiz</button>' +
                               '</div>';

            if (station.latitude && station.longitude) {
                var marker = L.marker([station.latitude, station.longitude], {icon: customIcon})
                              .bindPopup(popupContent);
                markers.addLayer(marker);
            }
        });

        // Tüm kümeleri haritaya tek seferde ekle (Performans artışı)
        map.addLayer(markers);
    </script>
</body>
</html>
`;

import Toast from 'react-native-toast-message';

export default function MapScreen({ route, navigation }: any) {
  const [allStations, setAllStations] = useState<any[]>([]);
  const [filteredStations, setFilteredStations] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<any>(null);

  // Rota Modu Parametreleri
  const routeConfig = route.params?.routeConfig;
  const [routeData, setRouteData] = useState<any>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // AI State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    // 1. Kullanıcıdan konum izni iste ve konumu al (Emülatör Korumalı)
    const getUserLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn("Konum izni reddedildi.");
          return;
        }

        let location;
        try {
          // Emülatörlerde sonsuza kadar asılı kalmasın diye 4 saniyelik zaman aşımı (timeout) koyuyoruz
          location = await Promise.race([
            Location.getCurrentPositionAsync({}),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
          ]);
        } catch (err) {
          console.warn("Gerçek konum bulunamadı (Emülatörtesiniz), İstanbul test konumuna geçiliyor...");
          // Emülatör için Sahte İstanbul (Kadıköy) Konumu
          location = {
            coords: {
              latitude: 40.990,
              longitude: 29.020
            }
          };
        }

        setUserLocation(location as any);
      } catch (err) {
        console.error("Konum izni alınırken hata:", err);
      }
    };

    // 2. İstasyonları backendden al
    const loadStations = async () => {
      try {
        const res = await apiClient('/stations/?limit=2000', { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          setAllStations(data);
          setFilteredStations(data);
        }
      } catch (err) {
        console.error("İstasyonlar çekilemedi", err);
      }
    };

    // 3. Eğer rota planlayıcıdan geldiyse OSRM'den rotayı çek
    const fetchOSRMRoute = async () => {
      if (routeConfig) {
        const { startLat, startLon, endLat, endLon } = routeConfig;
        // OSRM lon,lat formatı ister
        const url = `http://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            setRouteData({
              geometry: data.routes[0].geometry,
              distance: data.routes[0].distance, // metre
              duration: data.routes[0].duration, // saniye
            });
          }
        } catch (err) {
          console.error("Rota çekilemedi (OSRM):", err);
        }
      }
    };

    getUserLocation();
    loadStations();
    fetchOSRMRoute();
  }, [routeConfig]);

  // Arama Efekti
  useEffect(() => {
    let result = allStations;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q)) ||
        (s.provider && s.provider.toLowerCase().includes(q))
      );
    }

    setFilteredStations(result);
  }, [searchQuery, allStations]);

  const htmlSource = useMemo(() => {
    return { html: generateLeafletHTML(filteredStations, userLocation, routeData) };
  }, [filteredStations, userLocation, routeData]);





  // AI Analizi İsteği
  const handleAiAnalysis = async () => {
    if (!routeData || !routeData.geometry) return;
    setIsAiLoading(true);
    try {
      // OSRM [boylam, enlem] dönüyor, biz backend'e [enlem, boylam] yollamalıyız
      const routeCoords = routeData.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);

      const payload = {
        start_point: "Başlangıç",
        end_point: "Varış Noktası",
        total_distance_km: parseFloat((routeData.distance / 1000).toFixed(2)),
        total_duration_mins: parseFloat((routeData.duration / 60).toFixed(2)),
        vehicle_model: routeConfig.vehicleModel || "Bilinmiyor",
        battery_capacity_kwh: routeConfig.batteryCapacity || 60,
        range_km: routeConfig.rangeKm || 350,
        current_battery_percentage: routeConfig.batteryPercentage || 100,
        route_coordinates: routeCoords
      };

      const res = await apiClient('/routes/ai-analysis', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
        setShowAiModal(true);
      } else {
        const errorData = await res.json();
        Toast.show({ type: 'error', text1: 'AI Hatası', text2: errorData.detail || 'Bilinmeyen Hata' });
      }
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Yapay Zeka servisine ulaşılamadı.' });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Rotayı Veritabanına Kaydet
  const handleSaveRoute = async () => {
    if (!routeConfig || !routeData) return;

    try {
      const payload = {
        vehicle_id: routeConfig.vehicleId,
        start_lat: routeConfig.startLat,
        start_lon: routeConfig.startLon,
        end_lat: routeConfig.endLat,
        end_lon: routeConfig.endLon,
        total_distance_km: parseFloat((routeData.distance / 1000).toFixed(2)),
        total_duration_mins: parseFloat((routeData.duration / 60).toFixed(2)),
        ai_plan: aiAnalysis
      };

      const res = await apiClient('/routes/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Toast.show({ type: 'success', text1: 'Rota Onaylandı', text2: 'Rotanız başarıyla kaydedildi!' });
        // Rota parametrelerini temizleyerek Ana sayfaya yönlendir
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        Toast.show({ type: 'error', text1: 'Hata', text2: 'Rota kaydedilemedi.' });
      }
    } catch (err) {
      console.error("Rota kaydetme hatası", err);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* WebView Map */}
      <WebView
        originWhitelist={['*']}
        source={htmlSource}
        style={styles.map}
        scrollEnabled={false}
        bounces={false}
      />

      {/* AI Analiz Butonu (Rota çizildiğinde görünür) */}
      {routeConfig && routeData && (
        <TouchableOpacity
          style={styles.aiButton}
          onPress={handleAiAnalysis}
          disabled={isAiLoading}
        >
          {isAiLoading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.aiButtonText}>✨ AI Analizi</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Rota Onaylama Kartı (Sadece Rota Çizildiyse Görünür) */}
      {routeConfig && routeData && (
        <SafeAreaView style={styles.routeConfirmOverlay} edges={['bottom']}>
          <ScrollView bounces={false} style={styles.routeConfirmCard} contentContainerStyle={{ paddingBottom: 20 }}>
            <View style={styles.routeInfoRow}>
              <View>
                <Text style={styles.routeInfoLabel}>Toplam Mesafe</Text>
                <Text style={styles.routeInfoValue}>{(routeData.distance / 1000).toFixed(1)} km</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.routeInfoLabel}>Tahmini Süre</Text>
                <Text style={styles.routeInfoValue}>{Math.round(routeData.duration / 60)} dk</Text>
              </View>
            </View>


            <TouchableOpacity style={styles.confirmButton} onPress={handleSaveRoute} activeOpacity={0.8}>
              <Text style={styles.confirmButtonText}>Rotayı Onayla ve Kaydet</Text>
              <MaterialIcons name="check-circle" size={20} color={COLORS.background} />
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      )}

      {/* Header Overlay (Sadece rota modunda değilse search bar göster, rota modunda sadece geri dön tuşu) */}
      <SafeAreaView style={styles.headerOverlay} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>

          {!routeConfig && (
            <>
              <View style={[styles.searchBar, { paddingHorizontal: 12 }]}>
                <MaterialIcons name="search" size={20} color={COLORS.onSurfaceVariant} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="İstasyon ara..."
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
            </>
          )}
        </View>
      </SafeAreaView>

      {/* AI Analiz Modalı */}
      {showAiModal && aiAnalysis && (
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
                  {aiAnalysis.general_recommendations.map((rec: string, idx: number) => (
                    <Text key={idx} style={styles.aiRecText}>• {rec}</Text>
                  ))}
                </View>
              </View>

              {/* Mola Noktaları */}
              <Text style={styles.aiSectionTitle}>Mola Noktaları</Text>
              {aiAnalysis.charging_stops.length === 0 ? (
                <Text style={styles.aiNoStopText}>Şarj molasına gerek yok!</Text>
              ) : (
                aiAnalysis.charging_stops.map((stop: any, index: number) => (
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
              {aiAnalysis.charging_stops.length > 0 && (
                <View style={styles.aiSummaryCard}>
                  <Text style={styles.aiSummaryTitle}>Tahmini Toplam Maliyet</Text>
                  <Text style={styles.aiSummaryValue}>{aiAnalysis.total_cost} ₺</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: COLORS.background,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    pointerEvents: 'box-none',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(28, 27, 29, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 27, 29, 0.95)',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 15,
    paddingVertical: 8,
  },
  routeConfirmOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 100,
  },
  routeConfirmCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 227, 139, 0.3)',
    shadowColor: '#00e38b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  routeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  routeInfoLabel: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    marginBottom: 4,
  },
  routeInfoValue: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  confirmButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.background },
  aiButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  aiButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 14,
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
    lineHeight: 20,
  },
  aiSectionTitle: {
    color: COLORS.onSurface,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  aiNoStopText: {
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  aiStopCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  aiStopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiStopBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  aiStopBadgeText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 12,
  },
  aiStopName: {
    color: COLORS.onSurface,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  aiStopDetails: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  aiDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiDetailText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
  },
  aiStopReason: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  aiSummaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
  },
  aiSummaryTitle: {
    color: COLORS.background,
    fontSize: 14,
    opacity: 0.8,
  },
  aiSummaryValue: {
    color: COLORS.background,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
