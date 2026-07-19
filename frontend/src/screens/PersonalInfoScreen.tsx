import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { apiClient } from '../lib/apiClient';

const COLORS = {
  background: '#131315',
  surface: '#1c1b1d',
  primary: '#00e38b',
  surfaceVariant: '#353437',
  onSurface: '#e6e1e5',
  onSurfaceVariant: '#b9cbbc',
  error: '#ff5449',
  border: 'rgba(255,255,255,0.05)',
};

export default function PersonalInfoScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    country: '',
    city: '',
    email: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await apiClient('/users/', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          country: data.country || '',
          city: data.city || '',
          email: data.email || '',
        });
      } else {
        Toast.show({ type: 'error', text1: 'Hata', text2: 'Bilgiler alınamadı.' });
      }
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Bağlantı Hatası', text2: 'Sunucuya ulaşılamadı.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Eksik Bilgi',
        text2: 'Ad ve Soyad alanları zorunludur.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const updatePayload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
      };

      const response = await apiClient('/users/', {
        method: 'PUT',
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Başarılı',
          text2: 'Bilgileriniz güncellendi.',
        });
        navigation.goBack();
      } else {
        Toast.show({ type: 'error', text1: 'Hata', text2: 'Güncelleme başarısız oldu.' });
      }
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Bağlantı Hatası', text2: 'Sunucuya ulaşılamadı.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kişisel Bilgiler</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kişisel Bilgiler</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-posta Adresi (Değiştirilemez)</Text>
            <View style={[styles.inputContainer, styles.disabledInput]}>
              <MaterialIcons name="email" size={20} color={COLORS.onSurfaceVariant} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: COLORS.onSurfaceVariant }]}
                value={formData.email}
                editable={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Adınız"
                placeholderTextColor={COLORS.surfaceVariant}
                value={formData.first_name}
                onChangeText={(text) => setFormData({ ...formData, first_name: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Soyad</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Soyadınız"
                placeholderTextColor={COLORS.surfaceVariant}
                value={formData.last_name}
                onChangeText={(text) => setFormData({ ...formData, last_name: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefon Numarası</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="phone" size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="05XX XXX XX XX"
                placeholderTextColor={COLORS.surfaceVariant}
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Ülke</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="public" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Türkiye"
                  placeholderTextColor={COLORS.surfaceVariant}
                  value={formData.country}
                  onChangeText={(text) => setFormData({ ...formData, country: text })}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Şehir</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="location-city" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Şehir"
                  placeholderTextColor={COLORS.surfaceVariant}
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <Text style={styles.saveButtonText}>Kaydet</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  disabledInput: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'transparent',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
