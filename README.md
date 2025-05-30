## Project Personel Assignment Request

Personel Tayin Talebi Uygulaması, adli personel atama süreçlerini kolaylaştırmak için geliştirilmiş bir web uygulamasıdır. Bu uygulama, adli personelin atanması, görev değişiklikleri gibi işlemleri yönetmeyi amaçlar.

## Demo

Uygulamanın canlı demosunu [buradan görüntüleyebilirsiniz](https://project-personel-assignment-request.netlify.app/)

Uygulamanın backend kısmını [buradan görüntüleyebilirsiniz](https://personel-assignment-request.bilgehan26.keenetic.pro)
Backend kısmı Raspberry Pi üzerinde çalışmaktadır. Bu nedenle, performans ve erişilebilirlik açısından bazı sınırlamalar olabilir.



## Backend Kullanılan Teknolojiler

Node.js - Sunucu tarafı JavaScript çalıştırmak için kullanılan bir platform, asenkron I/O desteği ile yüksek performanslı web uygulamaları geliştirmeyi sağlar.
Express.js - Node.js üzerinde çalışan hafif ve esnek bir web uygulama çatısı, RESTful API geliştirmek için kullanışlıdır.
Mongo DB - NoSQL veritabanı, esnek veri yapısı ve ölçeklenebilirlik sunar, bu sayede prototip geliştirme ve hızlı iterasyon için idealdir.
React - Kullanıcı arayüzü geliştirmek için popüler bir JavaScript kütüphanesi, bileşen tabanlı mimarisi sayesinde yeniden kullanılabilir ve yönetilebilir UI bileşenleri oluşturmayı kolaylaştırır.
Redis - Bellek içi veri yapısı deposu, hızlı veri erişimi ve önbellekleme için kullanılır, performansı artırır.
multer - Dosya yükleme işlemleri için kullanılan bir middleware, kullanıcıların dosya yüklemesini kolaylaştırır.
Dotenv - Çevresel değişkenleri yönetmek için kullanılan bir kütüphane, uygulama yapılandırmasını kolaylaştırır.
jsonwebtoken - JSON Web Token'ları oluşturmak ve doğrulamak için kullanılan bir kütüphane, kimlik doğrulama ve yetkilendirme işlemlerinde kullanılır.

## Frontend Kullanılan Teknolojiler

React - Kullanıcı arayüzü geliştirmek için popüler bir JavaScript kütüphanesi, bileşen tabanlı mimarisi sayesinde yeniden kullanılabilir ve yönetilebilir UI bileşenleri oluşturmayı kolaylaştırır.
Axios - HTTP istekleri yapmak için kullanılan bir kütüphane, API ile etkileşimde kolaylık sağlar.
Alertify.js - Kullanıcı bildirimleri için kullanılan bir kütüphane, kullanıcı deneyimini iyileştirir.
Bootstrap - CSS framework, duyarlı ve modern tasarımlar oluşturmayı kolaylaştırır.
jwt-decode - JSON Web Token'ları çözmek için kullanılan bir kütüphane, kimlik doğrulama ve yetkilendirme işlemlerinde kullanılır.
react-router-dom - React uygulamalarında yönlendirme işlemleri için kullanılan bir kütüphane, sayfalar arası geçişleri yönetir.
reactstrap - React uygulamalarında form yönetimi için kullanılan bir kütüphane, form verilerini kolayca yönetmeyi sağlar.
react-scripts - React uygulamalarını geliştirmek için kullanılan bir araç seti, hızlı başlangıç ve yapılandırma sağlar.
universal-cookie - React uygulamalarında çerez yönetimi için kullanılan bir kütüphane, kullanıcı oturumlarını yönetmeyi kolaylaştırır.
http-proxy-middleware - API isteklerini yönlendirmek için kullanılan bir araç, geliştirme sırasında CORS sorunlarını aşmayı sağlar.
fortawesome/fontawesome-free - İkon seti, kullanıcı arayüzünde görsel öğeler eklemeyi kolaylaştırır.

Kurulum ve Çalıştırma Adımları

1. Projeyi klonlayın:

   ```bash
   git clone

   ```

2. Proje dizinine gidin:

   ```bash
   cd project-personel-assignment-request
   ```

3. Gerekli bağımlılıkları yükleyin:

   ```bash
    npm install
   ```

4. Ortam değişkenlerini ayarlayın:
   .env dosyasını oluşturun ve gerekli değişkenleri ekleyin. Örnek .env dosyası için .env.example dosyasını kullanabilirsiniz.
   ```bash
    cp .env.example .env
   ```
5. Veritabanını başlatın:
   MongoDB veritabanınızı başlatın. Yerel olarak çalıştırmak için MongoDB'nin kurulu olması gerekmektedir.
   ```bash
   mongod
   ```
6. Projeyi dev modunda başlatın:
   ```bash
   npm run dev
   ```
   Bu komut, hem frontend hem de backend'i geliştirici modunda başlatır.
   Frontend uygulaması genellikle http://localhost:3000 adresinde çalışır.

## Proje Yapısı

```
project-personel-assignment-request
├── backend
│   ├── actions
│   ├── common
│   ├── config
│   ├── constants
│   ├── database
│   ├── middleware
│   ├── model
│   ├── routes
│   ├── scripts
│   ├── .env.example
│   ├── index.js
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── assets
│   │   ├── styles
│   │   ├── index.js
├── package.json
├── README.md
```

## Proje Özellikleri

- Kullanıcı kimlik doğrulama (JWT ve Redis kullanılarak)
- Personel temel bilgileri yönetimi
- Personel tayin talepleri başvuru ve onay süreçleri
- Personel tayin talepleri listeleme ve detay görüntüleme

Veritabanı Yapısı / ER Diyagramı

API Dökümantasyonu (Varsa Swagger benzeri)

## Geliştirici Notları

Projeyi çok kapsamlı yapmayı tercih etmedim çünkü inceleme aşamasında çok fazla zaman harcamanızı istemedim.
Bu yüzden temel CRUD işlemleri kullanarak tayin talepi ve personel ait temel bilgileri işleyen basit bir web app geliştirdim.
Buna benzer olan ve şuan Eskişehir Adliyesinde çalışan kapsamlı bir uygulamam mevcut. Bu uygulamaya ait bir adet tanıtım videosu da bulunmaktadır.

## Postman koleksiyonunu kullanarak API isteklerini test edebilirsiniz.
Postman koleksiyonunu [buradan indirebilirsiniz](https://documenter.getpostman.com/view/18039597/2sB2qgdHtS).

## Lisans

Bu proje sadece eğitim amaçlıdır ve herhangi bir lisans altında değildir. Kişisel kullanım için serbesttir, ancak ticari amaçlarla kullanılmamalıdır.

## İletişim

Eğer proje hakkında herhangi bir sorunuz veya geri bildiriminiz varsa, lütfen benimle iletişime geçin:

- E-posta: [kalaybilgehan60@gmail.com](mailto:kalaybilgehan60@gmail.com)
- GitHub: [afkborn](github.com/afkborn)
