# 💖 Our Love Journey - Photo Album

Isang romantikong interactive 3D digital photo album para sa iyong partner na handang-handa nang i-deploy nang libre sa **GitHub** at **Vercel**!

---

## 📁 Folder Structure

```text
PhotoAlbum/
│
├── index.html          # Pangunahing pahina ng album
├── css/
│   └── style.css       # Romantic dark & warm gold design, 60fps animations
├── js/
│   ├── memories.js     # DITO ILALAGAY ANG INYONG PICTURES AT CAPTIONS
│   └── script.js       # 3D book physics, audio player, at navigation
├── images/             # Dito i-paste ang inyong mga litrato (photo1.jpg, etc.)
└── audio/              # Dito i-paste ang chorus o kanta (music.mp3)
```

---

## 🚀 Paano Idagdag ang Inyong Pictures & Captions

### Option 1 (Pinakamadali para sa Vercel - Recommended):
1. I-save ang inyong mga pictures sa `images/` folder (hal. `pic1.jpg`, `pic2.jpg`).
2. Buksan ang `js/memories.js`.
3. I-type ang inyong mga memories:
   ```javascript
   const albumMemories = [
       {
           title: "Our First Date",
           date: "2023-02-14",
           image: "images/pic1.jpg",
           caption: "Where our beautiful story first began... ❤️"
       },
       {
           title: "Sunset Walk",
           date: "2023-05-20",
           image: "images/pic2.jpg",
           caption: "Holding hands while watching the sky turn into gold."
       }
   ];
   ```

### Option 2 (Gamit ang Website UI):
1. Buksan ang `index.html` sa iyong browser.
2. I-click ang **+ Add New Memory**.
3. Piliin ang picture file o ilagay ang path, isulat ang caption, at i-save.
4. I-click ang **📋 Sync / Export Data** sa itaas at i-click ang **Copy Code**, pagkatapos ay i-paste ito sa `js/memories.js`.

---

## 🎵 Paano Maglagay ng Music / Chorus

1. Kumuha ng MP3 ng inyong paboritong kanta o chorus.
2. Pangalanan itong `music.mp3`.
3. Ilagay ito sa loob ng folder na `audio/` (`audio/music.mp3`).
4. Kapag binuksan ang album, pindutin lang ang umiikot na vinyl disc button sa bandang itaas sa kanan!

---

## 🌐 Paano I-upload sa GitHub at Vercel (Libre!)

### Hakbang 1: Mag-upload sa GitHub
1. Pumunta sa [github.com](https://github.com) at mag-log in.
2. I-click ang **New Repository** (hal. Pangalanan: `our-love-story`). Piliin ang **Public** at i-click ang **Create repository**.
3. I-click ang link na **"uploading an existing file"**.
4. I-drag and drop ang **lahat ng files at folders** mula sa iyong `PhotoAlbum` folder (`index.html`, `css`, `js`, `images`, `audio`).
5. I-click ang **Commit changes**.

### Hakbang 2: I-deploy sa Vercel
1. Pumunta sa [vercel.com](https://vercel.com) at mag-sign in gamit ang iyong GitHub account.
2. I-click ang **Add New...** > **Project**.
3. Hanapin ang repository na ginawa mo (`our-love-story`) at i-click ang **Import**.
4. Iwanan ang lahat ng default settings at i-click ang **Deploy**.
5. Sa loob ng ilang segundo, bibigyan ka ng Vercel ng live link (halimbawa: `https://our-love-story.vercel.app`)!

Maaari mo na itong ipadala sa iyong partner para matingnan niya ito nang live sa kanyang cellphone o laptop!
