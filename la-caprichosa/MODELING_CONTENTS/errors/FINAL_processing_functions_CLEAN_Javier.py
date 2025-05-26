#!pip install stanza
import stanza
import sqlite3
import re
from ast import Pass
import copy

#####---GETTING VARIABLE OF DATA FROM DB---#####
con = sqlite3.connect("proyectoPura.db")
cur = con.cursor()

query = """
SELECT Título_Obra FROM OBRAS
UNION ALL
SELECT Título_Complemento FROM COMPLEMENTOS
UNION ALL
SELECT Título_Sección FROM SECCIONES_PUBLICADAS
"""

cur.execute(query)
titles = cur.fetchall()
#print(titles)

titles_list = []
for title in titles:
  if title[0] is not None:
    titles_list.append(title[0])
  if title[0] is None:
    titles_list.append("NULL") #we take into account "NULL" titles, to keep the same structure as original DB.
#print(titles_list)

con.close()


#####---FORMATTING BEFORE NER---#####
def subtitle_format(matchobj):
  match = matchobj.group(0)
  if re.fullmatch(r'\s*"\s*-\s*', match):
    return '" | '
  elif re.fullmatch(r'\s*-\s*"\s*', match):
    return ' | "'
  elif re.fullmatch(r'\s*-\s*"\s*-\s*', match):
    return '" | '
  elif re.fullmatch(r'\s*\[\.\.\.\]\s*"\s*-\s*', match):
    submatch = re.fullmatch(r'(\s*)\[\.\.\.\]\s*"\s*-\s*', match)
    return submatch.group(1)+'[...]" | '

def formatting_subtitles(text):
    subtit_re = r'\s*"\s*-\s*|\s*-\s*"\s*|\s*-\s*"\s*-\s*|\s*\[\.\.\.\]\s*"\s*-\s*'
    new_text = re.sub(subtit_re, subtitle_format, text)
    return new_text

def formatting_century(text):
  re_century_1 = r'(siglo|siglos)\s*(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI)\.\s*'
  re_century_2 = r'(siglo|siglos)\s*(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI)\s+\.'
  if re.search(re_century_1, text):
    return re.sub(re_century_1, r'[("\1 \2", "DATE")] ', text).strip()
  if re.search(re_century_2, text):
    return re.sub(re_century_2, r'[("\1 \2", "DATE")]', text).strip()
  else:
    return text

encontrar_subtit = [formatting_subtitles(row) for row in titles_list]
list_titsub = [row for row in encontrar_subtit if " | " in row]

#only this exceptions do not adjust to pattern (2 rows):
excepcion_1 = """Piquer-Oda "Alzad vuestras"""
excepcion_2 = """Matrimonios por anuncios-Los baños de Biarritz"""
def subadhoc(matchobj):
  return ' "'+ matchobj.group(0)[1:]
for i, row in enumerate(encontrar_subtit):
  if excepcion_1 in row:
    encontrar_subtit[i] = row.replace('Piquer-Oda "Alzad', 'Piquer-Oda. "Alzad') #Mismo formato que algunos sonetos.
  if excepcion_2 in row:
    encontrar_subtit[i]= row.replace('-', ' | ')
    #encontrar_subtit[i] = re.sub(r'[^|]+\]"', subadhoc, encontrar_subtit[i])##N: añadido mío (con la definición de subadhoc)
#print(encontrar_subtit[249])
#print(encontrar_subtit[207])

encontrar_century = [formatting_century(row).strip() for row in encontrar_subtit]

#encontrar_century[:30]


#####---FORMATTING (PART 2) BEFORE NER---#####
titles_to_NER = [row.split(" | ") if " | " in row else [row] for row in encontrar_century]

#for row in titles_to_NER[:30]:
  #print(row, "\n")


#####---FIRST PROCESSING (ner)---#####
def processing_1(text, nlp_model):
  doc = nlp_model(text)
  if text == "NULL":
    return [("NULL")]
  if "[(" not in text:
    return [(ent.text, ent.type) for ent in doc.entities]
  if "[(" in text:
    special_categories = re.findall(r'\[\(.*\)\]', text)
    parsing_text = re.split(r'\[\(.*\)\]', text)
    exception = []
    for part in parsing_text:
      if part.startswith("[(") and part.endswith(")]"):
        exception.append(part)
      else:
        doc = nlp_model(part)
        exception.extend([(ent.text, ent.type) for ent in doc.entities])
    return exception

nlp_es = stanza.Pipeline(lang="es", processors="tokenize,mwt,pos,lemma,ner,depparse")

processed_ent_es = [[processing_1(el, nlp_es) for el in lista] for lista in titles_to_NER]

#for element in processed_ent_es:
 #print(element, "\n")


#####---INTEGRATING NEW AS CATEGORIES [(X,Y)] INTO TITLES---#####
titles_to_NER_COPY = copy.deepcopy(titles_to_NER)

for index, row in enumerate(processed_ent_es):
  if index in [18, 22]:  # Problematic samples, we create exception
    continue
  else:
    for sub_index, entidad in enumerate(row):
      for tuple_item in entidad:
        if tuple_item is None:
          pass
        if isinstance(tuple_item, str):
          pass
        if isinstance(tuple_item, tuple):
          entity_str = tuple_item[0]
          replacement_str = f"[('{tuple_item[0]}', '{tuple_item[1]}')]"
          titles_to_NER_COPY[index][sub_index] = re.sub(re.escape(entity_str), replacement_str, titles_to_NER_COPY[index][sub_index])
        #except TypeError:
          #pass
        #except IndexError:
          #pass

#for el in titles_to_NER_COPY[:50]:
    #print(el, "\n")


#####---ONCE WE'VE INCLUDED NER CATEGORIES [(X,Y)]---#####
#####---WE PROCEED WITH SECOND PROCESSING (TOK,LEM,POS)---#####
#####---WITHOUT PROCESSING THOSE PARTS OF TITLES CORRESPONDING TO NER---#####
def processing_2(text, nlp_model):
  doc = nlp_model(text)
  if text == "NULL":
    return [("NULL")]
  if "[(" not in text:
    return [(word.text, word.lemma, word.upos) for sent in doc.sentences for word in sent.words]
  if "[(" in text:
    result = []
    current_index = 0
    for match in re.finditer(r'\[\(.*?\)\]', text):  # Find all special category patterns
      # Process text before the match
      before_match = text[current_index:match.start()]
      doc = nlp_model(before_match)
      result.extend([(word.text, word.lemma, word.upos) for sent in doc.sentences for word in sent.words])

      result.append(match.group(0))

      current_index = match.end()

    remaining_text = text[current_index:]
    doc = nlp_model(remaining_text)
    result.extend([(word.text, word.lemma, word.upos) for sent in doc.sentences for word in sent.words])

    return result

nlp_es = stanza.Pipeline(lang="es", processors="tokenize,mwt,pos,lemma")

pro_lem = [processing_2(el, nlp_es) for lista in titles_to_NER_COPY for el in lista]

#for element in pro_lem[:50]:
  #print(element, "\n")


#####---TOO MUCH NOISE, CLEANING FROM UNNECESSARY POS (KEEPING JUST RELEVANT POS)---#####
pro_lem_cleaned = copy.deepcopy(pro_lem)

for i_element, element in enumerate(pro_lem):
  #for i_titulo, titulo in enumerate(element):
    #pro_lem_cleaned[i_element][i_titulo] = [tupla for tupla in titulo if isinstance(tupla, tuple) and tupla[2] in ('NOUN', 'PROPN', 'ADJ', 'VERB', 'ADV', 'INTJ')]
      #pro_lem_cleaned[i_element][i_titulo] = [tupla for tupla in titulo if isinstance(tupla, tuple) and tupla[2] in ('NOUN', 'PROPN', 'ADJ', 'VERB', 'ADV', 'INTJ') or isinstance(tupla, str)]
  pro_lem_cleaned[i_element] = [tupla for tupla in element if isinstance(tupla, tuple) and tupla[2] in ('NOUN', 'PROPN', 'ADJ', 'VERB', 'ADV', 'INTJ') or isinstance(tupla, str)]

for element in pro_lem_cleaned[:50]:
  print(element, "\n")


###### --01.04.2025-- result of modifying 'processing_categories_CLEAN_Javier.py'#######



