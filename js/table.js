const API_URL = 'https://script.google.com/macros/s/AKfycbzxGHyjPuKTjV0235CxPVRnTZZH41kP5khQfPhi0NZtSlrst00RMW3IJCdx5LcQsr7pGA/exec';
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch(`${API_URL}?action=list`);
    if (!res.ok) throw new Error("Conexión fallida");
    const data = await res.json();
    const tbody = document.querySelector("#productTable tbody");
    data.forEach(p => {
      const row = `<tr>
        <td>${p.CodigoBarra}</td>
        <td>${p.Nombre}</td>
        <td>${p.Tipo}</td>
        <td>${p.Talle}</td>
        <td>${p.Precio}</td>
        <td>${p.Descripcion}</td>
        <td>${p.Stock}</td>
      </tr>`;
      tbody.insertAdjacentHTML("beforeend", row);
    });
  } catch (err) {
    alert("Error: " + err.message);
  }
});
