UPDATE FIRST_MATCH_Javier
SET Type_title = 'Obra'
WHERE ID_Title BETWEEN 1 AND 254;

UPDATE FIRST_MATCH_Javier
SET Type_title = 'Complemento'
WHERE ID_Title BETWEEN 255 AND 388;

COMMIT