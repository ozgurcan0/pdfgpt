// API anahtarı
const API_KEY = 'enter your api key here';

// Gemini API URL'i
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Gemini API'yi kullanarak metin içeriği oluşturur
 * @param {string} prompt - İçerik oluşturmak için istek metni
 * @returns {Promise<string>} - Oluşturulan içerik
 */
export async function generateContent(prompt) {
  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 1,
          topK: 32,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API hatası: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('İçerik oluşturma hatası:', error);
    throw new Error('İçerik oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
  }
}

/**
 * Kitap kapağı için görsel oluşturma isteği oluşturur
 * @param {string} title - Kitap başlığı
 * @param {string} genre - Kitap türü
 * @returns {string} - Kapak görselinin açıklaması
 */
export async function generateCoverPrompt(title, genre) {
  const prompt = `
  Aşağıdaki kitap için çarpıcı ve profesyonel bir kitap kapağı tasarım açıklaması oluştur:
  
  Başlık: ${title}
  Tür: ${genre}
  
  Kapak tasarımı nasıl olmalı, hangi renkleri, görselleri ve tipografiyi içermeli açıkla.
  Açıklama kısa ve net olmalı (en fazla 100 kelime).
  `;
  
  try {
    return await generateContent(prompt);
  } catch (error) {
    console.error('Kapak açıklaması oluşturma hatası:', error);
    throw new Error('Kapak açıklaması oluşturulurken bir hata oluştu.');
  }
}

/**
 * Sayfa sayısını kelime sayısına dönüştürür
 * @param {number} pages - Sayfa sayısı
 * @returns {number} - Tahmini kelime sayısı
 */
function pagesToWords(pages) {
  // Bir sayfada ortalama 300 kelime olduğunu varsayarak
  const perPage = 300;
  
  // Kitap boyutu arttıkça ortalama kelime sayısı artabilir
  if (pages > 100) {
    return pages * 350; // Daha büyük kitaplar için sayfa başına 350 kelime
  } else if (pages > 50) {
    return pages * 325; // Orta büyüklükteki kitaplar için sayfa başına 325 kelime
  } else {
    return pages * 300; // Normal kitaplar için sayfa başına 300 kelime
  }
}

/**
 * Kitap içeriği oluştur
 * @param {Object} options - Kitap özellikleri
 * @returns {Promise<string>} - Oluşturulan kitap içeriği
 */
export async function generateBook(options) {
  const { title, genre, subject, length, style, audience } = options;
  
  // Eğer length sayfa olarak girildiyse, kelime sayısına çevir
  const wordCount = isNaN(parseInt(length)) ? 1500 : pagesToWords(parseInt(length));
  
  let genreSpecificPrompt = "";
  
  switch (genre) {
    case "makale":
      genreSpecificPrompt = `Bu bir akademik makale olmalıdır. Giriş, geliştirme ve sonuç bölümlerini içermelidir. En az 5 bölüm ve akademik referanslar içermelidir. Makale bir taslak DEĞİL, yayına hazır tam bir akademik makale olmalıdır.`;
      break;
    case "akademikYazi":
      genreSpecificPrompt = `Bu bir akademik çalışma olmalıdır. Literatür taraması, metodoloji, bulgular, tartışma ve sonuç bölümlerini içermelidir. En az 6 bölüm ve bilimsel referanslar içermelidir. Çalışma bir taslak DEĞİL, yayına hazır tam bir akademik eser olmalıdır.`;
      break;
    case "hikaye":
      genreSpecificPrompt = `Bu bir kısa hikaye olmalıdır. Güçlü karakter gelişimi, sürükleyici olay örgüsü ve etkileyici bir sonuç içermelidir. Diyaloglar canlı ve gerçekçi olmalıdır. Karakterlerin iç dünyaları detaylı bir şekilde anlatılmalıdır. Hikaye bir taslak DEĞİL, yayına hazır tam bir edebi eser olmalıdır.`;
      break;
    case "cocukHikayesi":
      genreSpecificPrompt = `Bu bir çocuk hikayesi olmalıdır. Basit dil, ilgi çekici karakterler ve olumlu bir mesaj içermelidir. Her bölümde resim açıklamaları olmalıdır. Çocuklar için uygun, eğitici ve eğlenceli olmalıdır. Hikaye bir taslak DEĞİL, yayına hazır tam bir çocuk kitabı olmalıdır.`;
      break;
    case "roman":
      genreSpecificPrompt = `Bu bir roman olmalıdır. Derinlikli karakter gelişimi, detaylı olay örgüsü, canlı diyaloglar ve çarpıcı bölümler içermelidir. Ana karakter(ler) ve yan karakterler arasındaki ilişkiler net bir şekilde işlenmeli ve olay örgüsü tutarlı olmalıdır. Roman bir taslak DEĞİL, yayına hazır tam bir edebi eser olmalıdır.`;
      break;
    case "fantastikRoman":
      genreSpecificPrompt = `Bu bir fantastik roman olmalıdır. Eşsiz bir dünya inşası, büyü sistemleri, olağandışı yaratıklar ve epik bir hikaye içermelidir. Dünya kuralları tutarlı olmalı ve karakterlerin bu dünyadaki gelişimleri detaylı işlenmelidir. Roman bir taslak DEĞİL, yayına hazır tam bir fantastik eser olmalıdır.`;
      break;
    case "bilimKurgu":
      genreSpecificPrompt = `Bu bir bilim kurgu eseri olmalıdır. Bilimsel kavramları kullanarak geleceğe dair projeksiyonlar yapmalı, teknolojik gelişmelerin toplum üzerindeki etkilerini incelemeli ve ilgi çekici bir öykü anlatmalıdır. Eser bir taslak DEĞİL, yayına hazır tam bir bilim kurgu olmalıdır.`;
      break;
    case "polisiye":
      genreSpecificPrompt = `Bu bir polisiye roman olmalıdır. Merkezdeki suç veya gizem, ipuçları, şüpheliler ve çözüm süreci detaylı işlenmelidir. Gerilim unsurları ve beklenmedik dönüşler içermelidir. Roman bir taslak DEĞİL, yayına hazır tam bir polisiye eser olmalıdır.`;
      break;
    case "korku":
      genreSpecificPrompt = `Bu bir korku hikayesi olmalıdır. Gerçekçi bir korku atmosferi, psikolojik gerilim, tedirgin edici unsurlar ve okuyucuyu korkutacak betimlemeler içermelidir. Hikaye bir taslak DEĞİL, yayına hazır tam bir korku eseri olmalıdır.`;
      break;
    case "romantik":
      genreSpecificPrompt = `Bu bir romantik hikaye olmalıdır. Karakterler arasındaki duygusal bağlar, ilişkilerin gelişimi ve romantik anlar detaylı işlenmelidir. Hikaye bir taslak DEĞİL, yayına hazır tam bir romantik eser olmalıdır.`;
      break;
    case "biyografi":
      genreSpecificPrompt = `Bu bir biyografi olmalıdır. Kişinin hayatı, başarıları, zorlukları ve etkisi kronolojik bir sırayla ve detaylı anlatılmalıdır. Biyografi bir taslak DEĞİL, yayına hazır tam bir biyografik eser olmalıdır.`;
      break;
    case "dokuman":
      genreSpecificPrompt = `Bu bir teknik doküman olmalıdır. Açık talimatlar, adım adım kılavuzlar ve teknik terimler içermelidir. Düzenli başlıklar ve alt başlıklar kullanılmalıdır. Doküman bir taslak DEĞİL, yayına hazır tam bir teknik doküman olmalıdır.`;
      break;
    case "macera":
      genreSpecificPrompt = `Bu bir macera hikayesi olmalıdır. Heyecan verici olaylar, tehlikeler, keşifler ve karakterlerin bu maceradaki gelişimleri detaylı anlatılmalıdır. Hikaye bir taslak DEĞİL, yayına hazır tam bir macera eseri olmalıdır.`;
      break;
    case "tarihi":
      genreSpecificPrompt = `Bu bir tarihi eser olmalıdır. Belirli bir tarihsel dönem, önemli olaylar ve kişiler gerçeğe uygun olarak işlenmelidir. Dönemin kültürel, sosyal ve politik özellikleri yansıtılmalıdır. Eser bir taslak DEĞİL, yayına hazır tam bir tarihi kitap olmalıdır.`;
      break;
    case "felsefi":
      genreSpecificPrompt = `Bu bir felsefi eser olmalıdır. Derin düşünce soruları, felsefi tartışmalar ve fikirler akıcı bir dille anlatılmalıdır. Eser bir taslak DEĞİL, yayına hazır tam bir felsefi kitap olmalıdır.`;
      break;
    default:
      genreSpecificPrompt = `Bu bir ${genre} olmalıdır. En az 12 bölüm içermeli ve her bölüm detaylı ve çekici olmalıdır. Eser bir taslak DEĞİL, yayına hazır tam bir kitap olmalıdır.`;
  }
  
  const prompt = `
  Lütfen aşağıdaki spesifikasyonlara göre çok detaylı ve kapsamlı bir kitap içeriği oluştur:
  
  Başlık: ${title}
  Tür: ${genre}
  Konu: ${subject}
  Uzunluk: Tam olarak ${wordCount} kelime (yaklaşık ${length} sayfa)
  Stil: ${style}
  Hedef Kitle: ${audience}
  
  ${genreSpecificPrompt}
  
  ÖNEMLİ: Bu kitap bir TASLAK DEĞİL, tamamen bitmiş ve yayına hazır bir eser olmalıdır. Kesinlikle tam uzunlukta, detaylı ve profesyonel olmalıdır.
  
  İçerik tamamen Türkçe olmalı ve orijinal olmalıdır. 
  Kitaba bir kapak sayfası ve içindekiler bölümü ile başla. İçindekiler bölümünde kitabın tüm bölümlerini listele.
  Her bölümün başlığı "# Bölüm Başlığı" formatında olmalı.
  Alt başlıklar "## Alt Başlık" formatında olmalı.
  Paragraflar arasında boş satır bırakarak yazmalısın.
  
  Her bölüm başlığından sonra kısa bir giriş ve sonra o bölümün içeriğini yaz.
  Her bölüm en az 4-5 sayfa uzunluğunda olmalı ve bölümler arasında mantıklı bir geçiş olmalıdır.
  Diyaloglar için düzgün tırnak işaretleri kullan ve her konuşmacıyı belirt:
  "Bu bir konuşma örneğidir," dedi Ahmet.
  
  Kitabın konusu olan "${subject}" ile ilgili doğru, detaylı ve kapsamlı bilgiler vermelisin.
  
  ÖNEMLİ: Kitap formatında, profesyonel bir kitap gibi yazmalısın. İçerik kesinlikle en az ${wordCount} kelime olmalıdır ve her kelimesi anlamlı, gereksiz tekrarlardan uzak olmalıdır!
  Bu kitap satışa sunulacak bir ürün gibi düşünülmeli ve o kalitede olmalıdır.
  `;
  
  try {
    // Daha uzun içerik için API parametrelerini ayarla
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.85,  // Yaratıcı içerik için dengelenmiş sıcaklık
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,  // Maksimum çıktı uzunluğu
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API hatası: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Oluşturulan içeriğin uzunluğunu kontrol et
    const generatedContent = data.candidates[0].content.parts[0].text;
    const generatedWords = generatedContent.split(/\s+/).length;
    
    // Eğer içerik istenilen uzunluktan kısaysa, daha uzun içerik talep et
    if (generatedWords < wordCount * 0.8) {
      console.log(`İçerik çok kısa (${generatedWords} kelime). Daha uzun içerik talep ediliyor...`);
      
      // Daha detaylı bir istek oluştur
      const enhancedPrompt = `
      ${prompt}
      
      ÖNEMLİ EK TALEP: Gönderilen içerik sadece ${generatedWords} kelime içeriyor, bu istenilen ${wordCount} kelimenin çok altında. 
      Lütfen içeriği GENİŞLET ve her bölümü daha detaylı hale getir. 
      Her paragrafa daha fazla detay ekle, diyalogları genişlet, betimlemeleri zenginleştir.
      İçerik kesinlikle en az ${wordCount} kelime olmalıdır! Bu bir taslak değil, yayına hazır bir kitap olmalıdır.
      `;
      
      // Yeni bir istek gönder
      const enhancedResponse = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: enhancedPrompt }]
          }],
          generationConfig: {
            temperature: 0.9,  // Daha da yaratıcı içerik için
            topP: 1,
            topK: 40,
            maxOutputTokens: 8192,  // Maksimum çıktı uzunluğu
          }
        })
      });
      
      if (!enhancedResponse.ok) {
        const errorData = await enhancedResponse.json();
        throw new Error(`API hatası: ${errorData.error?.message || enhancedResponse.statusText}`);
      }
      
      const enhancedData = await enhancedResponse.json();
      return enhancedData.candidates[0].content.parts[0].text;
    }
    
    return generatedContent;
  } catch (error) {
    console.error('Kitap oluşturma hatası:', error);
    throw new Error('Kitap içeriği oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
  }
} 
