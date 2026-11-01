const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const MONGO_URI = 'mongodb+srv://kerimcan:kerim.KE4@cluster0.bhwtbps.mongodb.net/egitimplatformu?retryWrites=true&w=majority';
const ODEME_API_KEY = 'BURAYA_ODEME_ARACISI_API_ANAHTARINIZI_YAZIN';

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Atlas veritabanı bağlantısı başarılı!"))
    .catch(err => console.error("Bağlantı hatası:", err));


// ==========================================
// 1. MODEL (VERİTABANI ŞEMALARI)
// ==========================================
const kursSchema = new mongoose.Schema({
    baslik: { type: String, required: true },
    aciklama: { type: String, required: true },
    fiyatUSD: { type: Number, required: true },
    egitmen: { type: String, required: true },
    tarih: { type: Date, default: Date.now }
});
const KursModel = mongoose.model('Kurs', kursSchema);

const siparisSchema = new mongoose.Schema({
    kullaniciEmail: { type: String, required: true },
    kursAdi: { type: String, required: true },
    odemeDurumu: { type: String, default: 'Onaylandi' },
    tarih: { type: Date, default: Date.now }
});
const SiparisModel = mongoose.model('Siparis', siparisSchema);


// ==========================================
// 2. SERVICE (İŞ MANTIĞI VE VERİTABANI İŞLEMLERİ)
// ==========================================
class EgitimService {
    async kurslariGetir() {
        return await KursModel.find().sort({ tarih: -1 });
    }
    async kursEkle(veri) {
        const yeniKurs = new KursModel(veri);
        return await yeniKurs.save();
    }
    async siparisKaydet(veri) {
        const yeniSiparis = new SiparisModel(veri);
        return await yeniSiparis.save();
    }
}
const egitimService = new EgitimService();


// ==========================================
// 3. CONTROLLER (İSTEK YÖNLENDİRME VE BAĞLANTI)
// ==========================================
class EgitimController {
    getIndex(req, res) {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
    async getKurslar(req, res) {
        try {
            const kurslar = await egitimService.kurslariGetir();
            res.json({ success: true, data: kurslar });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
    async postKursEkle(req, res) {
        try {
            const sonuc = await egitimService.kursEkle(req.body);
            res.json({ success: true, message: "Eğitim başarıyla eklendi!", data: sonuc });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }
    async postSiparis(req, res) {
        try {
            const sonuc = await egitimService.siparisKaydet(req.body);
            res.json({ success: true, message: "Ödeme başarıyla onaylandı!", data: sonuc });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }
}
const egitimController = new EgitimController();

app.get('/', (req, res) => egitimController.getIndex(req, res));
app.get('/api/kurslar', (req, res) => egitimController.getKurslar(req, res));
app.post('/api/kurs-ekle', (req, res) => egitimController.postKursEkle(req, res));
app.post('/api/satin-al', (req, res) => egitimController.postSiparis(req, res));


// ==========================================
// 4. ÇALIŞTIRMA / BAŞLATMA (EN AŞAĞIDA)
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
