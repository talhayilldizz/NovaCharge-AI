import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  background: '#131315',
  surface: '#1c1b1d',
  primary: '#00e38b',
  surfaceVariant: '#353437',
  onSurface: '#e6e1e5',
  onSurfaceVariant: '#b9cbbc',
  border: 'rgba(255,255,255,0.05)',
};

const FAQ_ITEMS = [
  {
    question: "Nasıl şarj istasyonu bulabilirim?",
    answer: "Ana ekrandaki Harita menüsünü kullanarak çevrenizdeki tüm istasyonları görebilirsiniz. İstasyonların uygunluk durumu (müsait/dolu) canlı olarak güncellenir."
  },
  {
    question: "Akıllı Rota nasıl çalışır?",
    answer: "Varsayılan aracınızın menziline ve batarya kapasitesine göre, gideceğiniz güzergah üzerindeki en uygun şarj noktalarını hesaplar. Böylece yolda kalma riski olmadan seyahatinizi planlar."
  },
  {
    question: "Birden fazla araç ekleyebilir miyim?",
    answer: "Evet, Garaj sayfasından dilediğiniz kadar elektrikli araç ekleyebilir ve bunlar arasında geçiş yapabilirsiniz. En sık kullandığınız aracı 'Varsayılan' olarak seçmeyi unutmayın."
  },
  {
    question: "Favori istasyonlar ne işe yarar?",
    answer: "Sık kullandığınız (örneğin eviniz veya iş yerinize yakın) istasyonları favorilerinize ekleyerek, bu istasyonların müsaitlik durumunu her an ana ekrandan hızlıca takip edebilirsiniz."
  }
];

export default function HelpSupportScreen({ navigation }: any) {

  const handleContact = () => {
    Linking.openURL('mailto:destek@voltpilot.com');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yardım ve Destek</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Contact Support */}
        <View style={styles.contactCard}>
          <View style={styles.contactIconWrapper}>
            <Ionicons name="chatbubbles-outline" size={28} color={COLORS.primary} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Bize Ulaşın</Text>
            <Text style={styles.contactDesc}>
              Sorularınız, önerileriniz veya yaşadığınız problemler için teknik ekibimizle doğrudan iletişime geçebilirsiniz.
            </Text>
            <TouchableOpacity style={styles.contactButton} onPress={handleContact} activeOpacity={0.8}>
              <MaterialCommunityIcons name="email-outline" size={18} color={COLORS.background} />
              <Text style={styles.contactButtonText}>E-Posta Gönder</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>Sıkça Sorulan Sorular</Text>

        <View style={styles.faqContainer}>
          {FAQ_ITEMS.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <View style={styles.faqHeader}>
                <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.questionText}>{item.question}</Text>
              </View>
              <Text style={styles.answerText}>{item.answer}</Text>
            </View>
          ))}
        </View>
        
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
  contactCard: {
    backgroundColor: 'rgba(0, 227, 139, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 227, 139, 0.2)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 32,
  },
  contactIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 227, 139, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  contactDesc: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  contactButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 16,
  },
  faqContainer: {
    gap: 16,
  },
  faqItem: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  answerText: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    lineHeight: 22,
    paddingLeft: 32,
  },
});
