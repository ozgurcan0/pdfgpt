'use client';

import { useRef, useState, useEffect } from 'react';
import { generatePDF, downloadPDF } from '../services/pdfservice';
import { searchBookCoverImages } from '../services/pexels';
import './BookResult.css';

const BookResult = ({ book, resetForm }) => {
  const contentRef = useRef(null);
  const [coverImage, setCoverImage] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageCredit, setImageCredit] = useState({ name: '', url: '' });
  const [cleanedBookContent, setCleanedBookContent] = useState('');
  
  // AI çıktısından resim talimatını ayıkla
  const extractImagePrompt = (content) => {
    const imagePromptRegex = /\(Resim:\s*(.*?)\)/i;
    const match = content.match(imagePromptRegex);
    if (match) {
      const prompt = match[1].trim();
      console.log('Resim talimatı bulundu:', prompt);
      return prompt;
    }
    return null;
  };
  
  // Kitap içeriğini temizle (görüntülemek için)
  const cleanContent = (content) => {
    // AI'nin eklediği yönergeleri ve resim tariflerini kaldır
    let cleanedContent = content
      .replace(/^\*\*\(Kapak Sayfası\)\*\*$/gmi, '')
      .replace(/^\(Kapak Sayfası\)$/gmi, '')
      .replace(/^\*\*\(İç Kapak Sayfası\)\*\*$/gmi, '')
      .replace(/^\(İç Kapak Sayfası\)$/gmi, '')
      .replace(/^İşte talep ettiğiniz özelliklere .* uygun.*$/gmi, '')
      .replace(/^\*?\*?\(Resim:.*\)\*?\*?$/gmi, '')
      .replace(/^\*?\*?Yazan:.*\*?\*?$/gmi, '')
      .replace(/^© \d{4} .*$/gmi, '')
      .replace(/^Tüm hakları saklıdır\.$/gmi, '')
      .replace(/^Minecraft macera$/gmi, '')
      .replace(/^\d+$/gm, '');
    
    // Boş satırların fazlalıklarını temizle
    cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n');
    
    return cleanedContent;
  };
  
  // İçeriği yükleme ve temizleme
  useEffect(() => {
    if (book && book.content) {
      const cleaned = cleanContent(book.content);
      setCleanedBookContent(cleaned);
    }
  }, [book]);
  
  // Component yüklendiğinde kapak görseli al
  useEffect(() => {
    const fetchCoverImage = async () => {
      try {
        // Kitap içeriğinden resim açıklamasını çıkar
        const imagePrompt = extractImagePrompt(book.content);
        
        // Resim açıklaması varsa, onu arama sorgusuna ekle
        let searchQuery = book.subject;
        if (imagePrompt) {
          console.log('Resim açıklaması kullanılıyor:', imagePrompt);
          searchQuery = imagePrompt;
        }
        
        // Kitap konusunu ve türünü kullanarak daha doğru görseller bul
        const images = await searchBookCoverImages(book.title, book.genre, searchQuery);
        if (images && images.length > 0) {
          setSelectedImage(images[0]);
          setImageCredit({
            name: images[0].photographer,
            url: images[0].photographer_url
          });
        }
      } catch (error) {
        console.error('Kapak görseli getirme hatası:', error);
      }
    };
    
    if (book && book.content) {
      fetchCoverImage();
    }
  }, [book]);
  
  // Kitap içeriğini bölümlere ayır
  const formatContent = (content) => {
    // İçindekiler ve içerik bölümlerini ayır
    const parts = content.split('\n\n');
    
    // İçindekiler kısmını bul
    const tocIndex = parts.findIndex(part => 
      part.toLowerCase().includes('içindekiler') || 
      part.toLowerCase().includes('içerik') || 
      part.toLowerCase().includes('bölümler')
    );
    
    if (tocIndex === -1) {
      return {
        toc: [],
        content: content
      };
    }
    
    // İçindekiler ve içerik bölümlerini ayır
    const tocPart = parts[tocIndex];
    const contentParts = parts.slice(tocIndex + 1);
    
    // İçindekileri satırlara ayır
    const tocLines = tocPart.split('\n').filter(line => line.trim() !== '');
    
    // İçindekiler başlığını kaldır
    const toc = tocLines.slice(1);
    
    return {
      toc,
      content: contentParts.join('\n\n')
    };
  };
  
  const { toc, content } = formatContent(cleanedBookContent || book.content);
  
  // PDF oluştur ve indir
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      
      // Kapak görselini PDF'e dahil et
      const coverImageUrl = selectedImage ? selectedImage.src.large : null;
      
      // PDF oluştur
      const pdfBlob = await generatePDF(book.title, book.content, coverImageUrl);
      
      // PDF'i indir
      downloadPDF(pdfBlob, `${book.title.replace(/[^\w\s]/gi, '')}.pdf`);
      
      setIsGeneratingPdf(false);
    } catch (error) {
      console.error('PDF indirme hatası:', error);
      setIsGeneratingPdf(false);
      alert('PDF oluşturulurken bir hata oluştu: ' + error.message);
    }
  };
  
  // Kitap türüne göre renk belirleme
  const getGenreTag = () => {
    switch(book.genre) {
      case 'makale':
        return 'tag-success';
      case 'akademikYazi':
        return 'tag-info';
      case 'hikaye':
        return 'tag-warning';
      case 'cocukHikayesi':
        return 'tag-primary';
      case 'roman':
        return 'tag-purple';
      case 'fantastikRoman':
        return 'tag-pink';
      case 'bilimKurgu':
        return 'tag-cyan';
      case 'polisiye':
        return 'tag-dark';
      case 'korku':
        return 'tag-danger';
      case 'romantik':
        return 'tag-rose';
      case 'biyografi':
        return 'tag-orange';
      case 'dokuman':
        return 'tag-blue';
      case 'macera':
        return 'tag-yellow';
      case 'tarihi':
        return 'tag-brown';
      case 'felsefi':
        return 'tag-indigo';
      default:
        return 'tag-gray';
    }
  };
  
  // Türkçe tür adını göster
  const getGenreName = () => {
    switch(book.genre) {
      case 'makale':
        return 'Makale';
      case 'akademikYazi':
        return 'Akademik Yazı';
      case 'hikaye':
        return 'Hikaye';
      case 'cocukHikayesi':
        return 'Çocuk Hikayesi';
      case 'roman':
        return 'Roman';
      case 'fantastikRoman':
        return 'Fantastik Roman';
      case 'bilimKurgu':
        return 'Bilim Kurgu';
      case 'polisiye':
        return 'Polisiye';
      case 'korku':
        return 'Korku';
      case 'romantik':
        return 'Romantik';
      case 'biyografi':
        return 'Biyografi';
      case 'dokuman':
        return 'Döküman';
      case 'macera':
        return 'Macera';
      case 'tarihi':
        return 'Tarihi';
      case 'felsefi':
        return 'Felsefi';
      default:
        return book.genre;
    }
  };
  
  return (
    <div className="book-result-card">
      {/* Kitap başlığı ve bilgileri */}
      <div className="book-header border-bottom">
        <div className="book-header-content">
          <div>
            <h1 className="book-title">{book.title}</h1>
            <p className="book-author">Yazar: {book.author}</p>
            <div className="book-tags">
              <span className={`tag ${getGenreTag()}`}>
                {getGenreName()}
              </span>
              <span className="tag tag-gray">
                {book.length} sayfa
              </span>
              <span className="tag tag-gray">
                {book.style}
              </span>
            </div>
          </div>
          <div className="book-actions">
            <button
              onClick={handleDownloadPDF}
              className={`btn btn-primary ${isGeneratingPdf ? 'btn-loading' : ''}`}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                'Yükleniyor...'
              ) : (
                <>
                  <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  PDF İndir
                </>
              )}
            </button>
            <button
              onClick={resetForm}
              className="btn btn-secondary"
              disabled={isGeneratingPdf}
            >
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Yeni Kitap
            </button>
          </div>
        </div>
      </div>
      
      {/* Kapak görseli önizlemesi */}
      {selectedImage && (
        <div className="book-cover-preview">
          <div className="book-cover-image" style={{ backgroundImage: `url(${selectedImage.src.large})` }}>
            <div className="book-cover-overlay">
              <h2>{book.title}</h2>
              <p>{book.author}</p>
            </div>
            <div className="book-cover-credit">
              Fotoğraf: <a href={`${imageCredit.url}?utm_source=AI-Kitap&utm_medium=referral`} target="_blank" rel="noopener noreferrer">{imageCredit.name}</a> / Pexels
            </div>
          </div>
        </div>
      )}
      
      {/* İçindekiler ve içerik */}
      <div className="book-content">
        {toc.length > 0 && (
          <div className="book-toc">
            <h2 className="toc-title">İçindekiler</h2>
            <ul className="toc-list">
              {toc.map((item, index) => (
                <li key={index} className="toc-item">{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className={`book-body ${toc.length > 0 ? '' : 'full-width'}`}>
          <div ref={contentRef} className="book-text">
            <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookResult; 