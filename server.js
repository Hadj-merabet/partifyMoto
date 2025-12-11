///////////////////////////////////////////////////////
// 1) BASE DE DONNÉES : CARÉNAGES YAMAHA MOTOCROSS   //
///////////////////////////////////////////////////////
const YAMAHA_MX_DATABASE = {
  "YZ 85": {
    years: range(2000, 2024),
    description: "La YZ85 est la référence des jeunes pilotes. Ses carénages sont légers, résistants et parfaits pour l'entraînement et la compétition.",
    images: ["https://images.unsplash.com/photo-1504215680853-026ed2a45def"],
    colors: ["Bleu Yamaha", "Blanc", "Noir"],
    price: 79.90
  },
  "YZ 125": {
    years: range(1990, 2024),
    description: "Carénages complets pour YZ125 toutes années. Plastiques haute résistance.",
    images: ["https://images.unsplash.com/photo-1568772585407-9361f9bf3a87"],
    colors: ["Bleu Yamaha", "Blanc"],
    price: 119.90
  },
  "YZ 250": {
    years: range(1990, 2024),
    description: "La YZ250, une moto iconique 2 temps. Kits plastiques complets compétition.",
    images: ["https://images.unsplash.com/photo-1529429611278-8d1d1c5bd77a"],
    colors: ["Bleu Yamaha", "Noir", "Jaune Rétro"],
    price: 129.90
  },
  "YZ 250F": {
    years: range(2001, 2024),
    description: "Carénages complets YZ250F. Plastiques souples haute durabilité.",
    images: ["https://images.unsplash.com/photo-1617745278868-ab38e97f8a19"],
    colors: ["Bleu Yamaha", "Noir"],
    price: 139.90
  },
  "YZ 450F": {
    years: range(2003, 2024),
    description: "Carénages renforcés pour YZ450F. Look racing agressif.",
    images: ["https://images.unsplash.com/photo-1624492447849-2799777084ff"],
    colors: ["Bleu Yamaha", "Blanc", "Noir"],
    price: 149.90
  }
};

// Fonction utilitaire
function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

///////////////////////////////////////////////////////
// 2) MENU DÉROULANT DYNAMIQUE YAMAHA                //
///////////////////////////////////////////////////////
window.addEventListener("DOMContentLoaded", () => {
  const brandSelect = document.querySelector("#search select:nth-child(1)");
  const modelSelect = document.querySelector("#search select:nth-child(2)");
  const yearSelect = document.querySelector("#search select:nth-child(3)");
  const searchButton = document.querySelector("#search button");

  brandSelect.addEventListener("change", () => {
    if (brandSelect.value === "Yamaha") {
      modelSelect.innerHTML = "<option>Modèle</option>";
      Object.keys(YAMAHA_MX_DATABASE).forEach(model => {
        modelSelect.innerHTML += `<option>${model}</option>`;
      });
    }
  });

  modelSelect.addEventListener("change", () => {
    const m = modelSelect.value;
    if (!YAMAHA_MX_DATABASE[m]) return;
    yearSelect.innerHTML = "<option>Année</option>";
    YAMAHA_MX_DATABASE[m].years.forEach(y => {
      yearSelect.innerHTML += `<option>${y}</option>`;
    });
  });

  ///////////////////////////////////////////////
  // 3) REDIRECTION VERS PAGE PRODUIT INTERNE  //
  ///////////////////////////////////////////////
  searchButton.addEventListener("click", () => {
    const brand = brandSelect.value;
    const model = modelSelect.value;
    const year = yearSelect.value;

    if (brand !== "Yamaha") return;
    if (!YAMAHA_MX_DATABASE[model]) return;

    window.location.href =
      `produit.html?marque=Yamaha&modele=${encodeURIComponent(model)}&annee=${year}`;
  });
});

///////////////////////////////////////////////////////
// 4) PAGE PRODUIT (produit.html)                    //
///////////////////////////////////////////////////////
if (window.location.pathname.includes("produit.html")) {
  const params = new URLSearchParams(window.location.search);
  const model = params.get("modele");
  const data = YAMAHA_MX_DATABASE[model];

  if (!data) return;

  document.body.innerHTML = `
    <div class='max-w-3xl mx-auto py-20 px-6'>
      <h1 class='text-4xl font-display font-bold text-slate-900 mb-6'>${model}</h1>
      <p class='text-slate-600 mb-6 text-lg'>${data.description}</p>

      <div class='grid grid-cols-1 md:grid-cols-2 gap-6 mb-10'>
        ${data.images.map(img => `
          <img class='rounded-xl shadow-lg' src='${img}' />
        `).join('')}
      </div>

      <div class='bg-white p-6 rounded-xl shadow-lg border border-slate-200'>
        <h2 class='text-2xl font-semibold mb-4'>Détails du kit carénage</h2>

        <p class='text-slate-600 mb-2'><strong>Prix :</strong> ${data.price}€</p>
        <p class='text-slate-600 mb-2'><strong>Couleurs disponibles :</strong> ${data.colors.join(', ')}</p>

        <label class='block mb-4'>
          <span class='text-slate-500 text-sm'>Quantité</span>
          <input type='number' value='1' min='1' class='w-20 mt-1 p-2 border rounded-lg'/>
        </label>

        <button class='bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-lg font-medium text-lg w-full'>
          Commander maintenant
        </button>
      </div>
    </div>
  `;
}

