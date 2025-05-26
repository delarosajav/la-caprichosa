
//!!!======== D3 WORDCLOUD SETUP AND DESING ===================
let svgWidth = Math.min(1400, window.innerWidth - 40);
let svgHeight = Math.min(1000, window.innerHeight * 0.7);

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
      handleWordClick(d.text);
    });
      
      function handleWordClick(wordText) {
        console.log("Word Clicked:", wordText);
      
        const selectedType = document.getElementById("tipo").value;
        const selectedGenre = document.getElementById("genero").value;
        const selectedStage = document.getElementById("direccion").value;
        //const selectedStage = selectedStageRaw.split(":")[0]; //getting only that part before colon

        const queryParams = new URLSearchParams({
          category: wordText,
          tipo: selectedType,
          direccion: selectedStage,
          genero: selectedGenre,
        });
      
        fetch(`/api/wordcloud?${queryParams.toString()}`)
          .then(response => response.json())
          .then(data => {
            console.log("Fetched category details:", data);
            displayCategoryDetails(data, selectedType);
            //displayCategoryDetails(data[0], selectedType);
          })
          .catch(error => {
            console.error("Error fetching info:", error);
          });
      }
      
      // ===============================================
      // Format and display modal content
      function displayCategoryDetails(data, selectedType) {
        if (!Array.isArray(data)) {
          console.error("Expected an array, got:", data);
          return;
        }
      
        const modal = document.getElementById("category-modal");
        const modalTitles = document.getElementById("modal-titles");
        
        // Clear existing content
        modalTitles.innerHTML = "";
        
        // Set header content
        document.getElementById("modal-category-title").innerHTML = `Categoría: <em>${data[0].category}</em>`;
        document.getElementById("modal-frequency").textContent = data.reduce((acc, item) => acc + (parseInt(item.total) || 0), 0);
      
        // Populate content
        data.forEach(row => {
          const titles = row.titles || [];
          const authors = row.authors || [];
          const generos = row.generos || [];
          
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
              
              // Add gender class
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
          });
        });
        
        // Show modal
        document.getElementById("category-modal").style.display = "block";
        document.getElementById("category-modal").classList.add("show");
        //document.body.style.overflow = "hidden";
      }
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
  
  let url = `/api/wordcloud?tipo=${tipo}&stage=${direccion}`; //important in order to fetch server and make them to query rightly to sql
  if (genero) url += `&genero=${genero}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data || data.length === 0) {
        console.warn("No data received");
        return;
      }

      // Calculate dynamic sizes
      const sizes = calculateWordSizes(data);
      
      // Create words array
      const words = data.map((d, i) => ({
        text: d.Categoría,
        size: sizes[i],
        frequency: d.Total
      }));

      // Generate word cloud
      d3.layout.cloud()
        .size([svgWidth, svgHeight])
        .words(words)
        .padding(12)
        .rotate(() => Math.random() * 60 - 30) // -30 to 30 degrees
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
      console.log("Fetched authors:", data.map(d => `${d.text || d.nombre_completo} (${d.Total})`)); //to check what it exactly fetch
    
      const minFontSize = 30;
      const maxFontSize = 80;
      const scale = 10;
      
      const words = data.map(d => ({
        text: d.nombre_completo,
        size: Math.max(
        minFontSize,
        Math.min(Math.sqrt(d.Total) * scale, maxFontSize)
        ),
        idAutor: d.ID_Autor
      }));

      d3.layout.cloud()
        .size([svgWidth - 400, svgHeight - 400])
        .words(words)
        .padding(10)
        .rotate(() => ~~(Math.random() * 2) * 90)
        .font("Impact")
        .fontSize(d => d.size)
        .on("end", draw)
        .start();
    });
};

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
const AuthorMenu = document.getElementById('AuthorFilter');
const AuthorSubMenu = document.getElementById('AuthorFilter2');

// what it happens when clicling Authors Button and its submenu
authorButton.addEventListener('click', () => {
  tipoSelect.disabled = true;
  generoSelect.disabled = true;
  direccionSelect.disabled = true;
  
  AuthorMenu.style.display = 'block';
  AuthorFilter2.style.display = 'block';
  document.querySelector('input[name="AuthorFilters"][value="Todos"]').checked = true;
  document.querySelector('input[name="AuthorFilters2"][value="Todas"]').checked = true;
  let tipo = "Obra";
  fetchTopAuthors(tipo, "%", "%");
});

// Hiding author's filters when switching to main wordclouds
tipoSelect.addEventListener('click', () => {
  AuthorMenu.style.display = 'none';
  AuthorSubMenu.style.display = 'none';
});
generoSelect.addEventListener('click', () => {
  AuthorMenu.style.display = 'none';
  AuthorSubMenu.style.display = 'none';
});
direccionSelect.addEventListener('click', () => {
  AuthorMenu.style.display = 'none';
  AuthorSubMenu.style.display = 'none';
});

// Changing author's wordcloud behaviour when selecting its filters
document.querySelectorAll('input[name="AuthorFilters"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    let selectedFilter = document.querySelector('input[name="AuthorFilters"]:checked').value;
    let tipo = 'Obra'
    let selectedFilter2 = document.querySelector('input[name="AuthorFilters2"]:checked').value;
    let genero;
    let direccion;

    if (selectedFilter2 === "Todas") direccion = "%";
    if (selectedFilter2 === "Primera") direccion = "Primera";
    if (selectedFilter2 === "Segunda") direccion = "Segunda";
    if (selectedFilter2 === "Tercera") direccion = "Tercera";


    if (selectedFilter === "Todos") genero = "%";
    else if (selectedFilter === "Hombres") genero = "Hombre";
    else if (selectedFilter === "Mujeres") genero = "Mujer";
    else genero = "ND"
    
    fetchTopAuthors(tipo, direccion, genero);
  });
});

document.querySelectorAll('input[name="AuthorFilters2"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    let selectedFilter = document.querySelector('input[name="AuthorFilters"]:checked').value;
    let selectedFilter2 = document.querySelector('input[name="AuthorFilters2"]:checked').value;
    let tipo = 'Obra';
    let genero, direccion;

    if (selectedFilter === "Todos") genero = "%";
    else if (selectedFilter === "Hombres") genero = "Hombre";
    else if (selectedFilter === "Mujeres") genero = "Mujer";
    else genero = "ND";

    if (selectedFilter2 === "Todas") direccion = "%";
    else direccion = selectedFilter2;

    fetchTopAuthors(tipo, direccion, genero);
  });
});

// ==== Main filters wordcloud logic ====
function updateWordCloud() {
  const tipo = tipoSelect.value;
  const genero = generoSelect.value;
  const direccion = direccionSelect.value;

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

//Initializing wordcloud
updateWordCloud();

tipoSelect.addEventListener("change", updateWordCloud);
generoSelect.addEventListener("change", updateWordCloud);
direccionSelect.addEventListener("change", updateWordCloud);
authorButton.addEventListener("click", () => {
  let tipo = 'Obra';
  fetchTopAuthors(tipo, "%", "%");
});
document.getElementById("resetToCategories").addEventListener("click", () => {
window.location.reload();
});
document.getElementById("darkModeToggle").addEventListener("change", () => {
  document.body.classList.toggle("dark-mode");
});