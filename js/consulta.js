const API_URL = 'https://script.google.com/macros/s/AKfycbzxGHyjPuKTjV0235CxPVRnTZZH41kP5khQfPhi0NZtSlrst00RMW3IJCdx5LcQsr7pGA/exec';

document.addEventListener("DOMContentLoaded", () => {
  startScanner("#scanner", async code => {
    try {
      const res = await fetch(`${API_URL}?action=list`);
      if (!res.ok) throw new Error("Conexión fallida");
      const data = await res.json();
      const found = data.find(p => p.CodigoBarra === code);
      document.getElementById("scanResult").innerText = found ? JSON.stringify(found, null, 2) : "Producto no encontrado";
    } catch (err) {
      alert(err.message);
    }
  });
});

function startScanner(selector, onDetected) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.style.display = "block";
  Quagga.init({
    inputStream: { name: "Live", type: "LiveStream", target: el, constraints: { facingMode: "environment" } },
    decoder: { readers: ["ean_reader", "code_128_reader"] }
  }, err => {
    if (err) { alert("Error lector: " + err); return; }
    Quagga.start();
  });
  Quagga.onDetected(data => {
    Quagga.stop();
    el.style.display = "none";
    onDetected(data.codeResult.code);
  });
}
