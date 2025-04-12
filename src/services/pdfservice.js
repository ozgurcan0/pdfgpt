import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Türkçe karakter desteği için özel yazı tipi
// import { addFont } from 'jspdf';

/**
 * Kitap içeriğini PDF'e dönüştürür
 * @param {string} title - Kitap başlığı
 * @param {string} content - Kitap içeriği
 * @param {string} coverImageUrl - Kapak resmi URL'si (opsiyonel)
 * @returns {Blob} PDF dosyası blob nesnesi
 */
export async function generatePDF(title, content, coverImageUrl = null) {
  try {
    // AI çıktısını temizle
    const cleanedContent = cleanAIOutput(content);
    
    // A4 boyutunda PDF oluştur
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      compress: true
    });
    
    // Sayfa değişkenleri
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const usableWidth = pageWidth - (margin * 2);
    
    // ------------------------
    // KAPAK SAYFASI
    // ------------------------
    if (coverImageUrl) {
      try {
        await addCoverImage(doc, coverImageUrl, title, pageWidth, pageHeight, margin, usableWidth);
      } catch (error) {
        console.error("Kapak resmi eklenirken hata oluştu:", error);
        createBookCover(doc, title, pageWidth, pageHeight, margin, usableWidth);
      }
    } else {
      createBookCover(doc, title, pageWidth, pageHeight, margin, usableWidth);
    }
    
    // Kapak sayfasından sonra içindekiler için yeni sayfa
    doc.addPage();
    let currentPage = 2;
    
    // İçeriği paragraflara ayır
    const paragraphs = cleanedContent.split('\n\n');
    
    // Başlıkları topla (içindekiler için)
    const chapterTitles = [];
    const chapterPages = {};
    
    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (trimmed.startsWith('# ') && !trimmed.toLowerCase().includes('içindekiler')) {
        const title = trimmed.substring(2).trim();
        chapterTitles.push(title);
      }
    }
    
    // ------------------------
    // İÇİNDEKİLER SAYFASI
    // ------------------------
    createTableOfContents(doc, chapterTitles, pageWidth, pageHeight, margin, usableWidth);
    currentPage++;
    
    // İçindekilerden sonra içerik için yeni sayfa
    doc.addPage();
    currentPage++;
    
    // İçerik bölümü değişkenleri
    let y = margin;
    let inTocSection = false;
    
    // ------------------------
    // İÇERİK SAYFASI
    // ------------------------
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i].trim();
      
      // İçindekiler bölümünü atla
      if (paragraph.toLowerCase().includes('içindekiler') || 
          paragraph.toLowerCase().includes('içerik tablosu')) {
        inTocSection = true;
        continue;
      }
      
      // İçindekiler bölümünden çık (bir başlıkla karşılaştığımızda)
      if (inTocSection && paragraph.startsWith('# ')) {
        inTocSection = false;
      }
      
      // İçindekiler bölümündeyken içeriği atla
      if (inTocSection) continue;
      
      // Üstbilgi ve altbilgi ekle
      addHeaderFooter(doc, title, currentPage - 2, pageWidth, pageHeight);
      
      // Ana başlıklar
      if (paragraph.startsWith('# ')) {
        // Başlık metni
        const headerText = paragraph.substring(2).trim();
        
        // Her bölüm yeni sayfada başlar
        if (y > margin) {
          doc.addPage();
          currentPage++;
          y = margin;
          addHeaderFooter(doc, title, currentPage - 2, pageWidth, pageHeight);
        }
        
        // Başlık fontunu ayarla
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0); // Başlıklar için siyah renk
        
        // Başlığı ekle
        const headerLines = doc.splitTextToSize(convertToUtf8(headerText), usableWidth);
        doc.text(headerLines, margin, y);
        
        // İçindekiler için sayfa numarasını kaydet
        chapterPages[headerText] = currentPage - 2;
        
        // Y pozisyonunu güncelle
        y += (headerLines.length * 8) + 10;
      }
      // Alt başlıklar
      else if (paragraph.startsWith('## ')) {
        // Alt başlık metni
        const subHeaderText = paragraph.substring(3).trim();
        
        // Sayfa taşması kontrolü
        if (y + 15 > pageHeight - margin) {
          doc.addPage();
          currentPage++;
          y = margin;
          addHeaderFooter(doc, title, currentPage - 2, pageWidth, pageHeight);
        }
        
        // Alt başlık fontunu ayarla
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30); // Alt başlıklar için koyu gri
        
        // Alt başlığı ekle
        const subHeaderLines = doc.splitTextToSize(convertToUtf8(subHeaderText), usableWidth);
        doc.text(subHeaderLines, margin, y);
        
        // Y pozisyonunu güncelle
        y += (subHeaderLines.length * 7) + 8;
      }
      // Normal paragraflar
      else if (paragraph !== '') {
        // Font ayarları
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40); // Normal metin için koyu gri
        
        // Türkçe karakter desteği için metni dönüştür
        const normalizedText = convertToUtf8(paragraph);
        
        // Metni satırlara böl
        const lines = doc.splitTextToSize(normalizedText, usableWidth);
        
        // Satır yüksekliği ve toplam yükseklik
        const lineHeight = 6;
        const totalHeight = lines.length * lineHeight;
        
        // Sayfa taşması kontrolü
        if (y + totalHeight > pageHeight - margin) {
          doc.addPage();
          currentPage++;
          y = margin;
          addHeaderFooter(doc, title, currentPage - 2, pageWidth, pageHeight);
        }
        
        // Metni ekle
        doc.text(lines, margin, y);
        
        // Y pozisyonunu güncelle
        y += totalHeight + 6;
      }
    }
    
    // Son kontrol olarak, içindekiler sayfasına dön ve sayfa numaralarını ekle
    doc.setPage(2); // İçindekiler sayfası
    
    let tocY = margin + 15; // İçindekiler başlığından sonraki pozisyon
    
    // İçindekiler için font ayarları
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50); // İçindekiler metni için koyu gri
    
    // Her bölüm için
    for (const title of chapterTitles) {
      if (chapterPages[title]) {
        // Başlık uzunluğu
        const titleWidth = doc.getTextWidth(convertToUtf8(title));
        
        // Nokta çizgisi ve sayfa numarası için yer hesapla
        const dotStart = margin + titleWidth + 5;
        const pageNumX = pageWidth - margin;
        
        // Nokta çizgisi çiz
        let dots = '';
        for (let i = 0; i < Math.floor((pageNumX - dotStart) / 3); i++) {
          dots += '. ';
        }
        doc.text(dots, dotStart, tocY);
        
        // Sayfa numarasını sağa hizalı yaz
        doc.text(String(chapterPages[title]), pageNumX, tocY, { align: 'right' });
        
        // Sonraki başlık için Y pozisyonunu güncelle
        tocY += 8;
      }
    }
    
    // PDF'i blob olarak döndür
    const pdfBlob = doc.output('blob');
    return pdfBlob;
  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    throw new Error('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
  }
}

/**
 * Kapak resmi ekler
 */
async function addCoverImage(doc, imageUrl, title, pageWidth, pageHeight, margin, usableWidth) {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      
      img.onload = () => {
        try {
          // Görsel oranlarını koru
          const imgRatio = img.height / img.width;
          let imgWidth = pageWidth;
          let imgHeight = imgWidth * imgRatio;
          
          // Sayfayı kaplamak için ayarla
          if (imgHeight < pageHeight) {
            imgHeight = pageHeight;
            imgWidth = imgHeight / imgRatio;
          }
          
          // Görsel merkezleme
          const xOffset = (pageWidth - imgWidth) / 2;
          const yOffset = (pageHeight - imgHeight) / 2;
          
          // Görsel ekle
          doc.addImage(img, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);
          
          // Başlık için yarı saydam arka plan ekle
          doc.setFillColor(0, 0, 0, 0.6);
          doc.rect(0, pageHeight * 0.4, pageWidth, pageHeight * 0.2, 'F');
          
          // Başlık
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(24);
          doc.setFont("helvetica", "bold");
          
          // Başlığı satırlara böl ve ekle
          const titleLines = doc.splitTextToSize(convertToUtf8(title), usableWidth - 20);
          doc.text(titleLines, pageWidth / 2, pageHeight * 0.5, { align: 'center' });
          
          // Alt bilgi için arka plan
          doc.setFillColor(0, 0, 0, 0.6);
          doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
          
          // Alt bilgi
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text('AI-Kitap tarafından oluşturulmuştur', pageWidth / 2, pageHeight - 15, { align: 'center' });
          
          resolve();
        } catch (err) {
          console.error("Görsel işleme hatası:", err);
          reject(err);
        }
      };
      
      img.onerror = (err) => {
        console.error("Görsel yükleme hatası:", err);
        reject(err);
      };
      
      img.src = imageUrl;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Kitap kapak sayfası oluşturur
 */
function createBookCover(doc, title, pageWidth, pageHeight, margin, usableWidth) {
  // Renkli arkaplan
  const gradient = {
    start: [75, 107, 175], // Koyu mavi
    end: [145, 126, 206]   // Mor
  };
  
  // Arkaplan geçiş rengi ekle
  for (let i = 0; i < pageHeight; i++) {
    const ratio = i / pageHeight;
    const r = Math.floor(gradient.start[0] * (1 - ratio) + gradient.end[0] * ratio);
    const g = Math.floor(gradient.start[1] * (1 - ratio) + gradient.end[1] * ratio);
    const b = Math.floor(gradient.start[2] * (1 - ratio) + gradient.end[2] * ratio);
    
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(1);
    doc.line(0, i, pageWidth, i);
  }
  
  // Başlık için yarı saydam beyaz panel
  doc.setFillColor(255, 255, 255, 0.85);
  doc.roundedRect(margin, pageHeight * 0.35, usableWidth, pageHeight * 0.3, 10, 10, 'F');
  
  // Başlık
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  
  // Başlığı satırlara böl ve ekle
  const titleLines = doc.splitTextToSize(convertToUtf8(title), usableWidth - 20);
  doc.text(titleLines, pageWidth / 2, pageHeight * 0.45, { align: 'center' });
  
  // Tarih
  const date = new Date().toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Tarih ve alt bilgi
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(date, pageWidth / 2, pageHeight * 0.55, { align: 'center' });
  
  // Alt kısımda süsleme
  doc.setFillColor(255, 255, 255, 0.7);
  doc.rect(0, pageHeight - 40, pageWidth, 40, 'F');
  
  // Yayıncı bilgisi
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text('AI-Kitap tarafından oluşturulmuştur', pageWidth / 2, pageHeight - 20, { align: 'center' });
}

/**
 * İçindekiler sayfası oluşturur
 */
function createTableOfContents(doc, chapterTitles, pageWidth, pageHeight, margin, usableWidth) {
  // Renkli başlık arka planı
  doc.setFillColor(75, 107, 175, 0.9);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // İçindekiler başlığı
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text('İÇİNDEKİLER', pageWidth / 2, 25, { align: 'center' });
  
  // Altbilgi çizgisi
  doc.setDrawColor(75, 107, 175);
  doc.setLineWidth(0.5);
  doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
  
  // Sayfa numarası
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('1', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // İçindekiler öğeleri için başlangıç Y pozisyonu
  let y = 60;
  
  // İçindekiler için font ayarları
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  
  // Her bölüm için içindekiler öğesi oluştur
  for (const title of chapterTitles) {
    // Sayfa taşması kontrolü
    if (y + 8 > pageHeight - margin) {
      doc.addPage();
      y = margin;
      
      // Yeni sayfa için üstbilgi
      doc.setFillColor(75, 107, 175, 0.9);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text('İÇİNDEKİLER (devam)', pageWidth / 2, 25, { align: 'center' });
      
      // Altbilgi
      doc.setDrawColor(75, 107, 175);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('2', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // İçindekiler yeniden ayarla
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
    }
    
    // Başlık ekle
    doc.text(convertToUtf8(title), margin, y);
    
    // Sonraki öğe için Y pozisyonunu güncelle
    y += 10;
  }
}

/**
 * Üstbilgi ve altbilgi ekler
 */
function addHeaderFooter(doc, title, pageNumber, pageWidth, pageHeight) {
  // Üstbilgi çizgisi
  doc.setDrawColor(75, 107, 175);
  doc.setLineWidth(0.5);
  doc.line(20, 12, pageWidth - 20, 12);
  
  // Başlık (üstbilgi)
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100); // Üstbilgi için gri renk
  doc.setFont("helvetica", "italic");
  doc.text(convertToUtf8(title), pageWidth / 2, 8, { align: 'center' });
  
  // Altbilgi çizgisi
  doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);
  
  // Sayfa numarası (altbilgi) - daha dekoratif
  doc.setFillColor(75, 107, 175);
  doc.circle(pageWidth / 2, pageHeight - 10, 7, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255); // Sayfa numarası için beyaz renk (mavi daire üzerinde)
  doc.setFont("helvetica", "bold");
  doc.text(String(pageNumber), pageWidth / 2, pageHeight - 7, { align: 'center' });
}

/**
 * Türkçe karakter desteği için metin dönüşümü
 */
function convertToUtf8(text) {
  // Bu dönüşüm Türkçe karakterleri uyumlu hale getirir
  return text
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C');
}

/**
 * PDF'i indirme bağlantısı oluşturur
 * @param {Blob} pdfBlob - PDF dosyası blob nesnesi 
 * @param {string} fileName - İndirilecek dosya adı
 */
export function downloadPDF(pdfBlob, fileName) {
  try {
    // Blob için URL oluştur
    const url = URL.createObjectURL(pdfBlob);
    
    // İndirme linki oluştur
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'kitap.pdf';
    
    // Linki tıkla ve temizle
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // URL'yi temizle
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('PDF indirme hatası:', error);
    throw new Error('PDF indirme işlemi sırasında bir hata oluştu.');
  }
}

/**
 * AI çıktısını temizler ve gereksiz yönergeleri kaldırır
 * @param {string} content - Orijinal içerik
 * @returns {string} - Temizlenmiş içerik
 */
function cleanAIOutput(content) {
  // Kapak sayfası etiketlerini kaldır
  let cleanContent = content
    .replace(/^\*\*\(Kapak Sayfası\)\*\*$/gmi, '')
    .replace(/^\(Kapak Sayfası\)$/gmi, '')
    .replace(/^\*\*\(İç Kapak Sayfası\)\*\*$/gmi, '')
    .replace(/^\(İç Kapak Sayfası\)$/gmi, '');
  
  // Telif hakkı bilgilerini kaldır (bunlar otomatik eklenir)
  cleanContent = cleanContent
    .replace(/^© \d{4} .*$/gmi, '')
    .replace(/^Tüm hakları saklıdır\.$/gmi, '');
  
  // AI'nin eklediği yönergeleri kaldır
  cleanContent = cleanContent
    .replace(/^İşte talep ettiğiniz özelliklere .* uygun.*$/gmi, '')
    .replace(/^Minecraft macera$/gmi, '')
    .replace(/^\d+$/gm, '');
  
  // (Resim: ...) şeklindeki etiketleri kaldır
  cleanContent = cleanContent.replace(/^\*?\*?\(Resim:.*\)\*?\*?$/gmi, '');
  
  // Yazan kısmını özel olarak ekleyeceğiz, bu yüzden kaldır
  cleanContent = cleanContent.replace(/^\*?\*?Yazan:.*\*?\*?$/gmi, '');
  
  // Boş satırların fazlalıklarını temizle
  cleanContent = cleanContent.replace(/\n{3,}/g, '\n\n');
  
  // Başlık ve alt başlık formatını düzgünleştir
  cleanContent = cleanContent
    .replace(/^#\s+(.*)$/gm, '# $1')
    .replace(/^##\s+(.*)$/gm, '## $1');
  
  return cleanContent;
} 