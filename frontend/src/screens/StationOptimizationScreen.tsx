import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  baseBackground: '#131315',
  surfaceContainerLow: 'rgba(28, 27, 29, 0.4)',
  surfaceTint: '#00ff9d',
  surfaceContainerHighest: '#353437',
  surfaceContainerHigh: '#2a2a2c',
  surface: '#131315',
  onSurface: '#e5e1e4',
  onSurfaceVariant: '#b9cbbc',
  secondary: '#d1bcff',
  secondaryContainer: '#7000ff',
  error: '#ffb4ab',
  transparentSecondary: 'rgba(112, 0, 255, 0.3)',
};

export default function StationOptimizationScreen({ navigation }: any) {
  // Dalga animasyon değerleri
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createWaveAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 3000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    createWaveAnimation(pulseAnim1, 0).start();
    createWaveAnimation(pulseAnim2, 1000).start();
    createWaveAnimation(pulseAnim3, 2000).start();
  }, [pulseAnim1, pulseAnim2, pulseAnim3]);

  // Interpolasyonlar
  const getWaveStyle = (animValue: Animated.Value) => ({
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 3.5], // Merkezden çıkıp dışarı büyür
        }),
      },
    ],
    opacity: animValue.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [0, 0.8, 0], // Aniden belirip yavaşça kaybolur
    }),
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.baseBackground} />
      
      <View style={styles.container}>
        {/* Üst Kısım: Geri ve Atla Butonu */}
        <View style={styles.header}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => navigation.navigate('Auth')}
            style={styles.headerButton}
          >
            <Text style={styles.skipText}>ATLA</Text>
          </TouchableOpacity>
        </View>

        {/* Ana İçerik */}
        <View style={styles.mainContent}>
          {/* İllüstrasyon / İkon Kutusu */}
          <View style={styles.illustrationBox}>
            {/* Dalga (Wave) Efekti Halkaları */}
            <Animated.View style={[styles.waveRing, getWaveStyle(pulseAnim1)]} />
            <Animated.View style={[styles.waveRing, getWaveStyle(pulseAnim2)]} />
            <Animated.View style={[styles.waveRing, getWaveStyle(pulseAnim3)]} />

            {/* Merkez İkon */}
            <View style={styles.centerIconWrapper}>
              <MaterialIcons name="ev-station" size={48} color={COLORS.secondary} />
            </View>

            {/* Yüzen Çipler (Data Chips) */}
            <View style={[styles.chip, styles.chipTopRight]}>
              <Text style={[styles.chipText, { color: COLORS.secondary }]}>350 kW</Text>
            </View>

            <View style={[styles.chip, styles.chipBottomLeft]}>
              <Text style={[styles.chipText, { color: COLORS.surfaceTint }]}>-20% ₺</Text>
            </View>
          </View>

          {/* Metin İçeriği */}
          <Text style={styles.title}>Şarj İstasyonu{'\n'}Optimizasyonu</Text>
          <Text style={styles.subtitle}>
            Rotanız üzerindeki en hızlı ve maliyet açısından en uygun şarj istasyonlarını otomatik olarak hesaplar ve duraklarınızı planlar.
          </Text>
        </View>

        {/* Alt Kısım: Aksiyon Butonları ve Sayfalama */}
        <View style={styles.footer}>
          {/* Sayfalama Noktaları (Pagination) - Tüm sayfalarda ortak yerleşim */}
          <View style={styles.pagination}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.activeDot]} />
          </View>

          <TouchableOpacity 
            style={styles.button} 
            activeOpacity={0.8} 
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.buttonText}>DEVAM ET</Text>
            <MaterialIcons name="arrow-forward" size={18} color={COLORS.surface} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.baseBackground,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 10,
  },
  headerButton: {
    padding: 8,
    marginHorizontal: -8,
  },
  skipText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.2,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  illustrationBox: {
    width: Math.min(width - 40, 240),
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  waveRing: {
    position: 'absolute',
    width: 96, // Merkez ikonun boyutu kadar
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: COLORS.secondaryContainer,
  },
  centerIconWrapper: {
    backgroundColor: COLORS.surfaceContainerHigh,
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(112, 0, 255, 0.4)',
    zIndex: 10,
    // Mor parlama efekti
    shadowColor: COLORS.secondaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 10,
  },
  chip: {
    position: 'absolute',
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 20,
  },
  chipTopRight: {
    top: 10,
    right: -20,
    borderColor: 'rgba(112, 0, 255, 0.3)',
  },
  chipBottomLeft: {
    bottom: 20,
    left: -10,
    borderColor: 'rgba(0, 255, 157, 0.3)',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace', // JetBrains Mono etkisi için
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
    zIndex: 10,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32, // Geri butonu da olduğu için biraz küçülttüm
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceContainerHighest,
  },
  activeDot: {
    width: 32,
    backgroundColor: COLORS.surfaceTint,
    shadowColor: COLORS.surfaceTint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  button: {
    width: '100%',
    maxWidth: 384,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceTint,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.surfaceTint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
    marginBottom: 12,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});
