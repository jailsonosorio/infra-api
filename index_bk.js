const express = require("express");
const app = express();

app.use(express.json());

// Rota principal
app.post("/consultaInfraestrutura", (req, res) => {
  const { p_tipo, p_instancia } = req.body.consultaInfraestrutura;

  // Apenas para debug
  console.log(`Tipo: ${p_tipo}, Instancia: ${p_instancia}`);

  let response;

  // Retorno mockado baseado no tipo
  if (p_tipo === "estado") {
    response = {
      status: `Base de dados ${p_instancia} OPEN com ${
        Math.floor(Math.random() * 50) + 1
      } Sessão Ativo e consumindo ${(Math.random() * 200).toFixed(2)} MB de PGA`,
    };
  } else if (p_tipo === "capacidade") {
    response = [
      {
        name: "DATA",
        type: "NORMAL",
        state: "CONNECTED",
        totalSizeGB: 3000,
        usedSpaceGB: 2873,
        freeSpaceGB: 128,
        usedPercentage: 95.76,
      },
      {
        name: "FRA",
        type: "EXTERN",
        state: "MOUNTED",
        totalSizeGB: 500,
        usedSpaceGB: 448,
        freeSpaceGB: 53,
        usedPercentage: 89.53,
      },
    ];
  } else if (p_tipo === "anomalia") {
    response = [
      {
        name: "FNOS1",
        allocatedMB: 35,
        freeMb: 5,
        usedMb: 30,
        pctFree: 13,
        pctUsed: 87,
        maxBytesMb: 32768,
        maxFreeBytesMb: 32738,
      },
      {
        name: "DBPLUS",
        allocatedMB: 1000,
        freeMB: 436,
        usedMB: 564,
        pctFree: 44,
        pctUsed: 56,
        maxBytesMb: 1000,
        maxFreeBytesMb: 436,
      },
    ];
  } else {
    response = { error: "Tipo de consulta inválido!" };
  }

  res.json(response);
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
