/*SELECT *
FROM CATEGORIAS_TO_SERVER_3_Javier AS CAT 
JOIN Títulos_Metadata_Javier AS META          
ON CAT.ID_título = META.ID_título              
WHERE META.Tipo_título = '%';

SELECT META.ID_título, CAT.Categoría, CAT.Forma, CAT.Tipo, SUM(CAT.Frecuencia) as Total
FROM CATEGORIAS_TO_SERVER_3_Javier AS CAT
JOIN Títulos_Metadata_Javier AS META
ON CAT.ID_título = META.ID_título
WHERE META.Tipo_título LIKE '%'
	/*AND META.Género LIKE '%'
GROUP BY CAT.Categoría, CAT.Tipo
ORDER BY Total DESC
LIMIT 100;

SELECT META.ID_título, CAT.Categoría, CAT.Forma, CAT.Tipo, SUM(CAT.Frecuencia) as Total
FROM CATEGORIAS_TO_SERVER_3_Javier AS CAT
JOIN Títulos_Metadata_Javier AS META
ON CAT.ID_título = META.ID_título
WHERE META.Etapa_Dirección LIKE '%'
	AND META.Género LIKE '%'
GROUP BY CAT.Categoría, CAT.Tipo
ORDER BY Total DESC
LIMIT 100;
-----SOLVING TROUBLE ADDING FILTER WITH TODOS TIPO TITULO------
SELECT META.ID_título, CAT.Categoría, CAT.Forma, CAT.Tipo, SUM(CAT.Frecuencia) as Total
FROM CATEGORIAS_TO_SERVER_3_Javier AS CAT
JOIN Títulos_Metadata_Javier AS META
ON CAT.ID_título = META.ID_título
WHERE META.Etapa_Dirección LIKE '%'
	/*AND META.Género LIKE '%'
	AND META.Tipo_título LIKE '%'
GROUP BY CAT.Categoría, CAT.Tipo
ORDER BY Total DESC
LIMIT 100;

SELECT META.ID_título, CAT.Categoría, CAT.Forma, CAT.Tipo, SUM(CAT.Frecuencia) as Total
FROM CATEGORIAS_TO_SERVER_3_Javier AS CAT
JOIN Títulos_Metadata_Javier AS META
ON CAT.ID_título = META.ID_título
WHERE META.Etapa_Dirección LIKE '%'
	/*AND META.Género LIKE '%'
	AND META.Tipo_título LIKE '%'
GROUP BY CAT.Categoría, CAT.Tipo
ORDER BY Total DESC
LIMIT 100;*/

/*SELECT CAT.Categoría, THIRD.ID_Autor, THIRD.nombre_completo, SUM(CAT.Frecuencia) as Total
FROM CATEGORIAS_TO_SERVER_3_Javier AS CAT
JOIN Títulos_Metadata_Javier AS META
ON CAT.ID_título = META.ID_título
JOIN THIRD_MATCH_Javier AS THIRD
ON META.ID_título = THIRD.ID_título
WHERE META.Etapa_Dirección LIKE '%'
	/*AND META.Género LIKE '%'*/
	/*AND META.Tipo_título LIKE '%'
	AND THIRD.nombre_completo IS NOT NULL
GROUP BY CAT.Categoría, THIRD.nombre_completo
ORDER BY Total DESC
LIMIT 100;

SELECT THIRD.ID_Autor, THIRD.nombre_completo, SUM(CAT.Frecuencia) as Total
FROM CATEGORIAS_TO_SERVER_3_Javier AS CAT
JOIN Títulos_Metadata_Javier AS META
ON CAT.ID_título = META.ID_título
JOIN THIRD_MATCH_Javier AS THIRD
ON META.ID_título = THIRD.ID_título
WHERE META.Etapa_Dirección LIKE '%'
	/*AND META.Género LIKE '%'
	AND META.Tipo_título LIKE '%'
	AND THIRD.nombre_completo IS NOT NULL
GROUP BY THIRD.ID_Autor, THIRD.nombre_completo
ORDER BY Total DESC
LIMIT 100;

SELECT 
	SUM(CAT.Frecuencia) AS Total, 
	CAT.Tipo, 
	THIRD.Título, 
	THIRD.nombre_completo, 
	THIRD.Etapa_Dirección
FROM CATEGORIAS_TO_SERVER_3_Javier AS CAT
JOIN THIRD_MATCH_Javier AS THIRD
    ON CAT.ID_título = THIRD.ID_título
WHERE THIRD.Etapa_Dirección LIKE '%'
    AND THIRD.Tipo_título LIKE '%'
GROUP BY THIRD.Título, THIRD.nombre_completo, THIRD.Etapa_Dirección, CAT.Tipo;

SELECT 
  SUM(CAT.Frecuencia) AS Total, 
  CAT.Tipo AS category, 
  GROUP_CONCAT(THIRD.Título) AS titles, 
  THIRD.Etapa_Dirección AS stage,
  GROUP_CONCAT(THIRD.ID_Autor) AS authorIds,
  CAT.Tipo AS categoryType
FROM CATEGORIAS_TO_SERVER_3_Javier AS CAT
JOIN THIRD_MATCH_Javier AS THIRD
ON CAT.ID_título = THIRD.ID_título
WHERE CAT.Tipo LIKE "%"
GROUP BY CAT.Tipo, THIRD.Etapa_Dirección;*/

SELECT THIRD.ID_Autor, THIRD.nombre_completo, SUM(CAT.Frecuencia) AS Total, GROUP_CONCAT(THIRD.Título, '|| ') AS titles 
FROM CATEGORIAS_TO_SERVER_3_Javier AS CAT
JOIN Títulos_Metadata_Javier AS META
	ON CAT.ID_título = META.ID_título
JOIN THIRD_MATCH_Javier AS THIRD
	ON META.ID_título = THIRD.ID_título
WHERE META.Etapa_Dirección LIKE "%"
	AND META.Tipo_título LIKE "%"
	AND META.género LIKE "%"
	AND THIRD.nombre_completo IS NOT NULL
GROUP BY THIRD.ID_Autor, THIRD.nombre_completo
ORDER BY Total DESC;
LIMIT?



