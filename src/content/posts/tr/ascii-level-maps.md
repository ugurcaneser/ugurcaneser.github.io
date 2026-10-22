---
title: Pizza Assassin'in 40 bölümü birer metin dosyası
description: Bir Godot platform oyununda bölümlerin ASCII harita olarak çizilmesi, bir build script'iyle sahneye dönüştürülmesi ve oyuncunun ne kadar zıplayabildiğini bilen testlerle kontrol edilmesi.
date: 2026-10-22
project: pizza-assassin
tags: [Godot, GDScript, Bölüm tasarımı, Araçlar]
---

Pizza Assassin pixel-art bir gizlilik platform oyunu: bir pizza kuryesisin, rakip kuryelere arkadan sessizce yaklaşıp onları tek darbede saf dışı bırakıyor ve pizzayı daha sıcakken kapıya yetiştiriyorsun. Oyunda altı dünyaya yayılmış 40 bölüm var ve hiçbiri Godot'nun sahne editöründe yapılmadı. Her bölüm `levels/` klasöründe düz bir metin dosyası; onu sahneye bir build script'i çeviriyor.

Bu yazıda bu sistemin parçalarını anlatıyorum: harita formatı, ayrıştırıcı (parser), sahne üretici ve her haritanın üzerinden geçen testler.

## Bölüm, karakterlerden oluşan bir ızgara

İlk bölüm `levels/first_delivery.txt` şöyle görünüyor (üstteki boş satırları kırptım):

```txt title="levels/first_delivery.txt"
; 1-1: learn to run, jump, swing and deliver.
@par 22
@theme street
@hint 1 HINT_MOVE
@hint 2 HINT_JUMP
@hint 3 HINT_ATTACK
@hint 4 HINT_SPIKES
@hint 5 HINT_HOT
...............................................................*....................
....................................................................................
...................*................................................................
.............................................................====...................
*..................................T................................................
...................C..............====..................====........................
..P.1.....2...C...CC....3...T..T......4..^^.........5...............^^........D.....
##############################################...###################################
##############################################...###################################
##############################################...###################################
```

Oyunun bu dosyadan ürettiği bölüm ise bu:

![İlk bölümün oyun içinden tam görüntüsü: kasalar, tenteler, bir boşluk ve sağda teslimat kapısı olan bir sokak](../../../assets/posts/pizza-assassin/first-delivery.png)

Her karakter 16×16 piksellik bir hücre. `#` zemin, `=` alttan zıplayıp üstüne çıkabildiğin bir tente, `C` kasa, `P` oyuncunun başladığı yer, `D` teslimat kapısı. `T` antrenman mankeni, `^^` bir çift diken, rakamlar ipucu tabelaları, `*` ise gizli bir malzeme. Sonraki dünyalar yeni harfler ekliyor: nöbetçiler, uyuyan rakipler, yaylar, çöken bloklar, su, hareketli platformlar, lambalar, ışık anahtarları ve avizeler. Tüm lejant ayrıştırıcının en üstündeki doc yorumunda duruyor, yani formatın tek bir dokümantasyonu var.

`@` ile başlayan satırlar direktif. `@par`, "hâlâ sıcak" yıldızı için hedef süreyi belirliyor; `@theme` tile setini, arka planı ve müziği seçiyor; `@hint 3 HINT_ATTACK` de `3` ile işaretli tabelanın hangi çeviri anahtarını göstereceğini söylüyor. `;` ile başlayan satırlar yorum ve formatın en işe yarayan parçası bunlar çıktı. Zor bölümler kısa bir tasarım notuyla açılıyor:

```txt title="levels/power_cut.txt"
; 6-2: light switches. A hit puts out the lamps a switch is wired to (see
; the conduits), and someone always comes over to switch them back on.
; 1) A guard under a lamp, its switch on your side: lights out, and he
;    comes to you in the dark.
; 2) Two guards under two lamps on one switch: both come running.
```

Bölümün amacı, onu hayata geçiren yerleşimin hemen üstünde duruyor ve ikisi de aynı diff'te görünüyor.

## Ayrıştırma: ilk hatada durma, hepsini topla

`LevelMap.parse()` metni iki şeye çeviriyor: tile hücrelerinden oluşan bir sözlük (`Vector2i -> Cell`) ve varlıkların listesi (`{kind, cell, facing, ...}`). Karakterlerin çoğu doğrudan bir tablodan okunuyor:

```gdscript title="scripts/core/level_map.gd"
const TILE_CHARS := {"#": Cell.GROUND, "=": Cell.PLATFORM, "C": Cell.CRATE, "~": Cell.WATER}
const ENTITY_CHARS := {
	"P": &"player", "D": &"door", "E": &"rival", "e": &"rival", "T": &"dummy",
	"^": &"spikes", "K": &"checkpoint", "Z": &"sleeper", "S": &"spring",
	# ...
}
## Lower-case enemy letters face right; everything else faces left.
const FACING_RIGHT := "erbgn"
```

Birkaçı bağlam istiyor. Dikenler çift olmak zorunda. Hareketli platform bir yol olarak çiziliyor (yatayda `M----m`, dikeyde `M` ve altında `m` ile biten bir `|` sütunu) ve ayrıştırıcı platformun nerede geri döneceğini bulmak için bu yolu takip ediyor. İpucu rakamlarının da eşleşen bir `@hint` satırı olmalı.

Ayrıştırıcı hiçbir zaman hata fırlatmıyor. Sorun olan her şey `map.errors` listesine ekleniyor ve okuma devam ediyor; böylece bozuk bir harita bütün sorunlarını tek seferde raporluyor. Builder'a bilerek bozulmuş dört satırlık bir harita verince çıktı şu:

```txt
broken.txt:
  unpaired spike at 5,1
  hint 3 at 5,2 has no @hint
  need exactly one door, found 0
  map is 4 rows, need at least 17
```

Bazı kurallar sözdiziminin ötesine geçiyor. Işık anahtarları hangi lambaları kontrol ettiğini söylemiyor: her lamba, 16 hücre içindeki en yakın anahtara bağlanıyor. Bu haritayı okunur tutuyor ama eşitlik durumlarını mümkün kılıyor. Bu yüzden ayrıştırıcı iki anahtara eşit uzaklıktaki bir lambayı da, menzilinde hiç lamba olmayan bir anahtarı da reddediyor. Bölüm tasarımcısı (yani ben) belirsiz bir yerleşimi oynayarak değil, oyun yayınlanmadan önce öğreniyor.

## Sahne üretmek: kopyalama, miras al

`tools/levels/build_levels.gd`, headless çalışan bir `SceneTree` script'i:

```bash
godot --headless -s tools/levels/build_levels.gd
```

Katalogdaki her bölüm için haritayı okuyor, bir node ağacı kuruyor ve `scenes/levels/<id>.tscn` olarak kaydediyor. İşin püf noktası bu ağacın nasıl kurulduğu:

```gdscript title="tools/levels/build_levels.gd"
# Edit states make pack() store only differences: the level inherits
# level_base.tscn and entities stay plain instances of their scenes, so
# later changes to those scenes still reach every level.
var root: Level = BASE.instantiate(PackedScene.GEN_EDIT_STATE_MAIN_INHERITED)
```

Düz bir `instantiate()` çağrısı, temel bölümün (kamera, HUD, duraklatma menüsü, arka planlar) tam bir kopyasını 40 dosyanın hepsine gömerdi. `GEN_EDIT_STATE_MAIN_INHERITED` ile kaydedilen sahne `level_base.tscn`'yi *miras alıyor* ve yalnızca farkları saklıyor. Düşmanlar, kapılar ve lambalar `GEN_EDIT_STATE_INSTANCE` ile oluşturuluyor; böylece her bölüm `rival_courier.tscn`'yi kopyalamak yerine ona referans veriyor. Rakip kuryenin görünüşünü değiştirdiğimde hiçbir şeyi yeniden build etmem gerekmiyor.

Builder'ın geri kalanı haritadan node'lara düz bir çeviri:

- **Tile'lar** tek bir `TileMapLayer`'a gidiyor. `tile_for()` zemini komşulara bakarak otomatik döşüyor (üst kenar, sol uç, sağ uç, dolgu); tema da tile atlasındaki satırı seçiyor.
- **Varlıklar** hücrelerinin alt ortasına yerleştiriliyor, böylece karakterler zemine basıyor. Lambalar ise ışıklarının ne kadar aşağı düştüğünü (`lamp_reach()`) ve tavana ulaşmak için ne uzunlukta bir kabloya ihtiyaç duyduklarını ölçüyor.
- **Su**, yatay her su yüzeyi için bir çarpışma şeridi olan tek bir `Area2D`'ye dönüşüyor.
- **Karanlık bölümler** (lamba ya da gece bekçisi olan her harita) üstüne bir karanlık katmanı alıyor.

Üretilen sahneler commit ediliyor ama kimse onları elle düzenlemiyor. Builder'ın kendi başlık yorumu da bunu söylüyor.

## Diff'leri dürüst tutmak

İlk sürümün can sıkıcı bir sorunu vardı. Godot 4, kaydedilen sahnedeki her node'a rastgele bir `unique_id` veriyor ve her kayıtta yenisini üretiyor. Tek bir haritada tek karakter değiştirip bölümleri yeniden build edince, bütün bölümlerin sahne dosyaları baştan yazılıyordu.

Çözüm, kayıttan sonra çalışan bir geçiş. Builder kaydetmeden önce eski dosyayı okuyor; kaydettikten sonra da zaten var olan her node'a, parent yolu ve ismiyle eşleştirerek eski id'sini geri veriyor:

```gdscript title="tools/levels/build_levels.gd"
## text with each node's unique_id taken from old_text, for the nodes that
## were already there (same parent and name).
func _keep_node_ids(text: String, old_text: String) -> String:
	var old_ids := {}
	for line in old_text.split("\n"):
		var key := _node_key(line)
		if key != "":
			old_ids[key] = _node_id.search(line).get_string()
	var lines := text.split("\n")
	for i in lines.size():
		var key := _node_key(lines[i])
		if old_ids.has(key):
			lines[i] = _node_id.sub(lines[i], old_ids[key])
	return "\n".join(lines)
```

Bunun çalışmasının sebebi node isimlerinin deterministik olması. Varlıklar tür ve sırayla isimlendiriliyor (`Rival1`, `Lamp3`), yani aynı harita her zaman aynı isimleri üretiyor. Artık yeniden build, dokunmadığım her bölüm için `unchanged` yazıyor ve bir bölüm düzenlemesinin diff'inde yalnızca gerçekten yer değiştiren node'lar görünüyor.

## Oyuncunun ne kadar zıpladığını bilen testler

Metin haritalar bölümleri test etmeyi kolaylaştırıyor, çünkü bir test onları doğrudan okuyabiliyor. `tests/unit/test_levels.gd` ([GUT](https://github.com/bitwes/Gut) ile çalışıyor) katalogdaki her bölümü kontrol ediyor.

**Kapıya ulaşılabiliyor ve hiçbir çıkıntı ulaşılamaz kalmıyor.** Test önce oyuncunun basabileceği her yüzeyi buluyor (katı ve üstünde iki boş hücre olan), sonra başlangıç noktasından, hareket ayarlarından türetilmiş zıplama sınırlarıyla bir genişlik öncelikli arama (BFS) yapıyor:

```gdscript title="tests/unit/test_levels.gd"
## Jump reach in tiles, from MovementStats defaults (48 px jump, 110 px/s):
## about 4.3 tiles across when landing 1 tile higher, 3.8 when 2 higher.
const REACH_UP_1 := 4
const REACH_UP_2 := 3
const MAX_CLIMB := 2
## A spring (96 px launch) reaches 6 tiles up, drifting up to 4 across.
const SPRING_CLIMB := 6
const SPRING_REACH := 4
```

Kapı ulaşılabilen kümede olmak zorunda; diğer her yüzey de öyle. Ulaşılamayan bir çıkıntı ya bir hatadır ya da bir çıkmaz sokak; ikisini de yakalamaya değer.

**Her malzeme toplanabiliyor.** Her bölüm tam olarak üç malzeme saklıyor: hiçbiri duvarın içinde değil, her biri ulaşılabilen bir yüzeyin en fazla üç hücre üstünde (yay üstündeyse daha yüksekte) ve hiçbiri kapının ötesinde değil, çünkü kapıya dokunmak bölümü bitiriyor.

**Par süresi adil.** Par, haritanın bir ucundan öbürüne son hızla koşma süresinin 1,4 ile 5 katı arasında olmalı. Altında yıldız imkânsız, üstünde ise acele etmeye gerek kalmıyor.

**Motorun sınırları aşılmıyor.** Karanlık shader'ı aynı anda en fazla 16 ışık kaynağı alabiliyor. Bu yüzden test her karanlık bölümde 40 tile'lık bir pencereyi (aşağı yukarı geniş bir telefon ekranı) kaydırıp içindeki lamba, avize ve gece bekçilerini sayıyor.

**Sahne haritayla uyuşuyor.** Bu test haritayı okuyor, üretilmiş sahneyi yüklüyor ve tile sayısını, başlangıç noktasını, kapının konumunu, kamera sınırlarını ve par süresini karşılaştırıyor. Bir `.txt` dosyasını düzenleyip builder'ı çalıştırmayı unuttuğumda kırılıyor ve hata mesajında da bunu söylüyor.

## Bu kurulum bana ne kazandırıyor

- **Bölümler kod gibi gözden geçiriliyor.** Bir yerleşim değişikliği, diff'te birkaç karakterden ibaret ve onu açıklayan yorumun hemen yanında duruyor.
- **Hatalar test sırasında çıkıyor, oyun testinde değil.** "Bu çıkıntıya ulaşılamıyor" ya da "bu iki anahtar aynı lamba için çekişiyor" koordinatlı birer hata mesajı.
- **Ortak sahneler ortak kalıyor.** Builder temel bölümü miras alıp geri kalan her şeyi instance olarak eklediği için rakip kuryede ya da HUD'da yaptığım bir değişiklik, yeniden build gerektirmeden 40 bölümün hepsine ulaşıyor.

Asıl ödünleşim şu: harita yalnızca yerleşimi ifade edebiliyor. Izgaraya yerleştirmek yerine hassas biçimde sahnelenmesi gereken bir bölüm, ya yeni bir direktif ya da elle yapılmış bir sahne gerektirirdi. Şimdiye kadarki 40 bölümün hepsi bir karakter ızgarasına sığdı.
