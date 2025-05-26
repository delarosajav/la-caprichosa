// 1. Imports & Setup
// ==========================
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const port = 3001;

// 2. Middleware
// ==========================
app.use(express.static('static'));
app.use(cors());

// 3. Connecting to DB
// ==========================
let db = new sqlite3.Database("ProyectoPura_SERVER_Javier.db", (err) => {
  if (err) return console.error(err.message);
  console.log("Connected to SQLite database.");
});

// 4. API Endpoints
// ==========================

// --- 4.1 WordCloud: main category data with main filters(tipo,genero,direccion) ---
app.get("/api/wordcloud", (req, res) => {
  const tipo = req.query.tipo || '%';     // '''''''''''''''''''''''''
  const genero = req.query.genero || '%'; // wildcard
  const direccion = req.query.stage || '%'; // ''''''''''''''''''''''''''
  const category = req.query.category;
  
  console.log(`Tipo: ${tipo}, Género: ${genero}, Etapa dirección: ${direccion}, Categoría: ${category || 'N/A'}`);

  let baseSql = `
    FROM CATEGORIAS_TO_SERVER_3_Javier AS CAT
    JOIN Títulos_Metadata_Javier AS META ON CAT.ID_título = META.ID_título
    LEFT JOIN THIRD_MATCH_Javier AS MATCH ON META.ID_título = MATCH.ID_título
  `;


  let filters = `WHERE META.Tipo_título LIKE ? AND META.Etapa_Dirección LIKE ?`;
  let params = [tipo, direccion];

  if (direccion === '%') {
    filters += ` AND META.Etapa_Dirección LIKE ?`;
    params.push('%');  // Allow any direction when "Todos" is selected
  } else {
    filters += ` AND META.Etapa_Dirección = ?`;  // Match exact direction (no wildcard)
    params.push(direccion);  // Only use exact value for stage
  }

  if (tipo === "Obra") {
    filters += ` AND META.género LIKE ?`;
    params.push(genero);
  };

  // Return normal wordcloud
  if (!category) {
    const sql = `
      SELECT CAT.Categoría, CAT.Forma, CAT.Tipo, SUM(CAT.Frecuencia) AS Total
      ${baseSql}
      ${filters}
      GROUP BY CAT.Categoría, CAT.Tipo
      ORDER BY Total DESC
    `;

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error("SQL Error:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
      console.log(rows)
    });
    // Return all data from a selected category under selected wordcloud filters
    } else {
      const sql = `
      SELECT 
        CAT.Categoría AS category,
        SUM(CAT.Frecuencia) AS total,
        GROUP_CONCAT(MATCH.Título, '|| ') AS titles,
        META.Etapa_Dirección AS stage,
        GROUP_CONCAT(MATCH.nombre_completo, '|| ') AS authorNames,
        GROUP_CONCAT(MATCH.Género, '|| ') AS generos
      ${baseSql}
      ${filters} AND CAT.Categoría = ?
      GROUP BY META.Etapa_Dirección
    `;

    db.all(sql, [...params, category], (err, rows) => {
      if (err) {
        console.error("SQL Error:", err.message);
        return res.status(500).json({ error: err.message });
      }

      if (!rows.length) {
        return res.status(404).json({ error: "No extracted data" });
      }
      console.log(rows)
      //If there're multiple rows (e.g Etapas, Género, etc) return all of them
      const formatted = rows.map(row => ({
        category: row.category,
        total: row.total,
        titles: row.titles?.split("|| ").filter(Boolean) || [],
        generos: row.generos?.split("|| ").filter(Boolean) || [],
        stage: row.stage,
        authors: row.authorNames?.split("|| ").filter(Boolean) || [],
      }));
      res.json(formatted);
    });
  }

});

// --- 4.3 Top Authors (Alternative Wordcloud) ---
app.get("/api/wordcloud-authors", (req, res) => {
  const tipo = req.query.tipo || '%';
  const direccion = req.query.direccion || '%';
  const genero = req.query.genero || '%';

  console.log(`Top Authors. Tipo: ${tipo}, Etapa dirección: ${direccion}, Género: ${genero}`);

  let sql = `
    SELECT THIRD.ID_Autor, THIRD.nombre_completo, SUM(CAT.Frecuencia) as Total
    FROM CATEGORIAS_TO_SERVER_3_Javier AS CAT
    JOIN Títulos_Metadata_Javier AS META
      ON CAT.ID_título = META.ID_título
    JOIN THIRD_MATCH_Javier AS THIRD
      ON META.ID_título = THIRD.ID_título
    WHERE META.Etapa_Dirección LIKE ?
      AND META.Tipo_título LIKE ?
      AND META.género LIKE ?
      AND THIRD.nombre_completo IS NOT NULL
    GROUP BY THIRD.ID_Autor, THIRD.nombre_completo
    ORDER BY Total DESC
    LIMIT 35;
  `;

  let params = [direccion, tipo, genero];

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error("SQL Error:", err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// ==========================
// 5. Start Server
// ==========================
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


