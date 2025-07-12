// Memory-optimized imports
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

// Only import when needed - lazy loading
let multer;
let fs;
let axios;
let cron;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3003;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// MySQL bağlantısı
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'akaydin',
  password: process.env.DB_PASSWORD || '518518',
  database: process.env.DB_NAME || 'akaydin_tarim',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Lazy-loaded multer configuration
const getMulter = async () => {
  if (!multer) {
    multer = (await import('multer')).default;
  }
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  return multer({ storage: storage });
};

// SERVICES API
app.get('/api/services', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM services ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hizmetler alınırken hata oluştu' });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const { title, description, iconName } = req.body;
    const [result] = await db.execute(
      'INSERT INTO services (title, description, icon_name) VALUES (?, ?, ?)',
      [title, description, iconName]
    );
    res.json({ id: result.insertId, title, description, iconName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hizmet eklenirken hata oluştu' });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, iconName } = req.body;
    await db.execute(
      'UPDATE services SET title = ?, description = ?, icon_name = ? WHERE id = ?',
      [title, description, iconName, id]
    );
    res.json({ id, title, description, iconName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hizmet güncellenirken hata oluştu' });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM services WHERE id = ?', [id]);
    res.json({ message: 'Hizmet başarıyla silindi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hizmet silinirken hata oluştu' });
  }
});

// PRODUCTS API
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM products ORDER BY id DESC');
    
    // Images alanını parse et ve is_featured'ı boolean'a çevir
    const processedRows = rows.map(row => ({
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
      isFeatured: Boolean(row.is_featured) // Veritabanından gelen tinyint'i boolean'a çevir
    }));
    
    res.json(processedRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ürünler alınırken hata oluştu' });
  }
});

app.post('/api/products', upload.array('images', 10), async (req, res) => {
  try {
    const { name, description, category, is_featured } = req.body;
    const uploadedFiles = req.files || [];
    
    // Ana resim (ilk yüklenen resim)
    const imageUrl = uploadedFiles.length > 0 ? `/uploads/${uploadedFiles[0].filename}` : '';
    
    // Tüm resimlerin yollarını JSON olarak sakla
    const images = uploadedFiles.map(file => `/uploads/${file.filename}`);
    const imagesJson = JSON.stringify(images);
    
    const isFeatured = is_featured === 'true' || is_featured === true || is_featured === 1;
    
    const [result] = await db.execute(
      'INSERT INTO products (name, description, category, image_url, images, is_featured) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, category, imageUrl, imagesJson, isFeatured]
    );
    res.json({ 
      id: result.insertId, 
      name, 
      description, 
      category, 
      image_url: imageUrl,
      images: images,
      isFeatured: isFeatured
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ürün eklenirken hata oluştu' });
  }
});

app.put('/api/products/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, is_featured, deletedImages, keepExistingImages } = req.body;
    const uploadedFiles = req.files || [];
    
    // Mevcut images'ları al
    const [existing] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
    let currentImages = [];
    
    if (existing.length > 0 && existing[0].images) {
      try {
        currentImages = JSON.parse(existing[0].images);
      } catch {
        currentImages = [];
      }
    }
    
    let allImages = [];
    
    // Eğer keepExistingImages true ise ve yeni görsel yoksa, mevcut görselleri koru
    if (keepExistingImages === 'true' && uploadedFiles.length === 0) {
      allImages = currentImages;
    } else {
      // Silinen görselleri çıkar
      let updatedImages = currentImages;
      if (deletedImages) {
        const toDelete = JSON.parse(deletedImages);
        updatedImages = currentImages.filter(img => !toDelete.includes(img));
        
        // Fiziksel dosyaları sil
        toDelete.forEach(imagePath => {
          if (imagePath.startsWith('/uploads/')) {
            const fullPath = path.join(__dirname, '..', imagePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          }
        });
      }
      
      // Yeni yüklenen görselleri ekle
      const newImages = uploadedFiles.map(file => `/uploads/${file.filename}`);
      allImages = [...updatedImages, ...newImages];
    }
    
    // Ana resim (ilk resim)
    const imageUrl = allImages.length > 0 ? allImages[0] : existing[0]?.image_url || '';
    const imagesJson = JSON.stringify(allImages);
    
    const isFeatured = is_featured === 'true' || is_featured === true || is_featured === 1;
    
    await db.execute(
      'UPDATE products SET name = ?, description = ?, category = ?, image_url = ?, images = ?, is_featured = ? WHERE id = ?',
      [name, description, category, imageUrl, imagesJson, isFeatured, id]
    );
    res.json({ 
      id, 
      name, 
      description, 
      category, 
      image_url: imageUrl,
      images: allImages,
      isFeatured: isFeatured
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ürün güncellenirken hata oluştu' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Ürün başarıyla silindi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ürün silinirken hata oluştu' });
  }
});

// BLOG POSTS API
app.get('/api/blog-posts', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM blog_posts ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Blog yazıları alınırken hata oluştu' });
  }
});

app.post('/api/blog-posts', upload.single('image'), async (req, res) => {
  try {
    const { title, content, excerpt, author } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const [result] = await db.execute(
      'INSERT INTO blog_posts (title, summary, content, excerpt, author, date, image_url, views, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW())',
      [title, excerpt || '', content || '', excerpt || '', author || 'Akaydın Tarım', currentDate, imageUrl]
    );
    res.json({ 
      id: result.insertId, 
      title, 
      summary: excerpt || '',
      content: content || '', 
      excerpt: excerpt || '',
      author: author || 'Akaydın Tarım',
      date: currentDate,
      image_url: imageUrl,
      image: req.file ? req.file.filename : null,
      views: 0,
      created_at: new Date()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Blog yazısı eklenirken hata oluştu' });
  }
});

app.put('/api/blog-posts/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, author } = req.body;
    
    // Mevcut kayıt bilgilerini al
    const [existing] = await db.execute('SELECT * FROM blog_posts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Blog yazısı bulunamadı' });
    }
    
    let imageUrl = existing[0].image_url || '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    await db.execute(
      'UPDATE blog_posts SET title = ?, summary = ?, content = ?, excerpt = ?, author = ?, image_url = ?, updated_at = NOW() WHERE id = ?',
      [title, excerpt || '', content || '', excerpt || '', author || 'Akaydın Tarım', imageUrl, id]
    );
    
    res.json({ 
      id: parseInt(id), 
      title, 
      summary: excerpt || '',
      content: content || '', 
      excerpt: excerpt || '',
      author: author || 'Akaydın Tarım',
      date: existing[0].date,
      image_url: imageUrl,
      image: req.file ? req.file.filename : null,
      views: existing[0].views || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Blog yazısı güncellenirken hata oluştu' });
  }
});

app.delete('/api/blog-posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM blog_posts WHERE id = ?', [id]);
    res.json({ message: 'Blog yazısı başarıyla silindi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Blog yazısı silinirken hata oluştu' });
  }
});

// Blog okuma sayacını artır
app.post('/api/blog-posts/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('UPDATE blog_posts SET views = views + 1 WHERE id = ?', [id]);
    res.json({ message: 'View count updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'View count güncellenirken hata oluştu' });
  }
});

// Blog istatistikleri için endpoint
app.get('/api/blog-posts/stats', async (req, res) => {
  try {
    const [totalRows] = await db.execute('SELECT COUNT(*) as total FROM blog_posts');
    const [viewsRows] = await db.execute('SELECT SUM(views) as totalViews FROM blog_posts');
    const [topRows] = await db.execute('SELECT title, views FROM blog_posts ORDER BY views DESC LIMIT 5');
    
    res.json({
      totalPosts: totalRows[0].total,
      totalViews: viewsRows[0].totalViews || 0,
      topPosts: topRows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Blog istatistikleri alınırken hata oluştu' });
  }
});

// ABOUT PAGE API
app.get('/api/about', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM about_page LIMIT 1');
    const aboutData = rows[0] || { mission: '', vision: '', title: '', content: '', images: null };
    
    // JSON string'i parse et
    if (aboutData.images) {
      try {
        aboutData.images = JSON.parse(aboutData.images);
      } catch {
        aboutData.images = [];
      }
    } else {
      aboutData.images = [];
    }
    
    res.json(aboutData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hakkımızda bilgileri alınırken hata oluştu' });
  }
});

app.put('/api/about', upload.array('images', 10), async (req, res) => {
  try {
    const { title, content, mission, vision, deletedImages } = req.body;
    const uploadedFiles = req.files || [];
    
    // Mevcut images'ları al
    const [existing] = await db.execute('SELECT * FROM about_page LIMIT 1');
    let currentImages = [];
    
    if (existing.length > 0 && existing[0].images) {
      try {
        currentImages = JSON.parse(existing[0].images);
      } catch {
        currentImages = [];
      }
    }
    
    // Silinen görselleri çıkar
    let updatedImages = currentImages;
    if (deletedImages) {
      const toDelete = JSON.parse(deletedImages);
      updatedImages = currentImages.filter(img => !toDelete.includes(img));
      
      // Fiziksel dosyaları sil
      toDelete.forEach(imagePath => {
        if (imagePath.startsWith('/uploads/')) {
          const fullPath = path.join(__dirname, '..', imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      });
    }
    
    // Yeni yüklenen görselleri ekle
    const newImages = uploadedFiles.map(file => `/uploads/${file.filename}`);
    const allImages = [...updatedImages, ...newImages];
    
    const imagesJson = JSON.stringify(allImages);
    
    if (existing.length > 0) {
      await db.execute(
        'UPDATE about_page SET title = ?, content = ?, mission = ?, vision = ?, images = ? WHERE id = ?',
        [title || '', content || '', mission, vision, imagesJson, existing[0].id]
      );
    } else {
      await db.execute(
        'INSERT INTO about_page (title, content, mission, vision, images) VALUES (?, ?, ?, ?, ?)',
        [title || '', content || '', mission, vision, imagesJson]
      );
    }
    
    res.json({ 
      title: title || '', 
      content: content || '', 
      mission, 
      vision, 
      images: allImages 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hakkımızda bilgileri güncellenirken hata oluştu' });
  }
});

// About resim silme API
app.delete('/api/about/image', async (req, res) => {
  try {
    const { imagePath } = req.body;
    
    if (!imagePath) {
      return res.status(400).json({ error: 'Resim yolu gerekli' });
    }
    
    // Mevcut images'ları al
    const [existing] = await db.execute('SELECT * FROM about_page LIMIT 1');
    let currentImages = [];
    
    if (existing.length > 0 && existing[0].images) {
      try {
        currentImages = JSON.parse(existing[0].images);
      } catch {
        currentImages = [];
      }
    }
    
    // Resmi listeden çıkar
    const updatedImages = currentImages.filter(img => img !== imagePath);
    
    // Fiziksel dosyayı sil
    if (imagePath.startsWith('/uploads/')) {
      const fullPath = path.join(__dirname, '..', imagePath);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          // File deletion failed
        }
      }
    }
    
    // Veritabanını güncelle
    const imagesJson = JSON.stringify(updatedImages);
    
    if (existing.length > 0) {
      await db.execute(
        'UPDATE about_page SET images = ? WHERE id = ?',
        [imagesJson, existing[0].id]
      );
    }
    
    res.json({ 
      success: true, 
      message: 'Resim başarıyla silindi',
      images: updatedImages 
    });
  } catch (error) {
    console.error('Resim silme hatası:', error);
    res.status(500).json({ error: 'Resim silinirken hata oluştu' });
  }
});

// CONTACT PAGE API
app.get('/api/contact', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM contact_page LIMIT 1');
    res.json(rows[0] || { 
      company_name: 'Akaydın Tarım',
      address: '', 
      phone: '', 
      whatsapp_phone: '', 
      email: '',
      facebook_url: '',
      instagram_url: '',
      twitter_url: '',
      linkedin_url: '',
      youtube_url: '',
      website: '',
      working_hours: '',
      map_embed: ''
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'İletişim bilgileri alınırken hata oluştu' });
  }
});

app.put('/api/contact', async (req, res) => {
  try {
    const { 
      company_name,
      address, 
      phone, 
      whatsapp_phone, 
      email, 
      facebook_url,
      instagram_url,
      twitter_url,
      linkedin_url,
      youtube_url,
      website,
      working_hours,
      map_embed
    } = req.body;
    
    const [existing] = await db.execute('SELECT id FROM contact_page LIMIT 1');
    
    if (existing.length > 0) {
      await db.execute(
        `UPDATE contact_page SET 
         company_name = ?,
         address = ?, 
         phone = ?, 
         whatsapp_phone = ?, 
         email = ?, 
         facebook_url = ?, 
         instagram_url = ?, 
         twitter_url = ?, 
         linkedin_url = ?, 
         youtube_url = ?,
         website = ?,
         working_hours = ?,
         map_embed = ?
         WHERE id = ?`,
        [
          company_name || 'Akaydın Tarım', 
          address || '', 
          phone || '', 
          whatsapp_phone || '', 
          email || '', 
          facebook_url || '', 
          instagram_url || '', 
          twitter_url || '', 
          linkedin_url || '', 
          youtube_url || '',
          website || '',
          working_hours || '',
          map_embed || '',
          existing[0].id
        ]
      );
    } else {
      await db.execute(
        `INSERT INTO contact_page 
         (company_name, address, phone, whatsapp_phone, email, facebook_url, instagram_url, twitter_url, linkedin_url, youtube_url, website, working_hours, map_embed) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          company_name || 'Akaydın Tarım', 
          address || '', 
          phone || '', 
          whatsapp_phone || '', 
          email || '', 
          facebook_url || '', 
          instagram_url || '', 
          twitter_url || '', 
          linkedin_url || '', 
          youtube_url || '',
          website || '',
          working_hours || '',
          map_embed || ''
        ]
      );
    }
    
    res.json({ 
      company_name: company_name || 'Akaydın Tarım',
      address: address || '', 
      phone: phone || '', 
      whatsapp_phone: whatsapp_phone || '', 
      email: email || '', 
      facebook_url: facebook_url || '', 
      instagram_url: instagram_url || '', 
      twitter_url: twitter_url || '', 
      linkedin_url: linkedin_url || '', 
      youtube_url: youtube_url || '',
      website: website || '',
      working_hours: working_hours || '',
      map_embed: map_embed || ''
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'İletişim bilgileri güncellenirken hata oluştu' });
  }
});

// CONTACT MESSAGES API
app.post('/api/contact/messages', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Ad, email ve mesaj alanları zorunludur' });
    }

    const [result] = await db.execute(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone === undefined ? null : phone, subject === undefined ? null : subject, message]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Mesajınız başarıyla gönderildi',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Contact message error:', error);
    res.status(500).json({ error: 'Mesaj gönderilirken hata oluştu' });
  }
});

app.get('/api/contact/messages', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM contact_messages ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ error: 'Mesajlar alınırken hata oluştu' });
  }
});

app.put('/api/contact/messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute(
      'UPDATE contact_messages SET is_read = TRUE WHERE id = ?',
      [id]
    );
    res.json({ success: true, message: 'Mesaj okundu olarak işaretlendi' });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ error: 'Mesaj güncellenirken hata oluştu' });
  }
});

app.delete('/api/contact/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM contact_messages WHERE id = ?', [id]);
    res.json({ success: true, message: 'Mesaj silindi' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Mesaj silinirken hata oluştu' });
  }
});

// HERO API
app.get('/api/hero', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM hero_content ORDER BY order_index ASC');
    res.json(rows);
  } catch (error) {
    console.error('Hero içeriği alınırken hata:', error);
    res.status(500).json({ error: 'Hero içeriği alınırken hata oluştu' });
  }
});

app.post('/api/hero', upload.single('background_image'), async (req, res) => {
  try {
    const { title, subtitle, description, cta, background_gradient, is_active, order_index } = req.body;
    const backgroundImage = req.file ? req.file.filename : null;

    const [result] = await db.execute(
      'INSERT INTO hero_content (title, subtitle, description, cta, background_gradient, background_image, is_active, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, subtitle, description, cta, background_gradient, backgroundImage, is_active === 'true', parseInt(order_index) || 1]
    );

    res.json({ 
      id: result.insertId, 
      title, 
      subtitle, 
      description, 
      cta, 
      background_gradient: background_gradient,
      background_image: backgroundImage,
      is_active: is_active === 'true',
      order_index: parseInt(order_index) || 1
    });
  } catch (error) {
    console.error('Hero içeriği eklenirken hata:', error);
    res.status(500).json({ error: 'Hero içeriği eklenirken hata oluştu' });
  }
});

app.put('/api/hero/:id', upload.single('background_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, cta, background_gradient, is_active, order_index } = req.body;
    const backgroundImage = req.file ? req.file.filename : null;

    let query = 'UPDATE hero_content SET title = ?, subtitle = ?, description = ?, cta = ?, background_gradient = ?, is_active = ?, order_index = ?';
    let values = [title, subtitle, description, cta, background_gradient, is_active === 'true', parseInt(order_index) || 1];

    if (backgroundImage) {
      query += ', background_image = ?';
      values.push(backgroundImage);
    }

    query += ' WHERE id = ?';
    values.push(id);

    await db.execute(query, values);

    res.json({ 
      id: parseInt(id), 
      title, 
      subtitle, 
      description, 
      cta, 
      background_gradient: background_gradient,
      background_image: backgroundImage,
      is_active: is_active === 'true',
      order_index: parseInt(order_index) || 1
    });
  } catch (error) {
    console.error('Hero içeriği güncellenirken hata:', error);
    res.status(500).json({ error: 'Hero içeriği güncellenirken hata oluştu' });
  }
});

app.delete('/api/hero/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM hero_content WHERE id = ?', [id]);
    res.json({ message: 'Hero içeriği silindi' });
  } catch (error) {
    console.error('Hero içeriği silinirken hata:', error);
    res.status(500).json({ error: 'Hero içeriği silinirken hata oluştu' });
  }
});

app.put('/api/hero/order', async (req, res) => {
  try {
    const { items } = req.body;
    
    for (const item of items) {
      await db.execute('UPDATE hero_content SET order_index = ? WHERE id = ?', [item.order, item.id]);
    }
    
    res.json({ message: 'Sıralama güncellendi' });
  } catch (error) {
    console.error('Hero sıralaması güncellenirken hata:', error);
    res.status(500).json({ error: 'Sıralama güncellenirken hata oluştu' });
  }
});

// HAZELNUT PRICES API
app.get('/api/hazelnut-prices', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM hazelnut_prices ORDER BY updated_at DESC LIMIT 1');
    if (rows.length === 0) {
      // Varsayılan fiyatlar döndür
      res.json({
        id: 1,
        tmo_price: 45.50,
        borsa_price: 46.70,
        serbest_price: 48.00,
        daily_change: 2.30,
        change_percentage: 5.2,
        updated_at: new Date()
      });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    console.error('Fındık fiyatları alınırken hata:', error);
    res.status(500).json({ error: 'Fındık fiyatları alınırken hata oluştu' });
  }
});

// HAZELNUT PRICES API
app.get('/api/hazelnut-prices', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM hazelnut_prices ORDER BY created_at DESC LIMIT 1');
    if (rows.length === 0) {
      // Varsayılan değerler
      res.json({
        id: 1,
        price: 48.00,
        daily_change: 0.00,
        change_percentage: 0.00,
        source: 'manual',
        update_mode: 'manual',
        scraping_enabled: true,
        notes: '',
        created_at: new Date(),
        updated_at: new Date()
      });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    console.error('Fındık fiyatları yüklenirken hata:', error);
    res.status(500).json({ error: 'Fındık fiyatları yüklenirken hata oluştu' });
  }
});

// Fiyat geçmişi
app.get('/api/hazelnut-prices/history', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM hazelnut_prices ORDER BY created_at DESC LIMIT 50');
    res.json(rows);
  } catch (error) {
    console.error('Fiyat geçmişi yüklenirken hata:', error);
    res.status(500).json({ error: 'Fiyat geçmişi yüklenirken hata oluştu' });
  }
});

// Yeni fiyat kaydı oluştur
app.post('/api/hazelnut-prices', async (req, res) => {
  try {
    const { price, daily_change, change_percentage, source, update_mode, scraping_enabled, notes } = req.body;
    
    const [result] = await db.execute(
      'INSERT INTO hazelnut_prices (price, daily_change, change_percentage, source, update_mode, scraping_enabled, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [price || 0, daily_change || 0, change_percentage || 0, source || 'manual', update_mode || 'manual', scraping_enabled !== undefined ? scraping_enabled : true, notes || '']
    );
    
    res.json({ 
      id: result.insertId,
      message: 'Fındık fiyatı kaydedildi',
      price,
      daily_change,
      change_percentage
    });
  } catch (error) {
    console.error('Fındık fiyatı kaydedilirken hata:', error);
    res.status(500).json({ error: 'Fındık fiyatı kaydedilirken hata oluştu' });
  }
});

app.put('/api/hazelnut-prices', async (req, res) => {
  try {
    const { price, daily_change, change_percentage, source, update_mode, scraping_enabled, notes } = req.body;
    
    // En son kaydı güncelle (update ayarları için)
    const [latest] = await db.execute('SELECT id FROM hazelnut_prices ORDER BY created_at DESC LIMIT 1');
    
    if (latest.length > 0) {
      await db.execute(
        'UPDATE hazelnut_prices SET update_mode = ?, scraping_enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [update_mode || 'manual', scraping_enabled !== undefined ? scraping_enabled : true, latest[0].id]
      );
    }
    
    res.json({ message: 'Fındık fiyat ayarları güncellendi' });
  } catch (error) {
    console.error('Fındık fiyat ayarları güncellenirken hata:', error);
    res.status(500).json({ error: 'Fındık fiyat ayarları güncellenirken hata oluştu' });
  }
});

// Web scraping endpoint for hazelnut prices
app.post('/api/hazelnut-prices/scrape', async (req, res) => {
  try {
    // Web scraping fonksiyonu
    const scrapePrices = async () => {
      try {
        const response = await axios.get('https://www.findiktv.com/urunler/findik/sakarya/fiyati', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          timeout: 10000
        });
        
        // Lazy import cheerio sadece gerektiğinde
        const { load } = await import('cheerio');
        const $ = load(response.data);
        
        // Fiyatları bul - sayfa yapısına göre
        let scrapedPrice = null;
        
        // İlk yöntem: Text içinde ₺ ile başlayan ikinci fiyatı bul
        const bodyText = $('body').text();
        const priceMatches = bodyText.match(/₺(\d{1,3}(?:,\d{2})?)/g);
        
        if (priceMatches && priceMatches.length >= 2) {
          // İkinci fiyatı al
          const priceString = priceMatches[1].replace('₺', '').replace(',', '.');
          scrapedPrice = parseFloat(priceString);
        }
        
        // İkinci yöntem: Spesifik CSS selector'ları dene
        if (!scrapedPrice || isNaN(scrapedPrice)) {
          const selectors = [
            '.price-value',
            '.fiyat',
            '.price',
            '[class*="fiyat"]',
            '[class*="price"]'
          ];
          
          for (const selector of selectors) {
            const elements = $(selector);
            if (elements.length >= 2) {
              const secondElement = elements.eq(1);
              const text = secondElement.text().trim();
              const match = text.match(/(\d{1,3}(?:,\d{2})?)/);
              if (match) {
                scrapedPrice = parseFloat(match[1].replace(',', '.'));
                break;
              }
            }
          }
        }
        
        // Üçüncü yöntem: Tüm sayısal değerleri kontrol et
        if (!scrapedPrice || isNaN(scrapedPrice) || scrapedPrice < 100 || scrapedPrice > 300) {
          const allNumbers = bodyText.match(/\d{3},\d{2}/g);
          if (allNumbers && allNumbers.length >= 2) {
            scrapedPrice = parseFloat(allNumbers[1].replace(',', '.'));
          }
        }
        
        if (!scrapedPrice || isNaN(scrapedPrice)) {
          throw new Error('Geçerli fiyat bulunamadı');
        }
        
        // Makul bir fiyat aralığında olup olmadığını kontrol et
        if (scrapedPrice < 100 || scrapedPrice > 300) {
          throw new Error(`Geçersiz fiyat aralığı: ${scrapedPrice}`);
        }
        
        // Mevcut fiyatları al
        const [current] = await db.execute('SELECT * FROM hazelnut_prices ORDER BY created_at DESC LIMIT 1');
        
        let dailyChange = 0;
        let changePercentage = 0;
        
        if (current.length > 0 && current[0].price) {
          dailyChange = scrapedPrice - current[0].price;
          changePercentage = (dailyChange / current[0].price) * 100;
        }
        
        // En son kaydın update_mode ve scraping_enabled ayarlarını al
        let updateMode = 'manual';
        let scrapingEnabled = true;
        
        if (current.length > 0) {
          updateMode = current[0].update_mode || 'manual';
          scrapingEnabled = current[0].scraping_enabled !== undefined ? current[0].scraping_enabled : true;
        }
        
        // Scraped price'ı yeni kayıt olarak ekle
        const [result] = await db.execute(
          'INSERT INTO hazelnut_prices (price, daily_change, change_percentage, source, scraped_price, last_scraped_at, update_mode, scraping_enabled, notes) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?)',
          [scrapedPrice, dailyChange, changePercentage, 'scraped', scrapedPrice, updateMode, scrapingEnabled, `Otomatik scraping - ${new Date().toLocaleString('tr-TR')}`]
        );
        
        return {
          success: true,
          scrapedPrice,
          dailyChange,
          changePercentage,
          timestamp: new Date(),
          recordId: result.insertId
        };
      } catch (error) {
        console.error('Scraping hatası:', error.message);
        throw error;
      }
    };
    
    const result = await scrapePrices();
    res.json(result);
  } catch (error) {
    console.error('Fındık fiyat scraping hatası:', error);
    res.status(500).json({ 
      error: 'Fiyat çekme işlemi başarısız oldu',
      details: error.message 
    });
  }
});

// Otomatik mod durumunda scraped price'ı serbest_price olarak güncelle
app.post('/api/hazelnut-prices/apply-scraped', async (req, res) => {
  try {
    const [current] = await db.execute('SELECT * FROM hazelnut_prices ORDER BY created_at DESC LIMIT 1');
    
    if (current.length > 0 && current[0].scraped_price && current[0].update_mode === 'automatic') {
      const scrapedPrice = current[0].scraped_price;
      
      // Yeni kayıt oluştur
      const [result] = await db.execute(
        'INSERT INTO hazelnut_prices (price, daily_change, change_percentage, source, update_mode, scraping_enabled, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [scrapedPrice, current[0].daily_change || 0, current[0].change_percentage || 0, 'scraped', current[0].update_mode, current[0].scraping_enabled, `Scraped fiyat uygulandı - ${new Date().toLocaleString('tr-TR')}`]
      );
      
      res.json({ 
        message: 'Scraped fiyat yeni kayıt olarak uygulandı',
        price: scrapedPrice,
        recordId: result.insertId
      });
    } else {
      res.json({ message: 'Uygulanacak scraped fiyat bulunamadı veya manuel mod aktif' });
    }
  } catch (error) {
    console.error('Scraped fiyat uygulama hatası:', error);
    res.status(500).json({ error: 'Scraped fiyat uygulanırken hata oluştu' });
  }
});

// Otomatik fiyat scraping - 4 saatte bir çalışır
const autoScrapeJob = cron.schedule('0 */4 * * *', async () => {
  try {
    // Önce scraping enabled ve automatic mode kontrolü yap
    const [settings] = await db.execute('SELECT * FROM hazelnut_prices ORDER BY updated_at DESC LIMIT 1');
    
    if (settings.length > 0 && settings[0].scraping_enabled && settings[0].update_mode === 'automatic') {
      // Scraping yap
      const response = await axios.get('https://www.findiktv.com/urunler/findik/sakarya/fiyati', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });
      
      // Lazy import cheerio sadece gerektiğinde
      const { load } = await import('cheerio');
      const $ = load(response.data);
      
      // Fiyat çıkarma (aynı logic scrape endpoint'i ile)
      let scrapedPrice = null;
      const bodyText = $('body').text();
      const priceMatches = bodyText.match(/₺(\d{1,3}(?:,\d{2})?)/g);
      
      if (priceMatches && priceMatches.length >= 2) {
        const priceString = priceMatches[1].replace('₺', '').replace(',', '.');
        scrapedPrice = parseFloat(priceString);
      }
      
      if (scrapedPrice && !isNaN(scrapedPrice) && scrapedPrice >= 100 && scrapedPrice <= 300) {
        // Scraped price'ı güncelle
        await db.execute(
          'UPDATE hazelnut_prices SET scraped_price = ?, last_scraped_at = CURRENT_TIMESTAMP WHERE id = ?',
          [scrapedPrice, settings[0].id]
        );
        
        // Otomatik mod ise serbest_price'ı da güncelle
        const currentPrice = settings[0].serbest_price || 0;
        const dailyChange = scrapedPrice - currentPrice;
        const changePercentage = currentPrice > 0 ? (dailyChange / currentPrice) * 100 : 0;
        
        await db.execute(
          'UPDATE hazelnut_prices SET serbest_price = ?, daily_change = ?, change_percentage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [scrapedPrice, dailyChange, changePercentage, settings[0].id]
        );
        
        console.log(`Otomatik fiyat güncellendi: ${scrapedPrice} TL`);
      }
    } else {
      // Settings not suitable for automatic scraping
    }
  } catch (error) {
    // Automatic scraping failed
  }
}, {
  timezone: 'Europe/Istanbul'
});

// Server başlatıldığında cron job'ı başlat
autoScrapeJob.start();

// SEO API ENDPOINTS
// =================

// SEO Settings
app.get('/api/seo/settings', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM seo_settings LIMIT 1');
    res.json(rows[0] || {
      site_title: 'Akaydın Tarım - Fındık Üretimi ve Satışı',
      site_description: 'Hendek/Sakarya\'da kaliteli fındık üretimi ve satışı. Organik tarım ürünleri.',
      site_keywords: 'fındık, tarım, hendek, sakarya, organik',
      site_author: 'Akaydın Tarım',
      og_title: 'Akaydın Tarım - Premium Fındık Üreticisi',
      og_description: 'Hendek/Sakarya\'da kaliteli fındık üretimi',
      og_image: '',
      og_url: 'https://www.akaydintarim.com',
      twitter_card: 'summary_large_image',
      twitter_site: '@akaydintarim',
      twitter_creator: '@akaydintarim',
      canonical_url: 'https://www.akaydintarim.com',
      robots_txt: 'User-agent: *\\nAllow: /\\nSitemap: https://www.akaydintarim.com/sitemap.xml',
      google_analytics_id: '',
      google_search_console: '',
      facebook_pixel_id: '',
      schema_organization: '',
      sitemap_enabled: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SEO ayarları alınırken hata oluştu' });
  }
});

app.put('/api/seo/settings', async (req, res) => {
  try {
    const {
      site_title, site_description, site_keywords, site_author,
      og_title, og_description, og_image, og_url,
      twitter_card, twitter_site, twitter_creator,
      canonical_url, robots_txt,
      google_analytics_id, google_search_console, facebook_pixel_id,
      schema_organization, sitemap_enabled
    } = req.body;

    const [existing] = await db.execute('SELECT id FROM seo_settings LIMIT 1');
    
    if (existing.length > 0) {
      await db.execute(
        `UPDATE seo_settings SET 
         site_title = ?, site_description = ?, site_keywords = ?, site_author = ?,
         og_title = ?, og_description = ?, og_image = ?, og_url = ?,
         twitter_card = ?, twitter_site = ?, twitter_creator = ?,
         canonical_url = ?, robots_txt = ?,
         google_analytics_id = ?, google_search_console = ?, facebook_pixel_id = ?,
         schema_organization = ?, sitemap_enabled = ?
         WHERE id = ?`,
        [
          site_title, site_description, site_keywords, site_author,
          og_title, og_description, og_image, og_url,
          twitter_card, twitter_site, twitter_creator,
          canonical_url, robots_txt,
          google_analytics_id, google_search_console, facebook_pixel_id,
          schema_organization, sitemap_enabled,
          existing[0].id
        ]
      );
    } else {
      await db.execute(
        `INSERT INTO seo_settings 
         (site_title, site_description, site_keywords, site_author,
          og_title, og_description, og_image, og_url,
          twitter_card, twitter_site, twitter_creator,
          canonical_url, robots_txt,
          google_analytics_id, google_search_console, facebook_pixel_id,
          schema_organization, sitemap_enabled) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          site_title, site_description, site_keywords, site_author,
          og_title, og_description, og_image, og_url,
          twitter_card, twitter_site, twitter_creator,
          canonical_url, robots_txt,
          google_analytics_id, google_search_console, facebook_pixel_id,
          schema_organization, sitemap_enabled
        ]
      );
    }
    
    res.json({ message: 'SEO ayarları güncellendi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SEO ayarları güncellenirken hata oluştu' });
  }
});

// Page SEO
app.get('/api/seo/pages', async (req, res) => {
  try {
    const { path } = req.query;
    if (path) {
      const [rows] = await db.execute('SELECT * FROM page_seo WHERE page_path = ?', [path]);
      res.json(rows[0] || null);
    } else {
      const [rows] = await db.execute('SELECT * FROM page_seo ORDER BY page_path');
      res.json(rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sayfa SEO verileri alınırken hata oluştu' });
  }
});

app.post('/api/seo/pages', async (req, res) => {
  try {
    const {
      page_path, page_title, meta_description, meta_keywords,
      og_title, og_description, og_image, canonical_url,
      noindex, nofollow
    } = req.body;

    await db.execute(
      `INSERT INTO page_seo 
       (page_path, page_title, meta_description, meta_keywords,
        og_title, og_description, og_image, canonical_url,
        noindex, nofollow) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        page_path, page_title, meta_description, meta_keywords,
        og_title, og_description, og_image, canonical_url,
        noindex || false, nofollow || false
      ]
    );
    
    res.json({ message: 'Sayfa SEO ayarı eklendi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sayfa SEO ayarı eklenirken hata oluştu' });
  }
});

app.put('/api/seo/pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page_path, page_title, meta_description, meta_keywords,
      og_title, og_description, og_image, canonical_url,
      noindex, nofollow
    } = req.body;

    await db.execute(
      `UPDATE page_seo SET 
       page_path = ?, page_title = ?, meta_description = ?, meta_keywords = ?,
       og_title = ?, og_description = ?, og_image = ?, canonical_url = ?,
       noindex = ?, nofollow = ?
       WHERE id = ?`,
      [
        page_path, page_title, meta_description, meta_keywords,
        og_title, og_description, og_image, canonical_url,
        noindex || false, nofollow || false, id
      ]
    );
    
    res.json({ message: 'Sayfa SEO ayarı güncellendi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sayfa SEO ayarı güncellenirken hata oluştu' });
  }
});

app.delete('/api/seo/pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM page_seo WHERE id = ?', [id]);
    res.json({ message: 'Sayfa SEO ayarı silindi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sayfa SEO ayarı silinirken hata oluştu' });
  }
});

// SEO Analysis
app.get('/api/seo/analyze', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL parametresi gerekli' });
    }

    // Basit SEO analizi simülasyonu
    const analysis = {
      page_url: url,
      title_length: Math.floor(Math.random() * 80) + 20,
      description_length: Math.floor(Math.random() * 200) + 50,
      keywords_density: {
        'fındık': 3.2,
        'tarım': 2.1,
        'organik': 1.8
      },
      has_meta_description: true,
      has_og_tags: true,
      has_canonical: true,
      images_without_alt: Math.floor(Math.random() * 5),
      internal_links: Math.floor(Math.random() * 20) + 5,
      external_links: Math.floor(Math.random() * 10) + 2,
      page_speed_score: Math.floor(Math.random() * 40) + 60,
      mobile_friendly: true,
      recommendations: [
        'Meta açıklaması 160 karakteri geçmemeli',
        'Başlık etiketine ana anahtar kelimeler eklenebilir',
        'Alt metni olmayan görseller için alt açıklaması ekleyin',
        'İç bağlantıları artırarak sayfa otoritesini güçlendirin',
        'Schema markup kullanarak yapılandırılmış veri ekleyin'
      ]
    };

    res.json(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SEO analizi yapılırken hata oluştu' });
  }
});

// Sitemap
app.post('/api/seo/sitemap', async (req, res) => {
  try {
    // Sitemap oluşturma simülasyonu
    res.json({ message: 'Sitemap başarıyla yeniden oluşturuldu' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sitemap oluşturulurken hata oluştu' });
  }
});

app.get('/api/seo/sitemap', async (req, res) => {
  try {
    res.json({ url: '/sitemap.xml', last_generated: new Date().toISOString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sitemap bilgileri alınırken hata oluştu' });
  }
});

// Robots.txt
app.put('/api/seo/robots', async (req, res) => {
  try {
    const { content } = req.body;
    // Robots.txt güncelleme simülasyonu
    res.json({ message: 'Robots.txt güncellendi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Robots.txt güncellenirken hata oluştu' });
  }
});

app.get('/api/seo/robots', async (req, res) => {
  try {
    res.json({ content: 'User-agent: *\nAllow: /\nSitemap: https://www.akaydintarim.com/sitemap.xml' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Robots.txt alınırken hata oluştu' });
  }
});

// ANALYTICS API
// Helper function to get client IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip;
};

// Create visitor session
app.post('/api/analytics/sessions', async (req, res) => {
  try {
    const {
      session_id,
      user_agent,
      country,
      city,
      device_type,
      browser,
      operating_system,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign
    } = req.body;

    // Validate required parameters
    if (!session_id) {
      return res.status(400).json({ error: 'session_id is required' });
    }

    const ip_address = getClientIP(req);

    // Check if session already exists
    const [existingSessions] = await db.execute(
      'SELECT id FROM visitor_sessions WHERE session_id = ?',
      [session_id]
    );

    if (existingSessions.length > 0) {
      // Update existing session
      await db.execute(
        `UPDATE visitor_sessions SET 
         last_activity_at = CURRENT_TIMESTAMP,
         ip_address = COALESCE(ip_address, ?),
         country = COALESCE(country, ?),
         city = COALESCE(city, ?)
         WHERE session_id = ?`,
        [ip_address || null, country || null, city || null, session_id]
      );
      res.json({ session_id, updated: true });
    } else {
      // Create new session with proper null handling
      await db.execute(
        `INSERT INTO visitor_sessions (
          session_id, ip_address, user_agent, country, city, 
          device_type, browser, operating_system, referrer,
          utm_source, utm_medium, utm_campaign
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          session_id,
          ip_address || null,
          user_agent || null,
          country || null,
          city || null,
          device_type || null,
          browser || null,
          operating_system || null,
          referrer || null,
          utm_source || null,
          utm_medium || null,
          utm_campaign || null
        ]
      );
      res.json({ session_id, created: true });
    }
  } catch (error) {
    console.error('Analytics session error:', error);
    res.status(500).json({ error: 'Session oluşturulurken hata oluştu' });
  }
});

// Update visitor session
app.put('/api/analytics/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { last_activity_at, session_duration, total_page_views, is_bounce } = req.body;

    // Convert undefined values to null for MySQL compatibility
    const sanitizedData = [
      last_activity_at === undefined ? null : last_activity_at,
      session_duration === undefined ? null : session_duration,
      total_page_views === undefined ? null : total_page_views,
      is_bounce === undefined ? null : is_bounce,
      sessionId
    ];

    await db.execute(
      `UPDATE visitor_sessions SET 
       last_activity_at = COALESCE(?, last_activity_at),
       session_duration = COALESCE(?, session_duration),
       total_page_views = COALESCE(?, total_page_views),
       is_bounce = COALESCE(?, is_bounce)
       WHERE session_id = ?`,
      sanitizedData
    );

    res.json({ sessionId, updated: true });
  } catch (error) {
    console.error('Analytics session update error:', error);
    res.status(500).json({ error: 'Session güncellenirken hata oluştu' });
  }
});

// Track page view
app.post('/api/analytics/page-views', async (req, res) => {
  try {
    const {
      session_id,
      page_path,
      page_title,
      referrer,
      time_on_page,
      scroll_percentage,
      exit_page
    } = req.body;

    // Validate required parameters
    if (!session_id || !page_path) {
      return res.status(400).json({ error: 'session_id and page_path are required' });
    }

    // Check if session exists, create if not
    const [existingSessions] = await db.execute(
      'SELECT id FROM visitor_sessions WHERE session_id = ?',
      [session_id]
    );

    if (existingSessions.length === 0) {
      // Create session if it doesn't exist
      const ip_address = getClientIP(req);
      await db.execute(
        `INSERT INTO visitor_sessions (
          session_id, ip_address, user_agent, device_type, browser, operating_system
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          session_id,
          ip_address || null,
          req.get('User-Agent') || null,
          'unknown',
          'unknown',
          'unknown'
        ]
      );
    }

    // Convert undefined values to null for MySQL compatibility
    const sanitizedData = [
      session_id,
      page_path,
      page_title || null,
      referrer || null,
      time_on_page || 0,
      scroll_percentage || 0,
      exit_page || false
    ];

    await db.execute(
      `INSERT INTO page_views (
        session_id, page_path, page_title, referrer,
        time_on_page, scroll_percentage, exit_page
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      sanitizedData
    );

    // Update session page count
    await db.execute(
      'UPDATE visitor_sessions SET total_page_views = total_page_views + 1 WHERE session_id = ?',
      [session_id]
    );

    res.json({ tracked: true });
  } catch (error) {
    console.error('Page view tracking error:', error);
    res.status(500).json({ error: 'Sayfa görüntülemesi kaydedilirken hata oluştu' });
  }
});

// Update page view (for sendBeacon)
app.post('/api/analytics/page-views/update', async (req, res) => {
  try {
    const {
      session_id,
      page_path,
      time_on_page,
      scroll_percentage,
      exit_page
    } = req.body;

    if (!session_id || !page_path) {
      return res.status(400).json({ error: 'session_id and page_path are required' });
    }

    // Check if session exists, create if not
    const [existingSessions] = await db.execute(
      'SELECT id FROM visitor_sessions WHERE session_id = ?',
      [session_id]
    );

    if (existingSessions.length === 0) {
      // Create session if it doesn't exist
      const ip_address = getClientIP(req);
      await db.execute(
        `INSERT INTO visitor_sessions (
          session_id, ip_address, user_agent, device_type, browser, operating_system
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          session_id,
          ip_address || null,
          req.get('User-Agent') || null,
          'unknown',
          'unknown',
          'unknown'
        ]
      );
    }

    // Update the most recent page view for this session and path
    await db.execute(
      `UPDATE page_views SET 
       time_on_page = COALESCE(?, time_on_page),
       scroll_percentage = GREATEST(COALESCE(?, 0), scroll_percentage),
       exit_page = COALESCE(?, exit_page)
       WHERE session_id = ? AND page_path = ?
       ORDER BY viewed_at DESC LIMIT 1`,
      [
        time_on_page || null,
        scroll_percentage || null,
        exit_page !== undefined ? exit_page : null,
        session_id,
        page_path
      ]
    );

    res.json({ updated: true });
  } catch (error) {
    console.error('Page view update error:', error);
    res.status(500).json({ error: 'Sayfa görüntülemesi güncellenirken hata oluştu' });
  }
});

// Track visitor action
app.post('/api/analytics/actions', async (req, res) => {
  try {
    const {
      session_id,
      action_type,
      element_selector,
      element_text,
      page_path,
      additional_data
    } = req.body;

    // Convert undefined values to null for MySQL compatibility
    const sanitizedData = [
      session_id === undefined ? null : session_id,
      action_type === undefined ? null : action_type,
      element_selector === undefined ? null : element_selector,
      element_text === undefined ? null : element_text,
      page_path === undefined ? null : page_path,
      additional_data === undefined ? null : (additional_data ? JSON.stringify(additional_data) : null)
    ];

    await db.execute(
      `INSERT INTO visitor_actions (
        session_id, action_type, element_selector, element_text,
        page_path, additional_data
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      sanitizedData
    );

    res.json({ tracked: true });
  } catch (error) {
    console.error('Action tracking error:', error);
    res.status(500).json({ error: 'Eylem kaydedilirken hata oluştu' });
  }
});

// Generate test data endpoint
app.post('/api/analytics/generate-test-data', async (req, res) => {
  try {
    // Generate 50 test sessions over the last 7 days
    for (let i = 0; i < 50; i++) {
      const sessionId = `test_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const devices = ['desktop', 'mobile', 'tablet'];
      const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
      const countries = ['TR', 'US', 'DE', 'FR', 'UK'];
      const cities = ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya'];
      const pages = ['/', '/about', '/services', '/products', '/blog', '/contact'];
      
      const device = devices[Math.floor(Math.random() * devices.length)];
      const browser = browsers[Math.floor(Math.random() * browsers.length)];
      const country = countries[Math.floor(Math.random() * countries.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      
      // Create session
      const sessionDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      await db.execute(
        `INSERT INTO visitor_sessions (
          session_id, ip_address, user_agent, country, city, 
          device_type, browser, operating_system, 
          first_visit_at, last_activity_at, total_page_views, 
          session_duration, is_bounce, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionId,
          `192.168.1.${Math.floor(Math.random() * 255)}`,
          `Mozilla/5.0 (${device}) ${browser}`,
          country,
          city,
          device,
          browser,
          device === 'mobile' ? 'Android' : 'Windows',
          sessionDate,
          new Date(sessionDate.getTime() + Math.random() * 60 * 60 * 1000),
          Math.floor(Math.random() * 10) + 1,
          Math.floor(Math.random() * 600) + 30,
          Math.random() > 0.7,
          Math.random() > 0.8
        ]
      );
      
      // Create page views for this session
      const pageCount = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < pageCount; j++) {
        const page = pages[Math.floor(Math.random() * pages.length)];
        const viewDate = new Date(sessionDate.getTime() + j * 30000);
        
        await db.execute(
          `INSERT INTO page_views (
            session_id, page_path, page_title, 
            time_on_page, scroll_percentage, viewed_at
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            sessionId,
            page,
            `Test Page ${page}`,
            Math.floor(Math.random() * 300) + 10,
            Math.floor(Math.random() * 100),
            viewDate
          ]
        );
      }
      
      // Create some actions
      if (Math.random() > 0.5) {
        const actions = ['click', 'scroll', 'contact'];
        const action = actions[Math.floor(Math.random() * actions.length)];
        
        await db.execute(
          `INSERT INTO visitor_actions (
            session_id, action_type, page_path, action_at
          ) VALUES (?, ?, ?, ?)`,
          [
            sessionId,
            action,
            pages[Math.floor(Math.random() * pages.length)],
            sessionDate
          ]
        );
      }
    }
    
    // Create some active visitors
    for (let i = 0; i < 5; i++) {
      const sessionId = `active_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const pages = ['/', '/about', '/services', '/products'];
      
      await db.execute(
        `INSERT INTO active_visitors (
          session_id, current_page, last_activity
        ) VALUES (?, ?, ?)`,
        [
          sessionId,
          pages[Math.floor(Math.random() * pages.length)],
          new Date()
        ]
      );
    }
    
    res.json({ 
      success: true, 
      message: 'Test analytics data generated successfully' 
    });
  } catch (error) {
    console.error('Test data generation error:', error);
    res.status(500).json({ error: 'Test data generation failed' });
  }
});

// Create test data for analytics
app.post('/api/analytics/test-data', async (req, res) => {
  try {
    const testSessions = [];
    const testPageViews = [];
    const testActions = [];
    
    // Create 20 test sessions
    for (let i = 0; i < 20; i++) {
      const sessionId = `test_session_${Date.now()}_${i}`;
      const devices = ['desktop', 'mobile', 'tablet'];
      const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
      const countries = ['TR', 'US', 'DE', 'FR', 'UK'];
      const cities = ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya'];
      
      const device = devices[Math.floor(Math.random() * devices.length)];
      const browser = browsers[Math.floor(Math.random() * browsers.length)];
      const country = countries[Math.floor(Math.random() * countries.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      
      const isActive = Math.random() > 0.3; // 70% active
      const sessionDuration = Math.floor(Math.random() * 1800) + 30; // 30 seconds to 30 minutes
      const pageViews = Math.floor(Math.random() * 10) + 1;
      
      const visitTime = new Date();
      visitTime.setMinutes(visitTime.getMinutes() - Math.floor(Math.random() * 30)); // Last 30 minutes
      
      await db.execute(
        `INSERT INTO visitor_sessions (
          session_id, ip_address, user_agent, country, city, device_type, 
          browser, operating_system, first_visit_at, last_activity_at,
          total_page_views, session_duration, is_bounce, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionId,
          `192.168.1.${Math.floor(Math.random() * 255)}`,
          `Mozilla/5.0 (Test Browser)`,
          country,
          city,
          device,
          browser,
          'Windows',
          visitTime,
          new Date(),
          pageViews,
          sessionDuration,
          pageViews === 1,
          isActive
        ]
      );
      
      // Create page views for this session
      const pages = ['/', '/services', '/products', '/about', '/contact', '/blog'];
      for (let j = 0; j < pageViews; j++) {
        const page = pages[Math.floor(Math.random() * pages.length)];
        const timeOnPage = Math.floor(Math.random() * 300) + 5; // 5 seconds to 5 minutes
        const scrollPercentage = Math.floor(Math.random() * 100);
        
        const viewTime = new Date(visitTime);
        viewTime.setMinutes(viewTime.getMinutes() + j * 2);
        
        await db.execute(
          `INSERT INTO page_views (
            session_id, page_path, page_title, time_on_page, 
            scroll_percentage, exit_page, viewed_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            sessionId,
            page,
            `Test Page ${page}`,
            timeOnPage,
            scrollPercentage,
            j === pageViews - 1, // Last page is exit page
            viewTime
          ]
        );
        
        // Create some actions
        if (Math.random() > 0.5) {
          const actions = ['click', 'scroll', 'contact'];
          const actionType = actions[Math.floor(Math.random() * actions.length)];
          
          await db.execute(
            `INSERT INTO visitor_actions (
              session_id, action_type, page_path, action_at
            ) VALUES (?, ?, ?, ?)`,
            [sessionId, actionType, page, viewTime]
          );
        }
      }
      
      // Update active visitors table for active sessions
      if (isActive) {
        await db.execute(
          `INSERT INTO active_visitors (session_id, current_page, last_activity) 
           VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE 
           current_page = VALUES(current_page), last_activity = VALUES(last_activity)`,
          [sessionId, pages[Math.floor(Math.random() * pages.length)], new Date()]
        );
      }
    }
    
    res.json({ 
      message: 'Test data created successfully',
      sessions: 20,
      estimated_page_views: '20-200',
      estimated_actions: '10-100'
    });
  } catch (error) {
    console.error('Test data creation error:', error);
    res.status(500).json({ error: 'Test verisi oluşturulurken hata oluştu' });
  }
});

// Debug endpoint to check database data
app.get('/api/analytics/debug', async (req, res) => {
  try {
    const [sessionsCount] = await db.execute('SELECT COUNT(*) as count FROM visitor_sessions');
    const [pageViewsCount] = await db.execute('SELECT COUNT(*) as count FROM page_views');
    const [actionsCount] = await db.execute('SELECT COUNT(*) as count FROM visitor_actions');
    const [activeVisitorsCount] = await db.execute('SELECT COUNT(*) as count FROM active_visitors');
    
    const [recentSessions] = await db.execute(
      'SELECT * FROM visitor_sessions ORDER BY last_activity_at DESC LIMIT 5'
    );
    
    const [recentPageViews] = await db.execute(
      'SELECT * FROM page_views ORDER BY viewed_at DESC LIMIT 5'
    );

    res.json({
      database_status: 'connected',
      tables: {
        visitor_sessions: sessionsCount[0].count,
        page_views: pageViewsCount[0].count,
        visitor_actions: actionsCount[0].count,
        active_visitors: activeVisitorsCount[0].count
      },
      recent_sessions: recentSessions,
      recent_page_views: recentPageViews
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ 
      error: 'Database connection error',
      details: error.message 
    });
  }
});

// Get dashboard analytics
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = from && to ? 'AND DATE(first_visit_at) BETWEEN ? AND ?' : '';
    const dateParams = from && to ? [from, to] : [];

    // Basic stats
    const [sessionStats] = await db.execute(
      `SELECT 
        COUNT(*) as total_sessions,
        COUNT(DISTINCT ip_address) as unique_visitors,
        AVG(session_duration) as avg_session_duration,
        SUM(CASE WHEN is_bounce THEN 1 ELSE 0 END) / COUNT(*) * 100 as bounce_rate
       FROM visitor_sessions 
       WHERE 1=1 ${dateFilter}`,
      dateParams
    );

    const [pageViewStats] = await db.execute(
      `SELECT COUNT(*) as total_page_views
       FROM page_views pv
       JOIN visitor_sessions vs ON pv.session_id = vs.session_id
       WHERE 1=1 ${dateFilter}`,
      dateParams
    );

    // Device stats
    const [deviceStats] = await db.execute(
      `SELECT device_type, COUNT(*) as count
       FROM visitor_sessions 
       WHERE 1=1 ${dateFilter}
       GROUP BY device_type`,
      dateParams
    );

    // Browser stats
    const [browserStats] = await db.execute(
      `SELECT browser, COUNT(*) as count
       FROM visitor_sessions 
       WHERE 1=1 ${dateFilter}
       GROUP BY browser
       ORDER BY count DESC
       LIMIT 10`,
      dateParams
    );

    // Country stats
    const [countryStats] = await db.execute(
      `SELECT country, COUNT(*) as count
       FROM visitor_sessions 
       WHERE 1=1 ${dateFilter}
       GROUP BY country
       ORDER BY count DESC
       LIMIT 10`,
      dateParams
    );

    // Recent visitors
    const [recentVisitors] = await db.execute(
      `SELECT * FROM visitor_sessions 
       WHERE 1=1 ${dateFilter}
       ORDER BY last_activity_at DESC 
       LIMIT 10`,
      dateParams
    );

    // Active visitors count
    const [activeVisitors] = await db.execute(
      'SELECT COUNT(*) as count FROM active_visitors WHERE last_activity > DATE_SUB(NOW(), INTERVAL 5 MINUTE)'
    );

    const stats = sessionStats[0];
    const device_stats = {};
    const browser_stats = {};
    const country_stats = {};

    deviceStats.forEach(row => {
      device_stats[row.device_type] = row.count;
    });

    browserStats.forEach(row => {
      browser_stats[row.browser] = row.count;
    });

    countryStats.forEach(row => {
      country_stats[row.country] = row.count;
    });

    res.json({
      total_sessions: stats.total_sessions || 0,
      unique_visitors: stats.unique_visitors || 0,
      total_page_views: pageViewStats[0].total_page_views || 0,
      avg_session_duration: Math.round(stats.avg_session_duration || 0),
      bounce_rate: Math.round(stats.bounce_rate || 0),
      current_active_visitors: activeVisitors[0].count || 0,
      device_stats,
      browser_stats,
      country_stats,
      recent_visitors: recentVisitors,
      traffic_sources: {},
      daily_sessions: [],
      daily_page_views: []
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Analytics verileri alınırken hata oluştu' });
  }
});

// Get sessions with filtering
app.get('/api/analytics/sessions', async (req, res) => {
  try {
    const { limit = 50, offset = 0, orderBy = 'last_activity_at', order = 'DESC' } = req.query;
    
    const [sessions] = await db.execute(
      `SELECT * FROM visitor_sessions 
       ORDER BY ${orderBy} ${order}
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    res.json({ sessions });
  } catch (error) {
    console.error('Sessions fetch error:', error);
    res.status(500).json({ error: 'Oturumlar alınırken hata oluştu' });
  }
});

// Get popular pages
app.get('/api/analytics/popular-pages', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const [pages] = await db.execute(
      `SELECT 
        page_path,
        page_title,
        COUNT(*) as total_views,
        COUNT(DISTINCT session_id) as unique_views,
        AVG(time_on_page) as avg_time_on_page,
        SUM(CASE WHEN exit_page THEN 1 ELSE 0 END) / COUNT(*) * 100 as bounce_rate,
        MAX(viewed_at) as last_updated
       FROM page_views 
       GROUP BY page_path, page_title
       ORDER BY total_views DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    const popularPages = pages.map((page, index) => ({
      id: index + 1,
      page_path: page.page_path,
      page_title: page.page_title,
      total_views: page.total_views,
      unique_views: page.unique_views,
      avg_time_on_page: Math.round(page.avg_time_on_page || 0),
      bounce_rate: Math.round(page.bounce_rate || 0),
      last_updated: page.last_updated
    }));

    res.json(popularPages);
  } catch (error) {
    console.error('Popular pages error:', error);
    res.status(500).json({ error: 'Popüler sayfalar alınırken hata oluştu' });
  }
});

// Get real-time stats
app.get('/api/analytics/realtime', async (req, res) => {
  try {
    // Aktif ziyaretçiler (son 5 dakika)
    const [activeVisitors] = await db.execute(
      'SELECT COUNT(*) as count FROM visitor_sessions WHERE is_active = true AND last_activity_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)'
    );

    // Bugünkü toplam sayfa görüntüleme
    const [todayPageViews] = await db.execute(
      'SELECT COUNT(*) as count FROM page_views WHERE DATE(viewed_at) = CURDATE()'
    );

    // Bugünkü benzersiz ziyaretçiler
    const [todayUniqueVisitors] = await db.execute(
      'SELECT COUNT(DISTINCT session_id) as count FROM visitor_sessions WHERE DATE(created_at) = CURDATE()'
    );

    // Bounce rate hesaplama (bugün için)
    const [totalSessions] = await db.execute(
      'SELECT COUNT(*) as total FROM visitor_sessions WHERE DATE(created_at) = CURDATE()'
    );
    const [singlePageSessions] = await db.execute(
      'SELECT COUNT(*) as single FROM visitor_sessions WHERE DATE(created_at) = CURDATE() AND total_page_views = 1'
    );
    
    const bounceRate = totalSessions[0].total > 0 ? 
      (singlePageSessions[0].single / totalSessions[0].total) * 100 : 0;

    // Ortalama oturum süresi (bugün)
    const [avgDuration] = await db.execute(
      'SELECT AVG(session_duration) as avg FROM visitor_sessions WHERE DATE(created_at) = CURDATE() AND session_duration > 0'
    );

    // En popüler sayfalar (bugün)
    const [topPages] = await db.execute(
      `SELECT 
        page_path as page,
        COUNT(*) as views
       FROM page_views 
       WHERE DATE(viewed_at) = CURDATE()
       GROUP BY page_path
       ORDER BY views DESC
       LIMIT 5`
    );

    // Cihaz dağılımı (bugün)
    const [deviceStats] = await db.execute(
      `SELECT 
        device_type,
        COUNT(*) as count
       FROM visitor_sessions 
       WHERE DATE(created_at) = CURDATE()
       GROUP BY device_type`
    );

    const deviceBreakdown = {
      desktop: 0,
      mobile: 0,
      tablet: 0
    };

    deviceStats.forEach(stat => {
      const deviceType = stat.device_type?.toLowerCase() || 'desktop';
      if (deviceBreakdown.hasOwnProperty(deviceType)) {
        deviceBreakdown[deviceType] = stat.count;
      } else {
        deviceBreakdown.desktop += stat.count; // Bilinmeyen cihazları desktop'a ekle
      }
    });

    // Saatlik istatistikler (bugün)
    const [hourlyStats] = await db.execute(
      `SELECT 
        HOUR(viewed_at) as hour,
        COUNT(DISTINCT session_id) as visitors,
        COUNT(*) as pageViews
       FROM page_views 
       WHERE DATE(viewed_at) = CURDATE()
       GROUP BY HOUR(viewed_at)
       ORDER BY hour`
    );

    res.json({
      activeVisitors: activeVisitors[0].count || 0,
      totalPageViews: todayPageViews[0].count || 0,
      uniqueVisitors: todayUniqueVisitors[0].count || 0,
      bounceRate: bounceRate,
      avgSessionDuration: Math.round(avgDuration[0].avg || 0),
      topPages: topPages || [],
      deviceBreakdown: deviceBreakdown,
      hourlyStats: hourlyStats || []
    });
  } catch (error) {
    console.error('Real-time stats error:', error);
    res.status(500).json({ error: 'Canlı veriler alınırken hata oluştu' });
  }
});

// Get analytics settings
app.get('/api/analytics/settings', async (req, res) => {
  try {
    const [settings] = await db.execute('SELECT * FROM analytics_settings ORDER BY id DESC LIMIT 1');
    
    if (settings.length > 0) {
      res.json(settings[0]);
    } else {
      // Return default settings
      res.json({
        analytics_enabled: true,
        track_ip_addresses: true,
        data_retention_days: 365,
        exclude_ips: '',
        exclude_user_agents: 'bot,crawler,spider,scraper,facebook,twitter,linkedin,whatsapp',
        privacy_mode: false
      });
    }
  } catch (error) {
    console.error('Analytics settings error:', error);
    res.status(500).json({ error: 'Ayarlar alınırken hata oluştu' });
  }
});

// Update analytics settings
app.put('/api/analytics/settings', async (req, res) => {
  try {
    const {
      analytics_enabled,
      track_ip_addresses,
      data_retention_days,
      exclude_ips,
      exclude_user_agents,
      privacy_mode
    } = req.body;

    // Check if settings exist
    const [existingSettings] = await db.execute('SELECT id FROM analytics_settings LIMIT 1');
    
    if (existingSettings.length > 0) {
      // Update existing
      await db.execute(
        `UPDATE analytics_settings SET 
         analytics_enabled = ?, track_ip_addresses = ?, data_retention_days = ?,
         exclude_ips = ?, exclude_user_agents = ?, privacy_mode = ?
         WHERE id = ?`,
        [analytics_enabled, track_ip_addresses, data_retention_days, exclude_ips, exclude_user_agents, privacy_mode, existingSettings[0].id]
      );
    } else {
      // Insert new
      await db.execute(
        `INSERT INTO analytics_settings (
          analytics_enabled, track_ip_addresses, data_retention_days,
          exclude_ips, exclude_user_agents, privacy_mode
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [analytics_enabled, track_ip_addresses, data_retention_days, exclude_ips, exclude_user_agents, privacy_mode]
      );
    }

    res.json({ updated: true });
  } catch (error) {
    console.error('Analytics settings update error:', error);
    res.status(500).json({ error: 'Ayarlar güncellenirken hata oluştu' });
  }
});

// Export analytics data
app.get('/api/analytics/export', async (req, res) => {
  try {
    const { format = 'json', from, to } = req.query;
    const dateFilter = from && to ? 'WHERE DATE(vs.first_visit_at) BETWEEN ? AND ?' : '';
    const dateParams = from && to ? [from, to] : [];

    const [data] = await db.execute(
      `SELECT 
        vs.session_id,
        vs.ip_address,
        vs.country,
        vs.city,
        vs.device_type,
        vs.browser,
        vs.operating_system,
        vs.first_visit_at,
        vs.session_duration,
        vs.total_page_views,
        vs.referrer
       FROM visitor_sessions vs
       ${dateFilter}
       ORDER BY vs.first_visit_at DESC`,
      dateParams
    );

    if (format === 'csv') {
      // Convert to CSV
      const headers = ['Session ID', 'IP Address', 'Country', 'City', 'Device', 'Browser', 'OS', 'First Visit', 'Duration', 'Page Views', 'Referrer'];
      const csvData = [
        headers.join(','),
        ...data.map(row => [
          row.session_id,
          row.ip_address || '',
          row.country || '',
          row.city || '',
          row.device_type || '',
          row.browser || '',
          row.operating_system || '',
          row.first_visit_at,
          row.session_duration || 0,
          row.total_page_views || 0,
          row.referrer || ''
        ].join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
      res.send(csvData);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Veri dışa aktarılırken hata oluştu' });
  }
});

// Get live visitors
app.get('/api/analytics/live-visitors', async (req, res) => {
  try {
    const [liveVisitors] = await db.execute(
      `SELECT 
        vs.session_id,
        vs.country,
        vs.city,
        vs.device_type as device,
        vs.browser,
        vs.last_activity_at as last_seen,
        vs.total_page_views as page_views,
        vs.session_duration as duration,
        av.current_page
       FROM visitor_sessions vs
       LEFT JOIN active_visitors av ON vs.session_id = av.session_id
       WHERE vs.is_active = true 
       AND vs.last_activity_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
       ORDER BY vs.last_activity_at DESC
       LIMIT 20`
    );

    const visitors = liveVisitors.map(visitor => ({
      session_id: visitor.session_id,
      current_page: visitor.current_page || '/',
      location: visitor.city && visitor.country ? `${visitor.city}, ${visitor.country}` : (visitor.country || 'Bilinmeyen'),
      device: visitor.device || 'desktop',
      browser: visitor.browser || 'Bilinmeyen',
      last_seen: visitor.last_seen,
      page_views: visitor.page_views || 0,
      duration: visitor.duration || 0
    }));

    res.json(visitors);
  } catch (error) {
    console.error('Live visitors error:', error);
    res.status(500).json({ error: 'Canlı ziyaretçiler alınırken hata oluştu' });
  }
});

// Get current page views (last 5 minutes)
app.get('/api/analytics/current-pageviews', async (req, res) => {
  try {
    const [currentPageViews] = await db.execute(
      `SELECT 
        page_path,
        page_title,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as unique_views
       FROM page_views 
       WHERE viewed_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
       GROUP BY page_path, page_title
       ORDER BY views DESC
       LIMIT 10`
    );

    res.json(currentPageViews);
  } catch (error) {
    console.error('Current page views error:', error);
    res.status(500).json({ error: 'Güncel sayfa görüntülemeleri alınırken hata oluştu' });
  }
});

// Get recent visitor actions
app.get('/api/analytics/recent-actions', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const [recentActions] = await db.execute(
      `SELECT 
        va.action_type,
        va.element_selector,
        va.element_text,
        va.page_path,
        va.action_at,
        vs.country,
        vs.device_type,
        vs.browser
       FROM visitor_actions va
       JOIN visitor_sessions vs ON va.session_id = vs.session_id
       WHERE va.action_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
       ORDER BY va.action_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.json(recentActions);
  } catch (error) {
    console.error('Recent actions error:', error);
    res.status(500).json({ error: 'Son aktiviteler alınırken hata oluştu' });
  }
});

// Get today's hourly stats
app.get('/api/analytics/today-hourly', async (req, res) => {
  try {
    const [hourlyStats] = await db.execute(
      `SELECT 
        HOUR(pv.viewed_at) as hour,
        COUNT(DISTINCT pv.session_id) as visitors,
        COUNT(*) as pageViews
       FROM page_views pv
       WHERE DATE(pv.viewed_at) = CURDATE()
       GROUP BY HOUR(pv.viewed_at)
       ORDER BY hour`
    );

    // Fill missing hours with 0
    const hours = Array.from({length: 24}, (_, i) => {
      const hourData = hourlyStats.find(h => h.hour === i);
      return {
        hour: i,
        visitors: hourData ? hourData.visitors : 0,
        pageViews: hourData ? hourData.pageViews : 0
      };
    });

    res.json(hours);
  } catch (error) {
    console.error('Today hourly stats error:', error);
    res.status(500).json({ error: 'Bugünün saatlik istatistikleri alınırken hata oluştu' });
  }
});

// Get traffic sources
app.get('/api/analytics/traffic-sources', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const [trafficSources] = await db.execute(
      `SELECT 
        COALESCE(utm_source, 'direct') as source,
        COUNT(*) as sessions,
        COUNT(DISTINCT ip_address) as unique_visitors
       FROM visitor_sessions 
       WHERE first_visit_at > DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY COALESCE(utm_source, 'direct')
       ORDER BY sessions DESC
       LIMIT 10`,
      [parseInt(days)]
    );

    res.json(trafficSources);
  } catch (error) {
    console.error('Traffic sources error:', error);
    res.status(500).json({ error: 'Trafik kaynakları alınırken hata oluştu' });
  }
});

// Get device breakdown for real-time
app.get('/api/analytics/device-breakdown', async (req, res) => {
  try {
    const [deviceBreakdown] = await db.execute(
      `SELECT 
        device_type,
        COUNT(*) as count
       FROM visitor_sessions 
       WHERE is_active = true 
       AND last_activity_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE)
       GROUP BY device_type`
    );

    const breakdown = {
      desktop: 0,
      mobile: 0,
      tablet: 0
    };

    deviceBreakdown.forEach(device => {
      breakdown[device.device_type] = device.count;
    });

    res.json(breakdown);
  } catch (error) {
    console.error('Device breakdown error:', error);
    res.status(500).json({ error: 'Cihaz dağılımı alınırken hata oluştu' });
  }
});

// Cleanup old data
app.post('/api/analytics/cleanup', async (req, res) => {
  try {
    const { olderThanDays = 365 } = req.body;
    
    await db.execute(
      'DELETE FROM visitor_sessions WHERE first_visit_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [olderThanDays]
    );

    res.json({ cleaned: true });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Veri temizlenirken hata oluştu' });
  }
});

app.listen(PORT, () => {
  // Server started successfully
});
