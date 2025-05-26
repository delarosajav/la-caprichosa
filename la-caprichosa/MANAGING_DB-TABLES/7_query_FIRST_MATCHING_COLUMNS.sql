SELECT Titles_Obras_Complementos.*, PERSONAS.nombre_completo, PERSONAS.género
FROM Titles_Obras_Complementos
LEFT JOIN PERSONAS 
ON Titles_Obras_Complementos.ID_Autor = PERSONAS.ID_Persona;

