import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Tema Renkleri (Tailwind Config'den alındı)
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

export default function OnboardingScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.container}>
        {/* Üst Kısım: Görsel ve Gradyan */}
        <View style={styles.imageSection}>
          <Image
            source={require('../../assets/image.png')} //assets klasörünüze göre yolu kontrol edin
            style={styles.image}
            resizeMode="cover"
          />
          {/* Görselin altına doğru siyaha geçiş (Fade to black) */}
          <LinearGradient
            colors={['transparent', COLORS.surface]}
            style={styles.gradientOverlay}
          />
        </View>

        {/* Alt Kısım: İçerik */}
        <View style={styles.contentSection}>
          {/* Metinler */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>AI ile Akıllı Rotalar</Text>
            <Text style={styles.subtitle}>
              Aracınız için en verimli ve ekonomik yolculuğu yapay zeka ile planlayın.
            </Text>
          </View>

          {/* Sayfalama Noktaları (Pagination) */}
          <View style={styles.pagination}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          {/* Aksiyon Butonu */}
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SmartRoute')}
          >
            <Text style={styles.buttonText}>HADİ BAŞLAYALIM</Text>
            <MaterialIcons name="arrow-forward" size={20} color={COLORS.surface} />
          </TouchableOpacity>
        </View>
      </View>
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
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  imageSection: {
    flex: 1, // Resmin mevcut alanı kaplamasını sağlar
    position: 'relative',
    minHeight: 442,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 128,
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(59, 74, 63, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceVariant,
  },
  activeDot: {
    width: 32,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
