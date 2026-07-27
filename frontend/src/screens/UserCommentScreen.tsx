import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { apiClient } from '../lib/apiClient';

const COLORS = {
  background: '#0d0d0f',
  surface: '#151518',
  surfaceVariant: '#222226',
  primary: '#00e38b',
  primaryDim: 'rgba(0, 227, 139, 0.1)',
  onSurface: '#ffffff',
  onSurfaceVariant: '#a1a1aa',
  danger: '#ff5449',
  star: '#FFC107'
};

// Mock Veri (Backend bağlandığında bu State api'den dolacak)
const MOCK_COMMENTS = [
  {
    id: '1',
    stationName: 'ZES Zorlu Center Şarj İstasyonu',
    date: '12 Temmuz 2026',
    rating: 5,
    comment: 'Harika bir deneyimdi! Cihazlar çok hızlı çalışıyor ve AVM içerisinde beklemesi çok keyifli. 120kW hız ile 30 dakikada %80 şarj oldum.',
    isVerified: true
  },
  {
    id: '2',
    stationName: 'Eşarj Kadıköy İskele',
    date: '3 Haziran 2026',
    rating: 3,
    comment: 'Konum çok merkezi ama maalesef fişlerden biri bozuktu. Diğer cihazda şarj edebildim fakat biraz sıra beklemek zorunda kaldım. Hız olarak standart.',
    isVerified: true
  },
  {
    id: '3',
    stationName: 'Trugo Ankara Otoyolu Tesisleri',
    date: '28 Mayıs 2026',
    rating: 4,
    comment: 'Yolculuk molasında hayat kurtardı. Tesis temiz ve şarj süresince kahve içmek için güzel bir yer var. Puan kırmamın sebebi kabloların biraz kısa olması.',
    isVerified: false
  }
];

export default function UserCommentScreen({ navigation }: any) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Düzenleme (Edit) State'leri
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editCommentText, setEditCommentText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient('/reviews/', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        // Map backend ReviewResponse to frontend structure
        const formattedData = data.map((item: any) => {
          // Format date from "2026-07-27T10:00:00" to a readable format
          const dateObj = new Date(item.created_at);
          const dateStr = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
          
          return {
            id: item.id,
            stationId: item.station_id,
            stationName: item.station_name || "Bilinmeyen İstasyon",
            date: dateStr,
            rating: item.rating,
            comment: item.comment,
            isVerified: true // Varsayılan olarak true yapıyoruz, ileride backend'e eklenebilir
          };
        });
        setComments(formattedData);
      } else {
        Toast.show({ type: 'error', text1: 'Hata', text2: 'Yorumlar yüklenemedi.' });
      }
    } catch (error) {
      console.error("Yorumlar çekilirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await apiClient(`/reviews/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setComments(prev => prev.filter(c => c.id !== id));
        Toast.show({
          type: 'success',
          text1: 'Silindi',
          text2: 'Yorumunuz başarıyla kaldırıldı.'
        });
      } else {
        Toast.show({ type: 'error', text1: 'Hata', text2: 'Yorum silinemedi.' });
      }
    } catch (error) {
      console.error("Yorum silinirken hata:", error);
    }
  };

  const openEditModal = (item: any) => {
    setEditingCommentId(item.id);
    setEditRating(item.rating);
    setEditCommentText(item.comment || '');
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingCommentId) return;
    setIsUpdating(true);
    try {
      const response = await apiClient(`/reviews/${editingCommentId}`, { 
        method: 'PUT',
        body: JSON.stringify({
          rating: editRating,
          comment: editCommentText,
          is_anonymous: false
        })
      });
      
      if (response.ok) {
        setComments(prev => prev.map(c => 
          c.id === editingCommentId ? { ...c, rating: editRating, comment: editCommentText } : c
        ));
        setEditModalVisible(false);
        Toast.show({ type: 'success', text1: 'Başarılı', text2: 'Yorum başarıyla güncellendi.' });
      } else {
        Toast.show({ type: 'error', text1: 'Hata', text2: 'Yorum güncellenemedi.' });
      }
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Bağlantı hatası.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FontAwesome 
            key={star} 
            name={star <= rating ? "star" : "star-o"} 
            size={14} 
            color={COLORS.star} 
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color={COLORS.onSurface} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yorumlarım</Text>
        <View style={{ width: 44 }} /> {/* Boşluk dengeleyici */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageDescription}>
          Geçmişte şarj istasyonlarına yaptığınız değerlendirmeler ve yorumlar.
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : comments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="speaker-notes-off" size={64} color={COLORS.surfaceVariant} />
            <Text style={styles.emptyText}>Henüz hiç yorum yapmadınız.</Text>
            <Text style={styles.emptySubtext}>Şarj deneyimlerinizi paylaşarak diğer elektrikli araç sürücülerine yardımcı olabilirsiniz.</Text>
          </View>
        ) : (
          <View style={styles.commentList}>
            {comments.map((item) => (
              <View key={item.id} style={styles.commentCard}>
                
                {/* Kart Üst Kısım: İstasyon Adı ve Tarih */}
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={styles.stationName} numberOfLines={1}>{item.stationName}</Text>
                    <Text style={styles.dateText}>{item.date}</Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>{item.rating}.0</Text>
                    <FontAwesome name="star" size={12} color={COLORS.star} style={{ marginLeft: 4 }} />
                  </View>
                </View>

                {/* Yıldızlar ve Verified Rozeti */}
                <View style={styles.badgeRow}>
                  {renderStars(item.rating)}
                  {item.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <MaterialIcons name="verified" size={14} color={COLORS.primary} />
                      <Text style={styles.verifiedText}>Şarj Doğrulandı</Text>
                    </View>
                  )}
                </View>

                {/* Yorum Metni */}
                <Text style={styles.commentBody}>{item.comment}</Text>

                {/* Kart Alt Kısım: Butonlar */}
                <View style={styles.cardFooter}>
                  <TouchableOpacity 
                    style={[styles.actionButton, { flex: 1, backgroundColor: COLORS.primaryDim, borderColor: 'rgba(0, 227, 139, 0.2)' }]}
                    onPress={() => navigation.navigate('StationDetail', { station: { id: item.stationId, name: item.stationName } })}
                  >
                    <MaterialIcons name="local-gas-station" size={16} color={COLORS.primary} />
                    <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>İstasyona Git</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => openEditModal(item)}
                  >
                    <MaterialIcons name="edit" size={16} color={COLORS.onSurfaceVariant} />
                    <Text style={styles.actionButtonText}>Düzenle</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: 'rgba(255, 84, 73, 0.1)', borderColor: 'rgba(255, 84, 73, 0.2)' }]}
                    onPress={() => handleDelete(item.id)}
                  >
                    <MaterialIcons name="delete-outline" size={16} color={COLORS.danger} />
                    <Text style={[styles.actionButtonText, { color: COLORS.danger }]}>Sil</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yorumu Düzenle</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Puanınız</Text>
              <View style={styles.starSelection}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setEditRating(star)}>
                    <FontAwesome 
                      name={star <= editRating ? "star" : "star-o"} 
                      size={32} 
                      color={COLORS.star} 
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Yorumunuz</Text>
              <TextInput
                style={styles.textInput}
                value={editCommentText}
                onChangeText={setEditCommentText}
                multiline
                placeholder="İstasyon deneyiminizi anlatın..."
                placeholderTextColor={COLORS.onSurfaceVariant}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
                disabled={isUpdating}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, isUpdating && { opacity: 0.7 }]}
                onPress={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color={COLORS.background} />
                ) : (
                  <Text style={styles.saveButtonText}>Kaydet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    borderBottomColor: COLORS.surfaceVariant,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  pageDescription: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
  commentList: {
    gap: 16,
  },
  commentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
  },
  ratingText: {
    color: COLORS.star,
    fontWeight: '700',
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDim,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  verifiedText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  commentBody: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceVariant,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    width: '100%',
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  modalBody: {
    marginBottom: 32,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    marginBottom: 12,
  },
  starSelection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    color: COLORS.onSurface,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceVariant,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.onSurface,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
  },
});