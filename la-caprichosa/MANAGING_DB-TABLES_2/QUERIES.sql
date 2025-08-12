/*CREATE TABLE FIRST_MATCH AS
SELECT Titles_Obras_Complementos.*, PERSONAS.nombre_completo, PERSONAS.género
FROM Titles_Obras_Complementos
LEFT JOIN PERSONAS
ON Titles_Obras_Complementos.ID_Autor = PERSONAS.ID_Persona;

UPDATE FIRST_MATCH 
SET ID_Autor = NULL 
WHERE ID_Autor = '';

UPDATE FIRST_MATCH 
SET Título = NULL 
WHERE Título = '';

UPDATE FIRST_MATCH
SET Tipo_Título = 'Obra'
WHERE Num_row BETWEEN 1 AND 254;

UPDATE FIRST_MATCH
SET Tipo_Título = 'Complemento'
WHERE Num_row BETWEEN 255 AND 388;

SELECT ID_NumRevista, Id_Revista, Título_Revista, Fecha, ID_Director, ID_Editor FROM NUMEROS_REVISTA;
CREATE TABLE TOWARDS_THIRD_MATCH AS SELECT * FROM NUMEROS_REVISTA;

ALTER TABLE TOWARDS_THIRD_MATCH
ADD COLUMN Etapa_Dirección;

UPDATE TOWARDS_THIRD_MATCH
SET Etapa_Dirección = 'Primera'
WHERE ID_Director = 3 AND ID_Editor IS NULL;

UPDATE TOWARDS_THIRD_MATCH
SET Etapa_Dirección = 'Segunda'
WHERE ID_Director = 5;

UPDATE TOWARDS_THIRD_MATCH
SET Etapa_Dirección = 'Tercera'
WHERE ID_Director = 3 AND ID_Editor IS NOT NULL;

SELECT ID_NumRevista, Título_Revista, Fecha, ID_Director, Etapa_Dirección FROM TOWARDS_THIRD_MATCH

CREATE TABLE THIRD_MATCH_Javier AS
SELECT FIRST_MATCH.*, TOWARDS_THIRD_MATCH.Etapa_Dirección
FROM FIRST_MATCH
LEFT JOIN TOWARDS_THIRD_MATCH
ON FIRST_MATCH.ID_NumRevista = TOWARDS_THIRD_MATCH.ID_NumRevista;*/


CREATE TABLE Títulos_Metadata_Javier AS
SELECT ID_Título, Etapa_Dirección, Tipo_Título, género FROM THIRD_MATCH_Javier;