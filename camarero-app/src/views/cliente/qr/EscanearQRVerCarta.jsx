import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import '../../../styles/cliente/qr/escanearQRVerCarta.css';

const EscanearQRVerCarta = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!isScanning) return;

    codeReaderRef.current = new BrowserMultiFormatReader();
    const currentCodeReader = codeReaderRef.current;

    const startScanner = async () => {
      try {
        const videoInputDevices = await currentCodeReader.listVideoInputDevices();
        if (videoInputDevices.length === 0) {
          setError('No se encontró ninguna cámara.');
          return;
        }
        const firstDeviceId = videoInputDevices[0].deviceId;
        
        currentCodeReader.decodeFromVideoDevice(firstDeviceId, videoRef.current, (result, err) => {
          if (result && isScanning) {
            setIsScanning(false);
            currentCodeReader.stopContinuousDecode();
            currentCodeReader.stopStreams();

            const scannedUrl = result.getText();
            console.log("QR escaneado para ver carta:", scannedUrl);

            try {
              const urlParts = new URL(scannedUrl).pathname.split('/').filter(part => part);
              if (urlParts.length >= 1) {
                const barId = urlParts[0]; 
                
                if (barId) {
                  navigate(`/ver-carta/${barId}`);
                } else {
                  setError('No se pudo extraer el ID del bar del QR.');
                  setIsScanning(true);
                }
              } else {
                setError('Formato de QR no válido para identificar el bar.');
                setIsScanning(true);
              }
            } catch (e) {
              console.error("Error parseando URL del QR:", e);
              setError('El QR no contiene una URL válida.');
              setIsScanning(true);
            }
          }
          if (err && !(err instanceof NotFoundException) && isScanning) {
            console.error("Error de escaneo:", err);
          }
        });
      } catch (err) {
        console.error('Error al iniciar el escáner:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Permiso de cámara denegado. Actívalo para poder escanear.');
        } else {
          setError('No se pudo acceder a la cámara.');
        }
      }
    };

    startScanner();

    return () => {
      try {
        currentCodeReader?.stopContinuousDecode();
        currentCodeReader?.stopStreams();
      } catch (e) {
        console.warn('No se pudo detener la cámara al desmontar (EscanearQRVerCarta)', e);
      }
    };
  }, [navigate, isScanning]);

  const handleVolver = () => {
    setIsScanning(false);
    try {
      codeReaderRef.current?.stopContinuousDecode();
      codeReaderRef.current?.stopStreams();
    } catch (e) {
      console.warn('Error al detener la cámara al volver (EscanearQRVerCarta)', e);
    }
    navigate(-1);
  };

  return (
    <div className="escanear-container-ver-carta"> 
      <button className="volver-btn-ver-carta" onClick={handleVolver}>
        <i className="fas fa-arrow-left"></i> Volver
      </button>
      <h2>Escanea el QR para ver la Carta</h2>
      <p>Apunta la cámara al código QR de cualquier mesa del bar.</p>

      <div className="qr-video-wrapper-ver-carta">
        <video ref={videoRef} className="qr-video-ver-carta" />
      </div>

      {error && <p className="error-mensaje-ver-carta">{error}</p>}
    </div>
  );
};

export default EscanearQRVerCarta;