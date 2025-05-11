import React, { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import '../styles/escanearQR.css';
import { useNavigate } from 'react-router-dom';

const EscanearQR = () => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const startScanner = async () => {
      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;

      try {
        await codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
          if (result) {
            window.location.href = result.getText();
          } else if (err && err.name !== 'NotFoundException') {
            setError('Error al escanear el código QR.');
          }
        });
      } catch (err) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Permiso de cámara denegado. Actívalo para poder escanear.');
        } else {
          console.error('Error inesperado:', err);
          setError('No se pudo acceder a la cámara.');
        }
      }
    };

    startScanner();

    return () => {
      try {
        codeReaderRef.current?.stopContinuousDecode();
        codeReaderRef.current?.stopStreams();
      } catch (e) {
        console.warn('No se pudo detener la cámara al desmontar', e);
      }
    };
  }, []);

  const handleVolver = () => {
    try {
      codeReaderRef.current?.stopContinuousDecode();
      codeReaderRef.current?.stopStreams();
    } catch (e) {
      console.warn('Error al detener la cámara al volver', e);
    }

    navigate(-1);
  };

  return (
    <div className="escanear-container">
      <button className="volver-btn" onClick={handleVolver}>
        ← Volver
      </button>

      <h2>Escanea el QR de la mesa</h2>

      <div className="qr-video-wrapper">
        <video ref={videoRef} className="qr-video" />
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default EscanearQR;