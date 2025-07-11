
import React from 'react';
import type { Service, Product, BlogPost, IconProps, AboutPageContent, ContactPageContent } from './types';

// --- ICONS ---
const LeafIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 15.536A9.001 9.001 0 102.464 4.464l11.657 11.072zM12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const FactoryIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6" />
  </svg>
);

const BagIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const NutritionIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export const serviceIcons = {
  Consulting: LeafIcon,
  Processing: FactoryIcon,
  Fertilizer: BagIcon,
  Nutrition: NutritionIcon
};


// --- INITIAL DATA ---

export const INITIAL_SERVICES: Service[] = [
  {
    id: 's1',
    title: 'Fındık Üretimi Danışmanlığı',
    description: 'Modern tarım teknikleri ve uzman ekibimizle verimliliğinizi artırıyoruz. Toprak analizinden hasat planlamasına kadar yanınızdayız.',
    iconName: 'Consulting'
  },
  {
    id: 's2',
    title: 'Fındık İşleme Hizmetleri',
    description: 'Son teknoloji makinelerimizle fındık kırma, kavurma ve vakumlu paketleme hizmetleri sunuyoruz. Ürününüzün değerini koruyoruz.',
    iconName: 'Processing'
  },
  {
    id: 's3',
    title: 'Organomineral Gübre Bayiliği',
    description: 'Toprağınızın ihtiyacı olan zengin içerikli, yüksek kaliteli organomineral gübre çeşitlerimizle fındık bahçenizi canlandırın.',
    iconName: 'Fertilizer'
  },
  {
    id: 's4',
    title: 'Bitki Besleme Ürünleri',
    description: 'Bitkinizin her dönemde ihtiyaç duyduğu makro ve mikro elementleri içeren özel formüllü bitki besleme ürünleri sunuyoruz.',
    iconName: 'Nutrition'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Yüksek Verim Organik Gübre',
    description: 'Azot, fosfor ve potasyum dengesiyle fındıkta kök gelişimini ve meyve tutumunu destekler.',
    imageUrl: 'https://picsum.photos/400/300?random=10',
    category: 'Gübre'
  },
  {
    id: 'p2',
    name: 'Kavrulmuş Giresun Fındığı',
    description: 'Giresun\'un en kaliteli fındıklarından özenle kavrulmuş, 500g vakumlu paketlerde.',
    imageUrl: 'https://picsum.photos/400/300?random=11',
    category: 'İşlenmiş Fındık'
  },
  {
    id: 'p3',
    name: 'Yaprak Gübresi Plus',
    description: 'Fotosentezi hızlandıran ve hastalıklara karşı direnci artıran mikro elementli yaprak gübresi.',
    imageUrl: 'https://picsum.photos/400/300?random=12',
    category: 'Bitki Besleme'
  },
  {
    id: 'p4',
    name: 'Çiğ İç Fındık',
    description: 'Kırma tesislerimizde taze olarak hazırlanan, 1kg paketlerde yüksek randımanlı iç fındık.',
    imageUrl: 'https://picsum.photos/400/300?random=13',
    category: 'İşlenmiş Fındık'
  }
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: 'Fındıkta Külleme Hastalığı ile Mücadele',
    summary: 'Külleme, fındık verimini önemli ölçüde etkileyen bir mantar hastalığıdır. Bu yazımızda, külleme ile mücadelede kültürel ve kimyasal yöntemleri ele alıyoruz.',
    imageUrl: 'https://picsum.photos/400/250?random=20',
    date: '15 Temmuz 2024',
    author: 'Ziraat Müh. Ali Veli'
  },
  {
    id: 'b2',
    title: 'Doğru Gübreleme Zamanı Ne Zaman?',
    summary: 'Fındık bahçenizden maksimum verim almanın anahtarı doğru zamanda doğru gübreyi uygulamaktır. Toprak analizi sonuçlarına göre gübreleme takvimi...',
    imageUrl: 'https://picsum.photos/400/250?random=21',
    date: '28 Haziran 2024',
    author: 'Akaydın Tarım Ekibi'
  },
  {
    id: 'b3',
    title: 'Vakumlu Paketlemenin Fındık Kalitesine Etkisi',
    summary: 'Fındığın raf ömrünü uzatmak ve tazeliğini korumak için vakumlu paketleme neden önemlidir? Oksidasyonu önleme ve lezzeti muhafaza etme üzerine...',
    imageUrl: 'https://picsum.photos/400/250?random=22',
    date: '10 Haziran 2024',
    author: 'Gıda Müh. Ayşe Yılmaz'
  }
];

export const INITIAL_ABOUT_CONTENT: AboutPageContent = {
  mission: 'Çiftçilerimize en yenilikçi tarım teknolojilerini ve en kaliteli ürünleri sunarak, onların verimliliğini ve gelirini artırmak. Sürdürülebilir tarım uygulamalarını yaygınlaştırarak hem toprağımızı korumak hem de gelecek nesillere daha verimli araziler bırakmak en temel amacımızdır.',
  vision: 'Türkiye\'nin fındık ve tarım sektöründe, teknoloji kullanımı, danışmanlık hizmetleri ve ürün kalitesiyle referans gösterilen lider bir marka olmak. Tarımda dijital dönüşüme öncülük ederek, sektörü geleceğe taşımak.'
};

export const INITIAL_CONTACT_CONTENT: ContactPageContent = {
  company_name: 'Akaydın Tarım',
  address: 'Başpınar, Remzi Efendi Cd. No:24 D:b, 54300 Hendek/Sakarya',
  phone: '+90 (264) 123 45 67',
  whatsapp_phone: '905397751517', // WhatsApp sipariş hattı
  email: 'info@akaydintarim.com',
  website: '',
  working_hours: '',
  map_embed: '',
  facebook_url: '',
  instagram_url: '',
  twitter_url: '',
  linkedin_url: '',
  youtube_url: ''
};