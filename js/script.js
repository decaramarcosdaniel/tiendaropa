const API_URL = 'https://script.google.com/macros/s/AKfycbzxGHyjPuKTjV0235CxPVRnTZZH41kP5khQfPhi0NZtSlrst00RMW3IJCdx5LcQsr7pGA/exec';

document.getElementById("showTable").onclick = loadTable;
document.getElementById("showForm").onclick = () => {
  showSection('formSection');
};
document.getElementById("showScan").onclick = startScanner;
document.getElementById("startFormScan").onclick = () => {
  startFormScanner();
};

document.getElementById("productForm").onsubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = new URLSearchParams(new FormData(form)).toString();
  await fetch(`${API_URL}?action=add&${data}`);
  form.reset();
  document.getElementById("saveMsg").classList.remove("hidden");
  setTimeout(() => {
    document.getElementById("saveMsg").classList.add("hidden");
  }, 3000);
  loadTable();
};

async function loadTable() {
  showSection('tableSection');
  const res = await fetch(`${API_URL}?action=list`);
  const products = await res.json();
  const tbody = document.querySelector("#productTable tbody");
  tbody.innerHTML = "";
  products.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.CodigoBarra}</td>
      <td>${p.Nombre}</td>
      <td>${p.Tipo}</td>
      <td>${p.Talle}</td>
      <td>${p.Precio}</td>
      <td>${p.Descripcion}</td>
      <td>${p.Stock}</td>
      <td>
        <button class="edit bi bi-pencil" onclick="editProduct('${p.CodigoBarra}')"></button>
        <button class="delete bi bi-trash" onclick="deleteProduct('${p.CodigoBarra}')"></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function deleteProduct(code) {
  if (confirm("¿Eliminar producto?")) {
    await fetch(`${API_URL}?action=delete&CodigoBarra=${code}`);
    loadTable();
  }
}

function editProduct(code) {
  alert(`Función de edición: busca el producto ${code} y actualiza usando el form`);
}

function showSection(id) {
  document.querySelectorAll('main section').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  Quagga.stop();
}

function startScanner() {
  showSection('scanSection');
  startQuagga('#scanner', (code) => {
    fetch(`${API_URL}?action=list`)
      .then(res => res.json())
      .then(products => {
        const found = products.find(p => p.CodigoBarra === code);
        if (found) {
          document.getElementById("scanResult").innerText = JSON.stringify(found, null, 2);
        } else {
          document.getElementById("scanResult").innerText = "Producto no encontrado";
        }
      });
  });
}

function startFormScanner() {
  startQuagga('#scannerForm', (code) => {
    document.querySelector('[name=CodigoBarra]').value = code;
  });
}

function startQuagga(targetSelector, onDetected) {
  const targetEl = document.querySelector(targetSelector);
  if (!targetEl) {
    alert("No se encontró el contenedor del lector");
    return;
  }

  Quagga.stop();

  Quagga.init({
    inputStream : {
      name : "Live",
      type : "LiveStream",
      target: targetEl,
      constraints: {
        facingMode: "environment"
      }
    },
    decoder : {
      readers : ["ean_reader", "code_128_reader"]
    },
    locate: true
  }, function(err) {
      if (err) {
          console.error("Error al iniciar Quagga: ", err);
          alert("Error al iniciar el lector: " + err);
          return;
      }
      Quagga.start();
  });

  let detected = false;
  Quagga.onDetected(function(data) {
    if (!detected) {
      detected = true;
      Quagga.stop();
      onDetected(data.codeResult.code);
    }
  });

  setTimeout(() => {
    if (!detected) {
      Quagga.stop();
      alert("No se pudo leer el código. Intenta de nuevo.");
    }
  }, 10000);
}
