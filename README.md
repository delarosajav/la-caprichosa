## Development and Implementation of Two Full-Stack Modules in the "La Caprichosa" Project

During my internship at the Digital Humanities Lab (Lab-HD) at the ILC (CCHS-CSIC), I participated in several projects related to the creation, development, and maintenance of digital tools within the field of humanities research. Among them, the most extensive and technically demanding was the development of two web modules for the *La Caprichosa* project, led by Nadège Rollet (Lab-HD’s resident technologist) and Purificación Fernández Rodríguez (Pura Fernández), one of the most prominent figures in the study of contemporary Hispanic literary culture, Director of CSIC Editorial and current Deputy Vice President of Scientific Culture at CSIC.

My main role focused on the full-stack development of two interactive modules—“Content Modeling” and “Distributions”—for the website of *La Caprichosa*, a 19th-century Spanish literary magazine linked to the figure of Baroness Serrano de Wilson (1834–1922) and other culturally significant personalities of that era.

This work involved the full design, programming, data integration, and deployment of a complete web infrastructure, structured through the following technical phases:

### 1. Content Processing and Categorization using Python and NLP Techniques

Starting from a database originally created by Nadège Rollet, I designed a system for automated linguistic processing of all magazine titles using Python and the Stanza library. This combined lemmatization, Named Entity Recognition (NER), and Part-of-Speech (POS) analysis.

A thorough textual data cleaning process was conducted using advanced regular expressions (Regex) and libraries such as NLTK, removing stop words, prepositions, adverbs, and other unnecessary elements, in order to create meaningful and structured categorization.

This stage enabled the automatic generation of coherent, reusable semantic categories, serving as the foundation for further philological and statistical analysis.

### 2. Relational Modeling and SQL Database Integration

With the categories and metadata in place, I designed and created new relational tables, enriching and expanding the existing SQLite database.

I developed complex relationships between new categories, their frequencies, original titles, authors, genres, and editorial stages through customized, optimized SQL queries.

The result was a robust, functional, structured, and scalable data model, usable both by backend logic and client-side queries.

### 3. Backend Programming with Node.js (JavaScript)

I designed and implemented multiple custom routes and endpoints using Node.js, responsible for delivering categorized data to the frontend.

Each endpoint was configured to handle dynamic parameters, apply filters, perform data aggregation, and return structured responses in JSON format, supporting multiple variables like title type, editorial period, genre, authorship, and more.

I also developed asynchronous and efficient functions to manage complex responses, ensuring the consistency, scalability, and traceability of the full backend system.

### 4. Interactive Frontend Development with HTML, CSS, JavaScript (D3.js & VanillaJS)

I designed and implemented a fully custom dynamic interface using D3.js to visualize categories and authors via expandable and clickable word clouds.

Features included zoom, animations, contextual modals, keyword search, and cross-filtering via metadata.

This interactive visualization allows researchers to explore the magazine corpus in an intuitive and analytically rich manner, accessing titles, authors, and contextual data through simple, efficient user interactions.

### 5. Autonomy and Technical Responsibility

This project was carried out mostly independently, with periodic meetings and supervision from Nadège Rollet. This working structure not only demonstrated trust in my role as a team member, but also allowed me to:

- Design, code, and deploy a complete technical solution from data ingestion to visual presentation.
- Make key decisions regarding data architecture, code organization, usability, and performance.
- Apply best practices in programming, including modular design, asynchronous processing, code separation, and version control via Git, both from the terminal (Git Bash) and within GitLab-CSIC repositories (`git pull`, `commit`, `push`, etc.).

This project consolidated my skills in web development and programming, and gave me the opportunity to apply them in a real scientific research environment, collaborating with respected researchers, engineers, and technologists. The result was a functional, accessible, and visually refined infrastructure—useful for both academic analysis and open dissemination of knowledge, aligned with the principles of Open Science and FAIR Data Reuse.
