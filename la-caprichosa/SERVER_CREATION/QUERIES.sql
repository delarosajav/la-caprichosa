/*CREATE TABLE TOWARDS_SERVER_Javier AS
SELECT * FROM Títulos_Metadata_Javier;

TABLE CREATED CATEGORIAS_RAW_Jav from python driver,
table has been created through all the data saved in the variable 'pro_lem_cleaned', which
is a result of NLP lem, ner. Now let's join it into of Metada table:

CREATE TABLE Títulos_Metadata_2_Javier AS
SELECT * FROM Títulos_Metadata_javier;*/
/*ALTER TABLE 
SELECT * FROM Títulos_Metadata_2_Javier
CROSS JOIN Categorías_RAW_Javier; (NOT WORKING)*/

/*CREATE TABLE Categorías_Javier (
    Num_row INTEGER PRIMARY KEY AUTOINCREMENT,
    categorias TEXT
);

CREATE TABLE Categorías_List_Javier AS
SELECT THIRD_MATCH_Javier.ID_título, THIRD_MATCH_Javier.Etapa_Dirección, THIRD_MATCH_Javier.Tipo_título, THIRD_MATCH_Javier.género, Categorías_RAW_Javier.Categorías
FROM THIRD_MATCH_Javier
LEFT JOIN Categorías_RAW_Javier
ON THIRD_MATCH_Javier.Num_row = Categorías_RAW_Javier.Num_rows;

CREATE TABLE Categorías_List_2_Javier AS
SELECT ID_título, Categorías FROM Categorías_List_Javier;

CREATE TABLE CATEGORIAS_TO_SERVER_Javier AS
SELECT CATEGORIAS_to_DB.*, THIRD_MATCH_Javier.ID_título
FROM CATEGORIAS_to_DB
LEFT JOIN THIRD_MATCH_Javier
ON CATEGORIAS_to_DB.Num_row = THIRD_MATCH_Javier.Num_row;

CREATE TABLE CATEGORIAS_TO_SERVER_2_Javier AS
SELECT ID_título, Categoría, Form AS Forma, Tipo, Frecuencia FROM CATEGORIAS_TO_SERVER_Javier;

CREATE TABLE "CATEGORIAS_TO_SERVER_3_Javier" (
	"ID_título"	TEXT,
	"Categoría"	TEXT,
	"Forma"	TEXT,
	"Tipo"	TEXT,
	"Frecuencia"	INT,
	PRIMARY KEY (ID_título)
);

INSERT OR REPLACE INTO CATEGORIAS_TO_SERVER_3_Javier
SELECT * FROM CATEGORIAS_TO_SERVER_2_Javier; (NOT WORKING!, TABLE REMOVED)
!!!----TRYING TO STABLISH ID_TITLE AS FOREIGN KEY REFERRING TÍTULOS_METADA_TABLE

!!!----THIS WORKS, NEEDED TO CREATE NEW TABLE STABLISHING THAT RELATION TO THE OTHER TABLE:
CREATE TABLE CATEGORIAS_TO_SERVER_3_Javier (
    "ID_título"	TEXT,
	"Categoría"	TEXT,
	"Forma"	TEXT,
	"Tipo"	TEXT,
	"Frecuencia" INT,
	FOREIGN KEY (ID_título) REFERENCES Títulos_Metadata_Javier(ID_título)
);
INSERT INTO CATEGORIAS_TO_SERVER_3_Javier
SELECT * FROM CATEGORIAS_TO_SERVER_2_Javier;  */



