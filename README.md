# Project Personel Assignment Request

Personel Tayin Talebi Uygulaması, adli personel atama süreçlerini kolaylaştırmak için geliştirilmiş bir web uygulamasıdır. Bu uygulama, adli personelin atanması, görev değişiklikleri gibi işlemleri yönetmeyi amaçlar.

![Adli Personel Tayin Sistemi](https://i.ibb.co/k24kG825/5846fa4e-fbf8-4af5-a384-c85061d7c2b9.png)

## 🚀 Demo

- **[Canlı Demo](https://project-personel-assignment-request.netlify.app/)**: Frontend uygulaması 
- **[Backend API](https://personel-assignment-request.bilgehan26.keenetic.pro)**: Raspberry Pi üzerinde çalışan backend
> **Not:** Backend Raspberry Pi ve KeenDNS üzerinde çalıştığından performans ve erişilebilirlik sınırlamaları olabilir.

## 💻 Kullanılan Teknolojiler

### Backend

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT"/>
</div>

- **Node.js**: Sunucu tarafı JavaScript çalıştırmak için asenkron I/O destekli platform
- **Express.js**: Node.js üzerinde çalışan hafif ve esnek RESTful API çatısı
- **MongoDB**: Esnek veri yapısı ve ölçeklenebilirlik sunan NoSQL veritabanı 
- **Redis**: Hızlı veri erişimi ve önbellekleme için bellek içi veri deposu
- **multer**: Dosya yükleme işlemleri için middleware
- **Dotenv**: Çevresel değişkenleri yönetme kütüphanesi
- **jsonwebtoken**: Kimlik doğrulama ve yetkilendirme için JWT kütüphanesi

### Frontend

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap"/>
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router"/>
  <img src="https://img.shields.io/badge/axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios"/>
</div>

- **React**: Bileşen tabanlı kullanıcı arayüzü kütüphanesi
- **Axios**: API ile etkileşimde kullanılan HTTP istek kütüphanesi
- **Alertify.js**: Kullanıcı bildirimleri için iyileştirilmiş deneyim
- **Bootstrap & Reactstrap**: Duyarlı ve modern tasarımlar için CSS framework
- **React Router Dom**: Sayfalar arası geçişleri yöneten yönlendirme kütüphanesi
- **Universal Cookie**: Kullanıcı oturumlarını yönetme kütüphanesi
- **Font Awesome**: Görsel öğeler eklemek için ikon seti

## 🔧 Kurulum ve Çalıştırma

### Ön Koşullar
- Node.js (v14 veya üzeri)
- MongoDB
- Redis (opsiyonel, ancak önerilir)

### Adımlar

1. **Projeyi klonlayın:**

```bash
git clone https://github.com/Afkborn/project-personel-assignment-request.git
cd project-personel-assignment-request
```

2. **Bağımlılıkları yükleyin:**

```bash
npm install
```

3. **Ortam değişkenlerini yapılandırın:**

```bash
cp .env.example .env
# .env dosyasını kendi ortamınıza göre düzenleyin
```

4. **Veritabanını başlatın:**

```bash
mongod
```

5. **Uygulamayı başlatın:**

```bash
# Geliştirme modunda başlatmak için
npm run dev

# Sadece backend için
npm run server

# Sadece frontend için
npm run client
```

Frontend uygulaması genellikle http://localhost:3000 adresinde çalışır.
Backend API http://localhost:2626 adresinde çalışır.

## 📁 Proje Yapısı

```
project-personel-assignment-request
├── backend
│   ├── actions       # İş mantığı eylemleri
│   ├── common        # Yardımcı fonksiyonlar
│   ├── config        # Yapılandırma ayarları
│   ├── constants     # Sabit değerler
│   ├── database      # Veritabanı bağlantıları
│   ├── middleware    # Express middleware'leri
│   ├── model         # Mongoose modelleri
│   ├── routes        # API rotaları
│   ├── scripts       # Yardımcı betikler
│   ├── .env.example  # Örnek çevre değişkenleri
│   └── index.js      # Ana giriş noktası
│
├── frontend
│   ├── public        # Statik dosyalar
│   ├── src
│   │   ├── components # React bileşenleri
│   │   ├── assets     # Resimler, fontlar vb.
│   │   ├── styles     # CSS ve stil dosyaları
│   │   └── index.js   # Frontend giriş noktası
│
├── package.json      # Proje bağımlılıkları
└── README.md         # Bu dosya
```

## ✨ Proje Özellikleri

- **Güvenli Kimlik Doğrulama:** JWT ve Redis kullanılarak
- **Personel Bilgi Yönetimi:** Personel kayıtları ve temel bilgiler
- **Tayin Talep İşlemleri:** 
  - Başvuru oluşturma ve düzenleme
  - İşlem adımları (hazırlık, onaya sunma, onaylama/reddetme)
  - Belge ekleme ve görüntüleme
- **Yetkilendirme Sistemi:** Rol tabanlı erişim kontrolü
- **Kapsamlı Raporlama:** Tayin talepleri istatistikleri ve durumları

## 📊 API Dokümantasyonu

Postman koleksiyonunu kullanarak API isteklerini test edebilirsiniz.
[API Dokümantasyonu için tıklayın](https://documenter.getpostman.com/view/18039597/2sB2qgdHtS)

## 👨‍💻 Geliştirici Notları

Proje, temel CRUD işlemleriyle tayin talebi ve personel bilgilerini işleyen basit bir web uygulaması olarak tasarlanmıştır. İnceleme aşamasında zaman kaybını önlemek adına sade tutulmuştur. Eskişehir Adliyesinde aktif kullanımda olan daha kapsamlı bir versiyonu bulunmaktadır.

## 📄 Lisans

Bu proje sadece eğitim amaçlıdır ve herhangi bir lisans altında değildir. Kişisel kullanım için serbesttir, ancak ticari amaçlarla kullanılmamalıdır.

## 📞 İletişim

Proje hakkında sorularınız veya geri bildirimleriniz için:

<div style="display: flex; gap: 10px; align-items: center;">
  <a href="mailto:kalaybilgehan60@gmail.com">
    <img src="https://img.shields.io/badge/Email-kalaybilgehan60%40gmail.com-blue?style=for-the-badge&logo=gmail" alt="E-posta"/>
  </a>
  <a href="https://github.com/afkborn">
    <img src="https://img.shields.io/badge/GitHub-afkborn-black?style=for-the-badge&logo=github" alt="GitHub"/>
  </a>
</div>

---

