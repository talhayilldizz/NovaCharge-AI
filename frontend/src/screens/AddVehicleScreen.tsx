import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { supabase } from '../lib/supabase';
import { apiClient } from '../lib/apiClient';
import BottomMenu from '../components/BottomMenu';

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

export default function AddVehicleScreen({ route, navigation }: any) {
  const editMode = route.params?.editMode || false;
  const editingVehicle = route.params?.vehicle || null;

  const [brand, setBrand] = useState(editingVehicle?.brand || '');
  const [model, setModel] = useState(editingVehicle?.model || '');
  const [batteryCapacity, setBatteryCapacity] = useState(editingVehicle?.battery_capacity?.toString() || '');
  const [rangeKm, setRangeKm] = useState(editingVehicle?.range_km?.toString() || '');
  const [plugType, setPlugType] = useState(editingVehicle?.plug_type || 'CCS2');

  // Modal stateleri
  const [modalVisible, setModalVisible] = useState(false);
  const [selectionType, setSelectionType] = useState<'brand' | 'model'>('brand');

  // Backend'den çekilecek stateler
  const [evDatabase, setEvDatabase] = useState<Record<string, any[]>>({});
  const [brands, setBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetchVehicleCatalog();
  }, []);

  const fetchVehicleCatalog = async () => {
    try {
      const response = await apiClient('/vehicles/catalog', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setEvDatabase(data);
        setBrands(Object.keys(data).sort());
      } else {
        console.error('Failed to fetch vehicle catalog');
      }
    } catch (error) {
      console.error('Error fetching vehicle catalog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const availableModels = brand && evDatabase[brand] ? evDatabase[brand] : [];

  const handleSelect = (item: any) => {
    if (selectionType === 'brand') {
      setBrand(item);
      setModel(''); // Marka değişince modeli sıfırla
      setBatteryCapacity('');
      setRangeKm('');
    } else {
      setModel(item.model);
      setBatteryCapacity(item.batteryCapacity);
      setRangeKm(item.rangeKm);
      setPlugType(item.plugType);
    }
    setModalVisible(false);
  };

  const renderModalItem = ({ item }: { item: any }) => {
    const isBrand = selectionType === 'brand';
    const title = isBrand ? item : item.model;

    return (
      <TouchableOpacity
        style={styles.modalItem}
        onPress={() => handleSelect(item)}
      >
        <Text style={styles.modalItemText}>{title}</Text>
        {!isBrand && (
          <Text style={styles.modalItemSub}>
            {item.batteryCapacity} kWh • {item.rangeKm} km
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const handleAddVehicle = async () => {
    if (!brand || !model || !batteryCapacity || !rangeKm || !plugType) {
      Toast.show({
        type: 'error',
        text1: 'Eksik Bilgi',
        text2: 'Lütfen tüm alanları doldurun!'
      });
      return;
    }


    const vehicleData = {
      brand: brand,
      model: model,
      battery_capacity: parseFloat(batteryCapacity),
      range_km: parseInt(rangeKm, 10),
      plug_type: plugType,
      is_primary: false
    };

    setIsLoading(true);
    try {
      let response;
      if (editMode) {
        response = await apiClient(`/vehicles/${editingVehicle.id}`, {
          method: 'PUT',
          body: JSON.stringify(vehicleData)
        });
      } else {
        response = await apiClient('/vehicles/', {
          method: 'POST',
          body: JSON.stringify(vehicleData)
        });
      }

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Başarılı',
          text2: editMode ? 'Araç başarıyla güncellendi.' : 'Araç başarıyla eklendi.'
        });
        navigation.navigate('Vehicles');
      } else {
        const errorData = await response.json();
        Toast.show({
          type: 'error',
          text1: 'Hata',
          text2: errorData.detail || 'İşlem başarısız oldu.'
        });
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Bağlantı Hatası',
        text2: 'Sunucuya ulaşılamadı!'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back-ios" size={20} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editMode ? 'Araç Güncelle' : 'Yeni Araç Ekle'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="electric-car" size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.subtitle}>
              {editMode ? 'Aracınızın teknik özelliklerini güncelleyin.' : 'Garajına yeni bir elektrikli araç ekle.'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Marka (Açılır Menü) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Marka</Text>
              <TouchableOpacity
                style={styles.inputWrapper}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectionType('brand');
                  setModalVisible(true);
                }}
              >
                <MaterialIcons name="directions-car" size={20} color={COLORS.onSurfaceVariant} style={styles.inputIcon} />
                <Text style={[styles.input, { lineHeight: 56, color: brand ? COLORS.onSurface : COLORS.surfaceVariant }]}>
                  {brand || "Marka Seçin"}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {/* Model (Açılır Menü) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Model</Text>
              <TouchableOpacity
                style={[styles.inputWrapper, !brand && { opacity: 0.5 }]}
                activeOpacity={0.7}
                disabled={!brand}
                onPress={() => {
                  setSelectionType('model');
                  setModalVisible(true);
                }}
              >
                <Ionicons name="car-sport" size={20} color={COLORS.onSurfaceVariant} style={styles.inputIcon} />
                <Text style={[styles.input, { lineHeight: 56, color: model ? COLORS.onSurface : COLORS.surfaceVariant }]}>
                  {model || (brand ? "Model Seçin" : "Önce marka seçin")}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {/* Batarya Kapasitesi & Menzil (Yan Yana) */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Batarya (kWh)</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="battery-charging-full" size={20} color={COLORS.onSurfaceVariant} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="75.0"
                    placeholderTextColor={COLORS.surfaceVariant}
                    value={batteryCapacity}
                    onChangeText={setBatteryCapacity}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Menzil (km)</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="route" size={20} color={COLORS.onSurfaceVariant} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="533"
                    placeholderTextColor={COLORS.surfaceVariant}
                    value={rangeKm}
                    onChangeText={setRangeKm}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Priz Tipi */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Priz Tipi</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="electrical-services" size={20} color={COLORS.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Örn: CCS2"
                  placeholderTextColor={COLORS.surfaceVariant}
                  value={plugType}
                  onChangeText={setPlugType}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Kaydet Butonu */}
            <TouchableOpacity
              style={styles.submitButton}
              activeOpacity={0.8}
              onPress={handleAddVehicle}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>{editMode ? 'Aracı Güncelle' : 'Garaja Ekle'}</Text>
                  <MaterialIcons name="check-circle" size={20} color="#000" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>

        {/* Modal for Brand/Model Selection */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectionType === 'brand' ? 'Marka Seçin' : 'Model Seçin'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={selectionType === 'brand' ? brands : availableModels}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderModalItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                  isLoading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
                  ) : (
                    <Text style={{ color: COLORS.onSurfaceVariant, textAlign: 'center', marginTop: 20 }}>
                      Veri bulunamadı
                    </Text>
                  )
                }
              />
            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
      <BottomMenu navigation={navigation} activeTab="Vehicles" />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 227, 139, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 227, 139, 0.3)',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 16,
    height: '100%',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '60%',
    padding: 20,
    borderTopWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.onSurface,
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
  },
  modalItemText: {
    fontSize: 18,
    color: COLORS.onSurface,
  },
  modalItemSub: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },
});
