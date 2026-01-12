const fs = require('fs');

const vendorIds = [
  "6944681d2f4a287183f26d46", "6944681d2f4a287183f26d47", "6944681d2f4a287183f26d48",
  "6944681d2f4a287183f26d49", "6944681d2f4a287183f26d4a", "6944681d2f4a287183f26d4b",
  "6944681d2f4a287183f26d4c", "6944681d2f4a287183f26d4d", "6944681d2f4a287183f26d4e",
  "6944681d2f4a287183f26d4f", "6944681d2f4a287183f26d50", "6944681d2f4a287183f26d51",
  "6944681d2f4a287183f26d52", "6944681d2f4a287183f26d53", "6944681d2f4a287183f26d54",
  "6944681d2f4a287183f26d55", "6944681d2f4a287183f26d56", "6944681d2f4a287183f26d57",
  "6944681d2f4a287183f26d58", "6944681d2f4a287183f26d59", "6944681d2f4a287183f26d5a",
  "6944681d2f4a287183f26d5b", "6944681d2f4a287183f26d5c", "6944681d2f4a287183f26d5d",
  "6944681d2f4a287183f26d5e", "6944681d2f4a287183f26d5f", "6944681d2f4a287183f26d60",
  "6944681d2f4a287183f26d61", "6944681d2f4a287183f26d62", "6944681d2f4a287183f26d63",
  "6944681d2f4a287183f26d64", "6944681d2f4a287183f26d65", "6944681d2f4a287183f26d66",
  "6944681d2f4a287183f26d67", "6944681d2f4a287183f26d68", "6944681d2f4a287183f26d69",
  "6944681d2f4a287183f26d6a", "6944681d2f4a287183f26d6b", "6944681d2f4a287183f26d6c",
  "6944681d2f4a287183f26d6d"
];

const productBases = [
  { n: "Placa de Vídeo RTX", d: "Performance extrema para Ray Tracing.", min: 2500, max: 8000 },
  { n: "Processador Intel Core i", d: "Arquitetura híbrida de alto desempenho.", min: 800, max: 4000 },
  { n: "Memória RAM DDR5", d: "Módulo de alta frequência 5600MHz.", min: 350, max: 1100 },
  { n: "SSD NVMe M.2 1TB", d: "Velocidade de leitura até 7500MB/s.", min: 280, max: 900 },
  { n: "Monitor Gamer 144Hz", d: "Painel IPS com tempo de resposta de 1ms.", min: 750, max: 2200 }
];

const finalProducts = [];

for (let i = 1; i <= 500; i++) {
  const base = productBases[Math.floor(Math.random() * productBases.length)];
  const buyPrice = parseFloat((Math.random() * (base.max - base.min) + base.min).toFixed(2));
  const sellPrice = parseFloat((buyPrice * 1.4).toFixed(2));
  const randomVendor = vendorIds[Math.floor(Math.random() * vendorIds.length)];

  finalProducts.push({
    name: `${base.n} v${i}`,
    description: base.d,
    purchasePrice: buyPrice,
    salePrice: sellPrice,
    supplier: randomVendor // Apenas a string para o Postman
  });
}

fs.writeFileSync('produtos_postman.json', JSON.stringify(finalProducts, null, 2));
console.log("Arquivo 'produtos_postman.json' gerado com sucesso!");