# 🌾 AKAYDIN TARIM HOSTİNG KURULUM REHBERİ

Bu rehber, Akaydın Tarım web sitesini hosting ortamına kurmak için gerekli adımları içermektedir.

## 📋 SİSTEM GEREKSİNİMLERİ

### Hosting Gereksinimleri:
- **Node.js**: 18+ sürümü
- **MySQL**: 8.0+ sürümü
- **NPM**: 9+ sürümü
- **Disk Alanı**: En az 1GB
- **RAM**: En az 512MB

### Domain ve SSL:
- Domain adı (örn: akaydintarim.com)
- SSL sertifikası (Let's Encrypt önerilir)

## 📁 DOSYA YAPISI

### Hosting'e yüklenecek dosyalar:
```
akaydin-tarim/
├── server/                 # Backend sunucu dosyaları
│   ├── index.js           # Ana sunucu dosyası
│   └── package.json       # Server bağımlılıkları
├── dist/                  # Frontend build dosyaları
├── uploads/               # Yüklenen medya dosyaları
├── database/              # Veritabanı dosyaları
│   └── setup.sql         # Ana veritabanı kurulum dosyası
├── package.json           # Ana proje dosyası
└── .env                   # Çevre değişkenleri
```

## 🗄️ VERİTABANI KURULUMU

### 1. MySQL Veritabanı Oluşturma:
```sql
CREATE DATABASE akaydin_tarim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Kullanıcı Oluşturma:
```sql
CREATE USER 'akaydin_user'@'localhost' IDENTIFIED BY 'GÜÇLÜ_ŞİFRE';
GRANT ALL PRIVILEGES ON akaydin_tarim.* TO 'akaydin_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Tabloları İçe Aktarma:
```bash
mysql -u akaydin_user -p akaydin_tarim < database/setup.sql
```

## ⚙️ ÇEVRE DEĞİŞKENLERİ YAPILANDIRMASI

`.env` dosyası oluşturun:
```env
# Veritabanı Ayarları
DB_HOST=localhost
DB_USER=akaydin_user
DB_PASSWORD=GÜÇLÜ_ŞİFRE
DB_NAME=akaydin_tarim

# Sunucu Ayarları
PORT=3003
NODE_ENV=production

# Güvenlik
JWT_SECRET=RASTGELE_GÜÇLÜ_ANAHTAR
ADMIN_PASSWORD=admin123

# Domain Ayarları
FRONTEND_URL=https://akaydintarim.com
BACKEND_URL=https://akaydintarim.com:3003
```

## 🚀 HOSTİNG KURULUM ADIMLARI

### 1. Dosyaları Hosting'e Yükleme:
```bash
# FTP/SFTP ile dosyaları yükleyin
# Ana dizin genellikle: /public_html/ veya /htdocs/
```

### 2. Node.js Bağımlılıklarını Yükleme:
```bash
cd /path/to/your/site
npm install --production
```

### 3. Frontend Build Oluşturma:
```bash
npm run build
```

### 4. PM2 ile Sunucu Başlatma:
```bash
# PM2 kurulumu (global)
npm install -g pm2

# Sunucuyu başlatma
pm2 start server/index.js --name "akaydin-tarim"

# Otomatik başlatma
pm2 startup
pm2 save
```

## 🌐 NGINX YAPILANDIRMASI

`/etc/nginx/sites-available/akaydintarim.com` dosyası:
```nginx
server {
    listen 80;
    server_name akaydintarim.com www.akaydintarim.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name akaydintarim.com www.akaydintarim.com;

    ssl_certificate /path/to/ssl/fullchain.pem;
    ssl_certificate_key /path/to/ssl/privkey.pem;

    # Frontend (React)
    location / {
        root /path/to/your/site/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static files
        location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
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

    # Upload dosyaları
    location /uploads/ {
        root /path/to/your/site;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

## 🔧 APACHE YAPILANDIRMASI (Alternatif)

`.htaccess` dosyası (ana dizinde):
```apache
RewriteEngine On

# HTTPS yönlendirmesi
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API isteklerini Node.js'e yönlendir
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^(.*)$ http://localhost:3003/$1 [P,L]

# React Router için
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## 📊 VERİTABANI YAPILANDIRMASI

### Ana Tablolar:
- `services` - Hizmetler
- `products` - Ürünler  
- `blog_posts` - Blog yazıları
- `hero_content` - Ana sayfa hero içerikleri
- `about_page` - Hakkımızda sayfası
- `contact_page` - İletişim bilgileri
- `contact_messages` - İletişim mesajları
- `hazelnut_prices` - Fındık fiyatları
- `visitor_sessions` - Ziyaretçi oturumları
- `page_views` - Sayfa görüntülemeleri
- `visitor_actions` - Ziyaretçi eylemleri
- `active_visitors` - Aktif ziyaretçiler

## 🔐 GÜVENLİK AYARLARI

### 1. Güvenlik Başlıkları (Nginx):
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self'" always;
```

### 2. Firewall Ayarları:
```bash
# Sadece gerekli portları açın
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### 3. Dosya İzinleri:
```bash
chmod 755 /path/to/your/site
chmod 644 /path/to/your/site/.env
chmod 755 /path/to/your/site/uploads
```

## 📈 PERFORMANS OPTİMİZASYONU

### 1. Gzip Sıkıştırma (Nginx):
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 2. Cache Ayarları:
```nginx
location ~* \.(jpg|jpeg|png|gif|svg|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔄 YEDEKLEME STRATEJİSİ

### 1. Veritabanı Yedeği:
```bash
#!/bin/bash
# daily-backup.sh
DATE=$(date +%Y%m%d)
mysqldump -u akaydin_user -p'ŞİFRE' akaydin_tarim > backup_$DATE.sql
```

### 2. Dosya Yedeği:
```bash
#!/bin/bash
# file-backup.sh
DATE=$(date +%Y%m%d)
tar -czf backup_files_$DATE.tar.gz /path/to/your/site/uploads/
```

### 3. Otomatik Yedekleme (Crontab):
```bash
# Her gün saat 02:00'da yedek al
0 2 * * * /path/to/daily-backup.sh
0 3 * * * /path/to/file-backup.sh
```

## 📱 SSL SERTİFİKASI KURULUMU

### Let's Encrypt ile:
```bash
# Certbot kurulumu
sudo apt install certbot python3-certbot-nginx

# Sertifika alma
sudo certbot --nginx -d akaydintarim.com -d www.akaydintarim.com

# Otomatik yenileme
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐛 SORUN GİDERME

### 1. Log Dosyalarını Kontrol Etme:
```bash
# PM2 logları
pm2 logs akaydin-tarim

# Nginx logları
tail -f /var/log/nginx/error.log

# MySQL logları
tail -f /var/log/mysql/error.log
```

### 2. Yaygın Sorunlar:

#### Problem: 500 Internal Server Error
**Çözüm:**
- `.env` dosyasının doğru yapılandırıldığından emin olun
- Veritabanı bağlantı bilgilerini kontrol edin
- Node.js sunucusunun çalıştığından emin olun

#### Problem: Dosya yükleme çalışmıyor
**Çözüm:**
- `uploads/` klasörünün yazma izinleri olduğundan emin olun
- Nginx/Apache'de dosya boyutu sınırlarını kontrol edin

#### Problem: Admin paneline giriş yapamıyorum
**Çözüm:**
- `.env` dosyasındaki `ADMIN_PASSWORD` değerini kontrol edin
- Varsayılan şifre: `admin123`

## 📞 DESTEK

Kurulum sırasında sorun yaşarsanız:
- Hosting sağlayıcınızın teknik desteğine başvurun
- Node.js ve MySQL'in doğru kurulduğundan emin olun
- Log dosyalarını kontrol edin

## ✅ KURULUM SONRASI KONTROL LİSTESİ

- [ ] Veritabanı bağlantısı çalışıyor
- [ ] Frontend sayfa açılıyor
- [ ] Admin paneline giriş yapılabiliyor
- [ ] Dosya yükleme çalışıyor
- [ ] İletişim formu çalışıyor
- [ ] SSL sertifikası aktif
- [ ] Analytics çalışıyor
- [ ] Yedekleme sistemi aktif

---

**📅 Son Güncelleme:** 11 Temmuz 2025  
**📧 İletişim:** info@akaydintarim.com
