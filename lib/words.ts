/**
 * Daftar kata bahasa Indonesia yang umum, pendek, dan mudah diingat
 * untuk pembuatan frasa sandi (passphrase).
 */
const RAW = `
kopi teh susu roti nasi sayur buah madu gula garam
gunung laut hujan pelangi langit bintang bulan surya awan kabut
embun angin ombak pantai sungai danau pulau hutan sawah kebun
pohon bunga daun akar batu pasir tanah api air udara
besi emas perak kayu bambu rotan padi jagung kelapa pisang
mangga jeruk apel anggur durian rambutan nanas semangka melon pepaya
jambu salak duku sawo nangka manggis kurma delima leci markisa
harimau gajah kancil rusa kuda sapi kambing ayam bebek angsa
merpati elang rajawali kupu lebah semut ikan paus lumba hiu
penyu kepiting udang cumi kerang katak buaya komodo badak kucing
anjing kelinci tupai landak musang panda koala jerapah zebra singa
merah biru hijau kuning ungu jingga putih hitam coklat perak
besar kecil tinggi rendah panjang pendek cepat lambat kuat lembut
hangat dingin sejuk terang gelap indah cerah tenang riang gembira
senang berani pintar rajin ramah santai segar manis asin asam
pedas gurih harum wangi pagi siang sore malam senja fajar
subuh besok minggu tahun jam menit detik musim panen hujan
rumah kamar dapur taman kebun ladang desa kota jalan jembatan
pasar sekolah kampus kantor toko warung kedai gedung menara benteng
istana candi masjid museum stasiun pelabuhan bandara terminal alun kampung
sepeda motor mobil kereta kapal perahu pesawat becak delman roket
bola raket sepatu topi baju celana sarung batik kain benang
jarum gunting pisau sendok garpu piring gelas cangkir teko panci
wajan kompor lampu lilin obor kunci gembok tas dompet payung
jaket kacamata cermin sisir sabun handuk bantal selimut kasur lemari
buku pena pensil kertas tinta kuas lukisan foto peta kamus
musik lagu gitar piano drum seruling gamelan angklung tari wayang
cerita puisi pantun dongeng mimpi harapan cita semangat senyum tawa
sahabat teman keluarga kakak adik nenek kakek paman bibi guru
murid dokter petani nelayan pedagang pilot sopir koki tukang seniman
penulis penyair pelukis penari atlet juara pahlawan raja ratu putri
pangeran ksatria naga garuda merak cendrawasih jalak kenari nuri kakatua
`;

export const WORDS: string[] = Array.from(new Set(RAW.split(/\s+/).map((w) => w.trim()).filter((w) => w.length >= 3)));
