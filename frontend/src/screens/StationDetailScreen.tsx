import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../lib/apiClient';
import Toast from 'react-native-toast-message';

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

export default function StationDetailScreen({ route, navigation }: any) {
  // route.params.station tam nesne olmayabilir (sadece id ve name gelmiş olabilir)
  const initialStation = route.params.station; 
  
  const [station, setStation] = useState(initialStation);
  const [reviews, setReviews] = useState<any[]>([]);
  const [summary, setSummary] = useState({ average_rating: 0, total_reviews: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Yeni yorum state'leri
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviewsAndStation();
  }, []);

  const fetchReviewsAndStation = async () => {
    setIsLoading(true);
    try {
      // 1. Eğer station eksik gelmişse (sadece id ve name varsa), backend'den tamamını çek
      if (!station.brand || !station.latitude) {
        try {
          const stationRes = await apiClient(`/stations/${station.id}`, { method: 'GET' });
          if (stationRes.ok) {
            const stationData = await stationRes.json();
            setStation(stationData);
          }
        } catch (e) {
          console.error("İstasyon detayı çekilemedi:", e);
        }
      }

      // 2. Yorumları Çek
      const res = await apiClient(`/reviews/${station.id}`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setSummary({ average_rating: data.average_rating, total_reviews: data.total_reviews });
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Veriler çekilemedi:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitReview = async () => {
    if (newRating === 0) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Lütfen bir puan (1-5) seçin.' });
      return;
    }

    setIsSubmitting(true);
    Keyboard.dismiss();

    try {
      const res = await apiClient(`/reviews/${station.id}`, {
        method: 'POST',
        body: JSON.stringify({
          rating: newRating,
          comment: newComment || null,
          is_anonymous: isAnonymous
        })
      });

      if (res.ok) {
        Toast.show({ type: 'success', text1: 'Başarılı', text2: 'Yorumunuz eklendi!' });
        setNewRating(0);
        setNewComment('');
        fetchReviewsAndStation(); // Listeyi yenile
      } else {
        const errData = await res.json();
        Toast.show({ type: 'error', text1: 'Hata', text2: errData.detail || 'Yorum eklenemedi.' });
      }
    } catch (err) {
      console.error('Yorum ekleme hatası:', err);
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Bağlantı hatası.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5 Yıldız Seçici
  const renderStarRating = () => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setNewRating(star)} style={{ padding: 4 }}>
            <Ionicons
              name={star <= newRating ? 'star' : 'star-outline'}
              size={32}
              color={COLORS.star}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Yorumları Listeleme Görünümü
  const renderReviewItem = ({ item }: any) => {
    // Sadece tarihi formatla (DD.MM.YYYY)
    const dateStr = new Date(item.created_at).toLocaleDateString('tr-TR');
    
    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="person-circle-outline" size={24} color={COLORS.onSurfaceVariant} />
            <Text style={styles.reviewUser}>{item.user_name || 'İsimsiz Kullanıcı'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="star" size={14} color={COLORS.star} />
            <Text style={styles.reviewRating}>{item.rating}</Text>
          </View>
        </View>
        {item.comment ? (
          <Text style={styles.reviewComment}>{item.comment}</Text>
        ) : null}
        <Text style={styles.reviewDate}>{dateStr}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{station.name || 'İstasyon Detayı'}</Text>
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReviewItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            {/* İstasyon Bilgi Özeti */}
            <View style={styles.infoBox}>
              <View>
                <Text style={styles.stationBrand}>{station.brand || 'Bilinmeyen Marka'}</Text>
                <Text style={styles.stationLocation}>
                  {station.district}, {station.province}
                </Text>
              </View>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={18} color={COLORS.star} />
                <Text style={styles.ratingText}>{summary.average_rating}</Text>
                <Text style={styles.totalReviewsText}>({summary.total_reviews})</Text>
              </View>
            </View>

            {station.latitude && station.longitude && (
              <TouchableOpacity 
                style={styles.mapBtn}
                onPress={() => navigation.navigate('Map', {
                  focusStation: {
                    lat: station.latitude,
                    lon: station.longitude,
                    id: station.id
                  }
                })}
              >
                <Ionicons name="map" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={styles.mapBtnText}>Haritada Göster</Text>
              </TouchableOpacity>
            )}

            {/* Yorum Ekleme Formu */}
            <View style={styles.addReviewBox}>
              <Text style={styles.addReviewTitle}>Deneyimini Değerlendir</Text>
              {renderStarRating()}
              <TextInput
                style={styles.commentInput}
                placeholder="Bu istasyon hakkında ne düşünüyorsunuz?"
                placeholderTextColor={COLORS.onSurfaceVariant}
                multiline
                numberOfLines={3}
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }} 
                onPress={() => setIsAnonymous(!isAnonymous)}
              >
                <Ionicons 
                  name={!isAnonymous ? "checkbox" : "square-outline"} 
                  size={24} 
                  color={COLORS.primary} 
                />
                <Text style={{ color: COLORS.onSurfaceVariant, marginLeft: 8 }}>
                  Adımı Göster
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitBtn, (newRating === 0 || isSubmitting) && { opacity: 0.5 }]} 
                onPress={submitReview}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <Text style={styles.submitBtnText}>Yorum Gönder</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Tüm Yorumlar</Text>
            
            {isLoading && (
              <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
            )}
            
            {!isLoading && reviews.length === 0 && (
              <Text style={styles.emptyText}>Henüz yorum yapılmamış. İlk yorumu sen yap!</Text>
            )}
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface
  },
  backButton: { marginRight: 15 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: COLORS.onSurface },
  infoBox: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stationBrand: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  stationLocation: { fontSize: 14, color: COLORS.onSurfaceVariant, marginTop: 4 },
  ratingBadge: { alignItems: 'center' },
  ratingText: { fontSize: 22, fontWeight: 'bold', color: COLORS.onSurface, marginTop: 4 },
  totalReviewsText: { fontSize: 12, color: COLORS.onSurfaceVariant },
  mapBtn: {
    backgroundColor: COLORS.surfaceVariant,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 227, 139, 0.2)',
  },
  mapBtnText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  addReviewBox: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(0, 227, 139, 0.1)',
  },
  addReviewTitle: { fontSize: 16, fontWeight: '600', color: COLORS.onSurface, marginBottom: 10, textAlign: 'center' },
  starContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
  commentInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 15,
    color: COLORS.onSurface,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  submitBtnText: { color: COLORS.background, fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.onSurface, marginBottom: 15 },
  emptyText: { color: COLORS.onSurfaceVariant, textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  reviewUser: { color: COLORS.onSurface, fontWeight: '600', marginLeft: 8 },
  reviewRating: { color: COLORS.star, fontWeight: 'bold', marginLeft: 4 },
  reviewComment: { color: COLORS.onSurfaceVariant, lineHeight: 20, marginBottom: 10 },
  reviewDate: { color: COLORS.onSurfaceVariant, fontSize: 12, textAlign: 'right' }
});
