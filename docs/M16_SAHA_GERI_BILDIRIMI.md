# M16 — SAHA GERİ BİLDİRİMİ VE RESMÎ DOĞRULAMA ENTEGRASYONU

**Aşama:** M16 (Saha Geri Bildirimi)  
**Tarih:** 2026-11-08  
**Standart Uyumluluğu:** TKGM 3B Şehir Modelleri Üretimi Teknik Şartnamesi v3.5.5, Şartname Ek-1 §2.10, P-20.

---

## 1. Genel Bakış ve Amaç

M16 aşaması, sahada harita ve inşaat mühendisleri tarafından üretilen CityGML 2.0 modellerinin TKGM `3dbinadogrula` sunucu portalına yüklenmesi sonucunda dönen resmî hata, uyarı ve bilgilendirme mesajlarının yerel kural motorumuzla (`src/core/validation/matchServerMessageToRule.ts`) birebir eşlenmesini ve doğrulanmasını belgeler.

---

## 2. TKGM Sunucu Mesajları Eşleme Kataloğu (P-20)

| TKGM Sunucu Mesajı | Eşlenen Kural | Ciddiyet | Açıklama |
|---|---|---|---|
| `Dosya kontrolleriniz başarılı` | - | BAŞARILI | Dosya tüm şema ve iş kurallarını geçti, tescil edilebilir. |
| `IntegrationState 1001 değil ise, takbisPropertyIdentityNumber -1 değerini almalıdır.` | V-131 | HATA | Bağımsız bölüm entegrasyonu henüz tamamlanmamışsa taşınmaz kimlik -1 olmalıdır. |
| `TakbisPropertyIdentityNumber ile yapıID uyuşmuyor.` | V-070 | HATA | constructionID formatı `TAKBİS-HARF` kuralına uymalıdır. |
| `Sürdürülebilirlik kapsamındaki üretimlerde Bina geometrik uygunluğu 1006 olarak girilmelidir.` | V-072 | HATA | S rejiminde bina geometrik uygunluk kodu 1006 olmalıdır. |
| `Toplam bağımsız bölüm sayısı gmldeki ile uyuşmuyor.` | V-076 | HATA | `totalIndependentSectionCount` dosyadaki BB sayısı ile eşit olmalıdır. |
| `Toplam kat adedi ile gml dosyasındaki kat adedi uyuşmuyor.` | V-077 | HATA | `storeysAboveGround + storeysBelowGround` toplamı `K_` sayısı ile eşit olmalıdır. |
| `Katın parent değeri binanın IDsine eşit olmalıdır.` | V-112 | HATA | `grp:parent` xlink referansı bina kimliğini göstermelidir. |
| `Referanslanan grup üyesi (groupMember) gml dosyası içinde bulunamadı.` | V-113 | HATA | Katta referanslanan BB kimliği dosyada mevcut olmalıdır. |
| `Kat bilgisinde verilen BB sayısı ile gmldeki BB sayısı uyuşmuyor.` | V-114 | HATA | `independentSectionCount` ile `grp:groupMember` sayısı tutarlı olmalıdır. |
| `Bağımsız Bölüm Çizim Alanı, kısım çizim alanlarının toplamından büyük olmalıdır.` | V-127 | HATA | BB küvet alanı bağlı kısımların net alanları toplamından küçük olamaz. |
| `Bağımsız bölüm kısım sayısı hatalı.` | V-128 | HATA | `partCount` değeri bağlı oda sayısına eşit olmalıdır. |
| `bağımsız bölüm geometrik uygunluk 1001 veya 1002 olmalıdır.` | V-129 | HATA | BB geometri uygunluğu kodu yalnız 1001 veya 1002 alabilir. |
| `entegrasyon durumu 1004 olmalıdır.` | V-130 | HATA | BB `integrationState` değeri 1004 olmalıdır. |
| `CardinalDirection aynı değerden birden fazla içeremez.` | V-135 | HATA | Bir BB içinde aynı bakı yönü birden fazla tekrarlanamaz. |
| `Bağımsız Bölüm Brüt Alandan küçük olmalıdır` | V-136 | UYARI | Net plan alanı brüt alandan küçük olmalıdır. |
| `Bağımsız bölümde pencere bulunamadı.` | V-137 | UYARI | Mesken BB birimlerinde dış cephe penceresi aranır. |
| `Bağımsız bölümde, kapı kullanım amacı 1003 olan bir kapı elementi bulunamadı.` | V-138 | UYARI | BB ana giriş kapısı (doorUsage 1003) tanımlanmalıdır. |
| `Oda (Room) geometrisi kapalı bir 3B kabuk oluşturmuyor (val3dity açık kenar hatası).` | V-217 | UYARI | 3B oda kabuğunun manifold ve kapalı olması beklenir. |

---

## 3. Resmî Kabul Örnekleri Özet Durumu

1. **Ornek6 (Standart 4 Katlı Apartman):**
   - Sıfırdan çıkar-üret döngüsünde 0 HATA.
   - 08.11.2026 tarihinde TKGM portalından "Dosya kontrolleriniz başarılı" resmî onayını almıştır.
2. **Ornek1 & Ornek5:**
   - Çıkar -> Üret -> Doğrula testlerinde 0 HATA ve tam manifold kapalı kabuk.
3. **M10 Şablonları (Apartman, Villa, Dubleks, Ticari Zemin):**
   - 4 şablonun tamamı B-Rep ve CityGML üretiminde 0 HATA vermektedir.
