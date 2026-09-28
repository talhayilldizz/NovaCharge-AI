# NovaCharge AI - Elektrikli Araç Şarj Ağı & Akıllı Rota Asistanı

<p align="center">
  <img src="frontend/assets/logo.png" width="200" alt="NovaCharge Logo">
</p>

NovaCharge AI, elektrikli araç kullanıcıları için tasarlanmış, yapay zeka destekli akıllı bir rota planlayıcı ve şarj istasyonu bulma uygulamasıdır. Frontend tarafında modern mobil teknolojiler (**React Native & Expo**), Backend tarafında ise yüksek performanslı **FastAPI** kullanılarak geliştirilmiştir. Veri yönetimi ve kimlik doğrulama işlemleri **Supabase** üzerinden sağlanmaktadır.

## Öne Çıkan Özellikler

- **Araç Yönetimi:** Kullanıcılar kendi elektrikli araçlarını profillerine ekleyebilir.
- **Akıllı Rota Planlama:** Başlangıç ve bitiş noktaları girilerek elektrikli araçlar için en optimize seyahat rotası çıkarılır.
- **Güzergah Üzeri İstasyonlar:** Oluşturulan rota üzerinde, aracınızın kalan menziline ve şarj ihtiyacına en uygun şarj istasyonları yapay zeka destekli olarak listelenir.
- **Kullancı Bildirimleri:** Kullanıcılar kullandıkları istasyonlar hakkında puan verebilir ve yorum atabilir. Bu sayede yollarda sıkıntılı bi istasyon hakkında diğer kullanıcılar bilgi sahibi olabilir.
- **Yapay Zeka Asistanı:** OpenAI destekli sistem, maliyet ve süre analizleri yaparak en mantıklı şarj duraklarını tavsiye eder.

<p align="center">
  <img src="frontend/assets/app_screenshotss.png" width="800" alt="NovaCharge Ekran Görüntüleri">
</p>

## Akıllı Algoritma: Doğru İstasyon Nasıl Bulunuyor?

Sistemin şarj istasyonu tavsiye etme süreci iki aşamalı bir algoritmadan oluşur:

1. **Geometrik Veri Filtreleme (PostGIS & GeoAlchemy2):** 
   Kullanıcının gideceği toplam menzil ve aracın şarj kapasitesi baz alınarak, yolda kaç kez mola verilmesi gerektiği (ideal kilometre hedefleri) matematiksel olarak hesaplanır. Ardından, veritabanındaki 16.000+ istasyon arasından sadece rotaya yakın olan (`distance_to_route_m`) ve hedeflenen kilometreye en yakın konumdaki adaylar filtrelenir.
   
2. **Yapay Zeka Karar Mekanizması (OpenAI):** 
   Önceden filtrelenmiş bu dar aday listesi OpenAI GPT modeline gönderilir. Yapay zeka bu istasyonlar arasından;
   - Birbirine çok yakın (50 km'den az) olanları eler.
   - Hızlı şarj (Fast Charge) imkanı sunanları önceliklendirir.
   - Rotadan en az sapmayı gerektirecek, en mantıklı olanları seçer ve kullanıcının önüne "Neden bu istasyonu seçtiğinin" açıklamasıyla beraber (Örn: *"100 kW hızlı şarj imkanı sunduğu ve rotadan sapma gerektirmediği için seçildi"*) sunar.

## Proje Mimarisi

*   **Frontend:** React Native, Expo, Leaflet (Harita)
*   **Backend:** Python, FastAPI, SQLAlchemy, GeoAlchemy2, Uvicorn
*   **Veritabanı & Auth:** Supabase (PostgreSQL), JWT
*   **Yapay Zeka:** OpenAI API (Akıllı istasyon önerileri ve maliyet/süre analizleri)
*   **Altyapı:** Docker & Docker Compose

## Proje Yapısı

```bash
├── backend/                # FastAPI sunucu kodları, veritabanı modelleri ve AI servisleri
│   ├── app/                # Ana uygulama klasörü (api, models, schemas, services)
│   ├── scripts/            # Veritabanı tablolarını ve seed verilerini oluşturan scriptler
│   ├── Dockerfile          # Backend konteyner yapılandırması
│   └── requirements.txt    # Python bağımlılıkları
├── frontend/               # Expo tabanlı React Native mobil/web uygulama kodları
│   ├── src/                # Bileşenler (components) ve ekranlar (screens)
│   ├── package.json        # Node.js bağımlılıkları
│   └── App.tsx             # Ana frontend başlangıç dosyası
└── docker-compose.yml      # Backend servislerini tek tıkla ayağa kaldırmak için ayar dosyası
```

## Kurulum ve Çalıştırma

Projede **Backend** Docker üzerinde çalışırken, anlık yenileme (hot-reload) rahatlığı için **Frontend** yerel makinede (host) çalışacak şekilde tasarlanmıştır.

### 1. Ortam Değişkenlerinin (Environment Variables) Ayarlanması

Sistemi çalıştırmadan önce iki adet gizli `.env` dosyası oluşturmalısınız:

**`backend/.env`**
```env
DATABASE_URL="postgresql://postgres.[PROJENIZ]:[SIFRENIZ]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxx"
SUPABASE_JWT_SECRET="buraya_supabase_jwt_secret_yazin"
SUPABASE_PUBLIC_KEY="buraya_supabase_anon_key_yazin"
```

**`frontend/.env`**
```env
EXPO_PUBLIC_API_URL="http://10.0.2.2:8000" # Android Emülatör için. (Gerçek cihaz veya web için bilgisayarınızın yerel IP'sini girin)
EXPO_PUBLIC_SUPABASE_URL="https://xxxxxxxx.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIs..."
```

### 2. Backend'in Başlatılması (Docker)

Docker'ın bilgisayarınızda açık olduğundan emin olduktan sonra ana dizinde terminali açıp şu komutu girin:
```bash
docker compose up --build -d
```
Bu komut, tüm backend bağımlılıklarını kuracak ve `8000` portunda API sunucusunu başlatacaktır.

### 3. Frontend'in Başlatılması (Expo / Yerel)

Backend hazır olduktan sonra, mobil uygulamayı başlatmak için `frontend` klasörüne geçiş yapın:
```bash
cd frontend
npm install   # İlk seferde kütüphaneleri indirmek için
npm start     # Expo'yu başlatmak için
```
Açılan menüde Android Studio emülatörü için `a` tuşuna, iOS Simülatör için `i` tuşuna basarak uygulamayı cihazınızda çalıştırabilirsiniz.

## İlk Kurulum ve Veritabanı Yönetimi

Projede veritabanı şema değişikliklerini yönetmek için **Alembic** kullanılmaktadır. 

İlk kez kurulum yaptığınızda veritabanını oluşturmak ve güncel hale getirmek için:
```bash
docker compose exec backend alembic upgrade head
```

Yeni bir model (tablo veya sütun) eklediğinizde veritabanını güncellemek için şu iki komutu sırasıyla çalıştırın:
```bash
docker compose exec backend alembic revision --autogenerate -m "yeni_ozellik_eklendi"
docker compose exec backend alembic upgrade head
```

Varsa hazır şarj istasyonları gibi demo verileri eklemek için (Opsiyonel):
```bash
docker compose exec backend python scripts/import_stations.py
docker compose exec backend python scripts/seed_vehicle_catalog.py
```

## Veri Kaynaklari (Datasets)

- [Turkey EV Charging Stations Network Geospatial](https://www.kaggle.com/datasets/aliemirkoca/turkey-ev-charging-stations-network-geospatial): Turkiye'deki sarj istasyonlarinin koordinat, marka ve kapasite bilgileri.
