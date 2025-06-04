import React, { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import '../../../styles/cliente/qr/escanearQR.css';
import { useNavigate } from 'react-router-dom';
import { obtenerMesas, ocuparMesa } from '../../../services/barService.js';
import { obtenerReservas } from '../../../services/reservaService.js';

const horaAMinutos = (horaStr) => {
  if (!horaStr || typeof horaStr !== 'string' || !horaStr.includes(':')) return 0;
  const [horas, minutos] = horaStr.split(':').map(Number);
  return horas * 60 + minutos;
};

const haySolapamiento = (inicio1, fin1, inicio2, fin2) => {
  return Math.max(inicio1, inicio2) < Math.min(fin1, fin2);
};

const DURACION_RESERVA_ESTIMADA_HORAS = 2;

const EscanearQR = () => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const stopDecoderRef = useRef(null);
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isMesaAsignada, setIsMesaAsignada] = useState(false);
  const [showComensalesInput, setShowComensalesInput] = useState(false);
  const [numeroComensales, setNumeroComensales] = useState('');
  const [scannedUrl, setScannedUrl] = useState(null);
  const [mesaInfo, setMesaInfo] = useState(null); // Nuevo estado

  const stopReader = () => {
    try {
      if (stopDecoderRef.current) {
        stopDecoderRef.current();
        stopDecoderRef.current = null;
        console.log('Decodificador detenido.');
      }
      if (codeReaderRef.current && typeof codeReaderRef.current.stopStreams === 'function') {
        codeReaderRef.current.stopStreams();
        console.log('Cámara detenida.');
      }
    } catch (e) {
      console.warn('Error al detener la cámara:', e);
    }
  };

  useEffect(() => {
    let isScannerActive = false;

    const startScanner = async () => {
      if (isScannerActive) return;
      isScannerActive = true;

      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;

      try {
        const controls = await codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
          if (result) {
            controls.stop();
            stopDecoderRef.current = null;
            setScannedUrl(result.getText());
            setShowComensalesInput(true);
            setMessage('QR Escaneado. Por favor, introduce el número de comensales.');
          } else if (err && err.name !== 'NotFoundException') {
            setError('Error al escanear el código QR.');
            console.error('Error al escanear:', err);
          }
        });
        stopDecoderRef.current = controls.stop;
      } catch (err) {
        isScannerActive = false;
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Permiso de cámara denegado. Actívalo para poder escanear.');
        } else {
          console.error('Error inesperado al acceder a la cámara:', err);
          setError('No se pudo acceder a la cámara.');
        }
      }
    };

    if (!isMesaAsignada && !showComensalesInput) {
      startScanner();
    } else {
      stopReader();
    }

    return () => {
      isScannerActive = false;
      stopReader();
    };
  }, [isMesaAsignada, showComensalesInput]);

  const handleVolver = () => {
    stopReader();
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
    setShowComensalesInput(false);

    try {
      const urlParts = scannedUrl.split('/');
      const barId = parseInt(urlParts[urlParts.length - 2], 10);
      const mesaCodigo = urlParts[urlParts.length - 1];

      if (isNaN(barId) || !mesaCodigo) {
        throw new Error('QR inválido: El formato del QR no contiene ID de bar o código de mesa.');
      }

      const allMesas = await obtenerMesas(barId);
      const targetMesa = allMesas.find(m => m.codigo === mesaCodigo);

      if (!targetMesa) {
        throw new Error(`Mesa ${mesaCodigo} no encontrada para el bar ${barId}.`);
      }

      if (comensales > targetMesa.capacidad) {
        setMessage(
          `El número de comensales (${comensales}) es mayor a la capacidad de la mesa (${targetMesa.capacidad}). ` +
          `Se requieren unir mesas. Por favor, espere para ser atendido por personal.`
        );
        return;
      }

      const reservasBar = await obtenerReservas(barId);
      const now = new Date();
      const currentDateString = now.toISOString().split('T')[0];
      const currentTimeString = now.toTimeString().slice(0, 5);

      const inicioConsultaMin = horaAMinutos(currentTimeString);
      const finConsultaMin = inicioConsultaMin + DURACION_RESERVA_ESTIMADA_HORAS * 60;

      const overlappingReservas = reservasBar.filter(res => {
        const resFechaHora = new Date(res.fechaHora);
        const resDateString = resFechaHora.toISOString().split('T')[0];
        const resTimeString = resFechaHora.toTimeString().slice(0, 5);

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
        const occupiedMesaIds = new Set(overlappingReservas.map(r => r.mesa.id));

        const nextAvailableMesa = allMesas.find(m =>
          m.disponible === true &&
          m.capacidad >= comensales &&
          !occupiedMesaIds.has(m.id)
        );

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

      await ocuparMesa(barId, mesaCodigo, comensales);
      setMessage(`Mesa ${mesaCodigo} asignada.`);
      setIsMesaAsignada(true);
      setError('');
      setMesaInfo({ barId, mesaId: targetMesa.id }); // << Aquí guardamos barId y mesaId
    } catch (err) {
      console.error('Error al procesar QR o asignar mesa:', err);
      setError(`Error: ${err.message || 'No se pudo procesar la solicitud.'}`);
      setShowComensalesInput(true);
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

      {isMesaAsignada && mesaInfo && (
        <div className="mesa-asignada-actions">
          <button
            className="btn-ver-carta"
            onClick={() => navigate(`/cliente/${mesaInfo.barId}/${mesaInfo.mesaId}`)}
          >
            Ver Carta Digital
          </button>
        </div>
      )}
    </div>
  );
};

export default EscanearQR;
