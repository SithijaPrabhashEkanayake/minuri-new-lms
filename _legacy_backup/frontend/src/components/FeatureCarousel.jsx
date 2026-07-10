import React, { useState, useCallback, useEffect } from 'react';

export function FeatureCarousel({ title, subtitle, images }) {
  const [currentIndex, setCurrentIndex] = useState(Math.floor(images.length / 2));

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };
  
  useEffect(() => {
      const timer = setInterval(() => {
          handleNext();
      }, 4000);
      return () => clearInterval(timer);
  }, [handleNext]);

  return (
    <div className="carousel-wrapper">
      <div className="carousel-bg" aria-hidden="true">
          <div className="carousel-blob blob-1"></div>
          <div className="carousel-blob blob-2"></div>
      </div>

      <div className="carousel-content">
        <div className="carousel-header center mb24">
          <h2 className="mt8" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.1, maxWidth: '800px', margin: '0 auto' }}>
            {title}
          </h2>
          <p className="lead" style={{ maxWidth: '600px', margin: '16px auto 0' }}>
            {subtitle}
          </p>
        </div>

        <div className="carousel-stage">
          <div className="carousel-track">
            {images.map((image, index) => {
              const total = images.length;
              let offset = index - currentIndex;
              let pos = (offset + total) % total;
              if (pos > Math.floor(total / 2)) {
                pos = pos - total;
              }

              const isCenter = pos === 0;
              const isAdjacent = Math.abs(pos) === 1;

              return (
                <div
                  key={index}
                  className="carousel-item"
                  style={{
                    transform: `translateX(${pos * 45}%) scale(${isCenter ? 1 : isAdjacent ? 0.85 : 0.7}) rotateY(${pos * -10}deg)`,
                    zIndex: isCenter ? 10 : isAdjacent ? 5 : 1,
                    opacity: isCenter ? 1 : isAdjacent ? 0.4 : 0,
                    filter: isCenter ? 'blur(0px)' : 'blur(4px)',
                    visibility: Math.abs(pos) > 1 ? 'hidden' : 'visible',
                  }}
                >
                  <img src={image.src} alt={image.alt} />
                </div>
              );
            })}
          </div>
          
          <button className="btn btn-glass carousel-btn btn-left" onClick={handlePrev}>
            ❮
          </button>
          <button className="btn btn-glass carousel-btn btn-right" onClick={handleNext}>
            ❯
          </button>
        </div>
      </div>
    </div>
  );
}
