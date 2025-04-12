'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import './BookForm.css';

const BookForm = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [activeStep, setActiveStep] = useState(0);
  
  // Kitap türleri
  const genres = [
    { id: 'makale', name: 'Makale', description: 'Akademik veya fikir yazısı' },
    { id: 'akademikYazi', name: 'Akademik Yazı', description: 'Bilimsel araştırma ve çalışmalar' },
    { id: 'hikaye', name: 'Hikaye', description: 'Kısa hikaye ve öyküler' },
    { id: 'cocukHikayesi', name: 'Çocuk Hikayesi', description: 'Çocuklara yönelik hikayeler' },
    { id: 'roman', name: 'Roman', description: 'Uzun hikaye ve romanlar' },
    { id: 'fantastikRoman', name: 'Fantastik Roman', description: 'Büyü ve olağanüstü dünyalar' },
    { id: 'bilimKurgu', name: 'Bilim Kurgu', description: 'Gelecek ve teknoloji temalı' },
    { id: 'polisiye', name: 'Polisiye', description: 'Suç ve gizem üzerine kurgu' },
    { id: 'korku', name: 'Korku', description: 'Korku ve gerilim öğeleri' },
    { id: 'romantik', name: 'Romantik', description: 'Aşk ve ilişkiler üzerine' },
    { id: 'biyografi', name: 'Biyografi', description: 'Gerçek kişilerin hayat hikayeleri' },
    { id: 'dokuman', name: 'Döküman', description: 'Teknik belgeler ve kılavuzlar' },
    { id: 'macera', name: 'Macera', description: 'Heyecanlı ve keşif dolu hikayeler' },
    { id: 'tarihi', name: 'Tarihi', description: 'Tarihi olaylar ve dönemler' },
    { id: 'felsefi', name: 'Felsefi', description: 'Düşünce ve fikirler üzerine' }
  ];
  
  // Adım adım form
  const steps = [
    {
      title: 'Tür Seçimi',
      description: 'Oluşturmak istediğiniz kitabın türünü seçin',
      fields: (
        <div className="grid grid-cols-3">
          {genres.map((genre) => (
            <div key={genre.id} className="form-group">
              <input
                type="radio"
                id={genre.id}
                value={genre.id}
                className="genre-radio"
                {...register('genre', { required: 'Lütfen bir tür seçin' })}
              />
              <label htmlFor={genre.id} className="genre-label">
                <div className="genre-title">{genre.name}</div>
                <div className="genre-desc">{genre.description}</div>
              </label>
            </div>
          ))}
          {errors.genre && <p className="error-text">{errors.genre.message}</p>}
        </div>
      )
    },
    {
      title: 'Kitap Detayları',
      description: 'Kitabınızın içeriği hakkında detayları girin',
      fields: (
        <div className="form-container">
          <div className="form-group">
            <label htmlFor="title">
              Başlık
            </label>
            <input
              id="title"
              type="text"
              placeholder="Kitabınızın başlığı"
              {...register('title', { required: 'Başlık gereklidir' })}
            />
            {errors.title && <p className="error-text">{errors.title.message}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="author">
              Yazar
            </label>
            <input
              id="author"
              type="text"
              placeholder="Yazar adı"
              {...register('author', { required: 'Yazar adı gereklidir' })}
            />
            {errors.author && <p className="error-text">{errors.author.message}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="subject">
              Konu
            </label>
            <textarea
              id="subject"
              placeholder="Kitabınızın ana konusu nedir?"
              rows="3"
              {...register('subject', { required: 'Konu gereklidir' })}
            ></textarea>
            {errors.subject && <p className="error-text">{errors.subject.message}</p>}
          </div>
        </div>
      )
    },
    {
      title: 'İçerik Özellikleri',
      description: 'İçeriğin stilini ve uzunluğunu belirleyin',
      fields: (
        <div className="form-container">
          <div className="form-group">
            <label htmlFor="style">
              Yazım Stili
            </label>
            <select
              id="style"
              {...register('style', { required: 'Yazım stili gereklidir' })}
            >
              <option value="">Bir stil seçin</option>
              <option value="bilgilendirici">Bilgilendirici</option>
              <option value="edebi">Edebi</option>
              <option value="mizahi">Mizahi</option>
              <option value="teknik">Teknik</option>
              <option value="resmi">Resmi</option>
              <option value="konuşma">Konuşma Dili</option>
              <option value="akademik">Akademik</option>
              <option value="yaratıcı">Yaratıcı</option>
              <option value="biyografik">Biyografik</option>
              <option value="heyecanlı">Heyecanlı/Aksiyon</option>
              <option value="duygusal">Duygusal</option>
              <option value="felsefi">Felsefi</option>
              <option value="öğretici">Öğretici</option>
              <option value="betimleyici">Betimleyici</option>
              <option value="basit">Basit ve Anlaşılır</option>
            </select>
            {errors.style && <p className="error-text">{errors.style.message}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="audience">
              Hedef Kitle
            </label>
            <select
              id="audience"
              {...register('audience', { required: 'Hedef kitle gereklidir' })}
            >
              <option value="">Bir hedef kitle seçin</option>
              <option value="okul öncesi">Okul Öncesi Çocuklar (3-6 yaş)</option>
              <option value="ilkokul">İlkokul Çocukları (7-10 yaş)</option>
              <option value="ortaokul">Ortaokul Öğrencileri (11-14 yaş)</option>
              <option value="lise">Lise Öğrencileri (15-18 yaş)</option>
              <option value="üniversite">Üniversite Öğrencileri</option>
              <option value="genç yetişkin">Genç Yetişkinler (18-25 yaş)</option>
              <option value="yetişkinler">Yetişkinler (26-40 yaş)</option>
              <option value="orta yaş">Orta Yaş (41-60 yaş)</option>
              <option value="yaşlılar">Yaşlılar (60+ yaş)</option>
              <option value="akademisyenler">Akademisyenler ve Araştırmacılar</option>
              <option value="öğretmenler">Öğretmenler ve Eğitimciler</option>
              <option value="uzmanlar">Uzmanlar ve Profesyoneller</option>
              <option value="iş dünyası">İş Dünyası ve Girişimciler</option>
              <option value="aileler">Aileler</option>
              <option value="herkes">Genel Okuyucu (Her Yaştan)</option>
            </select>
            {errors.audience && <p className="error-text">{errors.audience.message}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="length">
              Sayfa Sayısı
            </label>
            <select
              id="length"
              {...register('length', { required: 'Sayfa sayısı gereklidir' })}
            >
              <option value="">Bir uzunluk seçin</option>
              <option value="5">Çok Kısa (5 sayfa)</option>
              <option value="10">Kısa (10 sayfa)</option>
              <option value="25">Orta (25 sayfa)</option>
              <option value="50">Standart (50 sayfa)</option>
              <option value="100">Uzun (100 sayfa)</option>
              <option value="150">Çok Uzun (150 sayfa)</option>
              <option value="200">Kapsamlı (200 sayfa)</option>
              <option value="300">Detaylı (300 sayfa)</option>
            </select>
            {errors.length && <p className="error-text">{errors.length.message}</p>}
          </div>
        </div>
      )
    }
  ];
  
  // Sonraki adıma geç
  const nextStep = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };
  
  // Önceki adıma dön
  const prevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };
  
  // Form gönderim işleyicisi
  const submitHandler = (data) => {
    onSubmit(data);
  };
  
  // Kitap üretme fonksiyonu
  const handleGenerateBook = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Kitap seçeneklerini hazırla
      const bookOptions = {
        title: title,
        genre: genre,
        subject: subject,
        length: length,
        style: style,
        audience: audience
      };
      
      // Kitap içeriğini oluştur
      const bookContent = await generateBook(bookOptions);
      
      // Kitabı state'e kaydet
      setGeneratedBook({
        title: title,
        genre: genre,
        subject: subject,
        content: bookContent,
        author: "AI-Kitap"
      });
      
      // Başarı mesajı
      setSuccess("Kitap başarıyla oluşturuldu!");
      
      // BookResult bileşenine geçiş yapılacak
      onBookGenerated({
        title: title,
        genre: genre,
        subject: subject,
        content: bookContent,
        author: "AI-Kitap"
      });
    } catch (error) {
      console.error("Kitap oluşturma hatası:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="card">
      <div className="mb-6">
        <h2>{steps[activeStep].title}</h2>
        <p>{steps[activeStep].description}</p>
      </div>
      
      {/* İlerleme çubuğu */}
      <div className="progress-container">
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`step ${index < activeStep ? 'completed' : ''} ${index === activeStep ? 'active' : ''}`}
            >
              <div className="step-circle">
                {index < activeStep ? (
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className="step-title">{step.title}</div>
              {index < steps.length - 1 && <div className="step-line"></div>}
            </div>
          ))}
        </div>
      </div>
      
      <form onSubmit={handleSubmit(submitHandler)}>
        {steps[activeStep].fields}
        
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={activeStep === 0}
            className={`btn ${activeStep === 0 ? 'btn-disabled' : 'btn-secondary'}`}
          >
            Geri
          </button>
          
          {activeStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn btn-primary"
            >
              İleri
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className={`btn ${isLoading ? 'btn-disabled' : 'btn-primary'}`}
            >
              {isLoading ? (
                <>
                  <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Oluşturuluyor...
                </>
              ) : (
                'Kitabı Oluştur'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BookForm; 