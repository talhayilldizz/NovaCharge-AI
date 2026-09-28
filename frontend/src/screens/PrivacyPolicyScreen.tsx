import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

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

export default function PrivacyPolicyScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gizlilik Sözleşmesi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Text style={styles.lastUpdated}>Son Güncelleme: 19 Temmuz 2026</Text>

        <Text style={styles.sectionTitle}>1. Giriş</Text>
        <Text style={styles.paragraph}>
          NovaCharge olarak gizliliğinize önem veriyoruz. Bu gizlilik sözleşmesi, mobil uygulamamızı kullanırken kişisel verilerinizin nasıl toplandığı, kullanıldığı, saklandığı ve korunduğu hakkında bilgi vermek amacıyla hazırlanmıştır.
        </Text>

        <Text style={styles.sectionTitle}>2. Toplanan Veriler</Text>
        <Text style={styles.paragraph}>
          Uygulamamızı sorunsuz bir şekilde kullanabilmeniz için aşağıdaki verileri topluyoruz:
        </Text>
        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Kimlik ve İletişim Bilgileri:</Text> Adınız, soyadınız, e-posta adresiniz ve telefon numaranız.</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Araç Bilgileri:</Text> Uygulamaya eklediğiniz elektrikli aracın marka, model, batarya ve soket tipi bilgileri.</Text>
          <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Konum Verileri:</Text> Şarj istasyonlarını bulabilmeniz ve rota oluşturabilmeniz için anlık veya arka plan konum veriniz (izniniz dahilinde).</Text>
        </View>

        <Text style={styles.sectionTitle}>3. Verilerin Kullanım Amacı</Text>
        <Text style={styles.paragraph}>
          Topladığımız veriler, size en uygun şarj istasyonlarını göstermek, akıllı rota planlaması yapmak, kullanıcı deneyiminizi kişiselleştirmek ve teknik destek sağlayabilmek amacıyla kullanılmaktadır. Kişisel verileriniz hiçbir şekilde üçüncü şahıslara reklam amaçlı satılmaz.
        </Text>

        <Text style={styles.sectionTitle}>4. Veri Güvenliği</Text>
        <Text style={styles.paragraph}>
          Hesap bilgileriniz ve şifreleriniz Supabase altyapısı ile şifrelenerek korunmaktadır. İletişim, endüstri standardı SSL/TLS şifreleme protokolleri üzerinden sağlanır.
        </Text>

        <Text style={styles.sectionTitle}>5. Üçüncü Taraf Hizmetler</Text>
        <Text style={styles.paragraph}>
          Şarj istasyonu verileri (örn. uygunluk durumu, harita lokasyonları) entegre olduğumuz iş ortaklarımızın (örn. OCPI protokolü üzerinden haberleşen ağ operatörleri) sistemlerinden sağlanabilir. Harita görünümleri için harici harita servisleri kullanılabilir.
        </Text>

        <Text style={styles.sectionTitle}>6. Haklarınız</Text>
        <Text style={styles.paragraph}>
          Hesabınıza giriş yaparak "Kişisel Bilgiler" menüsünden verilerinizi güncelleyebilir veya bizimle iletişime geçerek hesabınızın ve tüm verilerinizin silinmesini talep edebilirsiniz.
        </Text>

        <Text style={styles.sectionTitle}>7. İletişim</Text>
        <Text style={styles.paragraph}>
          Gizlilik uygulamalarımızla ilgili herhangi bir sorunuz varsa bizimle "Yardım ve Destek" bölümünden veya destek adresi üzerinden iletişime geçebilirsiniz.
        </Text>

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
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
    paddingBottom: 60,
  },
  lastUpdated: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    lineHeight: 24,
  },
  bulletList: {
    marginTop: 8,
    gap: 8,
    paddingLeft: 8,
  },
  bulletItem: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.onSurface,
  },
});
