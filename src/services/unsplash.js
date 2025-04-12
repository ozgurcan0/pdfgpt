// Unsplash API anahtarı
const UNSPLASH_API_KEY = 'qj9l9wMKw9CtiHUXl5zszIWJrbN_vPWH9y4C-uXDXg4';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

/**
 * Unsplash API'den arama yapar
 * @param {string} query - Arama sorgusu
 * @param {number} page - Sayfa numarası
 * @param {number} perPage - Sayfa başına sonuç sayısı
 * @returns {Promise<Object>} Arama sonuçları
 */
export async function searchImages(query, page = 1, perPage = 10) {
  try {
    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_API_KEY}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Unsplash API hatası: ${errorData.errors?.[0] || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Görsel arama hatası:', error);
    throw new Error('Görseller aranırken bir hata oluştu. Lütfen tekrar deneyin.');
  }
}

/**
 * Kitap kapağı için görsel arar
 * @param {string} title - Kitap başlığı
 * @param {string} genre - Kitap türü
 * @returns {Promise<Array>} Görsel listesi
 */
export async function searchBookCoverImages(title, genre) {
  try {
    // Başlık ve türü birleştirerek daha iyi sonuçlar elde et
    const query = `${genre} ${title} book`;
    
    // Kapak görselleri için daha fazla sonuç getir
    const results = await searchImages(query, 1, 20);
    
    return results.results;
  } catch (error) {
    console.error('Kapak görseli arama hatası:', error);
    throw new Error('Kapak görselleri aranırken bir hata oluştu.');
  }
}

/**
 * Rastgele bir görsel getirir
 * @param {string} query - Arama sorgusu (opsiyonel)
 * @returns {Promise<Object>} Görsel bilgisi
 */
export async function getRandomImage(query = '') {
  try {
    let url = `${UNSPLASH_API_URL}/photos/random`;
    
    if (query) {
      url += `?query=${encodeURIComponent(query)}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Unsplash API hatası: ${errorData.errors?.[0] || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Rastgele görsel hatası:', error);
    throw new Error('Rastgele görsel alınırken bir hata oluştu. Lütfen tekrar deneyin.');
  }
}

/**
 * Görsel indirme bağlantısı oluşturur
 * @param {string} imageUrl - Görsel URL'i
 * @param {string} fileName - İndirilecek dosya adı
 */
export async function downloadImage(imageUrl, fileName) {
  try {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Görsel indirme hatası: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Blob için URL oluştur
    const url = URL.createObjectURL(blob);
    
    // İndirme linki oluştur
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'kapak.jpg';
    
    // Linki tıkla ve temizle
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // URL'yi temizle
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Görsel indirme hatası:', error);
    throw new Error('Görsel indirme işlemi sırasında bir hata oluştu.');
  }
}