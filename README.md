# Akaydın Tarım Web Sitesi

Modern ve responsive bir tarım şirketi web sitesi. React frontend ve Node.js/Express backend kullanılarak geliştirilmiştir.

## 🚀 Özellikler

- **Modern Design**: Responsive ve kullanıcı dostu arayüz
- **Admin Panel**: İçerik yönetim sistemi
- **SEO Optimizasyonu**: Arama motoru optimizasyonu
- **Blog Sistemi**: Dinamik blog yazıları
- **Ürün Kataloğu**: Ürün yönetimi ve gösterimi
- **İletişim Formu**: Müşteri mesaj sistemi
- **Analitik**: Ziyaretçi takibi ve istatistikler
- **Fındık Fiyat Takibi**: Güncel fındık fiyatları

## 🛠️ Teknolojiler

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- React Icons
- React Helmet (SEO)

### Backend
- Node.js
- Express.js
- MySQL
- Multer (dosya yükleme)
- CORS

## 📦 Kurulum

1. **Repository'yi klonlayın:**
```bash
git clone https://github.com/yourusername/akaydin-tarim.git
cd akaydin-tarim
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment dosyasını oluşturun:**
```bash
cp .env.example .env
```

4. **Environment değişkenlerini düzenleyin:**
`.env` dosyasını açın ve kendi değerlerinizi girin.

5. **Veritabanını oluşturun:**
- MySQL'de `akaydin_tarim` adında bir veritabanı oluşturun
- `database/setup.sql` dosyasını çalıştırın

6. **Uygulamayı başlatın:**
```bash
npm run dev
```

## 🌐 Kullanım

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3003
- **Admin Panel**: http://localhost:5173/admin

### Admin Giriş Bilgileri
- Şifre: admin123 (üretimde değiştirin!)

## 📁 Proje Yapısı

```
akaydin-tarim/
├── components/          # React bileşenleri
├── pages/              # Sayfa bileşenleri
├── hooks/              # Custom React hooks
├── services/           # API servisleri
├── server/             # Backend kodu
├── database/           # Veritabanı dosyaları
├── uploads/            # Yüklenen dosyalar
├── public/             # Statik dosyalar
└── types.ts            # TypeScript tip tanımları
```

## 🔒 Güvenlik

- Üretim ortamında admin şifresini değiştirin
- Environment dosyalarını GitHub'a yüklemeyin
- Veritabanı şifrelerini güvenli tutun

## 🚀 Deployment

Detaylı deployment talimatları için `PRODUCTION_DEPLOYMENT_GUIDE.md` dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add some amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje özel lisansa sahiptir. Akaydın Tarım şirketi için geliştirilmiştir.

## 📞 İletişim

Proje hakkında sorularınız için iletişime geçin.
