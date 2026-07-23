import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { supabase } from '../lib/supabase';

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

export default function SecurityScreen({ navigation }: any) {
  const [isSaving, setIsSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Eksik Bilgi',
        text2: 'Lütfen tüm alanları doldurun.',
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'Şifreniz en az 6 karakter olmalıdır.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'Şifreler birbiriyle eşleşmiyor.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Hata',
          text2: error.message,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Başarılı',
          text2: 'Şifreniz güvenle güncellendi.',
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Bağlantı Hatası',
        text2: 'Sunucuya ulaşılamadı.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Şifre ve Güvenlik</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark" size={28} color={COLORS.primary} style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Hesabınızın güvenliği için güçlü bir şifre kullanmanızı öneririz. Şifreniz en az 6 karakterden oluşmalıdır.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yeni Şifre</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Yeni Şifreniz"
                placeholderTextColor={COLORS.surfaceVariant}
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                <MaterialIcons
                  name={showNewPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={COLORS.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yeni Şifre (Tekrar)</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Yeni Şifreniz (Tekrar)"
                placeholderTextColor={COLORS.surfaceVariant}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={COLORS.onSurfaceVariant}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleUpdatePassword}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <Text style={styles.saveButtonText}>Şifreyi Güncelle</Text>
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 227, 139, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 227, 139, 0.2)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.onSurface,
    lineHeight: 20,
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: COLORS.onSurface,
    fontSize: 16,
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
