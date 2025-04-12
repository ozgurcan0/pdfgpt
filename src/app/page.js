'use client';

import { useState } from 'react';
import BookForm from '../components/BookForm';
import BookResult from '../components/BookResult';
import { generateBook } from '../services/gemini';
import './page.css';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);

  // Kitap oluştur
  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const bookContent = await generateBook(formData);
      
      setBook({
        ...formData,
        content: bookContent
      });
    } catch (error) {
      console.error('Kitap oluşturma hatası:', error);
      setError(error.message || 'Kitap oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Formu sıfırla
  const resetForm = () => {
    setBook(null);
    setError(null);
  };

  return (
    <div className="page-container">
      <header className="main-header">
        <div className="container">
          <div className="header-content">
            <h1 className="app-title">AI Kitap</h1>
            <p className="app-subtitle">Yapay Zeka ile E-Kitap Oluşturun</p>
          </div>
        </div>
      </header>
      
      <main className="main-content">
        <div className="container">
          {!book ? (
            <>
              <div className="hero-section">
                <h2 className="hero-title">
                  Hayal Ettiğiniz Kitabı Saniyeler İçinde Oluşturun
                </h2>
                <p className="hero-description">
                  Yapay zeka ile istediğiniz türde ve konuda e-kitaplar oluşturun.
                  Makaleler, hikayeler, akademik yazılar ve daha fazlası!
                </p>
              </div>
              
              <BookForm onSubmit={handleFormSubmit} isLoading={isLoading} />
              
              {error && (
                <div className="error-container">
                  <p className="error-title">Hata oluştu</p>
                  <p className="error-message">{error}</p>
                </div>
              )}
            </>
          ) : (
            <BookResult book={book} resetForm={resetForm} />
          )}
        </div>
      </main>
      
      <footer className="main-footer">
        <div className="container">
          <p className="copyright">
            &copy; {new Date().getFullYear()} AI Kitap. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
