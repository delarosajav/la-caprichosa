import sqlite3
import csv
import pandas as pd

#########EXTRACTING OBRAS
con = sqlite3.connect("proyectoPura.db")
cur = con.cursor()

query = """
SELECT Título_Obra, ID_NumRevista, ID_Autor FROM OBRAS
"""

cur.execute(query)
tit_obras = cur.fetchall()
con.close()

#print(type(tit_obras))
#print("tit,     ID_numRevis,    ID_Autor,     Nombre", "\n")
#for tit in tit_obras[:10]:
#    print(tit, "\n")

with open("tit_obras.csv", mode="w", newline="", encoding="utf-8") as file:
  writer = csv.writer(file)
  writer.writerow(["Title", "ID_NumRevista", "ID_Autor"])
  writer.writerows(tit_obras)

###########EXTRACTING COMPLEMENTOS

con = sqlite3.connect("proyectoPura.db")
cur = con.cursor()

query = """
SELECT Título_Complemento, ID_NumRevista FROM COMPLEMENTOS
"""

cur.execute(query)
complementos = cur.fetchall()

#print("tit,         ID_numRevis", "\n")
#for tit_com in complementos[6:18]:
 #   print(tit_com, "\n")
#con.close()

with open("tit_complementos.csv", mode="w", encoding="utf-8") as file:
  writer = csv.writer(file)
  writer.writerow(["Title", "ID_NumRevista", "ID_Autor"])
  writer.writerows(complementos)

################EXTRACTING BOTH IN A SINGLE .CSV

csv1 = pd.read_csv("tit_obras.csv")
csv2 = pd.read_csv("complementos.csv")

merged_csv = pd.concat([csv1, csv2], ignore_index=True)
merged_csv.to_csv("MERGED.csv", index=False)

################CREATING TABLE "titles_obras_compl" FROM MERGED.CSV

con = sqlite3.connect("proyectoPura.db")
cur = con.cursor()

cur.execute("""
CREATE TABLE Titles_Obras_Complementos
(ID_Title INTEGER PRIMARY KEY AUTOINCREMENT, Title TEXT,
ID_NumRevista INTEGER, ID_Autor INTEGER)
""")

with open("MERGED.csv","r", encoding="utf-8") as file:
  csv_reader = csv.reader(file)
  next(csv_reader) #ignoring head row
  for row in csv_reader:
    cur.execute("INSERT INTO Titles_Obras_Complementos (Title, ID_NumRevista, ID_Autor) VALUES (?, ?, ?)", row)

con.commit()
con.close()

##############FIRST MATCH (AUTHOR'S GENDER), CREATING TABLE "FIRST_MATCH"
#FROM LEFT JOINING SOME FEATURES %%

con = sqlite3.connect("proyectoPura(2).db")
cur = con.cursor()

cur.execute("""
CREATE TABLE FIRST_MATCH AS
SELECT Titles_Obras_Complementos.*, PERSONAS.nombre_completo, PERSONAS.género
FROM Titles_Obras_Complementos
LEFT JOIN PERSONAS
ON Titles_Obras_Complementos.ID_Autor = PERSONAS.ID_Persona;
""") #WE DO NOT USE PERSONAS.ID_PERSONA BC NOW IS REDUNDAT (ID_PERSONA=ID_AUTOR)

con.commit()
con.close()

######################## SECOND MATCH (TYPE_TITLE COLUMN)
############# FROM HERE ONWARDS RUNING QUERIES IN SQL BROWSER
###UPDATE TABLE WITH NEW COLUMN AS WELL AS QUERYING THE NEXT:
"""UPDATE FIRST_MATCH_Javier
SET Type_title = 'Obra'
WHERE ID_Title BETWEEN 1 AND 254;

UPDATE FIRST_MATCH_Javier
SET Type_title = 'Complemento'
WHERE ID_Title BETWEEN 255 AND 388;

COMMIT"""

#######NOW WE PROCEED TO THE THIRD_MATCH
###QUERIES LAUNCHED AT SQL BROWSER:

"""
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

"""

"""
/*SELECT FIRST_MATCH_Javier.*, TOWARDS_THIRD_MATCH.Etapa_Dirección
FROM FIRST_MATCH_Javier
LEFT JOIN TOWARDS_THIRD_MATCH
ON FIRST_MATCH_Javier.ID_NumRevista = TOWARDS_THIRD_MATCH.ID_NumRevista */

CREATE TABLE THIRD_MATCH_Javier AS
SELECT FIRST_MATCH_Javier.*, TOWARDS_THIRD_MATCH.Etapa_Dirección
FROM FIRST_MATCH_Javier
LEFT JOIN TOWARDS_THIRD_MATCH
ON FIRST_MATCH_Javier.ID_NumRevista = TOWARDS_THIRD_MATCH.ID_NumRevista

"""

######WE CREATE THE FINAL METADATA TABLE OF TITLES AS REQUESTED
## FROM LAST JOINS %%%
"""
/*SELECT * FROM THIRD_MATCH_Javier
CREATE TABLE TITLES_METADATA_TABLE_Javier AS
SELECT ID_Title, Etapa_Dirección, Type_title, género FROM THIRD_MATCH_Javier; */
SELECT * FROM TITLES_METADATA_TABLE_Javier


"""


















con = sqlite3.connect("proyectoPura_copia.db")
cur = con.cursor()

query = """SELECT ID_Persona, nombre_completo, género FROM PERSONAS
"""

cur.execute(query)
personas = cur.fetchall()

print("ID_per, nombre,   género", "\n")
for per in personas[6:18]:
    print(per, "\n")
con.close()

con = sqlite3.connect("proyectoPura_copia.db")
cur = con.cursor()

query = """
SELECT ID_NumRevista, ID_Revista, ID_Director, ID_Editor from NUMEROS_REVISTA
"""

cur.execute(query)
revistas = cur.fetchall()

print("ID_numRevis, ID_Revis, ID_Dir, ID_Edit", "\n")
for rev in revistas[6:18]:
    print(rev, "\n")
con.close()

#tit_obras

con = sqlite3.connect("proyectoPura_copia.db")
cur = con.cursor()

#query = """
#CREATE TABLE METADATA_TITLES (ID_title INTEGER PRIMARY KEY AUTOINCREMENT, Etapa_Revista TEXT, Type_title TEXT, Gender_Author TEXT)
#"""

cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cur.fetchall()

for table in tables:
    print(table)

con.close()

con = sqlite3.connect("proyectoPura.db")
cur = con.cursor()

query = """
CREATE TABLE METADATA_TITLES (ID_title INTEGER PRIMARY KEY AUTOINCREMENT, Etapa_Revista TEXT, Type_title TEXT, Gender_Author TEXT)
"""

cur.execute(query)
metadata_titles = cur.fetchall()

print(metadata_titles)

tit_obras_complementos = tit_obras + complementos
tit_obras_complementos









con = sqlite3.connect("proyectoPura.db")
cur = con.cursor()

query = """
CREATE TABLE METADATA_TITLES (ID_title INTEGER PRIMARY KEY AUTOINCREMENT, Etapa_Revista TEXT, Type_title TEXT, Gender_Author TEXT)
"""

cur.execute(query)
con.commit()
con.close()



"""
SELECT Título_Obra, ID_NumRevista, ID_Autor, Nombre_firma FROM OBRAS

SELECT Título_Complemento, ID_NumRevista FROM COMPLEMENTOS

SELECT nombre_completo, ID_Persona, género FROM PERSONAS

SELECT ID_NumRevista, ID_Revista, ID_Director, ID_Editor from NUMEROS_REVISTA
"""