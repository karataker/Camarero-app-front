import React, { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import '../../../styles/cliente/qr/escanearQR.css';
import { useNavigate } from 'react-router-dom';
import { obtenerMesas, ocuparMesa } from '../../../services/barService.js';
import { obtenerReservas } from '../../../services/reservaService.js';

// --- Funciones de Ayuda para Tiempos (Copiar de EmpleadoReservasView.jsx) ---
const horaAMinutos = (horaStr) => {
  if (!horaStr || typeof horaStr !== 'string' || !horaStr.includes(':')) return 0;
  const [horas, minutos] = horaStr.split(':').map(Number);
  return horas * 60 + minutos;
};


// para borrar
//const minutosAFormatoHora = (totalMinutos) => {
//  if (typeof totalMinutos !== 'number' || isNaN(totalMinutos)) return '00:00';
//  const horas = Math.floor(totalMinutos / 60);
//  const minutos = totalMinutos % 60;
//  return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
//};

const haySolapamiento = (inicio1, fin1, inicio2, fin2) => {
  return Math.max(inicio1, inicio2) < Math.min(fin1, fin2);
};

const DURACION_RESERVA_ESTIMADA_HORAS = 2; 

const EscanearQR = () => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null); // Will hold the BrowserQRCodeReader instance
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isMesaAsignada, setIsMesaAsignada] = useState(false);
  const [showComensalesInput, setShowComensalesInput] = useState(false);
  const [numeroComensales, setNumeroComensales] = useState('');
  const [scannedUrl, setScannedUrl] = useState(null);

  // Use a separate ref to store the 'stop' function returned by decodeFromVideoDevice
  const stopDecoderRef = useRef(null); 

  // Helper function to stop the reader streams safely
  const stopReader = () => {
    try {
      // First, try to stop the specific decoder if it was started
      if (stopDecoderRef.current) {
        stopDecoderRef.current(); // This stops the continuous decoding operation
        stopDecoderRef.current = null; // Clear the ref
        console.log('Decodificador detenido.');
      }
      // Then, stop all media streams associated with the BrowserQRCodeReader instance
      if (codeReaderRef.current && typeof codeReaderRef.current.stopStreams === 'function') {
        codeReaderRef.current.stopStreams();
        console.log('Cámara detenida.');
        // It might be good to clear the codeReaderRef.current here too if it's no longer needed
        // codeReaderRef.current = null;
      }
    } catch (e) {
      console.warn('Error al detener la cámara:', e);
      // You might want to set an error message here if it's critical
    }
  };

  useEffect(() => {
    // This flag helps prevent the scanner from restarting unnecessarily
    let isScannerActive = false; 

    const startScanner = async () => {
      if (isScannerActive) return; // Prevent multiple scanner instances
      isScannerActive = true;

      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader; // Store the instance

      try {
        // decodeFromVideoDevice returns a cleanup function in its promise resolution
        // which you can call to stop the video device.
        const controls = await codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
          if (result) {
            // A code was found, stop the scanner using the controls provided by zxing
            controls.stop(); // Stop the specific decode operation
            stopDecoderRef.current = null; // Clear the ref as it's stopped

            setScannedUrl(result.getText());
            setShowComensalesInput(true);
            setMessage('QR Escaneado. Por favor, introduce el número de comensales.');
          } else if (err && err.name !== 'NotFoundException') {
            setError('Error al escanear el código QR.');
            console.error('Error al escanear:', err);
          }
        });
        // Store the controls.stop() function in a ref so we can call it later for cleanup
        stopDecoderRef.current = controls.stop; 
      } catch (err) {
        isScannerActive = false; // Reset flag on error
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Permiso de cámara denegado. Actívalo para poder escanear.');
        } else {
          console.error('Error inesperado al acceder a la cámara:', err);
          setError('No se pudo acceder a la cámara.');
        }
      }
    };

    // Only start scanner if no mesa assigned and no comensales input showing
    if (!isMesaAsignada && !showComensalesInput) {
      startScanner();
    } else {
      // If already assigned or input is showing, ensure scanner is stopped
      stopReader(); 
    }

    // Cleanup function: This runs when the component unmounts or before the effect re-runs
    return () => {
      isScannerActive = false; // Reset flag on unmount
      stopReader(); // Ensure camera is stopped on unmount
    };
  }, [isMesaAsignada, showComensalesInput]); // Dependencies: Re-run effect when these states change

  const handleVolver = () => {
    stopReader(); // Ensure camera is stopped before navigating
    navigate(-1);
  };

  const handleComensalesSubmit = async () => {
    if (numeroComensales === '' || parseInt(numeroComensales, 10) <= 0) {
      setError('Por favor, introduce un número de comensales válido.');
      return;
    }
    const comensales = parseInt(numeroComensales, 10);
    setError('');
    setMessage('Verificando disponibilidad de la mesa...');
    setShowComensalesInput(false); // Hide input after submission

    try {
      // 1. Parse barId and mesaCodigo from URL
      const urlParts = scannedUrl.split('/');
      const barId = parseInt(urlParts[urlParts.length - 2], 10);
      const mesaCodigo = urlParts[urlParts.length - 1];

      if (isNaN(barId) || !mesaCodigo) {
        throw new Error('QR inválido: El formato del QR no contiene ID de bar o código de mesa.');
      }

      // 2. Get all mesas and target mesa details for the bar
      const allMesas = await obtenerMesas(barId);
      const targetMesa = allMesas.find(m => m.codigo === mesaCodigo);

      if (!targetMesa) {
        throw new Error(`Mesa ${mesaCodigo} no encontrada para el bar ${barId}.`);
      }

      // 3. Check Capacity
      if (comensales > targetMesa.capacidad) {
        setMessage(
          `El número de comensales (${comensales}) es mayor a la capacidad de la mesa (${targetMesa.capacidad}). ` +
          `Se requieren unir mesas. Por favor, espere para ser atendido por personal.`
        );
        return; 
      }

      // 4. Check for upcoming reservations for the target mesa
      const reservasBar = await obtenerReservas(barId);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
      const currentDay = now.getDate().toString().padStart(2, '0');
      const currentDateString = `${currentYear}-${currentMonth}-${currentDay}`;
      const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const inicioConsultaMin = horaAMinutos(currentTimeString);
      const finConsultaMin = inicioConsultaMin + DURACION_RESERVA_ESTIMADA_HORAS * 60;

      let isMesaCurrentlyAvailable = true;
      let nextAvailableMesa = null;

      const overlappingReservas = reservasBar.filter(res => {
        const resFechaHora = new Date(res.fechaHora);
        const resDateString = `${resFechaHora.getFullYear()}-${(resFechaHora.getMonth() + 1).toString().padStart(2, '0')}-${resFechaHora.getDate().toString().padStart(2, '0')}`;
        const resTimeString = `${resFechaHora.getHours().toString().padStart(2, '0')}:${resFechaHora.getMinutes().toString().padStart(2, '0')}`;
        
        if (res.estado === 'confirmada' && resDateString === currentDateString) {
          const inicioExistenteMin = horaAMinutos(resTimeString);
          const finExistenteMin = inicioExistenteMin + DURACION_RESERVA_ESTIMADA_HORAS * 60;
          return haySolapamiento(inicioConsultaMin, finConsultaMin, inicioExistenteMin, finExistenteMin);
        }
        return false;
      });

      const targetMesaOverlappingReservas = overlappingReservas.filter(res => {
        return res.mesa && res.mesa.id === targetMesa.id;
      });
      
      if (targetMesaOverlappingReservas.length > 0) {
        isMesaCurrentlyAvailable = false;
        const occupiedMesaIds = new Set(overlappingReservas.map(r => r.mesa.id));

        nextAvailableMesa = allMesas.find(m =>
          m.disponible === true && // Check global availability
          m.capacidad >= comensales &&
          !occupiedMesaIds.has(m.id) // Ensure it's not currently occupied by a reservation
        );
      }
      
      if (!isMesaCurrentlyAvailable) {
        let alternativeMessage = 'La mesa escaneada no está disponible actualmente debido a una reserva próxima. ';
        if (nextAvailableMesa) {
          setMessage(
            alternativeMessage +
            `Por favor, diríjase a la mesa ${nextAvailableMesa.codigo} (Capacidad: ${nextAvailableMesa.capacidad}).`
          );
        } else {
          setMessage(
            alternativeMessage +
            `No encontramos otra mesa disponible que se ajuste a su número de comensales. Por favor, espere para ser atendido por personal.`
          );
        }
        return;
      }
      
      // 5. If capacity and availability checks pass, assign the mesa
      await ocuparMesa(barId, mesaCodigo, comensales);
      
      // MODIFIED: Include mesaCodigo in the message
      setMessage(`Mesa ${mesaCodigo} asignada.`);
      setIsMesaAsignada(true); // This state change will trigger useEffect to stop the scanner
      setError('');

    } catch (err) {
      console.error('Error al procesar QR o asignar mesa:', err);
      // CORRECTED: Changed err.1message to err.message
      setError(`Error: ${err.message || 'No se pudo procesar la solicitud.'}`);
      setShowComensalesInput(true); // Re-show input on error to allow user to try again
    }
  };

  return (
    <div className="escanear-container">
      {!isMesaAsignada && (
        <button className="volver-btn" onClick={handleVolver}>
          ← Volver
        </button>
      )}

      {!isMesaAsignada && !showComensalesInput && (
        <>
          <h2>Escanea el QR de la mesa</h2>
          <div className="qr-video-wrapper">
            <video ref={videoRef} className="qr-video" />
          </div>
        </>
      )}

      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}

      {showComensalesInput && (
        <div className="comensales-input-container">
          <label htmlFor="numComensales">Número de comensales:</label>
          <input
            type="number"
            id="numComensales"
            value={numeroComensales}
            onChange={(e) => setNumeroComensales(e.target.value)}
            min="1"
            className="comensales-input"
          />
          <button onClick={handleComensalesSubmit} className="btn-submit-comensales">
            Confirmar
          </button>
        </div>
      )}

      {isMesaAsignada && (
        <div className="mesa-asignada-actions">
          <button className="btn-ver-carta">Ver Carta Digital</button>
        </div>
      )}
    </div>
  );
};

export default EscanearQR;