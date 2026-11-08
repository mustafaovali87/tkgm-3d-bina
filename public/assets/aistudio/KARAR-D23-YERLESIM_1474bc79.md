# CLAUDE, 08.11.2026, 04:50, 3DBİNA UYGULAMASI — KARAR D-23: ANA PENCERE YERLEŞİMİ (GEMİNİ'YE)

> **Yazan:** Claude, kullanıcı adına. Kullanıcı kararı: *"Senin tercihini ekle."*
> **Dayanak:** Normatif şartname `claude_uygulama_sartnamesi_v3.md`:
> - §7.2 Ana pencere düzeni
> - §7.4 2B çizim araçları
> - §7.6 3B sahne
> - §7.7 GML görüntüleyici
>
> **Yapılacak:** Bu metni `docs/KARARLAR.md` dosyasına **§A.6 Arayüz Yerleşimi** başlığıyla ekle. Kod **M1'de** yazılır; F1–F4 düzeltmeleri bitmeden başlanmaz.

---

## D-23.1 Varsayılan yerleşim (şartname §7.2 aynen korunur)

```
┌─────────────┬────────────────────────────┬────────────────────────────┐
│ PROJE AĞACI │ 2B ÇİZİM (aktif kat)       │ 3B SAHNE (canlı)            │
│  ~%15       │  ~%45                      │  ~%40                       │
├─────────────┴────────────────────────────┼────────────────────────────┤
│ DOĞRULAMA PANELİ (H/U/B, tıkla → git)     │ ÖZNİTELİK PANELİ (seçili)   │
└──────────────────────────────────────────┴────────────────────────────┘
```

## D-23.2 Paneller esnek olacak

1. **Boyutlandırma:** Panel sınırları sürüklenerek değişir. Her panel daraltılıp açılabilir.
2. **Kütüphane:** `react-resizable-panels` (MIT) önerilir. npm ile kurulur ve derlemeye gömülür (K91).
3. **Hazır düzenler:** Görünüm menüsünde ve kısayolla seçilir.

   | Ad | Kısayol | Kullanım | Düzen |
   |---|---|---|---|
   | **Standart** | `F5` | Varsayılan | D-23.1 |
   | **Yan Yana** (kullanıcının tarif ettiği) | `F6` | — | Sol yarı 2B çizim; sağ yarıda üstte 3B, altta ağaç ve öznitelik |
   | **Çizim** | `F7` | Plan çizerken | 2B büyük; 3B küçük önizleme; ağaç daraltılmış |
   | **Denetim** | `F8` | Hazır GML incelerken | 3B büyük; doğrulama paneli geniş; 2B gizli |

   - **Not:** Hazır GML incelenirken 2B paneli gizlenir, çünkü içe aktarılan GML'de çizim katmanı yoktur (§7.7).
4. **İkinci monitör:** 3B sahne "Ayrı pencerede aç" komutuyla ikinci bir Electron penceresine taşınabilir.
   - Seçim ve vurgulama iki pencere arasında eş zamanlı kalır.
   - Pencere kapanınca 3B sahne ana pencereye geri döner.
   - Tarayıcı geliştirme ortamında bu komut gizlenir.
5. **Küçük ekran (genişlik < 1366 px):**
   - 2B ve 3B tek alanda sekme olarak gösterilir.
   - Ağaç açılır kenar paneli olur.

## D-23.3 Seçim eşgüdümü (zorunlu)

- **Tek seçim kaynağı:** Seçili nesne tek bir `selection` durumunda tutulur.
  - Ağaçta, 2B'de, 3B'de veya doğrulama panelinde yapılan seçim diğer üçünde de vurgulanır.
  - Öznitelik paneli bu seçimi gösterir.
- **Çift tıklama:**
  - Ağaçta bir kata çift tıklanınca 2B'de o kat aktif olur.
  - 3B'de o kat öne alınır (kat patlatma veya kesit).
- **Hata seçimi:** Doğrulama panelinde bir hata seçilince ilgili poligon 3B'de kırmızı olur ve kamera oraya gider (§7.6). Nesnenin 2B karşılığı varsa 2B'de de gösterilir.

## D-23.4 Arayüz durumu ve kanonik özet

- **Nerede saklanır:**
  - Panel boyutları, seçili hazır düzen, kamera ve ayrı pencere durumu, **kullanıcı ayarı** olarak saklanır (Electron `userData`).
  - Bunlar proje dosyasına (`.tkgm3b`) **yazılmaz**.
- **K89:** Bu durumlar kanonik model özetini **değiştirmez**. Test:
  - Aynı model iki farklı yerleşimde aynı özeti vermeli.
  - Aynı model farklı nesne sırasıyla da aynı özeti vermeli.

## D-23.5 Aşamalara dağılım (yol haritası §11 değişmez)

| Aşama | Yerleşimde gelen |
|---|---|
| **M1** | Pencere iskeleti, D-23.1 düzeni, boyutlandırma, ağaç + 3B görüntüleyici + öznitelik paneli (içe aktarılan GML için), seçim eşgüdümü. 2B paneli yer tutucu: "M4'te gelecek". |
| **M2** | Doğrulama paneli, tıkla → git. |
| **M4** | 2B çizim editörü (§7.4), Çizim ve Yan Yana hazır düzenleri tam çalışır. |
| **M6** | Çizimden canlı 3B (her değişiklikte 3B yenilenir; 300 ms gecikmeli toplu güncelleme önerilir). |
| **M7** | DXF ve resim altlık katmanı. |
| **M10** | İkinci monitör penceresi paketlenmiş Electron'da test edilir. |

## D-23.6 Kabul testi (M1 sonunda Claude bakacak)

1. Ornek6 açılır.
2. Ağaçta `BBK_` seçilince 3B'de aynı nesne vurgulanır ve öznitelik panelinde `partUsage` görünür.
3. Panel boyutları değiştirilip uygulama kapatılıp açılınca aynı kalır.
4. Hazır düzenler `F5–F8` ile değişir. Kanonik özet değişmez.
5. Genişlik 1280 px'e indirilince sekme düzenine geçer.

## Oylama

- Kullanıcı kararıdır, oylamaya girmez.
- Gemini teknik bir sorun görürse (ör. kütüphane uyumsuzluğu) gerekçesiyle yazsın. Eşdeğer bir kütüphane önerebilir.
