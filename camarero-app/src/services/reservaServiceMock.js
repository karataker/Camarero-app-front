
export const obtenerBaresYzonas = async () => {
  return [
    { id: 1, nombre: 'Bar Central', zonas: ['Interior', 'Terraza'] },
    { id: 2, nombre: 'Bar Pepe', zonas: ['Interior'] },
    { id: 3, nombre: 'Bar El Patio', zonas: ['Terraza', 'Cocina'] },
  ];
};

export const enviarReserva = async (reserva) => {
  console.log('Reserva enviada al backend:', reserva);
  await new Promise((res) => setTimeout(res, 1000)); // Simula retardo
  return true;
};


export const descargarCartaPDF = async (barId) => {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString();

  const platos = [
    {
      nombre: 'Paella',
      descripcion: 'Sabrosa paella de arroz del delta del Ebro...',
      alergias: ['Gluten', 'Marisco'],
      gluten: true,
      precio: '14,90 €',
      img: 'https://via.placeholder.com/100',
      categoria: 'Platos principales'
    },
    {
      nombre: 'Tortilla Española',
      descripcion: 'Tortilla jugosa de patata...',
      alergias: ['Huevo'],
      gluten: false,
      precio: '6,50 €',
      img: 'https://via.placeholder.com/100',
      categoria: 'Tapas'
    },
    {
      nombre: 'Gazpacho',
      descripcion: 'Sopa fría andaluza de tomate...',
      alergias: [],
      gluten: false,
      precio: '5,00 €',
      img: 'https://via.placeholder.com/100',
      categoria: 'Platos principales'
    },
    {
      nombre: 'Flan de Huevo',
      descripcion: 'Delicioso flan casero...',
      alergias: ['Huevo', 'Lácteos'],
      gluten: false,
      precio: '3,50 €',
      img: 'https://via.placeholder.com/100',
      categoria: 'Postres'
    },
    {
      nombre: 'Cerveza',
      descripcion: 'Cerveza artesanal bien fría...',
      alergias: [],
      gluten: true,
      precio: '2,50 €',
      img: 'https://via.placeholder.com/100',
      categoria: 'Bebidas'
    }
  ];

  const categoriasOrdenadas = ['Tapas', 'Platos principales', 'Postres', 'Bebidas'];

  doc.setFontSize(14);
  doc.text(`Carta del día - Bar ${barId}`, 10, 15);

  doc.setFontSize(10);
  doc.text(`Fecha: ${fecha}`, 10, 22);

  let y = 30;

  for (const categoria of categoriasOrdenadas) {
    const platosCategoria = platos.filter((plato) => plato.categoria === categoria);

    if (platosCategoria.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 150);
      doc.text(categoria, 10, y);
      y += 8;

      for (const plato of platosCategoria) {
        doc.setFontSize(13);
        doc.setTextColor(0);
        doc.text(plato.nombre, 10, y);

        doc.setFontSize(10);
        doc.setTextColor(60);
        const descLines = doc.splitTextToSize(plato.descripcion, 110);
        doc.text(descLines, 10, y + 6);

        let yActual = y + 6 + descLines.length * 5;

        if (plato.alergias.length > 0) {
          doc.setFontSize(10);
          doc.setTextColor(150, 0, 0);
          doc.text(`Alergias: ${plato.alergias.join(', ')}`, 10, yActual);
          yActual += 6;
        }
        
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`${plato.gluten ? 'Con gluten' : 'Sin gluten'}`, 10, yActual);
        yActual += 6;

        doc.setFontSize(11);
        doc.setTextColor(0, 100, 0);
        doc.text(`Precio: ${plato.precio}`, 10, yActual);

        try {
          const imgData = await toBase64(plato.img);
          doc.addImage(imgData, 'JPEG', 130, y, 40, 40);
        } catch {
          doc.setFontSize(9);
          doc.text('[Imagen no disponible]', 130, y + 10);
        }

        y = yActual + 20;

        if (y > 260) {
          doc.addPage();
          y = 20;
        }
      }
    }
  }

  doc.save(`carta-bar-${barId}.pdf`);
};

const toBase64 = (url) =>
  fetch(url)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );