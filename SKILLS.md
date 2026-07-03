# HabitTracker — Mimari & Yol Haritası

Bu dosya projenin mimari kararlarını ve fazlı yapılacaklar planını tutar. Her faza başlamadan önce bu dosya güncel tutulmalı, faz bitince işaretlenmeli.

## Vizyon

Notion benzeri, kullanıcının kendi "template"ini oluşturduğu, günlük habit'leri tik attığı, takvimde başarılı günlerini gördüğü ve tutarlılık arttıkça gelişen/güçlenen bir karakterle motive edildiği bir alışkanlık takip uygulaması.

- Telefon (iOS + Android): React Native / TypeScript — tek kod tabanı.
- Apple Watch companion: ayrı native Swift/SwiftUI target, aynı Xcode workspace içinde (ayrı proje değil, ek bir target). WatchConnectivity ile telefonla veri paylaşır. Ayrı faz (Faz 5).

## Mimari — Katmanlar

Mevcut durumda tüm dosyalar repo kökünde (App.tsx, HomePage.tsx, CreateTemplate.tsx, types.ts). Hedef yapı:

```
/src
  /screens        ekran seviyesi bileşenler (HomeScreen, CreateTemplateScreen, DailyChecklistScreen, CalendarScreen)
  /components     tekrar kullanılabilir UI parçaları (HabitRow, AvatarWidget, CalendarGrid, ProgressBar, TemplateCard)
  /navigation     stack navigator kurulumu + route tipleri (App.tsx içeriği buraya taşınır)
  /data           repository/persistence katmanı ("backend" karşılığı) — TemplateRepository, DailyLogRepository
  /store          global state (zustand store'ları)
  /hooks          useTemplates, useDailyLog, useStreak gibi custom hook'lar
  /models         TS interface/type tanımları (mevcut types.ts genişler)
  /theme          renkler, spacing, typography sabitleri
  /assets         Lottie JSON dosyaları, ikonlar
  /utils          tarih yardımcıları, streak/vitality hesaplama fonksiyonları
```

"Backend" burada bir sunucu değil, **veri/iş mantığı katmanı** anlamına geliyor: UI hiçbir zaman doğrudan AsyncStorage'a dokunmaz, hep `/data` katmanındaki repository'ler üzerinden konuşur. Böylece ileride AsyncStorage yerine SQLite ya da cloud sync eklenirse UI katmanı değişmez.

## Veri Modeli

```ts
interface HabitDefinition {
  id: string;
  title: string;
  icon?: string;
  order: number;
}

interface Template {
  id: string;
  name: string;
  habits: HabitDefinition[];
  createdAt: string;
  archived?: boolean;
}

interface DailyLog {
  date: string;              // 'YYYY-MM-DD'
  templateId: string;
  completedHabitIds: string[];
}

interface StreakInfo {
  currentStreak: number;
  bestStreak: number;
  vitalityScore: number;     // 0-100, rolling consistency skoru
}
```

## Teknik Kararlar

| Konu | Karar | Gerekçe |
|---|---|---|
| Persistence | `@react-native-async-storage/async-storage` | Mevcut `@react-native-community/async-storage` deprecated, community fork'a geçilmeli |
| State management | zustand | Context+reducer'a göre az boilerplate, persist middleware ile AsyncStorage'a kolay bağlanır |
| Takvim | `react-native-calendars` + custom `dayComponent` | Sıfırdan takvim yazmaktan çok daha az iş, günleri DailyLog'a göre renklendirmeye izin veriyor |
| Karakter animasyonu | `lottie-react-native` | Önceden üretilmiş aşama animasyonlarını oynatmak en hızlı yol; ileride istenirse Skia'ya geçilebilir |

## Gamification — İdle Game Sistemi

Amaç: basit bir "tik at" eyleminin arkasında, idle oyunlardaki gibi bitmeyen bir güç/seviye ilerleyişi olması, ama bunun günlük habit takibini karmaşıklaştırmaması.

### Çekirdek döngü (tema bağımsız)

- Her tamamlanan habit → **Discipline Points (DP)** kazandırır (örn. habit başına 10 DP).
- Günün tüm habit'leri bitince "Perfect Day" bonusu (örn. +50 DP).
- **Streak çarpanı**: ardışık gün sayısı arttıkça DP kazancı çarpanla büyür (7 gün → x1.2, 30 gün → x1.5, 100 gün → x2). Zincir bozulunca çarpan sıfırlanır.
- **Vitality score (0-100)**: son 30 günün ağırlıklı tamamlanma oranı + streak bonusu — "şu an nasılsın" göstergesi, günlük dalgalanabilir. Rolling average + grace period ile hesaplanır ki bir günlük eksik yüzünden aniden çökmesin.
- **DP toplamı hiç sıfırlanmaz** (rebirth hariç). Level eşiği idle-oyun eğrisiyle artar: `gerekliDP(level) = 100 * level^1.5` — ilk seviyeler hızlı, sonrakiler yavaşlar.
- Her 10 level'da bir **tier breakthrough** (Bronz → Gümüş → Altın → Platin → Elmas → Efsanevi...), karakterin görünümü gerçekten değişir, büyük kutlama animasyonu + rozet/unvan açılır.
- **Rebirth (opsiyonel prestij)**: üst tier'e ulaşınca kullanıcı isterse level/DP'yi sıfırlayıp kalıcı küçük bir global çarpan (+%5 DP gibi) ve kalıcı kozmetik iz kazanabilir — %100'e ulaştıktan sonra da bitmeyen bir ilerleme hissi verir.
- Micro-interaction'lar: her tikte "pulse", perfect day'de confetti/sparkle, level-up'ta "power up" animasyonu, tier breakthrough'ta büyük kutlama.

### Tema seçimi — kullanıcı onboarding'de seçiyor

Aynı DP/Level/Tier/Rebirth motoru üzerine, iki farklı "cilt" + oyun mekaniği. Kullanıcı ilk açılışta birini seçiyor (her iki cinsiyete/zevke hitap etsin diye), istatistiksel altyapı aynı kalıyor, sadece görsel/isimlendirme/etkileşim değişiyor:

**A) Savaşçı Yolu — dünyayı fetheden karakter**
- Dünya haritası: her tier bir bölge (Orman → Mağara → Kale → Ejderha İni → Gökyüzü Kalesi...), her bölgede bir canavar/boss var.
- O günkü kazanılan DP = "saldırı puanı", boss'un can barına işlenir; can barı biterse boss yenilir → kutlama → sıradaki bölge/canavara geçilir (bir sonraki tier).
- Streak çarpanı = kritik vuruş şansı/gücü olarak gösterilir.
- Kaçırılan gün ceza olarak DP kaybettirmez, sadece karakter o gün "yorgun/yaralı" duruşta gösterilir (cezalandırıcı değil, nazik geri bildirim).
- Rebirth = "yeni çağa geçiş": zırh/silah tamamen değişir, güç sıfırlanır ama kalıcı bonus kazanılır.

**B) Bahçe Yolu — büyüyen/genişleyen bahçe**
- Bahçe alanı: her tier bir bölüm/mevsim (Çayır → Meyve Bahçesi → Büyülü Koru → Gök Bahçesi...).
- Her tamamlanan habit bahçeye yeni bir tohum/çiçek ekler; DP arttıkça bahçe genişler, yeni parseller ve nadir bitkiler/dekorasyonlar açılır.
- Perfect day'de bahçeye özel nadir bir çiçek/ışık efekti eklenir.
- Kaçırılan gün bazı bitkileri soldurur ama öldürmez — ertesi gün sulanınca canlanır (nazik ceza, cezalandırıcı değil).
- Rebirth = "yeni mevsim/yeni bahçe": eski bahçe bir "anı bahçesi" olarak arşivlenir, yeni bahçeye kalıcı bonusla başlanır.

### Veri modeline ek

```ts
interface GamificationState {
  totalDP: number;
  level: number;
  tier: number;               // her 10 level'da bir artar
  rebirthCount: number;
  theme: 'warrior' | 'garden'; // onboarding'de seçilir
}
```

`GamificationService`, DailyLog'lardan DP/level/tier/vitality hesaplayıp `GamificationState`'i günceller — UI hangi temayı seçtiyse (`warrior`/`garden`) aynı state'i kendi görsel diliyle (dünya haritası vs. bahçe) render eder.

## Takvim Component

`react-native-calendars` ile ay görünümü; her gün DailyLog'a bakılarak: tam başarı (dolu renk/rozet), kısmi başarı (soluk renk), boş (nötr), bugün (özel highlight) olarak işaretlenir.

## Faz Planı

- [x] **Faz 0 — Mimari refactor**: `/src` yapısını kur, mevcut dosyaları taşı, deprecated async-storage paketini değiştir.
- [ ] **Faz 1 — Template CRUD**: gerçek ekleme/silme/düzenleme/sıralama, repository + zustand store bağlantısı (CreateTemplate.tsx'teki hardcoded veri kalkar).
- [ ] **Faz 2 — Günlük tik atma**: DailyLog akışı, tik attıkça persistence, streak/vitality hesaplama.
- [ ] **Faz 3 — Takvim component**.
- [ ] **Faz 4 — İdle game gamification**: DP/Level/Tier/Rebirth motoru, tema seçimi (Savaşçı/Bahçe) onboarding'i, Lottie entegrasyonu, micro-interactions.
- [ ] **Faz 5 — Apple Watch companion**: Swift/SwiftUI watch target + WatchConnectivity senkronizasyonu.

## Notlar / Bilinen Artıklar

- Repo kökünde `habittracker/ios/...` diye tek bir dosyadan ibaret başıboş bir klasör var, muhtemelen ilk kurulumdan kalma artık — silinmesi gerekiyor.

## Gamification/Animasyon için MCP Önerisi

**Higgsfield'ın kendi resmi MCP sunucusu var** (Nisan 2026'da yayınlandı) — tam istediğin şey:
- Hosted endpoint: `https://mcp.higgsfield.ai/mcp`
- Text-to-image, image-to-video, motion preset'ler, **character consistency** (aynı karakteri farklı "seviyelerde" tutarlı üretmek için birebir uygun — bizim 5 aşamalı avatar fikrine çok iyi oturuyor), style preset'ler.
- Claude Code'a eklemek: hesabınla auth olup MCP URL'ini agent ayarlarına eklemen yeterli, API key yönetimi gerekmiyor.
- Ücretsiz katman: ayda 150 kredi.

Alternatif/tamamlayıcı: **fal.ai MCP** (`https://mcp.fal.ai/mcp`) — 1000+ modele (görüntü, video, ses, 3D) erişim, kullandıkça öde, Higgsfield'dan daha ucuz/esnek ama "character consistency" gibi özel bir özelliği yok.

Pratik öneri: avatarın 5 aşamasının ilk taslak görsellerini/kısa animasyonlarını Higgsfield MCP ile (character consistency özelliğini kullanarak) üretip, bunları elle ya da bir dönüştürücüyle Lottie JSON'a çevirip `/src/assets` altına koymak. MCP üretimi canlı kodlama sırasında değil, bir "asset üretim" adımı olarak düşünülmeli.

Kurulum (Claude Code, isteğe bağlı, kullanıcı onayı ile):
```
claude mcp add --transport http higgsfield https://mcp.higgsfield.ai/mcp
claude mcp add --transport http fal-ai https://mcp.fal.ai/mcp --header "Authorization: Bearer YOUR_FAL_KEY"
```

Sources:
- [Connect your AI to 1,000+ models with the fal MCP Server](https://blog.fal.ai/connect-your-ai-to-1-000-models-with-the-fal-mcp-server/)
- [AI Tools - fal](https://fal.ai/docs/documentation/setting-up/mcp)
- [Higgsfield MCP | AI Image & Video Generation for Any Agent](https://higgsfield.ai/mcp)
- [Higgsfield MCP for Claude Code: 60-Second Setup | TECHSY](https://techsy.io/en/blog/higgsfield-mcp-claude-code)
