const API_URL = 'https://script.google.com/macros/s/AKfycbzKAXK8Bn4QLViBiv2gIwQmnJPc4NZp189enG2VVM-AmmVMQE_7TuDVfoQTZsZTKhEj6Q/exec';

document.getElementById("showTable").onclick = loadTable;
document.getElementById("showForm").onclick = () => showSection('formSection');
document.getElementById("showScan").onclick = startScanner;

document.getElementById("productForm").onsubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = new URLSearchParams(new FormData(form)).toString();
  await fetch(`${API_URL}?action=add&${data}`);
  form.reset();
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
}

function startScanner() {
  showSection('scanSection');
  Quagga.init({
    inputStream : {
      name : "Live",
      type : "LiveStream",
      target: document.querySelector('#scanner')
    },
    decoder : {
      readers : ["ean_reader"]
    }
  }, function(err) {
      if (err) {
          console.log(err);
          return;
      }
      Quagga.start();
  });

  Quagga.onDetected(async function(data) {
    const code = data.codeResult.code;
    Quagga.stop();
    const res = await fetch(`${API_URL}?action=list`);
    const products = await res.json();
    const found = products.find(p => p.CodigoBarra === code);
    if (found) {
      document.getElementById("scanResult").innerText = JSON.stringify(found, null, 2);
    } else {
      document.getElementById("scanResult").innerText = "Producto no encontrado";
    }
  });
}
