// --- 1. KAWALAN JAM & TARIKH ---
function updateClock() {
    const now = new Date();
    document.getElementById('time').innerText = now.toLocaleTimeString('ms-MY', { hour12: false });
    document.getElementById('date').innerText = now.toLocaleDateString('ms-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
setInterval(updateClock, 1000);
updateClock();

// --- 2. PENGIRAAN WAKTU SOLAT (ADHAN.JS) ---
let globalPrayerTimes = null;

function calculatePrayerTimes() {
    // Koordinat Putrajaya/Kuala Lumpur
    const coordinates = new adhan.Coordinates(2.9264, 101.6964);
    const date = new Date();
    const params = adhan.CalculationMethod.Singapore(); 
    params.madhab = adhan.Madhab.Shafi;

    globalPrayerTimes = new adhan.PrayerTimes(coordinates, date, params);
    
    const formatTime = (dateObj) => {
        return dateObj.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    document.querySelector('#pt-subuh .time').innerText = formatTime(globalPrayerTimes.fajr);
    document.querySelector('#pt-syuruk .time').innerText = formatTime(globalPrayerTimes.sunrise);
    document.querySelector('#pt-zohor .time').innerText = formatTime(globalPrayerTimes.dhuhr);
    document.querySelector('#pt-asar .time').innerText = formatTime(globalPrayerTimes.asr);
    document.querySelector('#pt-maghrib .time').innerText = formatTime(globalPrayerTimes.maghrib);
    document.querySelector('#pt-isyak .time').innerText = formatTime(globalPrayerTimes.isha);
}
calculatePrayerTimes();
setInterval(calculatePrayerTimes, 1000 * 60 * 60);

// --- 3. SLIDESHOW MASJID-MASJID DI MALAYSIA ---
const mosquesImages = [
    "https://upload.wikimedia.org/wikipedia/commons/4/4c/Masjid_Putra_1.jpg", // Masjid Putra
    "https://upload.wikimedia.org/wikipedia/commons/e/ee/Masjid_Negara_Malaysia_2.jpg", // Masjid Negara
    "https://upload.wikimedia.org/wikipedia/commons/b/bd/Masjid_Kristal%2C_Kuala_Terengganu.jpg", // Masjid Kristal
    "https://upload.wikimedia.org/wikipedia/commons/6/6b/Masjid_Wilayah_Persekutuan_2.jpg" // Masjid Wilayah
];

let currentBgIndex = 0;
const bgElement = document.getElementById('bg-slideshow');

function changeBackground() {
    bgElement.style.backgroundImage = `url('${mosquesImages[currentBgIndex]}')`;
    currentBgIndex = (currentBgIndex + 1) % mosquesImages.length;
}
// Tukar gambar setiap 15 saat
changeBackground();
setInterval(changeBackground, 15000);


// --- 4. SISTEM PENJADUALAN KONTEN & MEDIA ---
const contentSchedules = [
    {
        id: 1,
        title: "Live Makkah (Streaming Pagi)",
        type: "youtube",
        src: "https://www.youtube.com/embed/live_stream?channel=UC4r8dwz17uE0J9rN1vL3pAg&autoplay=1&mute=1",
        startTime: "08:00", 
        endTimeType: "time",
        endTime: "12:00",   
        active: true
    },
    {
        id: 2,
        title: "Tazkirah / Laporan Kewangan (Placeholder Gambar)",
        type: "image",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png", // Ganti dgn imej anda
        startTime: "12:00",
        endTimeType: "prayer",
        endPrayer: "dhuhr",
        offsetMinutes: -5, // Tamat 5 minit sebelum Zohor
        active: true
    }
    // Anda boleh tambah jadual lain di sini
];

function getRealEndTime(schedule) {
    if (schedule.endTimeType === "time") return schedule.endTime; 
    
    if (schedule.endTimeType === "prayer" && globalPrayerTimes) {
        let prayerTimeObj;
        switch(schedule.endPrayer) {
            case 'fajr': prayerTimeObj = globalPrayerTimes.fajr; break;
            case 'dhuhr': prayerTimeObj = globalPrayerTimes.dhuhr; break;
            case 'asr': prayerTimeObj = globalPrayerTimes.asr; break;
            case 'maghrib': prayerTimeObj = globalPrayerTimes.maghrib; break;
            case 'isha': prayerTimeObj = globalPrayerTimes.isha; break;
        }

        let modifiedTime = new Date(prayerTimeObj.getTime() + schedule.offsetMinutes * 60000);
        let h = modifiedTime.getHours().toString().padStart(2, '0');
        let m = modifiedTime.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    }
    return "23:59";
}

function checkSchedule() {
    const now = new Date();
    const currentH = now.getHours().toString().padStart(2, '0');
    const currentM = now.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${currentH}:${currentM}`;

    let activeContent = null;
    for (let schedule of contentSchedules) {
        if (!schedule.active) continue;
        let endTimeStr = getRealEndTime(schedule);
        if (currentTimeStr >= schedule.startTime && currentTimeStr < endTimeStr) {
            activeContent = schedule;
            break;
        }
    }
    displayContent(activeContent);
}

function displayContent(content) {
    const iframe = document.getElementById('live-stream');
    const video = document.getElementById('custom-video');
    const image = document.getElementById('custom-image');
    const defaultScreen = document.getElementById('default-screen');

    iframe.style.display = 'none';
    video.style.display = 'none';
    image.style.display = 'none';
    defaultScreen.style.display = 'none';

    if (!content) {
        defaultScreen.style.display = 'flex';
        return;
    }

    if (content.type === 'youtube') {
        if(iframe.src !== content.src) iframe.src = content.src;
        iframe.style.display = 'block';
    } 
    else if (content.type === 'video') {
        if(video.getAttribute('src') !== content.src) {
            video.src = content.src;
            video.play();
        }
        video.style.display = 'block';
    } 
    else if (content.type === 'image') {
        image.src = content.src;
        image.style.display = 'block';
    }
}
setInterval(checkSchedule, 30000); // Semak jadual setiap 30 saat
checkSchedule(); // Semak sejurus dimuatkan


// --- 5. AL-QURAN & HADIS TICKER ---
const quotes = [
    { ar: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ", ms: "Sesungguhnya setiap amalan itu bergantung pada niat. (Riwayat Bukhari)" },
    { ar: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ", ms: "Dan jadikanlah sabar dan solat sebagai penolongmu. (Al-Baqarah: 45)" },
    { ar: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", ms: "Sebaik-baik kamu adalah orang yang mempelajari Al-Quran dan mengajarkannya. (Riwayat Bukhari)" }
];

let quoteIndex = 0;
function rotateQuotes() {
    quoteIndex = (quoteIndex + 1) % quotes.length;
    document.getElementById('arabic-text').innerText = quotes[quoteIndex].ar;
    document.getElementById('malay-translation').innerText = quotes[quoteIndex].ms;
}
setInterval(rotateQuotes, 15000);

// --- 6. TEMA & SERVICE WORKER ---
document.getElementById('theme-selector').addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.value);
    localStorage.setItem('azan_theme', e.target.value);
});
const savedTheme = localStorage.getItem('azan_theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-selector').value = savedTheme;
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW Berdaftar!', reg))
            .catch(err => console.error('SW Gagal:', err));
    });
}
