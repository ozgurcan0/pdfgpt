// Pexels API anahtarı ve URL'i
const API_KEY = 'bgan3UWV6vFX8IDiUcsi0UGJLtrwqE5kpNhF7wy5S2NYgogKE4q5spn7';
const API_URL = 'https://api.pexels.com/v1';

/**
 * İmge aramak için kullanılır
 * @param {string} query - Arama sorgusu
 * @param {number} page - Sayfa numarası
 * @param {number} perPage - Sayfa başına sonuç sayısı
 * @returns {Promise<Object>} - Arama sonuçları
 */
export async function searchImages(query, page = 1, perPage = 10) {
  try {
    const response = await fetch(
      `${API_URL}/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Hatası: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Görsel arama hatası:', error);
    throw new Error('Görseller aranırken bir hata oluştu. Lütfen tekrar deneyin.');
  }
}

/**
 * Kitap kapağı için görsel ara
 * @param {string} title - Kitap başlığı
 * @param {string} genre - Kitap türü
 * @param {string} subject - Kitap konusu veya resim açıklaması (opsiyonel)
 * @returns {Promise<Array>} - Bulunan görseller
 */
export async function searchBookCoverImages(title, genre, subject = '') {
  try {
    // Ana konu/anahtar kelimeyi belirle
    let primaryQuery = '';
    let isImagePrompt = false;
    
    // Öncelikle doğrudan resim açıklaması olup olmadığını kontrol et
    if (subject && subject.includes('Resim:')) {
      // Resim: ifadesinden sonraki açıklamayı al
      primaryQuery = subject.trim();
      isImagePrompt = true;
      console.log('Resim açıklaması kullanılıyor:', primaryQuery);
    }
    // Konu varsa onu kullan
    else if (subject && subject.trim() !== '') {
      primaryQuery = subject.trim();
    } 
    // Konu yoksa başlığı kullan
    else if (title && title.trim() !== '') {
      // Başlıktan anahtar kelimeleri çıkar (gereksiz kelimeleri kaldır)
      const titleWords = title.toLowerCase().split(/\s+/)
        .filter(word => word.length > 3 && 
          !['ve', 'ile', 'veya', 'için', 'gibi', 'dair', 'kadar', 'göre'].includes(word));
      
      if (titleWords.length > 0) {
        // En uzun 2 kelimeyi al
        primaryQuery = titleWords
          .sort((a, b) => b.length - a.length)
          .slice(0, 2)
          .join(' ');
      }
    }
    
    // Tür bazlı arama terimleri
    const genreTerms = {
      'roman': 'novel book cover',
      'fantastikRoman': 'fantasy landscape castle',
      'bilimKurgu': 'science fiction space futuristic',
      'polisiye': 'detective mystery crime',
      'korku': 'horror dark scary',
      'romantik': 'romantic love couple',
      'cocukHikayesi': 'children illustration colorful',
      'macera': 'adventure expedition journey',
      'tarihi': 'historical ancient vintage',
      'biyografi': 'portrait person',
      'felsefi': 'philosophy contemplation thought',
      'akademikYazi': 'academic research education',
      'makale': 'document paper article',
      'dokuman': 'document technical guide'
    };
    
    // Türe göre uygun arama terimleri
    const genreTerm = genreTerms[genre] || genre;
    
    // Ana sorguyu oluştur
    let searchQuery = '';
    
    if (primaryQuery) {
      // Doğrudan resim açıklaması ise sadece onu kullan
      if (isImagePrompt) {
        searchQuery = primaryQuery;
      }
      // Resim açıklaması varsa ve 'resim', 'manzara', 'fotoğraf' gibi terimler içeriyorsa
      else if (primaryQuery.match(/resim|manzara|fotoğraf|görsel|arka plan|kapak/i)) {
        searchQuery = primaryQuery;
      }
      // Normal konu/başlık durumunda
      else {
        // Konu veya başlıktan çıkarılan ana sorgu
        searchQuery = `${primaryQuery} ${genreTerm}`;
      }
    } else {
      // Sadece tür bazlı sorgu
      searchQuery = genreTerm;
    }
    
    // Bazı temel terimleri ekle (kitap kapağı için uygun görseller)
    if (!isImagePrompt && !searchQuery.match(/resim|manzara|fotoğraf|görsel|arka plan|kapak/i)) {
      searchQuery = `${searchQuery} book cover`;
    }
    
    console.log('Pexels görsel arama sorgusu:', searchQuery);
    
    // Görselleri ara
    const result = await searchImages(searchQuery, 1, 15);
    
    if (result && result.photos && result.photos.length > 0) {
      return result.photos;
    }
    
    // Sonuç bulunamazsa daha genel bir arama yap
    if (result.total_results === 0) {
      console.log('Spesifik arama sonuç vermedi, daha genel arama yapılıyor...');
      const fallbackQuery = genreTerm;
      const fallbackResult = await searchImages(fallbackQuery, 1, 15);
      return fallbackResult.photos || [];
    }
    
    return [];
  } catch (error) {
    console.error('Kitap kapağı görseli arama hatası:', error);
    throw new Error('Kitap kapağı görselleri aranırken bir hata oluştu.');
  }
}

/**
 * Seçkin imgeleri getirir
 * @param {number} page - Sayfa numarası
 * @param {number} perPage - Sayfa başına sonuç sayısı
 * @returns {Promise<Object>} - Seçkin görsel sonuçları
 */
export async function getCuratedImages(page = 1, perPage = 10) {
  try {
    const response = await fetch(
      `${API_URL}/curated?page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Hatası: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Seçkin görsel getirme hatası:', error);
    throw new Error('Seçkin görseller getirilirken bir hata oluştu. Lütfen tekrar deneyin.');
  }
}

/**
 * Görsel indir
 * @param {string} url - İndirilecek görsel URL'i
 * @returns {Promise<Blob>} - Görsel blob nesnesi
 */
export async function downloadImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Görsel indirme hatası: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Görsel indirme hatası:', error);
    throw new Error('Görsel indirilirken bir hata oluştu.');
  }
} 