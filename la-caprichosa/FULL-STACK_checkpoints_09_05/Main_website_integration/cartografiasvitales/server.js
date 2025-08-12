const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require("cors");

const app = express();
app.use(express.static('static'));
app.use(express.json({limit: '50mb'}));
const port = process.env.PORT || 4000;
app.use(cors());

app.listen(port, () => {
  console.log(`listening at port ${port}`);
});
//app.use(express.bodyParser({limit: '50mb'}));

let db = new sqlite3.Database('proyectoPura.db', (err)=> {
	if (err) {
		console.error(err.message);
	} else {
		console.log('Connected to proyectoPura.db');
		/*db.all('PRAGMA table_list;', (err,rows)=>{
			if (err) {
				console.log(err.message);
			} else {
				console.log(rows);
			}
		});*/
	}
});

app.get('/ping', (request,response)=>{
	response.json({data:'Hello server!'});
});
app.get('/favico.ico', (req, res) => {
    res.sendStatus(404);
});

// =================================
// API MODELING CONTENTS
// =================================
// 3. Connecting to DB
// ==========================
let db2 = new sqlite3.Database("ProyectoPura_SERVER_Javier.db", (err) => {
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
  
	  db2.all(sql, params, (err, rows) => {
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
		  GROUP_CONCAT(CAT.Forma, '|| ') as formas,
		  GROUP_CONCAT(MATCH.Título, '|| ') AS titles,
		  META.Etapa_Dirección AS stage,
		  GROUP_CONCAT(MATCH.nombre_completo, '|| ') AS authorNames,
		  GROUP_CONCAT(MATCH.Género, '|| ') AS generos
		${baseSql}
		${filters} AND CAT.Categoría = ?
		GROUP BY META.Etapa_Dirección
	  `;
  
	  db2.all(sql, [...params, category], (err, rows) => {
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
		  form: row.formas?.split("|| ").filter(Boolean) || [],
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
	`;
  
	let params = [direccion, tipo, genero];
  
	db2.all(sql, params, (err, rows) => {
	  if (err) {
		console.error("SQL Error:", err.message);
		res.status(500).json({ error: err.message });
		return;
	  }
	  res.json(rows);
	});
  });

  // --- 4.4 Author Details Endpoint (Updated) ---
app.get("/api/author-details", (req, res) => {
  const authorId = req.query.id;
  const tipo = req.query.tipo || '%';
  const genero = req.query.genero || '%';
  const direccion = req.query.direccion || '%';

  console.log(`Fetching details for author ID: ${authorId}`);

  // Query 1: Get ALL titles (including uncategorized)
  const sqlAllTitles = `
    SELECT DISTINCT 
      THIRD.Título,
      THIRD.ID_título
    FROM THIRD_MATCH_Javier AS THIRD
    JOIN Títulos_Metadata_Javier AS META
      ON THIRD.ID_título = META.ID_título
    WHERE THIRD.ID_Autor = ?
      AND META.Tipo_título LIKE ?
      AND META.género LIKE ?
      AND META.Etapa_Dirección LIKE ?
    ORDER BY THIRD.Título
  `;

  // Query 2: Get summary data (counts, genres, stages)
  const sqlSummary = `
    SELECT 
      THIRD.ID_Autor,
      THIRD.nombre_completo,
      COUNT(DISTINCT META.ID_título) AS total_titles,
      (
        SELECT GROUP_CONCAT(género, ' || ')
        FROM (
          SELECT DISTINCT género
          FROM Títulos_Metadata_Javier
          WHERE ID_título IN (
            SELECT ID_título 
            FROM THIRD_MATCH_Javier 
            WHERE ID_Autor = ?
          )
        )
      ) AS generos,
      (
        SELECT GROUP_CONCAT(Etapa_Dirección, ' || ')
        FROM (
          SELECT DISTINCT Etapa_Dirección
          FROM Títulos_Metadata_Javier
          WHERE ID_título IN (
            SELECT ID_título 
            FROM THIRD_MATCH_Javier 
            WHERE ID_Autor = ?
          )
        )
      ) AS stages
    FROM THIRD_MATCH_Javier AS THIRD
    JOIN Títulos_Metadata_Javier AS META
      ON THIRD.ID_título = META.ID_título
    WHERE THIRD.ID_Autor = ?
      AND META.Tipo_título LIKE ?
      AND META.género LIKE ?
      AND META.Etapa_Dirección LIKE ?
    GROUP BY THIRD.ID_Autor, THIRD.nombre_completo
  `;

  // Query 3: Get categorized titles (for frequency counts)
  const sqlCategorizedTitles = `
    SELECT DISTINCT 
      THIRD.Título,
      THIRD.ID_título
    FROM CATEGORIAS_TO_SERVER_3_Javier AS CAT
    JOIN THIRD_MATCH_Javier AS THIRD
      ON CAT.ID_título = THIRD.ID_título
    JOIN Títulos_Metadata_Javier AS META
      ON THIRD.ID_título = META.ID_título
    WHERE THIRD.ID_Autor = ?
      AND META.Tipo_título LIKE ?
      AND META.género LIKE ?
      AND META.Etapa_Dirección LIKE ?
  `;

  // Execute all queries
  db2.serialize(() => {
    // 1. Get ALL titles (including "Quién es el...")
    db2.all(sqlAllTitles, [authorId, tipo, genero, direccion], (err, allTitleRows) => {
      if (err) {
        console.error("SQL Error (all titles):", err.message);
        return res.status(500).json({ error: "Database error", details: err.message });
      }
      console.log("All titles (including uncategorized):");
      console.table(allTitleRows);

      // 2. Get summary data (author info, genres, stages)
      db2.all(sqlSummary, [
        authorId, 
        authorId,
        authorId, tipo, genero, direccion
      ], (err, summaryRows) => {
        if (err) {
          console.error("SQL Error (summary):", err.message);
          return res.status(500).json({ error: "Database error", details: err.message });
        }

        if (!summaryRows || summaryRows.length === 0) {
          return res.status(404).json({ 
            error: "Author not found",
            details: `No author found with ID ${authorId} using current filters` 
          });
        }

        // 3. Get categorized titles (for accurate frequency counts)
        db2.all(sqlCategorizedTitles, [authorId, tipo, genero, direccion], (err, categorizedTitleRows) => {
          if (err) {
            console.error("SQL Error (categorized titles):", err.message);
            return res.status(500).json({ error: "Database error", details: err.message });
          }

          // Process titles - keep one entry per ID_título
          const uniqueTitles = [];
          const seenIds = new Set();

          allTitleRows.forEach(row => {
            if (!seenIds.has(row.ID_título)) {
              seenIds.add(row.ID_título);
              uniqueTitles.push(row.Título);
            }
          });

          const formatted = {
            id: summaryRows[0].ID_Autor,
            name: summaryRows[0].nombre_completo,
            total: summaryRows[0].total_titles, // Total includes ALL titles
            titles: uniqueTitles, // Includes uncategorized titles
            generos: summaryRows[0].generos?.split(' || ').filter(Boolean) || [],
            stages: summaryRows[0].stages?.split(' || ').filter(Boolean) || [],
            // Optional: Add frequency data if needed
            categorizedTitles: categorizedTitleRows.map(row => row.Título)
          };

          console.log("Final response:", formatted);
          res.json(formatted);
        });
      });
    });
  });
});
