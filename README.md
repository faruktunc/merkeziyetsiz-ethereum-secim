# Blok Zinciri Tabanlı Seçim Uygulaması

Bu proje, Ethereum Sepolia test ağı üzerinde çalışan merkeziyetsiz bir çevrimiçi oylama uygulamasıdır. Akıllı sözleşmeler aracılığıyla güvenli ve şeffaf bir oy verme süreci sağlamayı amaçlar.

## İçindekiler

- [Özellikler](#özellikler)
- [Kullanılan Teknolojiler](#kullanılan-teknolojiler)
- [Gereksinimler](#gereksinimler)
- [Kurulum](#kurulum)
- [Projeyi Çalıştırma](#projeyi-çalıştırma)
  - [Hardhat Yerel Ağı](#hardhat-yerel-ağı)
  - [Akıllı Sözleşmeler](#akıllı-sözleşmeler)
  - [Testler](#testler)
  - [Frontend Uygulaması](#frontend-uygulaması)
- [Sepolia Test Ağına Dağıtım](#sepolia-test-ağına-dağıtım)
- [Proje Yapısı](#proje-yapısı)
- [Önemli Notlar](#önemli-notlar)
- [Test Kılavuzu](#test-kılavuzu)


## Özellikler

- Yetkilendirilmiş seçmenler tarafından oy kullanılabilir.
- Her seçmen yalnızca bir oy kullanabilir.
- Oy sayımları gerçek zamanlı olarak görüntülenebilir.
- Seçim, sözleşme sahibi tarafından sonlandırılabilir.
- Güvenli ve şeffaf oylama süreci.

## Kullanılan Teknolojiler

- **Akıllı Sözleşme:** Solidity
- **Geliştirme Ortamı:** Hardhat
- **Ethereum Kütüphanesi:** Ethers.js
- **Frontend:** React, Vite
- **Stil:** CSS

## Gereksinimler

- [Node.js](https://nodejs.org/) (v18 veya üstü önerilir)
- [npm](https://www.npmjs.com/) (Node.js ile birlikte gelir) veya [yarn](https://yarnpkg.com/)
- [MetaMask](https://metamask.io/) tarayıcı eklentisi

## Kurulum

1.  **Projeyi klonlayın:**
    ```bash
    git clone https://github.com/faruktunc/merkeziyetsiz-ethereum-secim
    cd merkeziyetsiz-ethereum-secim
    ```

2.  **Ana dizindeki bağımlılıkları yükleyin:**
    ```bash
    npm install
    ```

3.  **Frontend dizinindeki bağımlılıkları yükleyin:**
    ```bash
    cd frontend
    npm install
    cd ..
    ```

4.  **`.env` dosyasını yapılandırın:**
    Proje ana dizininde `.env.example` dosyasını kopyalayarak `.env` adında yeni bir dosya oluşturun.
    ```bash
    cp .env.example .env # Windows için copy .env.example .env
    ```
    Sepolia test ağına dağıtım yapmak için `SEPOLIA_RPC_URL` (örneğin Alchemy veya Infura'dan) ve `PRIVATE_KEY` (MetaMask cüzdanınızdan dağıtım yapacak hesabın özel anahtarı) değerlerini `.env` dosyasına girin.
    **UYARI:** Özel anahtarınızı asla herkese açık bir repoda paylaşmayın!

## Projeyi Çalıştırma

### Hardhat Yerel Ağı

Yerel bir Ethereum düğümü başlatmak için:

```bash
npx hardhat node 
```

Bu komut, test ve geliştirme için kullanabileceğiniz yerel bir blok zinciri ağı başlatır ve birkaç test hesabı oluşturur.

### Akıllı Sözleşmeler

1.  **Sözleşmeleri Derleme:**
    ```bash
    npx hardhat compile
    ```
    Bu komut, `contracts/` dizinindeki Solidity sözleşmelerini derler ve `artifacts/` dizininde ABI ve bytecode dosyalarını oluşturur.

2.  **Sözleşmeleri Yerel Ağa Dağıtma:**
    Hardhat yerel ağını başlattıktan sonra, sözleşmeyi bu ağa dağıtmak için `scripts/deploy.js` dosyasını kullanabilirsiniz. `deploy.js` script'i varsayılan olarak 5 adet örnek seçmen adresi ile sözleşmeyi başlatır.
    ```bash
    npx hardhat run scripts/deploy.js --network localhost
    ```
    Dağıtım sonrası konsolda sözleşme adresini göreceksiniz. Bu adresi frontend uygulamasında kullanmanız gerekecektir (`frontend/src/App.jsx` dosyasındaki `electionAddress` değişkeni).

### Testler

Akıllı sözleşme testlerini çalıştırmak için:

```bash
npx hardhat test
```

Bu komut, `test/` dizinindeki test dosyalarını çalıştırır ve test sonuçlarını konsola yazdırır. Testler, sözleşmenin tüm temel işlevlerini (oy verme, seçim sonlandırma, yetkilendirme kontrolleri vb.) doğrular.

### Frontend Uygulaması

Frontend React uygulamasını başlatmak için:

1.  `frontend` dizinine gidin:
    ```bash
    cd frontend
    ```

2.  Geliştirme sunucusunu başlatın:
    ```bash
    npm run dev
    ```
    Uygulama varsayılan olarak `http://localhost:5173` adresinde çalışacaktır.

3.  **MetaMask Yapılandırması:**
    - MetaMask'in Hardhat yerel ağına (RPC URL: `http://127.0.0.1:8545/`, Chain ID: `31337`) veya Sepolia test ağına bağlı olduğundan emin olun.
    - `Election.sol` sözleşmesinin constructor'ında tanımlanan 5 seçmen adresinden biriyle MetaMask'e giriş yapın. Hardhat yerel ağı için `npx hardhat node` komutunun çıktısındaki hesapları kullanabilirsiniz. `scripts/deploy.js` dosyasındaki örnek adresler yerel dağıtımda kullanılır.

## Sepolia Test Ağına Dağıtım

`.env` dosyanızı Sepolia RPC URL'si ve özel anahtarınızla doğru bir şekilde yapılandırdıktan sonra, sözleşmeyi Sepolia test ağına dağıtmak için aşağıdaki komutu çalıştırın:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Dağıtım sonrası konsolda sözleşme adresini göreceksiniz. Bu adresi frontend uygulamasında (`frontend/src/App.jsx` dosyasındaki `electionAddress` değişkeni) Sepolia ağı için güncellemeniz gerekecektir.
   - Frontend'deki sözleşme adresini güncelleyin (`frontend/src/App.jsx` içindeki `electionAddress`).
   ```jsx
   const electionAddress = "SEPOLIA_SOZLESME_ADRESI";
   ```
## Proje Yapısı

```
blok-election-project/
├── contracts/            # Solidity akıllı sözleşmeleri
│   └── Election.sol
├── scripts/              # Dağıtım ve etkileşim scriptleri
│   └── deploy.js
├── test/                 # Akıllı sözleşme testleri
│   └── Election.test.js
├── frontend/             # React frontend uygulaması
│   ├── public/
│   ├── src/
│   │   ├── App.css
│   │   ├── App.jsx       # Ana React bileşeni ve mantığı
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── artifacts/            # Derlenmiş sözleşme bilgileri (otomatik oluşturulur)
├── cache/                # Hardhat önbelleği (otomatik oluşturulur)
├── node_modules/         # Proje bağımlılıkları
├── .env.example          # Örnek ortam değişkenleri dosyası
├── .gitignore
├── hardhat.config.js     # Hardhat yapılandırma dosyası
├── package.json
└── README.md             # Bu dosya
```

## Önemli Notlar

- `scripts/deploy.js` dosyası, sözleşmeyi dağıtırken 5 adet sabit seçmen adresi kullanır. Gerçek bir senaryoda bu adreslerin dinamik olarak veya farklı bir yöntemle belirlenmesi gerekebilir.
- Frontend uygulamasındaki `electionAddress` (`frontend/src/App.jsx` içinde) değişkeninin, sözleşmenizin dağıtıldığı ağdaki (yerel veya Sepolia) doğru adresle güncellendiğinden emin olun.
- Güvenlik nedeniyle özel anahtarlarınızı asla herkese açık repolarda paylaşmayın. `.env` dosyasını `.gitignore` içinde tutun.

## Test Kılavuzu

Bu bölüm, projenin test edilmesi için adım adım talimatlar içerir.

### Akıllı Sözleşme Testleri

1. **Ortamı Hazırlama:**
   - Projeyi klonlayın ve bağımlılıkları yükleyin (yukarıdaki [Kurulum](#kurulum) bölümünü takip edin).
   - `.env` dosyasını yapılandırın (Sepolia testleri için gereklidir).

2. **Testleri Çalıştırma:**
   ```bash
   npx hardhat test
   ```
   Bu komut, `test/Election.test.js` dosyasındaki tüm test senaryolarını çalıştırır.

3. **Test Senaryoları:**
   - Sözleşme başlatma ve yapılandırma testleri
   - Seçmen yetkilendirme kontrolleri
   - Oy verme işlevi testleri
   - Çift oy engelleme testleri
   - Seçim sonlandırma testleri
   - Kazanan belirleme testleri

4. **Belirli Bir Testi Çalıştırma:**
1 - Sözleşme başarılı bir şekilde ağa yüklenebiliyor mu?
   ```bash
   npx hardhat test --grep "1. Sözleşme başarılı bir şekilde ağa yüklenebiliyor mu?"
   ```
   2 - Bir seçmen başarılı bir şekilde oyunu kullanabiliyor mu?
    ```bash
   npx hardhat test --grep "2. Bir seçmen başarılı bir şekilde oyunu kullanabiliyor mu?"
   ```
   3 - Seçmen olmayan bir hesaptan gelen bir işlemin talebi başarısızlıkla sonuçlanıyor mu?
    ```bash
   npx hardhat test --grep "3. Seçmen olmayan bir hesaptan gelen bir işlemin talebi başarısızlıkla sonuçlanıyor mu?"
   ```
   4 - Daha önce oy kullanmış bir seçmenin tekrar oy kullanma girişimi başarısızlıkla sonuçlanıyor mu?
    ```bash
   npx hardhat test --grep "4. Daha önce oy kullanmış bir seçmenin tekrar oy kullanma girişimi başarısızlıkla sonuçlanıyor mu?"
   ```
   5 - Oy verme işlemi başarılı bir şekilde sonuçlandığında ilgili adayın sayacı bir artıyor mu?
    ```bash
   npx hardhat test --grep "5. Oy verme işlemi başarılı bir şekilde sonuçlandığında ilgili adayın sayacı bir artıyor mu?"
   ```
   6 - İki seçmen belli bir aday için oy kullandığında ilgili adayın sayaç değeri iki artıyor mu?
    ```bash
   npx hardhat test --grep "6. İki seçmen belli bir aday için oy kullandığında ilgili adayın sayaç değeri iki artıyor mu?"
   ```
   7 - Sözleşmeyi oluşturan hesabın dışında bir hesap oy vermeyi sonlandırmaya çalıştığında başarısızlıkla sonuçlanıyor mu?
    ```bash
   npx hardhat test --grep "7. Sözleşmeyi oluşturan hesabın dışında bir hesap oy vermeyi sonlandırmaya çalıştığında başarısızlıkla sonuçlanıyor mu?"
   ```
   8 - Daha önce oy kullanmamış bir seçmen oy verme sonlandırıldıktan sonra oy vermeye çalıştığında başarısızlıkla sonuçlanıyor mu?
    ```bash
   npx hardhat test --grep "8. Daha önce oy kullanmamış bir seçmen oy verme sonlandırıldıktan sonra oy vermeye çalıştığında başarısızlıkla sonuçlanıyor mu?"
   ```

### Manuel Test Adımları

1. **Yerel Ağda Test:**
   - Hardhat yerel ağını başlatın:
     ```bash
     npx hardhat node
     ```
   - Sözleşmeyi yerel ağa dağıtın:
     ```bash
     npx hardhat run scripts/deploy.js --network localhost
     ```
   - Frontend uygulamasını başlatın:
     ```bash
     cd frontend
     npm run dev
     ```
   - MetaMask'i yerel ağa bağlayın (RPC URL: `http://127.0.0.1:8545/`, Chain ID: `31337`).
   - Hardhat'in sağladığı test hesaplarından birini MetaMask'e import edin (özel anahtarı kullanarak).
   - Uygulamayı tarayıcıda açın ve işlevleri test edin.

2. **Sepolia Test Ağında Test:**
   - Sözleşmeyi Sepolia ağına dağıtın:
     ```bash
     npx hardhat run scripts/deploy.js --network sepolia
     ```

   - Frontend uygulamasını başlatın.
   - MetaMask'i Sepolia ağına bağlayın.
   - Sepolia test ETH'sine sahip bir hesapla işlemleri gerçekleştirin.



