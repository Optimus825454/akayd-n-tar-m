# 🚀 AKAYDIN TARIM - HIZLI HOSTİNG KURULUM KILAVUZU

> **⚡ Bu kılavuz, projenizi 30 dakikada hosting'e kurmak için hazırlanmıştır.**

---

## 📋 ÖN HAZIRLIK (5 DK)

### Gerekli Bilgiler:
- ✅ Hosting hesabı (cPanel/Plesk)
- ✅ FTP/SFTP erişim bilgileri
- ✅ MySQL veritabanı erişimi
- ✅ Domain adı (örn: akaydintarim.com)

### İndirmeniz Gerekenler:
- ✅ FileZilla (FTP client)
- ✅ phpMyAdmin (web tabanlı) veya MySQL Workbench

---

## 🗂️ DOSYA HAZIRLAMA (5 DK)

### 1. Yerel Build Oluşturma:
```bash
# Proje klasöründe:
npm install
npm run build
```

### 2. Hosting Paketini Hazırlama:
```bash
# Bu klasörleri ZİP'leyin:
akaydin-tarim/
├── server/
├── dist/
├── database/
├── components/
├── hooks/
├── pages/
├── services/
├── public/
├── uploads/ (sadece gerekli resimler)
├── package.json
├── vite.config.ts
├── tsconfig.json
├── types.ts
├── App.tsx
├── constants.tsx
├── index.css
├── index.html
└── index.tsx
```

**⚠️ ZİP'e DAHIL ETMEYİN:**
- ❌ `node_modules/`
- ❌ `GEREKSIZ_DOSYALAR/`
- ❌ `*.md` dosyaları
- ❌ `.env.local`

---

## 🗄️ VERİTABANI KURULUMU (5 DK)

### 1. MySQL Veritabanı Oluşturma:
```sql
-- cPanel > MySQL Databases
Veritabanı Adı: akaydin_tarim
Kullanıcı Adı: akaydin
Şifre: güçlü_şifre_518518
```

### 2. Tabloları Import Etme:
```bash
# cPanel > phpMyAdmin
# "Import" sekmesi
# "Choose File" → database/setup.sql seçin
# "Go" butonuna tıklayın
```

**✅ Sonuç:** 15+ tablo başarıyla oluşturulmalı (services, products, blog_posts, analytics, vb.)

---

## 📤 DOSYA YÜKLEME (10 DK)

### 1. FTP ile Yükleme:
```bash
# FileZilla ile bağlanın:
Host: ftp.akaydintarim.com
Username: ftp_kullanici_adi
Password: ftp_şifre
Port: 21

# Hedef klasör:
/public_html/ (veya ana dizin)
```

### 2. Yükleme Sırası:
1. **ZIP dosyasını yükleyin** → `/public_html/akaydin-tarim.zip`
2. **cPanel File Manager'da açın**
3. **"Extract" butonuyla çıkarın**
4. **Dosyaları `/public_html/` seviyesine taşıyın**

### 3. Klasör Yapısı Kontrolü:
```
/public_html/
├── server/
├── dist/
├── components/
├── hooks/
├── pages/
├── services/
├── database/
├── public/
├── uploads/
└── package.json
```

---

## ⚙️ ÇEVRE DEĞİŞKENLERİ (3 DK)

### 1. .env Dosyası Oluşturma:
```bash
# cPanel File Manager'da yeni dosya oluşturun: .env
```

### 2. İçerik (.env):
```env
NODE_ENV=production
PORT=3003

# Database (hosting bilgilerinizi yazın)
DB_HOST=localhost
DB_USER=akaydin
DB_PASSWORD=güçlü_şifre_518518
DB_NAME=akaydin_tarim

# Domain
FRONTEND_URL=https://akaydintarim.com
API_URL=https://akaydintarim.com/api

# Security
SESSION_SECRET=ultra_secret_2025_akaydintarim
CORS_ORIGIN=https://akaydintarim.com

# Analytics (opsiyonel)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

---

## 🚀 SUNUCU BAŞLATMA (2 DK)

### 1. Node.js Bağımlılıkları:
```bash
# SSH terminal veya cPanel Terminal:
cd /home/username/public_html
npm install --production
```

### 2. PM2 ile Başlatma:
```bash
# PM2 kurulumu (global)
npm install -g pm2

# Sunucuyu başlat
pm2 start server/index.js --name "akaydin-tarim"

# Otomatik başlatma
pm2 startup
pm2 save
```

**Alternatif (Shared Hosting):**
```bash
# Forever kullanımı
npm install -g forever
forever start server/index.js
```

---

## 🌐 DOMAIN YÖNLENDİRME (ZATEN MEVCUT)

### Hosting Konfigürasyonu:
- ✅ **Ana Dizin**: `/public_html/dist/` (React build)
- ✅ **Node.js Portu**: 3003
- ✅ **SSL**: Let's Encrypt aktif
- ✅ **HTTPS Redirect**: Otomatik

### URL Yapısı:
- `https://akaydintarim.com` → React frontend (dist/)
- `https://akaydintarim.com/api/*` → Node.js backend (:3003)
- `https://akaydintarim.com/uploads/*` → Media files

---

## ✅ TEST VE DOĞRULAMA (HEMEN)

### 1. Backend API Test:
```bash
curl https://akaydintarim.com/api/services
curl https://akaydintarim.com/api/products
curl https://akaydintarim.com/api/analytics/realtime
```

**Beklenen**: JSON response

### 2. Frontend Test:
- 🌐 Ana sayfa: `https://akaydintarim.com`
- 🔧 Admin panel: `https://akaydintarim.com/admin`
- 📊 Analytics: Admin panelinde "Anlık İstatistikler"

### 3. Fonksiyon Testleri:
- [ ] Ana sayfa yükleniyor
- [ ] Hizmetler sayfası çalışıyor
- [ ] Ürünler sayfası çalışıyor
- [ ] İletişim formu gönderiliyor
- [ ] Admin panel erişilebilir (şifre: `111`)
- [ ] Resim yükleme çalışıyor
- [ ] Analytics veri gösteriyor

---

## 🚨 HIZLI SORUN GİDERME

### Sunucu Başlamıyor:
```bash
# Log kontrol
pm2 logs akaydin-tarim

# Manuel test
cd /home/username/public_html
node server/index.js
```

### Database Bağlantı Hatası:
```bash
# .env kontrol
cat .env

# MySQL bağlantı test
mysql -u akaydin -p -h localhost
```

### Frontend Yüklenmiyor:
```bash
# Build kontrol
ls -la dist/

# Dosya izinleri
chmod -R 755 dist/
```

### API Çalışmıyor:
```bash
# Port kontrol
netstat -tlnp | grep 3003

# Firewall kontrol
# cPanel'de Node.js Apps bölümünü kontrol edin
```

---

## 📊 İZLEME VE YÖNETİM

### PM2 Komutları:
```bash
pm2 status                    # Durum görüntüle
pm2 restart akaydin-tarim    # Yeniden başlat
pm2 stop akaydin-tarim       # Durdur
pm2 logs akaydin-tarim       # Logları görüntüle
pm2 monit                    # Real-time monitoring
```

### Admin Panel:
- **URL**: `https://akaydintarim.com/admin`
- **Şifre**: `111` (production'da değiştirin!)
- **Özellikler**: 
  - Anlık istatistikler
  - Ürün/hizmet yönetimi
  - Blog yönetimi
  - İletişim mesajları
  - SEO ayarları

---

## 🎯 BAŞARILI KURULUM CHECKLİSTİ

- [ ] ✅ Veritabanı oluşturuldu ve tablolar import edildi
- [ ] ✅ Dosyalar hosting'e yüklendi
- [ ] ✅ .env dosyası yapılandırıldı
- [ ] ✅ Node.js bağımlılıkları yüklendi
- [ ] ✅ PM2 ile sunucu başlatıldı
- [ ] ✅ Frontend erişilebilir
- [ ] ✅ API endpoints çalışıyor
- [ ] ✅ Admin panel erişilebilir
- [ ] ✅ Analytics aktif
- [ ] ✅ SSL/HTTPS aktif

---

## 🏆 KURULUM TAMAMLANDI!

**🎉 Tebrikler! Akaydın Tarım web sitesi başarıyla canlıya alındı.**

### Sonraki Adımlar:
1. **🔐 Güvenlik**: Admin şifresini değiştirin
2. **📈 Analytics**: Google Analytics entegrasyonu
3. **🔍 SEO**: Search Console doğrulaması
4. **📱 Test**: Mobil uyumluluğu test edin
5. **🚀 Performans**: PageSpeed Insights ile test edin

### Önemli URL'ler:
- **Ana Site**: https://akaydintarim.com
- **Admin Panel**: https://akaydintarim.com/admin
- **API Base**: https://akaydintarim.com/api

**🎯 Sistem tamamen fonksiyonel ve hazır!**

---

*⏱️ Toplam kurulum süresi: ~30 dakika*  
*📅 Kurulum tarihi: 11 Temmuz 2025*  
*🛠️ Geliştirici: AI Assistant*
