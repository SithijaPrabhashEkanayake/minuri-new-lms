import React from 'react';
import LottiePackage from 'lottie-react';
import animationData from '../../assets/loading-animation.json';

const Lottie = LottiePackage.default || LottiePackage;

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', padding: '24px' }}>
      <div style={{ width: '150px', height: '150px' }}>
        <Lottie animationData={animationData} loop={true} />
      </div>
      {text && (
        <p className="muted" style={{ marginTop: '16px', fontSize: '16px', fontWeight: '600' }}>
          {text}
        </p>
      )}
    </div>
  );
}
