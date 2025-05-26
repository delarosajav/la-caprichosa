SELECT *
FROM CATEGORIAS_TO_SERVER_3_Javier AS CAT 
JOIN Títulos_Metadata_Javier AS META          
ON CAT.ID_título = META.ID_título              
WHERE META.género = 'Mujer';