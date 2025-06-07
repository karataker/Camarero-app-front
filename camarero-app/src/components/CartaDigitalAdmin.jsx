// import React, { useState } from "react";
// import { useParams } from "react-router-dom";
// import { useCarta } from "../hooks/useCarta";
// import "../styles/cartaDigitalAdmin.css";

// const CartaDigitalAdmin = () => {
//   const { barId } = useParams();
//   const {
//     categorias,
//     productos,
//     toggleVisibleProducto,
//     recargar,
//   } = useCarta(barId);

//   const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("all");
//   const [busqueda, setBusqueda] = useState("");

//   const productosFiltrados = productos.filter((producto) => {
//     if (
//       categoriaSeleccionada !== "all" &&
//       producto.categoria.id.toString() !== categoriaSeleccionada
//     ) {
//       return false;
//     }
//     if (busqueda) {
//       const term = busqueda.toLowerCase();
//       return (
//         producto.nombre.toLowerCase().includes(term) ||
//         producto.descripcion.toLowerCase().includes(term)
//       );
//     }
//     return true;
//   });

//   return (
//     <div className="carta-digital-admin">
//       <div className="carta-header">
//         <h2>Gestión de Productos</h2>
//         <div className="carta-acciones">
//           <div className="carta-busqueda">
//             <input
//               type="text"
//               placeholder="Buscar producto..."
//               value={busqueda}
//               onChange={(e) => setBusqueda(e.target.value)}
//             />
//             <i className="fas fa-search"></i>
//           </div>
//         </div>
//       </div>

//       <div className="categorias-tabs">
//         <button
//           className={`categoria-tab ${
//             categoriaSeleccionada === "all" ? "activa" : ""
//           }`}
//           onClick={() => setCategoriaSeleccionada("all")}
//         >
//           <i className="fas fa-th"></i> Todos
//         </button>
//         {categorias.map((categoria) => (
//           <button
//             key={categoria.id}
//             className={`categoria-tab ${
//               categoriaSeleccionada === categoria.id.toString() ? "activa" : ""
//             }`}
//             onClick={() => setCategoriaSeleccionada(categoria.id.toString())}
//           >
//             <i className={`fas ${categoria.icono}`}></i> {categoria.nombre}
//           </button>
//         ))}
//       </div>

//       <div className="productos-grid">
//         {productosFiltrados.map((producto) => (
//           <div
//             key={producto.id}
//             className={`producto-card ${!producto.visible ? "producto-invisible" : ""}`}
//           >
//             <div className="producto-imagen">
//               <img src={producto.imagen} alt={producto.nombre} />
//             </div>
//             <div className="producto-info">
//               <div className="producto-header">
//                 <h3>{producto.nombre}</h3>
//                 <button
//                   className="btn-visibility"
//                   onClick={() => toggleVisibleProducto(producto.id).then(recargar)}
//                   title={producto.visible ? "Ocultar" : "Mostrar"}
//                 >
//                   <i className={`fas ${producto.visible ? "fa-eye" : "fa-eye-slash"}`}></i>
//                 </button>
//               </div>
//               <p className="producto-descripcion">{producto.descripcion}</p>
//               <div className="producto-footer">
//                 <span className="producto-precio">
//                   {producto.precio.toFixed(2)} €
//                 </span>
//                 <div
//                   className={`stock-indicator ${
//                     producto.stock <= 0
//                       ? "sin-stock"
//                       : producto.stock < 5
//                       ? "bajo-stock"
//                       : "stock-normal"
//                   }`}
//                 >
//                   <i className="fas fa-box"></i>
//                   <span>Stock: {producto.stock}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default CartaDigitalAdmin;
