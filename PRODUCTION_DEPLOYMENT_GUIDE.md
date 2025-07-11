# 🌾 AKAYDIN TARIM - HOSTİNG KURULUM REHBERİ

## 📋 SİSTEM GEREKSİNİMLERİ

### Hosting Gereksinimleri:
- **Node.js**: 18+ sürümü
- **MySQL**: 8.0+ sürümü  
- **NPM**: 9+ sürümü
- **Disk Alanı**: En az 2GB
- **RAM**: En az 1GB
- **SSL Sertifikası**: Let's Encrypt (ücretsiz)

### Domain Ayarları:
- Ana domain: `akaydintarim.com`
- www subdomain: `www.akaydintarim.com`
- SSL/TLS: Aktif

---

## 📁 DOSYA YAPISI (HOSTİNG HAZIR)

### Hosting'e Yüklenecek Dosyalar:
```
akaydin-tarim/
├── server/                 # Backend sunucu
│   ├── index.js           # Ana sunucu dosyası
│   └── findik-scraper.js  # Fındık fiyat çekici
├── dist/                  # Frontend build (npm run build sonrası)
├── database/              # Veritabanı setup
│   └── setup.sql         # Tek dosyada tüm tablolar
├── components/            # React bileşenleri
├── hooks/                 # React hooks
├── pages/                 # React sayfaları  
├── services/              # API katmanı
├── public/                # Static dosyalar
├── uploads/               # Kullanıcı yüklemeleri
├── package.json           # Bağımlılıklar
├── vite.config.ts         # Vite konfigürasyonu
├── tsconfig.json          # TypeScript ayarları
├── types.ts               # Tip tanımları
├── .env                   # Production çevre değişkenleri
└── .gitignore            # Git ignore listesi
```

### 🗑️ Hosting'e Gitmeyecek Dosyalar:
- `node_modules/` (hosting'de yeniden yüklenecek)
- `GEREKSIZ_DOSYALAR/` (yedek dosyalar)
- `.env.local` (yerel geliştirme)
- `README.md` (geliştirici dokümantasyonu)
- `*.md` dosyaları (rehberler)

---

## 🚀 HOSTİNG KURULUM ADIMLARI

### 1. Dosya Yükleme (FTP/SFTP):
```bash
# Ana hosting dizinine yükleyin:
# - Shared hosting: /public_html/
# - VPS/Dedicated: /var/www/html/
```

**Yüklenecek klasörler:**
- ✅ `server/`
- ✅ `components/`
- ✅ `hooks/`
- ✅ `pages/`
- ✅ `services/`
- ✅ `database/`
- ✅ `public/`
- ✅ `uploads/` (temizlenmiş)
- ✅ Ana dosyalar (package.json, vite.config.ts, etc.)

**Yüklenmeyecek:**
- ❌ `node_modules/`
- ❌ `GEREKSIZ_DOSYALAR/`
- ❌ `.env.local`
- ❌ Markdown dosyaları

### 2. MySQL Veritabanı Kurulumu:
```sql
-- cPanel/Hosting kontrolpanelinde:
CREATE DATABASE akaydin_tarim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'akaydin'@'localhost' IDENTIFIED BY 'GÜÇLÜ_ŞİFRE_518518';
GRANT ALL PRIVILEGES ON akaydin_tarim.* TO 'akaydin'@'localhost';
FLUSH PRIVILEGES;
```

**Tabloları oluştur:**
```bash
# cPanel File Manager veya phpMyAdmin'de:
# database/setup.sql dosyasını import edin
```

### 3. Çevre Değişkenleri (.env):
```env
# Production Environment
NODE_ENV=production
PORT=3003

# Database Configuration
DB_HOST=localhost
DB_USER=akaydin
DB_PASSWORD=GÜÇLÜ_ŞİFRE_518518
DB_NAME=akaydin_tarim

# Domain Configuration
FRONTEND_URL=https://akaydintarim.com
API_URL=https://akaydintarim.com/api

# Security
SESSION_SECRET=ultra_güçlü_session_secret_2025
CORS_ORIGIN=https://akaydintarim.com

# Analytics & SEO
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
GOOGLE_SEARCH_CONSOLE=verification_code
```

### 4. Node.js Bağımlılıkları:
```bash
# SSH veya hosting terminal ile:
cd /path/to/akaydin-tarim
npm install --production --no-optional
```

### 5. Frontend Build:
```bash
npm run build
```

### 6. PM2 ile Sunucu Başlatma:
```bash
# PM2 kurulumu (global)
npm install -g pm2

# Uygulamayı başlat
pm2 start server/index.js --name "akaydin-tarim" --env production

# Otomatik yeniden başlatma
pm2 startup
pm2 save

# İzleme
pm2 status
pm2 logs akaydin-tarim
```

### 7. Nginx/Apache Konfigürasyonu:

**Nginx (.htaccess benzeri):**
```nginx
server {
    listen 80;
    server_name akaydintarim.com www.akaydintarim.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name akaydintarim.com www.akaydintarim.com;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    root /var/www/html/akaydin-tarim/dist;
    index index.html;
    
    # API yönlendirme
    location /api/ {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Uploads
    location /uploads/ {
        alias /var/www/html/akaydin-tarim/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

**Apache (.htaccess):**
```apache
# .htaccess file
RewriteEngine On

# HTTPS yönlendirme
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API proxy
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3003/api/$1 [P,L]

# React Router (SPA)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set X-Content-Type-Options "nosniff"

# Cache control
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

---

## 🔧 HOSTİNG SONRASI KONTROLLER

### 1. API Test:
```bash
curl https://akaydintarim.com/api/services
curl https://akaydintarim.com/api/products
curl https://akaydintarim.com/api/analytics/realtime
```

### 2. Frontend Test:
- ✅ Ana sayfa yükleniyor mu?
- ✅ Admin paneli çalışıyor mu?
- ✅ Fotoğraf yüklemeleri çalışıyor mu?
- ✅ İletişim formu çalışıyor mu?
- ✅ Analytics veriler geliyor mu?

### 3. SEO Test:
- ✅ Sitemap: `https://akaydintarim.com/sitemap.xml`
- ✅ Robots: `https://akaydintarim.com/robots.txt`
- ✅ Meta tags doğru mu?
- ✅ SSL aktif mi?

### 4. Performance Test:
```bash
# Load time test
curl -w "@curl-format.txt" -s -o /dev/null https://akaydintarim.com

# Database test
pm2 logs akaydin-tarim --lines 50
```

---

## 🛠️ BAKIM VE GÜNCELLEMELERİ

### Günlük Kontroller:
```bash
# Sunucu durumu
pm2 status

# Log kontrol
pm2 logs akaydin-tarim --lines 20

# Disk kullanımı
df -h

# Memory kullanımı
free -m
```

### Haftalık Bakım:
```bash
# Veritabanı backup
mysqldump -u akaydin -p akaydin_tarim > backup_$(date +%Y%m%d).sql

# Upload klasörü temizlik
find uploads/ -type f -mtime +30 -delete

# Log dosyaları temizlik
pm2 flush
```

### Güncelleme Süreci:
```bash
# 1. Backup al
mysqldump -u akaydin -p akaydin_tarim > backup_before_update.sql

# 2. Kodu güncelle (FTP ile)
# 3. Bağımlılıkları güncelle
npm install --production

# 4. Build yenile
npm run build

# 5. Sunucuyu yeniden başlat
pm2 restart akaydin-tarim

# 6. Test et
pm2 logs akaydin-tarim
```

---

## 🚨 SORUN GİDERME

### Yaygın Sorunlar:

**1. Sunucu başlamıyor:**
```bash
# Log kontrol
pm2 logs akaydin-tarim --lines 50

# Port kontrol
netstat -tlnp | grep 3003

# Manuel başlatma test
cd /path/to/akaydin-tarim
node server/index.js
```

**2. Veritabanı bağlantı hatası:**
```bash
# MySQL servis kontrol
systemctl status mysql

# Bağlantı test
mysql -u akaydin -p akaydin_tarim

# .env dosyası kontrol
cat .env
```

**3. Frontend yüklenmiyor:**
```bash
# Build kontrol
ls -la dist/

# Nginx/Apache log
tail -f /var/log/nginx/error.log
tail -f /var/log/apache2/error.log
```

**4. Fotoğraf yükleme hatası:**
```bash
# Upload klasörü izinleri
chmod 755 uploads/
chown www-data:www-data uploads/

# Disk alanı kontrol
df -h
```

---

## 📊 MONİTÖRİNG VE ANALİTİK

### PM2 Monitoring:
```bash
# Real-time monitoring
pm2 monit

# CPU/Memory usage
pm2 show akaydin-tarim
```

### Analytics Dashboard:
- **Admin Panel**: `https://akaydintarim.com/admin`
- **Şifre**: `111` (production'da değiştirin!)
- **Anlık İstatistikler**: Gerçek zamanlı ziyaretçi takibi

### Google Analytics:
- **Property**: Akaydın Tarım
- **Tracking ID**: `.env` dosyasında tanımlı
- **Hedefler**: İletişim formu, ürün görüntülemeleri

---

## ✅ BAŞARILI KURULUM CHECKLİSTİ

- [ ] Dosyalar hosting'e yüklendi
- [ ] MySQL veritabanı oluşturuldu
- [ ] Tablolar import edildi
- [ ] .env dosyası yapılandırıldı
- [ ] Node.js bağımlılıkları yüklendi
- [ ] Frontend build oluşturuldu
- [ ] PM2 ile sunucu başlatıldı
- [ ] Domain DNS ayarları yapıldı
- [ ] SSL sertifikası aktif
- [ ] API endpoints test edildi
- [ ] Admin paneli erişilebilir
- [ ] Analytics çalışıyor
- [ ] SEO ayarları doğru
- [ ] Backup sistemi kuruldu

---

## 📞 DESTEK BİLGİLERİ

### Teknik Destek:
- **Geliştirici**: AI Assistant
- **Proje**: Akaydın Tarım Web Sitesi
- **Teknoloji**: React + Node.js + MySQL
- **Tarih**: 11 Temmuz 2025

### Hosting Bilgileri:
- **Sunucu Tipi**: [Hosting sağlayıcısına göre]
- **Node.js Sürümü**: 18+
- **MySQL Sürümü**: 8.0+
- **SSL**: Let's Encrypt

---

**🎯 Kurulum tamamlandığında sisteminiz tamamen hazır olacak!**

**📈 Özellikler:**
- ✅ Responsive tasarım
- ✅ Admin yönetim paneli
- ✅ Gerçek zamanlı analytics
- ✅ SEO optimizasyonu
- ✅ Otomatik fındık fiyat güncelleme
- ✅ İletişim form sistemi
- ✅ Blog yönetimi
- ✅ Ürün/hizmet yönetimi
- ✅ Çoklu resim yükleme
- ✅ GDPR uyumlu analytics
