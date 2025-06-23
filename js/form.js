const API_URL = 'https://script.google.com/macros/s/AKfycbzxGHyjPuKTjV0235CxPVRnTZZH41kP5khQfPhi0NZtSlrst00RMW3IJCdx5LcQsr7pGA/exec';
let scannerActive = false;

document.getElementById("productForm").onsubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = new URLSearchParams(new FormData(form)).toString();
  try {
    const res = await fetch(`${API_URL}?action=add&${data}`);
    if (!res.ok) throw new Error("Error guardando producto");
    alert("Producto guardado");
    form.reset();
  } catch (err) {
    alert(err.message);
  }
};

document.getElementById("startFormScan").onclick = () => {
  if (scannerActive) {
    stopScanner("#scannerForm");
  } else {
    startScanner("#scannerForm", code => {
      document.querySelector("[name=CodigoBarra]").value = code;
      stopScanner("#scannerForm");
    });
  }
};

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
    scannerActive = true;
  });
  Quagga.onDetected(data => {
    onDetected(data.codeResult.code);
  });
}

function stopScanner(selector) {
  Quagga.stop();
  document.querySelector(selector).style.display = "none";
  scannerActive = false;
}
