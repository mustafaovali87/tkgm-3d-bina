# CLAUDE, 08.11.2026, 11:30, 3DBİNA UYGULAMASI — M2 BİLDİRİMİ (GEMİNİ'YE)

> **Yazan:** Claude, kullanıcı adına.
> Senin günlük kullanım limitin dolduğu için kullanıcı M2'yi bana yazdırdı.
> **Commit:** `efa52cc` ("M2: dosya doğrulayıcı (şartname §6)"), GitHub `main` dalında.

## 0. İLK İŞ: Çalışma alanını doğrula

- AI Studio, GitHub'daki M2'yi çekti; iki taraf eşit (`9c3acca`).
- Çalışma alanında `src/core/validation/` klasörü olmalı. **Yoksa önce GitHub'dan çek.** Eski kopya üzerinden devam edersen 21 dosyalık M2 çalışması ezilir.
- Şunları çalıştır ve sonuçları `docs/ADIM_NOTU.md`'ye yaz:
  - `npm ci`
  - `npm run typecheck` (0 hata beklenir)
  - `npm test` (**59/59** beklenir)
  - `npm run docs:m2`

## 1. M2 sonucu (şartname §11 kabul ölçütü sağlandı)

| Dosya | HATA |
|---|---|
| Ornek1–6, Amasya, Sincan (8 kabul dosyası) | **0** |
| TKGM ret dosyası `GML_M-17273333-F` | **V-202** + V-072/073/074, V-090 (boş TIC), V-130, V-061 |

Ayrıntı ve tablo: `docs/M2_DOGRULAYICI.md`.

## 2. Ne eklendi

- **`src/core/validation/`:** `validateCityGml(xml, dosyaAdı, model, kodListeleri)`.
  - 175 kural kaydı: 136 uygulandı, 13 okuyucuda, 16 ertelendi (gerekçeli), 7 sunucu (T), 3 kısmi (K).
  - Her kuralın `source` (kaynak) ve `status` (durum) alanı var.
  - Kapsam tablosu `npm run docs:m2` ile koddan üretilir; **elle düzenleme**.
- **Rejim tespiti:**
  - Binada GroundSurface varsa **S** (Sürdürülebilirlik), yoksa **E** (eski kılavuz).
  - E rejiminde o dönem yazılmayan öğeler BİLGİ olarak raporlanır (N19).
- **`knownSampleExceptions.ts`:** Şartname §6.14 bilinen istisnaları. Şu an tek kayıt: Ornek2 V-186.
- **`gmlReader.ts` (geriye uyumlu ek):**
  - `ImportedCityObject.surfaces` ve `hostSurfaceTag` alanları eklendi.
  - TIC artık `gml:pos` ile de okunuyor. Önceden Amasya ve Ornek4'te TIC hiç okunmuyordu; bu bir okuyucu hatasıydı.
- **Worker:** Okumadan hemen sonra doğrulamayı da çalıştırıp `validation` raporu döner. App paneli bu raporu H → U → B sırasıyla gösterir; poligon bulgusunda poligon vurgulanır.
- **`verify:samples`:** Satırlara `regime`, `validationMs`, `issueCounts` ve `topRules` eklendi.
- **Testler (`m2.test.ts`):**
  - Ornek6 0 HATA.
  - 18 "tek hata ekleme" testi: Ornek6'ya bir hata konur, ilgili kural HATA vermeli.
  - Katalog bütünlüğü: V-001…V-216'nın tamamı kayıtlı, tekrarsız, kaynaklı.
- **Belgeler:**
  - `KARARLAR.md` §A.7: rejim ve ölçüme dayalı ciddiyetler.
  - `ACIK_SORULAR.md`: ACIK-01 yanıtlandı (Teras öneki `TRS_`, ölçüldü). Yeni sorular ACIK-02…06. Ornek3 dosya adı düzeltildi: `M-87754451-B`.

## 3. Şartnameden sapan ciddiyetler (gerekçeli)

Şartnamede HATA olan, ama TKGM'nin kendi kabul ettiği resmi örneklerde ihlal edilen kurallar **UYARI** yapıldı:
- V-076, V-096 (çatı en alçak noktası kısmı), V-117, V-126, V-137, V-138, V-163.
- V-164'ün "açıklık 10 cm'den fazla taşıyor" kısmı.

Ölçümler `docs/M2_DOGRULAYICI.md` §4'te. Daha katı bir eşik önerirsen, o eşikte 8 kabul dosyasının hâlâ 0 HATA verdiğini göster. Aksi halde kullanıcı karar verir.

## 4. Sana kalan

1. Kodu çek, komutları çalıştır, sonuçları `ADIM_NOTU.md`'ye yaz.
2. M2 kodunu oku. Katılmadığın bir yer varsa gerekçesiyle `docs/ACIK_SORULAR.md`'ye yaz.
3. **M3'e (öznitelik düzeltici + yazıcı) kullanıcı onay vermeden başlama.**

## 5. Qwen hakkında

Bu turda Qwen dosyası yok. Puan **0.75**.
