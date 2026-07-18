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

// Tailwind konfigürasyonundan alınan tema renkleri
const COLORS = {
  baseBackground: '#131315', // Onboarding ile aynı yapıldı
  surfaceContainerLow: 'rgba(28, 27, 29, 0.4)', // #1c1b1d with opacity
  surfaceTint: '#00ff9d', // Onboarding primaryContainer ile aynı
  surfaceContainerHighest: '#353437', // Onboarding surfaceVariant ile aynı
  surfaceContainerHighestAlpha: 'rgba(53, 52, 55, 0.8)',
  surface: '#131315',
  onSurface: '#e5e1e4',
  onSurfaceVariant: '#b9cbbc',
  secondary: '#d1bcff',
  error: '#ffb4ab',
};

export default function SmartRouteScreen({ navigation }: any) {
  // Animasyon değerleri
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulseAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2000,
            easing: Easing.bezier(0.4, 0, 0.6, 1),
            useNativeDriver: true,
          }),
        ])
      );
    };

    createPulseAnimation(pulseAnim1, 0).start();
    createPulseAnimation(pulseAnim2, 500).start(); // 0.5 saniye gecikmeli ikinci halka

    // Rota dönüş animasyonu
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [pulseAnim1, pulseAnim2, spinAnim]);

  // Animasyon interpolasyonları (0'dan 1'e giderken scale ve opacity değerlerini hesaplar)
  const getPulseStyle = (animValue: Animated.Value) => ({
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2.5],
        }),
      },
    ],
    opacity: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 0],
    }),
  });

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
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
            {/* Rota Animasyon Halkası (Kesik Çizgili) ve Üzerindeki Hareketli Araç */}
            <Animated.View style={[styles.routePathRing, { transform: [{ rotate: spinInterpolate }] }]}>
              <View style={styles.orbitCar}>
                <MaterialIcons name="electric-car" size={18} color={COLORS.surfaceTint} />
              </View>
            </Animated.View>

            {/* Radar Animasyon Halkaları */}
            <View style={styles.radarContainer}>
              <Animated.View style={[styles.pulseRing, styles.pulseRingInner, getPulseStyle(pulseAnim1)]} />
              <Animated.View style={[styles.pulseRing, styles.pulseRingOuter, getPulseStyle(pulseAnim2)]} />
            </View>

            {/* Merkez İkon */}
            <View style={styles.centerIconWrapper}>
              <MaterialIcons name="route" size={48} color={COLORS.surfaceTint} />
            </View>
          </View>

          {/* Metin İçeriği */}
          <Text style={styles.title}>Akıllı Rota Planlama</Text>
          <Text style={styles.subtitle}>
            Gelişmiş yapay zeka algoritmalarımız trafik durumunu, hava şartlarını ve aracınızın batarya seviyesini analiz ederek sizin için en verimli ve hızlı rotayı oluşturur.
          </Text>
        </View>

        {/* Alt Kısım: Aksiyon Butonu */}
        <View style={styles.footer}>
          {/* Sayfalama Noktaları (Pagination) */}
          <View style={styles.pagination}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
          </View>

          <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => navigation.navigate('StationOptimization')}>
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
    marginHorizontal: -8, // Tıklama alanını büyütüp hizalamayı korumak için
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
  routePathRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 157, 0.4)',
    borderStyle: 'dashed',
    zIndex: 5,
  },
  radarContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: 999,
  },
  pulseRingInner: {
    width: 96,
    height: 96,
    borderWidth: 2,
    borderColor: COLORS.surfaceTint,
  },
  pulseRingOuter: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 157, 0.5)',
  },
  centerIconWrapper: {
    backgroundColor: '#2a2a2c', // COLORS.surfaceContainerHigh
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 157, 0.4)',
    zIndex: 10,
    shadowColor: COLORS.surfaceTint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 10,
  },
  orbitCar: {
    position: 'absolute',
    top: -12,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerHighest, // İkonun arkasında küçük bir daire
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.surfaceTint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
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
  button: {
    width: '100%',
    maxWidth: 384,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceTint,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    shadowColor: COLORS.surfaceTint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});
