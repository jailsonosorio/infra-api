const express = require("express");
const oracledb = require("oracledb");
const app = express();
// 🔥 Importa a função de db.js
const { getConnection } = require("./db"); 

app.use(express.json());

app.post("/consultaInfraestrutura", async (req, res) => {
  const { p_tipo, p_instancia } = req.body.consultaInfraestrutura;

  console.log(`Tipo: ${p_tipo}, Instancia: ${p_instancia}`);

  let response;


  try {
    const conn = await getConnection();

    if (p_tipo === "estado") {
      const result = await conn.execute(
        `SELECT instance_name, status, database_status, logins, host_name
          FROM v$instance
          where instance_name = :instancia`,
        [p_instancia],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      response = result.rows;
    }

    else if (p_tipo === "capacidade") {
      const result = await conn.execute(
        `select * from (
          select
          t.tablespace as name,
          t.status,
          t.totalspace as totalSizeGB,
          round((t.totalspace-fs.freespace),2) as usedSpaceGB,
          fs.freespace as freeSpaceGB,
          round(((t.totalspace-fs.freespace)/t.totalspace)*100,2) as usedPercentage,
          round((fs.freespace/t.totalspace)*100,2) as freeSpaceGBperc
          from
          (select round(sum(d.bytes)/(1024*1024)) as totalspace,
          d.tablespace_name tablespace,
          d.status
          from
          dba_data_files d group by d.tablespace_name, d.status
          ) t,
          (select round(sum(f.bytes)/(1024*1024)) as freespace,
          f.tablespace_name tablespace
          from dba_free_space f group by f.tablespace_name) fs
          where
          t.tablespace=fs.tablespace
          order by usedPercentage desc)
          where rownum < 11`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      response = result.rows;
    }

    else if (p_tipo === "anomalia") {
      const result = await conn.execute(
        `select * from (
          select
          t.tablespace as Name,
          t.totalspace as allocatedMB,
          round((t.totalspace-fs.freespace),2) as usedSpaceMB,
          fs.freespace as freeSpaceMB,
          round(t.MAXBYTES/1024/1024/1024,2) MAXSIZE_GB,
          (t.INCREMENT_BY*8)/1024 INCR_MB,
          round(((t.totalspace-fs.freespace)/t.totalspace)*100,2) as usedPercentage,
          round((fs.freespace/t.totalspace)*100,2) as freeSpacePerc
          from
          (select round(sum(d.bytes)/(1024*1024)) as totalspace,
          d.tablespace_name tablespace,
          d.status,
          d.MAXBYTES,
          d.INCREMENT_BY
          from
          dba_data_files d
          group by d.tablespace_name, d.status, d.MAXBYTES, d.INCREMENT_BY
          ) t,
          (select round(sum(f.bytes)/(1024*1024)) as freespace,
          f.tablespace_name tablespace
          from dba_free_space f group by f.tablespace_name) fs
          where
          t.tablespace=fs.tablespace
          and round(((t.totalspace-fs.freespace)/t.totalspace)*100,2) > 95
          --order by t.tablespace
          order by usedPercentage desc)
          where rownum < 11`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      response = result.rows;
    }

    else {
      response = { error: "Tipo de consulta inválido!" };
    }

    await conn.close();
    res.json(response);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao consultar a base de dados" });
  }
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
