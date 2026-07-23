import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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

import { supabase } from '../lib/supabase';
import Toast from 'react-native-toast-message';

export default function AuthScreen({ navigation }: any) {
  const [isLogin, setIsLogin] = useState(false); // Kayıt sayfası istendiği için default false

  // Backend User modeline uygun stateler
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isKvkkAccepted, setIsKvkkAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animasyonlar
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const toggleAuthMode = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 20,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsLogin(!isLogin);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Eksik Bilgi',
        text2: 'Lütfen e-posta ve şifrenizi girin.'
      });
      return;
    }

    if (!isLogin && !isKvkkAccepted) {
      Toast.show({
        type: 'error',
        text1: 'Onay Gerekli',
        text2: 'Lütfen KVKK metnini onaylayın.'
      });
      return;
    }

    setIsLoading(true);

    if (isLogin) {
      // Giriş Yap
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Giriş Başarısız',
          text2: error.message
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Başarılı',
          text2: 'Başarıyla giriş yapıldı.'
        });
        console.log("Giriş Yapıldı: ", email)
        navigation.navigate('Home');
      }
    } else {
      // Kayıt Ol
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            country: country,
            city: city,
          }
        }
      });

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Kayıt Başarısız',
          text2: error.message
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Başarılı',
          text2: 'Kayıt başarılı.'
        });
        console.log("Kayıt Olundu: ", email)
        navigation.navigate('Home');
      }
    }

    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.baseBackground} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Geri Butonu (Opsiyonel) */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Logo ve Başlık Alanı */}
          <View style={styles.brandContainer}>
            <View style={styles.logoWrapper}>
              <MaterialIcons name="electric-bolt" size={40} color={COLORS.surfaceTint} />
            </View>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              <Text style={styles.title}>{isLogin ? 'Hoş Geldiniz' : 'Hesap Oluştur'}</Text>
              <Text style={styles.subtitle}>
                {isLogin
                  ? 'Elektrikli aracınızla yola çıkmaya hazır mısınız?'
                  : 'Geleceğin şarj ağına hemen katılın.'}
              </Text>
            </Animated.View>
          </View>

          {/* Form Alanı */}
          <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            {!isLogin && (
              <>
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Ad</Text>
                    <View style={[styles.inputWrapper, { paddingHorizontal: 12 }]}>
                      <TextInput
                        style={styles.input}
                        placeholder="Adınız"
                        placeholderTextColor={COLORS.surfaceContainerHighest}
                        value={firstName}
                        onChangeText={setFirstName}
                      />
                    </View>
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Soyad</Text>
                    <View style={[styles.inputWrapper, { paddingHorizontal: 12 }]}>
                      <TextInput
                        style={styles.input}
                        placeholder="Soyadınız"
                        placeholderTextColor={COLORS.surfaceContainerHighest}
                        value={lastName}
                        onChangeText={setLastName}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Telefon</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="phone" size={20} color={COLORS.onSurfaceVariant} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="+90 555 000 0000"
                      placeholderTextColor={COLORS.surfaceContainerHighest}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Ülke</Text>
                    <View style={[styles.inputWrapper, { paddingHorizontal: 12 }]}>
                      <TextInput
                        style={styles.input}
                        placeholder="Örn: Türkiye"
                        placeholderTextColor={COLORS.surfaceContainerHighest}
                        value={country}
                        onChangeText={setCountry}
                      />
                    </View>
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Şehir</Text>
                    <View style={[styles.inputWrapper, { paddingHorizontal: 12 }]}>
                      <TextInput
                        style={styles.input}
                        placeholder="Örn: İstanbul"
                        placeholderTextColor={COLORS.surfaceContainerHighest}
                        value={city}
                        onChangeText={setCity}
                      />
                    </View>
                  </View>
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-posta</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="mail-outline" size={20} color={COLORS.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="ornek@mail.com"
                  placeholderTextColor={COLORS.surfaceContainerHighest}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Şifre</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock-outline" size={20} color={COLORS.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.surfaceContainerHighest}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.visibilityIcon}>
                  <MaterialIcons
                    name={isPasswordVisible ? 'visibility' : 'visibility-off'}
                    size={20}
                    color={COLORS.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* KVKK Checkbox (Sadece Kayıt Modunda) */}
            {!isLogin && (
              <TouchableOpacity
                style={styles.checkboxContainer}
                activeOpacity={0.7}
                onPress={() => setIsKvkkAccepted(!isKvkkAccepted)}
              >
                <MaterialIcons
                  name={isKvkkAccepted ? "check-box" : "check-box-outline-blank"}
                  size={24}
                  color={isKvkkAccepted ? COLORS.surfaceTint : COLORS.onSurfaceVariant}
                />
                <Text style={styles.checkboxText}>
                  <Text style={styles.kvkkLink}>KVKK Aydınlatma Metni</Text>'ni okudum ve onaylıyorum.
                </Text>
              </TouchableOpacity>
            )}

            {/* Buton */}
            <TouchableOpacity
              style={[
                styles.mainButton,
                (!isLogin && !isKvkkAccepted) ? { opacity: 0.5 } : { opacity: 1 }
              ]}
              activeOpacity={0.8}
              disabled={(!isLogin && !isKvkkAccepted) || isLoading}
              onPress={handleAuth}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.surface} size="small" />
              ) : (
                <Text style={styles.mainButtonText}>{isLogin ? 'GİRİŞ YAP' : 'KAYIT OL'}</Text>
              )}
            </TouchableOpacity>

          </Animated.View>

          {/* Geçiş Linki */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
            </Text>
            <TouchableOpacity onPress={toggleAuthMode}>
              <Text style={styles.footerLink}>
                {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  brandContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  logoWrapper: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 227, 139, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 227, 139, 0.3)',
    shadowColor: COLORS.surfaceTint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
    lineHeight: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHighest,
    borderRadius: 16,
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
  },
  visibilityIcon: {
    padding: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 4,
    paddingRight: 16,
    gap: 8,
  },
  checkboxText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  kvkkLink: {
    color: COLORS.surfaceTint,
    textDecorationLine: 'underline',
  },
  mainButton: {
    backgroundColor: COLORS.surfaceTint,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: COLORS.surfaceTint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  mainButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 8,
  },
  footerText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
  },
  footerLink: {
    color: COLORS.surfaceTint,
    fontSize: 14,
    fontWeight: '700',
  },
});
