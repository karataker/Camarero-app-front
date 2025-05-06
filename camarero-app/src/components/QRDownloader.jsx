import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../styles/QRDownloader.css';

const QRDownloader = ({ mesaCodigo, barId, qrUrl }) => {
  const [abierto, setAbierto] = useState(false);
  const qrRef = useRef(null);

  const enlace = qrUrl || `https://tubar.com/cliente/bar/${barId}/mesa/${mesaCodigo}`;

  const handleDownloadPDF = async () => {
    const canvas = await html2canvas(qrRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    pdf.text(`Mesa: ${mesaCodigo}`, 10, 10);
    pdf.addImage(imgData, 'PNG', 10, 20, 100, 100);
    pdf.save(`QR_${mesaCodigo}.pdf`);
  };

  return (
    <div className="qr-container">
      <button className="qr-toggle" onClick={() => setAbierto(!abierto)}>
        <i className={`fas ${abierto ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i> Mostrar QR
      </button>

      {abierto && (
        <div ref={qrRef} className="qr-box">
          <QRCodeCanvas value={enlace} size={150} />
          <p>{mesaCodigo}</p>
          <button className="qr-download-btn" onClick={handleDownloadPDF}>
            Descargar QR
          </button>
        </div>
      )}
    </div>
  );
};

export default QRDownloader;