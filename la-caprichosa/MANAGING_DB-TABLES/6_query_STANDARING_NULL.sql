UPDATE Titles_Obras_Complementos
set ID_Autor = NULL
WHERE ID_AUTOR = '';

UPDATE Titles_Obras_Complementos
set Title = NULL
WHERE Title = '';

COMMIT