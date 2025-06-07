import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import '../../../styles/cliente/qr/escanearQRVerCarta.css'; // Línea corregida

const EscanearQRVerCarta = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(true); // Para controlar el escaneo

  useEffect(() => {
    if (!isScanning) return; // No iniciar escáner si no debe estar activo

    codeReaderRef.current = new BrowserMultiFormatReader();
    const currentCodeReader = codeReaderRef.current; // Captura la referencia actual

    const startScanner = async () => {
      try {
        const videoInputDevices = await currentCodeReader.listVideoInputDevices();
        if (videoInputDevices.length === 0) {
          setError('No se encontró ninguna cámara.');
          return;
        }
        const firstDeviceId = videoInputDevices[0].deviceId;
        
        currentCodeReader.decodeFromVideoDevice(firstDeviceId, videoRef.current, (result, err) => {
          if (result && isScanning) { // Solo procesar si hay resultado y el escaneo está activo
            setIsScanning(false); // Detener más escaneos una vez que se encuentra uno
            currentCodeReader.stopContinuousDecode(); // Detener decodificación continua
            currentCodeReader.stopStreams(); // Detener streams de la cámara

            const scannedUrl = result.getText();
            console.log("QR escaneado para ver carta:", scannedUrl);

            // Extraer barId de la URL. Asumimos formato como http://.../BAR_ID/MESA_ID
            // o similar. Ajusta esta lógica según el formato de tus URLs de QR.
            try {
              const urlParts = new URL(scannedUrl).pathname.split('/').filter(part => part);
              if (urlParts.length >= 1) { // Necesitamos al menos el barId
                const barId = urlParts[0]; 
                // const mesaId = urlParts[1]; // mesaId no se usa en este flujo
                
                if (barId) {
                  navigate(`/ver-carta/${barId}`); // Navegar a la vista de solo lectura
                } else {
                  setError('No se pudo extraer el ID del bar del QR.');
                  setIsScanning(true); // Permitir reintentar
                }
              } else {
                setError('Formato de QR no válido para identificar el bar.');
                setIsScanning(true); // Permitir reintentar
              }
            } catch (e) {
              console.error("Error parseando URL del QR:", e);
              setError('El QR no contiene una URL válida.');
              setIsScanning(true); // Permitir reintentar
            }
          }
          if (err && !(err instanceof NotFoundException) && isScanning) {
            console.error("Error de escaneo:", err);
            // No establecer error para errores menores de "NotFoundException" que ocurren continuamente
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
      // Limpieza al desmontar el componente
      try {
        currentCodeReader?.stopContinuousDecode();
        currentCodeReader?.stopStreams();
      } catch (e) {
        console.warn('No se pudo detener la cámara al desmontar (EscanearQRVerCarta)', e);
      }
    };
  }, [navigate, isScanning]); // Dependencia isScanning para reiniciar si es necesario

  const handleVolver = () => {
    setIsScanning(false); // Asegurarse de detener el escaneo
    try {
      codeReaderRef.current?.stopContinuousDecode();
      codeReaderRef.current?.stopStreams();
    } catch (e) {
      console.warn('Error al detener la cámara al volver (EscanearQRVerCarta)', e);
    }
    navigate(-1); // Volver a la página anterior (HomeCliente)
  };

  return (
    // Cambia las clases para que coincidan con el nuevo CSS
    <div className="escanear-container-ver-carta"> 
      <button className="volver-btn-ver-carta" onClick={handleVolver}>
        <i className="fas fa-arrow-left"></i> Volver
      </button>
      <h2>Escanea el QR para ver la Carta</h2>
      <p>Apunta la cámara al código QR de cualquier mesa del bar.</p>

      <div className="qr-video-wrapper-ver-carta">
        <video ref={videoRef} className="qr-video-ver-carta" />
        {/* Opcional: <div className="scan-indicator"></div> */}
      </div>

      {error && <p className="error-mensaje-ver-carta">{error}</p>}
    </div>
  );
};

export default EscanearQRVerCarta;