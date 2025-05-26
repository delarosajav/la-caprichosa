/*SELECT ID_NumRevista, Id_Revista, Título_Revista, Fecha, ID_Director, ID_Editor FROM NUMEROS_REVISTA;*/
/*CREATE TABLE TOWARDS_THIRD_MATCH AS SELECT * FROM NUMEROS_REVISTA;
/*SELECT ID_NumRevista, Id_Revista, Título_Revista, Fecha, ID_Director, ID_Editor FROM TOWARDS_THIRD_MATCH*/

/*ALTER TABLE TOWARDS_THIRD_MATCH
ADD COLUMN Etapa_Dirección;*/

/*UPDATE TOWARDS_THIRD_MATCH
SET Etapa_Dirección = 'Primera'
WHERE ID_Director = 3 AND ID_Editor IS NULL;

UPDATE TOWARDS_THIRD_MATCH
SET Etapa_Dirección = 'Segunda'
WHERE ID_Director = 5;

UPDATE TOWARDS_THIRD_MATCH
SET Etapa_Dirección = 'Tercera'
WHERE ID_Director = 3 AND ID_Editor IS NOT NULL;

SELECT ID_NumRevista, Id_Revista, Título_Revista, Fecha, ID_Director, ID_Editor, Etapa_Dirección FROM TOWARDS_THIRD_MATCH*/

SELECT ID_NumRevista, Título_Revista, Fecha, ID_Director, Etapa_Dirección FROM TOWARDS_THIRD_MATCH

