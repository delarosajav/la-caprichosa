let tab_id;
let current_url;
const noimageid_url = 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png';
let numeros_data;
let current_num;
let visumode;
let alldatarequired;

async function PingServer() {
    const url = 'ping/';
    const response = await fetch(url);
    const resjson = await response.json();
    const p_test = document.createElement('p');
    p_test.textContent = resjson.data;
    const divforp = document.getElementById('visualization-red-block');
    divforp.appendChild(p_test);
}

async function ReplaceURL(newurl) {
    await window.location.replace(newurl);
    //SetupChoice(newurl);
}

function ReactiveTabs(url_base) {
    const div_modules = document.getElementById('modules-block');
    for (const child of div_modules.children) {
        const tab_id = child.id;
        const tab_path = '/'+tab_id+'.html';
        const newUrl = url_base + tab_path;
        child.addEventListener('click', (event)=>{
            ReplaceURL(newUrl);
        });
        
    }
}

async function setupcontenidos() {
    console.log('you are setting up contenidos-tab.');
    tab_id = 'contenidos-tab';
    SetUrlBase();
    console.log("you are setting up content modeling");
    //!!!======== D3 WORDCLOUD SETUP AND DESING ===================
    let svgWidth = Math.min(1400, window.innerWidth - 40);
    let svgHeight = Math.min(1000, window.innerHeight * 0.8);
    let isAuthorMode = false;

    // Create SVG container
    let svg = d3.select("#wordcloud").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", `translate(${svgWidth/2}, ${svgHeight/2})`);

    // Handle window resize
    function handleResize() {
    svgWidth = Math.min(1400, window.innerWidth - 40);
    svgHeight = Math.min(1000, window.innerHeight * 0.7);
    
    d3.select("#wordcloud svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
    
    d3.select("#wordcloud svg g")
        .attr("transform", `translate(${svgWidth/2}, ${svgHeight/2})`);
    
    updateWordCloud();
    }

    window.addEventListener('resize', handleResize);

    function draw(words) {
    
    console.log(`Words being drawn: ${words}`); //debug log
        // Clear existing words
    svg.selectAll("text").remove();

    // Create color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Draw words
    const wordSelection = svg.selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", d => `${d.size}px`)
        .style("fill", "transparent")
        .style("font-weight", d => d.size > 40 ? "bold" : "normal")
        .style("opacity", d => 0.7 + (d.size / 200))
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
        .text(d => d.text);

    wordSelection
        .transition()
        .duration(600)
        .style("fill", (d, i) => colorScale(i % 10))
        .style("opacity", d => 0.7 + (d.size / 200));

    // Add interactivity
    wordSelection
        .on("mouseover", function(event, d) {
        d3.select(this)
            .transition()
            .duration(250)
            .style("font-size", `${d.size * 1.3}px`)
            .style("fill", "#ff0000");
        })  
        .on("mouseout", function(event, d) {
        d3.select(this)
            .transition()
            .duration(250)
            .style("font-size", `${d.size}px`)
            .style("fill", colorScale(words.indexOf(d) % 10));
        })
        .on("click", function(event, d) {
        handleWordClick(d);
        });
        
        function handleWordClick(wordData) {
        console.log("Word clicked with data:", wordData);
        
        if (isAuthorViewActive()) {
            // Handle author click
            const authorId = wordData.idAutor || wordData.originalData?.ID_Autor;
            if (!authorId) {
            console.error("No author ID found in:", wordData);
            alert("Error: Could not identify author. Please try again.");
            return;
            }

            const selectedType = "Obra";
            const selectedGenre = document.getElementById("genero").value || '%';
            const selectedStage = document.getElementById("direccion").value || '%';
            
            fetch(`/api/author-details?id=${authorId}&tipo=${selectedType}&direccion=${selectedStage}&genero=${selectedGenre}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                displayAuthorDetails(data);
            })
            .catch(error => {
                console.error("Error:", error);
                alert(`Error loading author details: ${error.message}`);
            });
        } if (!isAuthorViewActive()) {
            // Handle normal word click
            if (!wordData.text) {
            console.error("No word text found in:", wordData);
            alert("Error: Could not identify word. Please try again.");
            return;
            }

            const selectedType = document.getElementById("tipo").value;
            const selectedGenre = document.getElementById("genero").value || '%';
            const selectedStage = document.getElementById("direccion").value || '%';
            
            const queryParams = new URLSearchParams({
                category: wordData.text,
                tipo: selectedType,
                stage: selectedStage,  // Pass the current stage filter
                genero: selectedGenre,
            });



            fetch(`/api/wordcloud?${queryParams.toString()}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Fetched category details:", data);
                    displayCategoryDetails(data, selectedType);
                })
                .catch(error => {
                    console.error("Error fetching info:", error);
                });
            }
        }

        // Animate float motion
        function animateWords() {
            svg.selectAll("text").each(function(d, i) {
                const baseX = d.x;
                const baseY = d.y;
                const baseRotate = d.rotate;

                const offsetX = 1.5 * Math.sin(Date.now() / 1000 + i);
                const offsetY = 1.5 * Math.cos(Date.now() / 1000 + i * 1.3);

                d3.select(this)
                    .attr("transform", `translate(${baseX + offsetX}, ${baseY + offsetY}) rotate(${baseRotate})`);
            });

        requestAnimationFrame(animateWords);
        }
        
        animateWords();
        
        // ===============================================
        // Format and display modal content
        // Format and display modal content
    function displayCategoryDetails(data, selectedType) {
        if (!Array.isArray(data)) {
            console.error("Expected an array, got:", data);
            return;
        }

        const modal = document.getElementById("category-modal");
        const modalTitles = document.getElementById("modal-titles");
        const highlightBtn = document.getElementById("highlight-forms");
        
        modalTitles.innerHTML = "";
        
        document.getElementById("modal-category-title").innerHTML = `Categoría: <em>${data[0].category}</em>`;
        document.getElementById("modal-frequency").textContent = data.reduce((acc, item) => acc + (parseInt(item.total) || 0), 0);

        // Storing the forms for highlighting

        let allForms = [];
        const titleElements = [];

        data.forEach(row => {
            const titles = row.titles || [];
            const authors = row.authors || [];
            const generos = row.generos || [];
            const forms = row.form || [];

            allForms = [...new Set([...allForms, ...forms])]; //getting unique forms
            
            titles.forEach((title, index) => {
            const li = document.createElement("li");
            let authorInfo = "";
            
            if (selectedType === "Complemento" || !authors[index]) {
                authorInfo = "Complemento publicitario";
            } else {
                const genero = generos[index] || "";
                const symbol = genero === "Hombre" ? "(Hombre)" : 
                                genero === "Mujer" ? "(Mujer)" : "(ND)";
                authorInfo = `${authors[index]} <span class="gender-indicator">${symbol}</span>`;
                
                li.classList.add(
                genero === "Hombre" ? "male-author" :
                genero === "Mujer" ? "female-author" : "unknown-author"
                );
            }
            
            li.innerHTML = `
                <span class="title">${title}</span>
                <span class="author-info">${authorInfo}</span>
            `;
            modalTitles.appendChild(li);
            titleElements.push({ element: li, title: title })
            });
        });
        
        //highlight function
        let isHighLighted = false;
        // In your displayCategoryDetails function, modify the highlight button click handler:
        highlightBtn.addEventListener("click", function(event) {
            event.stopPropagation(); // Prevent click from bubbling up
            event.preventDefault(); // Prevent any default behavior
            
            isHighLighted = !isHighLighted;
            highlightBtn.textContent = isHighLighted ? "🖍️" : "🖍️";

            titleElements.forEach(item => {
                const titleElement = item.element.querySelector('.title');
                if (isHighLighted) {
                    // Highlight all forms in the title
                    let highlightedText = item.title;
                    allForms.forEach(form => {
                        if (form && item.title.includes(form)) {
                            const regex = new RegExp(`\\b${form}\\b`, 'gi') // \b means word boundary;
                            highlightedText = highlightedText.replace(
                                regex, 
                                `<span class="highlighted">${form}</span>`
                            );
                        }
                    });
                    titleElement.innerHTML = highlightedText;
                } else {
                    // Restore original text
                    titleElement.textContent = item.title;
                }
            });
        });

        modal.style.display = "block";
        modal.classList.add("show");
        }

    function displayAuthorDetails(data) {
        const modal = document.getElementById("author-modal");
        const modalTitles = document.getElementById("modal-author-titles-list");
        
        modalTitles.innerHTML = "";
        
        document.getElementById("modal-author-title").innerHTML = `Autor: <em>${data.name}</em>`;
        document.getElementById("modal-author-total").textContent = data.total;
        
        data.titles.forEach(title => {
            const li = document.createElement("li");
            li.innerHTML = `
            <span class="title2">${title}</span>
            <span class="author-info2">${data.name}</span>
            `;
            
            if (data.gender) {
            li.classList.add(
                data.gender === "Hombre" ? "male-author" :
                data.gender === "Mujer" ? "female-author" : "unknown-author"
            );
            }
            
            modalTitles.appendChild(li);
        });
        
        modal.style.display = "block";
        modal.classList.add("show");
        }

    // Setting zoom function and its default values (to be changed)
    let currentZoom = 1;
    const zoomStep = 0.2;
    const minZoom = 0.5;
    const maxZoom = 3;

    const zoomContainer = d3.select("#wordcloud svg").select("g");

    function updateZoom() {
    zoomContainer.attr("transform", `translate(${svgWidth/2}, ${svgHeight/2}) scale(${currentZoom})`);
    }

    // Zoom button listeners, setting their action
    document.getElementById("zoom-in").addEventListener("click", () => {
    if (currentZoom < maxZoom) {
        currentZoom += zoomStep;
        updateZoom();
    }
    });

    document.getElementById("zoom-out").addEventListener("click", () => {
    if (currentZoom > minZoom) {
        currentZoom -= zoomStep;
        updateZoom();
    }
    });

    // Close category details when clicking 'close'
    window.addEventListener("click", function(event) {
    const modal = document.getElementById("category-modal");
    const content = modal.querySelector(".modal-content");

    if (modal.classList.contains("show") && !content.contains(event.target)) {
        modal.style.display = "none";
        modal.classList.remove("show");
        //document.body.style.overflow = "";
    }
    });

    window.addEventListener("click", function(event) {
    const modal = document.getElementById("category-modal");
    modal.style.display = "none";
    modal.classList.remove("show");
    //document.body.style.overflow = "";
    }
    );
    
    // Close modals when clicking 'close' or outside
    document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
        this.closest('.modal').classList.remove('show');
    });
    });

    window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        event.target.classList.remove('show');
    }
    });

    // Close category details when clicking 'close'
    window.addEventListener("click", function(event) {
    const modal = document.getElementById("author-modal");
    const content = modal.querySelector(".modal-content2");

    if (modal.classList.contains("show") && !content.contains(event.target)) {
        modal.style.display = "none";
        modal.classList.remove("show");
        //document.body.style.overflow = "";
    }
    });

    window.addEventListener("click", function(event) {
    const modal = document.getElementById("author-modal");
    modal.style.display = "none";
    modal.classList.remove("show");
    //document.body.style.overflow = "";
    }
    );
    
    // Close modals when clicking 'close' or outside
    document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal2').style.display = 'none';
        this.closest('.modal2').classList.remove('show');
    });
    });

    window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal2')) {
        event.target.style.display = 'none';
        event.target.classList.remove('show');
    }
    });

    }

    //document.getElementById("resetZoom").addEventListener("click", () => {
    //d3.select("svg")
    //.transition()
    //.duration(500)
    //.call(zoom.transform, d3.zoomIdentity);
    //});


        //wordSelection
        //.on("click", function(event, d) {
        //alert
        //}
    
    //=======DATA REQUESTS TO SERVER============>>>>>:

    // The HTML uses "direccion" but the API expects "stage"
    // This translation happens within the fetchData() function

    // Data request (main filters)
    function fetchData(tipo, genero, direccion) {
    console.log("Fetching data with:", { tipo, genero, direccion });
    
    let url = `/api/wordcloud?tipo=${tipo}&stage=${direccion}`;
    if (genero) url += `&genero=${genero}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
        if (!data || data.length === 0) {
            console.warn("No data received");
            return;
        }

        const sizes = calculateWordSizes(data);
        
        const words = data.map((d, i) => ({
            text: d.Categoría,
            size: sizes[i],
            frequency: d.Total,
            // Add any additional fields your category words need
            isCategory: true // Flag to identify this as a category word
        }));

        d3.layout.cloud()
            .size([svgWidth, svgHeight])
            .words(words)
            .padding(8)
            .rotate(() => Math.random() * 60 - 30)
            .font("Impact")
            .fontSize(d => d.size)
            .spiral("archimedean")
            .on("end", draw)
            .start();
        })
        .catch(err => console.error("Error:", err));
    }

    // Helper function for dynamic sizing
    function calculateWordSizes(data) {
    const freqs = data.map(d => d.Total);
    const maxFreq = Math.max(...freqs);
    const minFreq = Math.min(...freqs);
    
    // Logarithmic scaling for better visual distribution
    return freqs.map(freq => {
        const scale = (Math.log(freq) - Math.log(minFreq)) / 
                    (Math.log(maxFreq) - Math.log(minFreq)) || 0;
        return 15 + (70 * scale); // Range: 15-85px
    });
    }

    // Data request for top authors (2nd group of filters)
    function fetchTopAuthors(tipo, direccion, genero = "%") {
    let url = `/api/wordcloud-authors?tipo=${tipo}&direccion=${direccion}&genero=${genero}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
        console.log("(Raw author data from API)Fetched authors:", data);
        
        // Calculate dynamic sizes
        const sizes = calculateWordSizes(data);
        
        const words = data.map((d, i) => ({
            text: d.nombre_completo,
            size: sizes[i],
            frequency: d.Total,
            idAutor: d.ID_Autor, //make sure this is included
            originalData: d         // Make sure this is included
        }));
        console.log(`Processed words data: ${words}`)

        d3.layout.cloud()
            .size([svgWidth, svgHeight])
            .words(words)
            .padding(11)
            .rotate(() => Math.random() * 60 - 30)
            .font("Impact")
            .fontSize(d => d.size)
            .spiral("archimedean")
            .on("end", draw)
            .start();
        })
        .catch(err => console.error("Error:", err));
    }
    function calculateWordSizes(data) {
        const freqs = data.map(d => d.Total);
        const maxFreq = Math.max(...freqs);
        const minFreq = Math.min(...freqs);
        
        // Logarithmic scaling for better visual distribution
        return freqs.map(freq => {
            const scale = (Math.log(freq) - Math.log(minFreq)) / 
                        (Math.log(maxFreq) - Math.log(minFreq)) || 0;
            return 15 + (70 * scale); // Range: 15-85px
        });
    }

    //=======Gathering elements from DOM (<html>)==========

    // Initial
    //fetchData("%");

    // when change it
    //document.getElementById("genero").addEventListener("change", e => {
    //fetchData(e.target.value);
    //});

    // Main constants declaration (buttons and filters)
    const tipoSelect = document.getElementById("tipo")
    const generoSelect = document.getElementById("genero")
    const direccionSelect = document.getElementById("direccion")

    const authorButton = document.getElementById('authorCloud');
    //const AuthorMenu = document.getElementById('AuthorFilter');
    //const AuthorSubMenu = document.getElementById('AuthorFilter2');

    // what it happens when clicling Authors Button 
    //let isAuthorMode = false;
    authorButton.addEventListener('click', () => {
        isAuthorMode = true;

        tipoSelect.value = "Obra";
        tipoSelect.disabled = true;
        generoSelect.disabled = false;
        generoSelect.value = "%"
        direccionSelect.disabled = false;
        direccionSelect.value = "%";
      
        const tipo = "Obra";
        const genero = "%";
        const direccion = "%";
        //const genero = generoSelect.value || "%";
        //const direccion = direccionSelect.value || "%";
      
        fetchTopAuthors(tipo, direccion, genero);
      });
      

    // Hiding author's filters when switching to main wordclouds
    //tipoSelect.addEventListener('click', () => {
    //AuthorMenu.style.display = 'none';
    //AuthorSubMenu.style.display = 'none';
    //});
  //  generoSelect.addEventListener('click', () => {
  //  AuthorMenu.style.display = 'none';
    //AuthorSubMenu.style.display = 'none';
    //});
 //   direccionSelect.addEventListener('click', () => {
 //   AuthorMenu.style.display = 'none';
 //   AuthorSubMenu.style.display = 'none';
   // });

    // Changing author's wordcloud behaviour when selecting its filters
    //document.querySelectorAll('input[name="AuthorFilters"]').forEach((radio) => {
    //radio.addEventListener('change', () => {
        //let selectedFilter = document.querySelector('input[name="AuthorFilters"]:checked').value;
        //let tipo = 'Obra'
        //let selectedFilter2 = document.querySelector('input[name="AuthorFilters2"]:checked').value;
        //let genero;
        //let direccion;

        //if (selectedFilter2 === "Todas") direccion = "%";
        //if (selectedFilter2 === "Primera") direccion = "Primera";
        //if (selectedFilter2 === "Segunda") direccion = "Segunda";
        //if (selectedFilter2 === "Tercera") direccion = "Tercera";


        //if (selectedFilter === "Todos") genero = "%";
        //else if (selectedFilter === "Hombres") genero = "Hombre";
        //else if (selectedFilter === "Mujeres") genero = "Mujer";
        //else genero = "ND"
        
        //fetchTopAuthors(tipo, direccion, genero);
    //});
    //});

    //document.querySelectorAll('input[name="AuthorFilters2"]').forEach((radio) => {
    //radio.addEventListener('change', () => {
      //  let selectedFilter = document.querySelector('input[name="AuthorFilters"]:checked').value;
     //   let selectedFilter2 = document.querySelector('input[name="AuthorFilters2"]:checked').value;
       // let tipo = 'Obra';
      //  let genero, direccion;

        //if (selectedFilter === "Todos") genero = "%";
     //   else if (selectedFilter === "Hombres") genero = "Hombre";
       // else if (selectedFilter === "Mujeres") genero = "Mujer";
       // else genero = "ND";

    //    if (selectedFilter2 === "Todas") direccion = "%";
    //    else direccion = selectedFilter2;

    //    fetchTopAuthors(tipo, direccion, genero);
    //});
    //});

    // ==== Main filters wordcloud logic ====
    function getCurrentFilters() {
        return {
            tipo: tipoSelect.value || "%",
            genero: generoSelect.value || "%",
            direccion: direccionSelect.value || "%"
        };
    }
    
    function updateWordCloud() {
    
    const { tipo, genero, direccion } = getCurrentFilters();
    //const tipo = tipoSelect.value;
    //const genero = generoSelect.value;
    //const direccion = direccionSelect.value;

    console.log("Parsed direccion:", direccion);

    if (tipo === "Complemento" || tipo === '%') {
        generoSelect.disabled = true;
        //generoSelect.style.opacity = 0.5; (we could adjust it as desired for UX)
        //generoSelect.title = "No disponible con este tipo de título.";
        fetchData(tipo, undefined, direccion); //skipping gender completely
    } else {
        generoSelect.disabled = false;
        //generoSelect.style.opacity = 1;
        //generoSelect.title = "";
        fetchData(tipo, genero, direccion);
    }
    //const genero = generoSelect.value;
    //fetchData(tipo, genero);
    }

    function handleFiltersChange() {
        const { tipo, genero, direccion } = getCurrentFilters();
        
        if (isAuthorMode) {
            fetchTopAuthors("Obra", direccion, genero); // Always pass valid filters
        } else {
            updateWordCloud();
        }
    }
    //Initializing wordcloud
    updateWordCloud();

    tipoSelect.addEventListener("change", handleFiltersChange);
    generoSelect.addEventListener("change", handleFiltersChange);
    direccionSelect.addEventListener("change", handleFiltersChange);
    
    function isAuthorViewActive() {
        isAuthorMode = true;
        return tipoSelect.disabled; 
      }
      
    tipoSelect.addEventListener("change", () => {
    if (isAuthorViewActive()) {
        const tipo = "Obra";
        const genero = generoSelect.value || "%";
        const direccion = direccionSelect.value || "%";
        fetchTopAuthors(tipo, direccion, genero);
    } else {
        updateWordCloud();
    }
    });
    
    generoSelect.addEventListener("change", () => {
    if (isAuthorViewActive()) {
        const tipo = "Obra";
        const genero = generoSelect.value || "%";
        const direccion = direccionSelect.value || "%";
        fetchTopAuthors(tipo, direccion, genero);
    } else {
        updateWordCloud();
    }
    });
    
    direccionSelect.addEventListener("change", () => {
    if (isAuthorViewActive()) {
        const tipo = "Obra";
        const genero = generoSelect.value || "%";
        const direccion = direccionSelect.value || "%";
        fetchTopAuthors(tipo, direccion, genero);
    } else {
        updateWordCloud();
    }
    });
      
      
    document.getElementById("resetToCategories").addEventListener("click", () => {
        isAuthorMode = false;
        tipoSelect.disabled = false;
        generoSelect.disabled = true;
        direccionSelect.disabled = false;
        tipoSelect.value = "%";
        direccionSelect.value = "%"
        generoSelect.value = "%";
        updateWordCloud();
        //window.location.reload();
    });
    
    document.getElementById("darkModeToggle").addEventListener("change", () => {
    document.body.classList.toggle("dark-mode");
    });




}



async function SetupChoice(current_url) {
    console.log('you are in setup choice');
    console.log(current_url);
    if (current_url.endsWith('red-tab.html')){
        setupred();
    } else if (current_url.endsWith('distribuciones-tab.html')) {
        setupdistribuciones();
    } else if (current_url.endsWith('contenidos-tab.html')) {
        setupcontenidos();
    }
}

async function setup() {
    tab_id = "home-tab";
    SetUrlBase();
    
    //PingServer();
}

const loading_url = window.location.href;
//console.log(loading_url);
if (loading_url.endsWith('/')){
    setup()
} else {
    SetupChoice(loading_url);
}
