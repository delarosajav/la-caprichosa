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

function defvisumode(afinidad, reldir){
    console.log('afinidad:', afinidad, 'reldir', reldir);
    if (afinidad == true && reldir == true) {
        visumode = "af_reldir";
    } else if (afinidad == false && reldir == false) {
        visumode = "simple";
    } else if (afinidad == false && reldir == true) {
        visumode = "reldir";
    } else if (afinidad == true && reldir == false) {
        visumode = "af";

    }
    UpdateNumero(current_num,visumode);

}

function setupRedVisuParams() {
    const div_params = document.getElementById("visuparams");
    if (document.getElementById("paramslist")){
        document.getElementById("paramslist").remove();
    }
    const paramslist_div = document.createElement('div');
    paramslist_div.setAttribute('id','paramslist');

    const cboxdiv_afinidad = document.createElement('div');
    cboxdiv_afinidad.setAttribute('class', 'paramdiv');

    const checkbox_afinidad = document.createElement('input');
    checkbox_afinidad.setAttribute('type', 'checkbox');
    checkbox_afinidad.setAttribute('id', 'cbox_afinidad');
    const lblcbox_afinidad = document.createElement('label');
    lblcbox_afinidad.setAttribute('for', 'cbox_afinidad');
    lblcbox_afinidad.textContent='Ver las afinidades entre las personas.';
    
    cboxdiv_afinidad.appendChild(checkbox_afinidad);
    cboxdiv_afinidad.appendChild(lblcbox_afinidad);
    paramslist_div.appendChild(cboxdiv_afinidad);

    const cboxdiv_reldir = document.createElement('div');
    cboxdiv_reldir.setAttribute('class', 'paramdiv');

    const checkbox_reldir = document.createElement('input');
    checkbox_reldir.setAttribute('type', 'checkbox');
    checkbox_reldir.setAttribute('id', 'cbox_reldir');
    const lblcbox_reldir = document.createElement('label');
    lblcbox_reldir.setAttribute('for', 'cbox_reldir');
    lblcbox_reldir.textContent= 'Posicionar a las personas en función de su afinidad con la dirección del número.';

    cboxdiv_reldir.appendChild(checkbox_reldir);
    cboxdiv_reldir.appendChild(lblcbox_reldir);
    paramslist_div.appendChild(cboxdiv_reldir);

    div_params.append(paramslist_div);

    document.getElementById('cbox_afinidad').addEventListener('change',(event)=>{
        const cbox_af = document.getElementById('cbox_afinidad');
        const cbox_rd = document.getElementById('cbox_reldir');
        defvisumode(cbox_af.checked, cbox_rd.checked);
    });
    document.getElementById('cbox_reldir').addEventListener('change',(event)=>{
        const cbox_af = document.getElementById('cbox_afinidad');
        const cbox_rd = document.getElementById('cbox_reldir');
        defvisumode(cbox_af.checked, cbox_rd.checked);
    });

}
function MakeLinks(datalinks, visumode) {
	return new Promise((resolve, reject)=> {
        var links=[];
		if (visumode== "simple"||visumode=="reldir"){
            Array.from(datalinks).forEach( (link)=>{
                if (link.type=='autor'||link.type=='colab'){
                    links.push(link);
                }
            });
            
        } else if (visumode == 'af'||visumode=='af_reldir'){
            links = datalinks;
    
        }
        resolve(links);
        reject('error');
	});
}

async function redvisulight(data, visudivid, visumode){
    console.log('here, right?');
    visudiv = document.getElementById(visudivid);
    let width = visudiv.offsetWidth;
    let height = visudiv.offsetHeight; 
    let promiselinks = MakeLinks(data.links, visumode);
    var links = await promiselinks;
    console.log(links);
    const nodes = data.nodes;
    let zoom = d3.zoom()
        .on('zoom', handleZoom);
    
    const svg = d3.select('#d3visu')
    .append('svg')
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;")
    .append('defs')
    .selectAll('.pattern')
    .data(data.patterns)
    .join(function(enter){
        return enter
            .append('pattern')
            .attr('id', function(d){return d.id})
            .attr('class', 'pattern')
            .attr('width', "100%")
            .attr('height', "100%")
            .attr('patternContentUnits', 'objectBoundingBox')
            .append('image')
            .attr('width', 1)
            .attr('height', 1)
            .attr('preserveAspectRatio', 'none')
            .attr('href', function(d){return d['href']});
        }, function(update){
            return update;
        }, function(exit){
            return exit;
        });
    
    let simulation;
    if (visumode == 'simple'||visumode=='af'){
        simulation = d3.forceSimulation(nodes)
                        .force("link", d3.forceLink(links).id(d=>d.id).strength(0.02))
                        .force("charge", d3.forceManyBody().strength(-400))
                        .force("center", d3.forceCenter(width/2, height/2));

    } else {
        simulation = d3.forceSimulation(nodes)
                        //.force("link", d3.forceLink(links).id(d=>d.id).strength(0.02))
                        .force("link", d3.forceLink(links).id(d=>d.id).distance(function(d){if(d.type=='afinidad'){
                                return 200
                            } else {
                                return 300 +(1- d.value/d.totalnumdir)*300
                            }
                        }))
                        .force("charge", d3.forceManyBody().strength(-400))
                        .force("center", d3.forceCenter(width/2, height/2));
    }
    /*const simulation = d3.forceSimulation(nodes)
                    .force("link", d3.forceLink(links).id(d=>d.id).strength(0.02))
                    .force("charge", d3.forceManyBody().strength(-400))
                    .force("center", d3.forceCenter(width/2, height/2));*/

    

    const link = d3.select('#d3visu')
        .select('svg')
        .append("g")
        
        //.attr("stroke", "#999")
        //.attr("stroke-opacity", 0.6)
        .selectAll(".line")
        .data(links)
        //.enter()
        //.append("line")//
        .join(function(enter) {
            return enter
                .append('line')
                .attr("stroke", function(d){
                    if (d.type=='autor') {
                        return "#eb8b05"

                    } else if (d.type == 'colab'){
                        return "#FFFFFF"
                    } else if (d.type=='afinidad'){
                        return "#d7f01f"

                    }else {
                        return "#FFFFFF"
                    }
                })
                .style('stroke-dasharray',function(d){
                    if (d.type=='autor') {
                        return 0

                    } else if (d.type == 'colab'){
                        return 5
                    } else {
                        return 0
                    }

                }) 
                .attr('class', 'line')
                .attr("stroke-width", 3);
            },
            function(update) {
                return update;
            },
            function(exit) {
                return exit
                    .transition()
                    .attr("stroke-width",3)
                    .remove();
            });
    
    const node = d3.select('#d3visu')
        .select('svg')
        .select("g")
        .selectAll(".node")
        .data(nodes)
        .join("g")
        .attr('class', 'node')
        .append("circle")
            .attr("stroke", function(d){
                if (d.tipo_persona=='autor') {
                    return "#eb8b05"

                } else if (d.tipo_persona == 'colab_noautor'){
                    return "#FFFFFF"
                } else {
                    return "#FFFFFF"
                }
            })
            .attr("stroke-width", 3)
            .attr('class', 'circle')
            .attr('id', function(d){d.id})
            //.attr("r", 30)
            .attr("r", function(d){
                if(d.Publicaciones==null) {
                    return 30;
                } else {
                    return 30 + d.Publicaciones.length*3;
                }
            })
            .style("fill", d=> "url(#image"+d.id.toString()+")");
    
        
    d3.selectAll(".node")
        .each(function(d){
            d3.select(this)
            .on("mouseenter", (event)=>{
                d3.select(this)
                .select('circle')
                .style("fill", "blue")
                d3.select(this)
                .append('text')
                .style('fill', "#FFFFFF")
                .style('font-weight', 'bold')
                .attr("transform", function(d){return "translate("+d.x+","+d.y+")"})
                .text(function(d){ return d.nombre})
            })
            .on('mouseleave', (event)=>{
                d3.select(this)
                .select('circle')
                .style("fill", d=> "url(#image"+d.id.toString()+")")
                .attr("r", function(d){
                    if(d.Publicaciones==null) {
                        return 30;
                    } else {
                        return 30 + d.Publicaciones.length*3;
                    }
                });
                d3.select(this)
                .select('text')
                .remove();


            })
            .on('click', (event)=>{
                d3.select(this)
                .select('circle')
                .style("fill", d=> "url(#image"+d.id.toString()+")")
                .attr("r", function(d){
                    if(d.Publicaciones==null) {
                        return 60;
                    } else {
                        return 60 + d.Publicaciones.length*3;
                    }
                });
                

            })
        }) 
        

    d3.selectAll(".node")
        .selectAll('title')
        .remove()
        
                                
    d3.selectAll(".node")
        .append("title")
        .text(d => d.nombre);                      
        
    d3.selectAll('.node').call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
        
    d3.select('svg')
        .call(zoom);
        
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
    
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        });
    
    function handleZoom(e) {
        d3.select('svg g')
        .attr('transform', e.transform);
    }
    
    

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.9).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }
    
    // Update the subject (dragged node) position during drag.
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    
    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    } 
}

async function redvisu(data, visudivid, visumode){
    console.log(alldatarequired);
    if (alldatarequired==true){
        console.log('supposed to be redirected');
        redvisulight(data,visudivid,visumode);
    } else {
        visudiv = document.getElementById(visudivid);
        let width = visudiv.offsetWidth;
        let height = visudiv.offsetHeight; 
        let promiselinks = MakeLinks(data.links, visumode);
        var links = await promiselinks;
        console.log(links);
        //console.log(width, height);

        
        const nodes = data.nodes;
        let zoom = d3.zoom()
            .on('zoom', handleZoom);
        
        const svg = d3.select('#d3visu')
        .append('svg')
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;")
        .append('defs')
        .selectAll('.pattern')
        .data(data.patterns)
        .join(function(enter){
            return enter
                .append('pattern')
                .attr('id', function(d){return d.id})
                .attr('class', 'pattern')
                .attr('width', "100%")
                .attr('height', "100%")
                .attr('patternContentUnits', 'objectBoundingBox')
                .append('image')
                .attr('width', 1)
                .attr('height', 1)
                .attr('preserveAspectRatio', 'none')
                .attr('href', function(d){return d['href']});
        }, function(update){
            return update;
        }, function(exit){
            return exit;
        })
        //.enter()
        //.append("pattern")
        //.join('pattern')
            
        
        var Tooltip = d3.select("#d3visu")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px");
        
        let simulation;
        if (visumode == 'simple'||visumode=='af'){
            simulation = d3.forceSimulation(nodes)
                            .force("link", d3.forceLink(links).id(d=>d.id).strength(0.02))
                            .force("charge", d3.forceManyBody().strength(-300))
                            .force("center", d3.forceCenter(width/2, height/2));

        } else {
            simulation = d3.forceSimulation(nodes)
                            //.force("link", d3.forceLink(links).id(d=>d.id).strength(0.02))
                            .force("link", d3.forceLink(links).id(d=>d.id).distance(function(d){if(d.type=='afinidad'){
                                    return 150
                                } else {
                                    return 200 +(1- d.value/d.totalnumdir)*200
                                }
                            }))
                            .force("charge", d3.forceManyBody().strength(-300))
                            .force("center", d3.forceCenter(width/2, height/2));
        }
        
        
                            //.force('collision', d3.forceCollide().radius(function(d){return d.r}));
                            //;
                            
        
        
        const link = d3.select('#d3visu')
                        .select('svg')
                        .append("g")
                        
                        //.attr("stroke", "#999")
                        //.attr("stroke-opacity", 0.6)
                        .selectAll(".line")
                        .data(links)
                        //.enter()
                        //.append("line")//
                        .join(function(enter) {
                            return enter
                                .append('line')
                                .attr("stroke", function(d){
                                    if (d.type=='autor') {
                                        return "#eb8b05"

                                    } else if (d.type == 'colab'){
                                        return "#FFFFFF"
                                    } else if (d.type=='afinidad'){
                                        return "#d7f01f"

                                    }else {
                                        return "#FFFFFF"
                                    }
                                })
                                .style('stroke-dasharray',function(d){
                                    if (d.type=='autor') {
                                        return 0
        
                                    } else if (d.type == 'colab'){
                                        return 5
                                    } else {
                                        return 0
                                    }

                                }) 
                                .attr('class', 'line')
                                .attr("stroke-width", 3);
                            },
                            function(update) {
                                return update;
                            },
                            function(exit) {
                                return exit
                                    .transition()
                                    .attr("stroke-width",3)
                                    .remove();
                            })
                        /*.join('line')
                            .attr('class', 'line')
                            .attr("stroke-width", 1.5);*/
        

        /*const zoomRect = d3.select('#d3visu')
            .select('svg')
            .append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")*/
        
        const node = d3.select('#d3visu')
                        .select('svg')
                        .select("g")
                        .selectAll(".node")
                        .data(nodes)
                        //.enter()
                        //.append("g")
                        .join(function(enter) {
                            return enter
                                .append('g')
                                .attr('class', 'node')
                                .append("circle")
                                    .attr("stroke", function(d){
                                        if (d.tipo_persona=='autor') {
                                            return "#eb8b05"

                                        } else if (d.tipo_persona == 'colab_noautor'){
                                            return "#FFFFFF"
                                        } else {
                                            return "#FFFFFF"
                                        }
                                    })
                                    .attr("stroke-width", 3)
                                    .attr('class', 'circle')
                                    .attr('id', function(d){d.id})
                                    .attr("r", function(d){
                                        if(d.Publicaciones==null) {
                                            return 40;
                                        } else {
                                            return 40 + d.Publicaciones.length*15;
                                        }
                                    })
                                    .style("fill", d=> "url(#image"+d.id.toString()+")");
                        }, function(update) {
                            return update;
                        }, function(exit) {
                            return exit
                                .transition()
                                .attr('cy', 500)
                                .remove()
                        }) 
                        /*.join('g')
                            .attr('class', 'node')
                            .append("circle")
                            .attr('class', 'circle')
                            .attr('id', function(d){d.id})
                            .attr("r", 40)
                            .style("fill", d=> "url(#image"+d.id.toString()+")")
                            ;*/

                        
        d3.selectAll(".node")
        .each(function(d){
            d3.select(this)
            .on("mouseenter", (event)=>{
                d3.select(this)
                .select('circle')
                .style("fill", "blue")
                d3.select(this)
                .append('text')
                .style('fill', "#FFFFFF")
                .style('font-weight', 'bold')
                .attr("transform", function(d){return "translate("+d.x+","+d.y+")"})
                .text(function(d){ return d.nombre})
            })
            .on('mouseleave', (event)=>{
                d3.select(this)
                .select('circle')
                .style("fill", d=> "url(#image"+d.id.toString()+")")
                .attr("r", function(d){
                    if(d.Publicaciones==null) {
                        return 40;
                    } else {
                        return 40 + d.Publicaciones.length*15;
                    }
                });
                d3.select(this)
                .select('text')
                .remove();
                Tooltip.style("opacity", 0);
                /*d3.select(this)
                .select('circle')
                .select('div')
                .style("visibility", "hidden");*/


            })
            .on('click', (event)=>{
                d3.select(this)
                .select('circle')
                .style("fill", d=> "url(#image"+d.id.toString()+")")
                .attr("r", function(d){
                    if(d.Publicaciones==null) {
                        return 80;
                    } else {
                        return 80 + d.Publicaciones.length*15;
                    }
                    })
                .on('click', (event)=>{
                    
                    Tooltip
                    .style("opacity", 1)
                    .style("top", d.cy + "px")
                    .style("left", d.cx + "px")
                    .html(function(){return d.tooltip})
                    
                })
                

            })
        }) 
        
    
        d3.selectAll(".node")
        .selectAll('title')
        .remove()
        
                                
        d3.selectAll(".node")
        .append("title")
        .text(d => d.nombre);                      
        
        /*const zoom = d3.zoom()
        .scaleExtent([1/2, 64])
        .on("zoom", zoomed);
    
        zoomRect.call(zoom)
            .call(zoom.translateTo, 0, 0);*/
        
        d3.selectAll('.node').call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
        
        d3.select('svg')
        .call(zoom);
        
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
            });
        /*d3.select('#d3visu')
        .select('svg')
        .select('defs')
        .selectAll('*')
        .remove()*/
        function handleZoom(e) {
            d3.select('svg g')
            .attr('transform', e.transform);
        }
        
        

        // Reheat the simulation when drag starts, and fix the subject position.
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.9).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        
        // Update the subject (dragged node) position during drag.
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        
        // Restore the target alpha so the simulation cools after dragging ends.
        // Unfix the subject position now that it’s no longer being dragged.
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

    }
    
    
    /*    // When this cell is re-run, stop the previous simulation. (This doesn’t
        // really matter since the target alpha is zero and the simulation will
        // stop naturally, but it’s a good practice.)RedData
        invalidation.then(() => simulation.stop());
      
        return svg.node();
      }*/
}

async function SetUrlBase() {
    const currentUrl = window.location.href;
    const url_parsing = new URL(currentUrl);
    const url_base = url_parsing.protocol +'//'+ url_parsing.host;
    await ReactiveTabs(url_base);

}

async function RedData(datanum) {
    console.log(datanum);
    let personas;
    if (datanum == 'all'){
        alldatarequired=true;
        const response = await fetch('reddataallnum/');
        const resjson = await response.json();
        personas = resjson.data;
        //console.log('all is to be configured...');
    } else {
        alldatarequired=false;
        const url = 'reddatanum/';
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                },
            body: JSON.stringify(datanum)
        };
        const response = await fetch(url, options);
        const resjson = await response.json();
        personas = resjson.data;
    }
    console.log(personas)
    const links = [];
    const patterns_data = [];
    const personas_nodes = [];
    //var idlink = 0;
    for (const n in personas) {
        const persona = personas[n];
        const personaid = persona.ID_Persona+1;
        persona_node = {'id': personaid, 'ID_Persona':persona.ID_Persona, 'nombre': persona.nombre, 'género': persona.género, 'image_url': persona.image_url, 'tipo_persona': persona.tipo_persona, 'director':persona.director, 'colab':persona.colab, 'autor':persona.autor, 'Publicaciones': persona.Publicaciones};     
        
        if (persona.image_url==null){
            persona_node.image_url = noimageid_url;
        }
        //personas[n]['id']= personaid;
        console.log(alldatarequired);
        if (alldatarequired==false){
            if (persona.Publicaciones==null) {
                persona_node.tooltip= '<p>No hay publicación.</p>';
    
            } else {
                const títulos = [];
                for (const n in persona.Publicaciones) {
                    const id_pub = {'id_pub': persona.Publicaciones[n]};
                    const url_título = 'titulo/';
                    //console.log(id_pub);
                    const options = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                            },
                        body: JSON.stringify(id_pub)
                    };
                    const response = await fetch(url_título, options);
                    const resjson = await response.json();
                    const título = resjson.título;
                    títulos.push(título);
    
                }
                //console.log(títulos);
                var tooltip = `<p>Publicaciones:`;
                for (const n in títulos) {
                    //console.log(títulos[n]);
                    //tooltip += `\n<span>${títulos[n].toString()}</span>`;
                    tooltip += `\n${títulos[n].toString()}`;
                }
                //personas[n].tooltip = tooltip + '</p>'; 
                persona_node.tooltip = tooltip + '</p>'; 
            }
        }
        
        patterns_data.push({'id':'image'+personaid.toString(), 'href': persona_node.image_url});
        for (const n in persona.links){
            const link = persona.links[n];
            //console.log(link);
            const new_link = link;
            new_link.source = link.source +1;
            new_link.target = link.target +1;
            //console.log(new_link);
            links.push(new_link);
        }
        personas_nodes.push(persona_node);
    }
    console.log(patterns_data);
    //console.log(personas);
    //console.log(links);
    const reddata = {'nodes': personas_nodes, 'links': links, 'patterns': patterns_data} 
    //console.log(reddata);
    return reddata;


    
}
    
async function UpdateNumero(current_num, visumode) {
    const datanum = await RedData(current_num);
    d3.select('#d3visu')
        .select('svg')
        .remove()
    d3.selectAll('.pattern')
      .remove()
    d3.select('.tooltip')
      .remove()
    redvisu(datanum, "d3visu", visumode);
}
async function setupred() {
    tab_id = 'red-tab';
    SetUrlBase();
    console.log('you are setting up red-tab.');
    const visu_div = document.getElementById("red-visualization");
    const d3visu_div = document.createElement("div");
    d3visu_div.setAttribute("id", "d3visu");
    d3visu_div.setAttribute("class", "d3visu");
    const visuparams_div = document.createElement("div");
    visuparams_div.setAttribute("id", "visuparams");
    visuparams_div.setAttribute("class", "visuparams");
    const label_red = document.createElement('div');
    label_red.setAttribute('id', 'labelnum');
    visuparams_div.appendChild(label_red);

    
    
    

    /*get números de revista con datos (¡no todos tienen director registrado!)*/
    const url = 'numswithdata/';
    const response = await fetch(url);
    const resjson = await response.json();
    numeros_data = resjson.data;
    
    console.log(numeros_data);
    var numeros_bar = document.createElement('input');
    numeros_bar.setAttribute('type', 'range');
    numeros_bar.setAttribute('id', "numero_barra");
    numeros_bar.setAttribute('min', 1);
    numeros_bar.setAttribute('list', "numeros_list" );
    var numeroslist = document.createElement('datalist');
    numeroslist.setAttribute('id', "numeros_list");
    var n = 1;
    Array.from(numeros_data).forEach((item) => {
        var item_opt = document.createElement('option');
        item_opt.value = n;
        //item_opt.value = item.ID_NumRevista;
        item_opt.textContent = item.Título_Revista + ' número ' +item.Número + ', ' + item.Fecha + ', ' + item.Lugar_Publicación;
        numeroslist.appendChild(item_opt);
        n+=1
        console.log(item_opt.value);
    });

    //to add all
    var opt_all = document.createElement('option');
    opt_all.value = 41;
    opt_all.textContent = 'Todos los números de La Caprichosa.';
    numeroslist.appendChild(opt_all);
    numeros_data.push('all');


    numeros_bar.setAttribute('max', numeros_data.length);
    numeros_bar.setAttribute('step', 1);
    d3visu_div.appendChild(numeros_bar);
    d3visu_div.append(numeroslist);
    
    visu_div.appendChild(d3visu_div);
    visu_div.appendChild(visuparams_div);
    current_num = numeros_data[0];
    const datanum = await RedData(current_num); 
    //document.getElementById('labelnum').content = numeroslist[current_num];
    const numeros_data_dic = {};
   /* n = 1;
    Array.from(numeros_data).forEach(datanum=>{
        console.log(n, datanum);
        if (datanum =='all') { //to add all
            numeros_data_dic[datanum]= n;
        }else {
            numeros_data_dic[datanum.ID_NumRevista]= n;
        }
        
        n+=1;
        
    });*/
    
    document.getElementById('numero_barra').value = 1;
    Array.from(document.getElementById('numeros_list').getElementsByTagName('option')).forEach((opt) => {
        //console.log(opt.value);
        //console.log(document.getElementById('numero_barra').value);
        if (document.getElementById('numero_barra').value==opt.value) {
            document.getElementById('labelnum').textContent = opt.text;
            //console.log(opt.text);
        }  
    });
    visumode = 'simple';
    document.getElementById('numero_barra').addEventListener("change", (event)=>{
        console.log(document.getElementById('numero_barra').value)
        current_num = numeros_data[document.getElementById('numero_barra').value-1];
        //console.log(document.getElementById('numero_barra').textContent);
        Array.from(document.getElementById('numeros_list').getElementsByTagName('option')).forEach((opt) => {
            //console.log(opt.value);
            if (document.getElementById('numero_barra').value==opt.value) {
                document.getElementById('labelnum').textContent = opt.text;
                //console.log(opt.text);
            }  
        });
        UpdateNumero(current_num, visumode);
    });
    
    redvisu(datanum, "d3visu",visumode);
    setupRedVisuParams();
       


}

async function setupdistribuciones() {
    console.log('you are setting up distribuciones-tab.');
    tab_id = 'distribuciones-tab';
    SetUrlBase();
}

let isAuthorMode = false;

async function setupcontenidos() {
    console.log('you are setting up contenidos-tab.');
    tab_id = 'contenidos-tab';
    SetUrlBase();
    console.log("you are setting up content modeling");
    //!!!======== D3 WORDCLOUD SETUP AND DESING ===================
    let svgWidth = Math.min(1400, window.innerWidth - 40);
    let svgHeight = Math.min(1000, window.innerHeight * 0.8);
    //let isAuthorMode = false;

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
        if (isAuthorMode) {
            handleAuthorClick(d.text);
            } else {
            handleWordClick(d.text);
            }
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

        function handleAuthorClick(authorText) {
            console.log("Author clicked:", authorText);

            const selectedType = document.getElementById("tipo").value;
            const selectedGenre = document.getElementById("genero").value;
            const selectedStage = document.getElementById("direccion").value;

            const queryParams = new URLSearchParams({
                author: authorText,
                tipo: selectedType,
                direccion: selectedStage,
                genero: selectedGenre,
                });
                fetch(`/api/wordcloud-authors?${queryParams.toString()}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Fetched category details:", data);
                    displayAuthorDetails(data, selectedType);
                    //displayCategoryDetails(data[0], selectedType);
                })
                .catch(error => {
                    console.error("Error fetching info:", error);
                });
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

        function displayAuthorDetails(data) {
            if (!Array.isArray(data) || data.length === 0) {
            console.error("Expected a non-empty array, got:", data);
            return;
            }
        
            const modal = document.getElementById("author-modal");
            const modalTitles = document.getElementById("modal-author-title");
            const modalFrequency = document.getElementById("modal-author-frequency");
            const titlesList = document.getElementById("modal-author-titles");
            // Clear existing content
            titlesList.innerHTML = "";

            const authorName = data[0].nombre_completo;
            const totalCategories = data.reduce((acc, row) => acc + (parseInt(row.Total) || 0), 0);
            const allTitles = data.flatMap(row => (row.titles || "").split("|| ").map(t => t.trim()).filter(Boolean));

            modalTitles.innerHTML = `Autor/a: <em>${authorName}</em>`;
            modalFrequency.textContent = totalCategories;

            allTitles.forEach(title => {
                const li = document.createElement("li");
                li.textContent = title;
                titlesList.appendChild(li);
            });

            modal.style.display = "block";
            modal.classList.add("show");    

        };

        };

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

    window.addEventListener("click", function(event) {
        const modal = document.getElementById("author-modal");
        const content = modal.querySelector(".modal-2-content");
        if (modal.classList.contains("show") && !content.contains(event.target)) {
            modal.style.display = "none";
            modal.classList.remove("show");
        }
    });
    
    document.getElementById("modal-2-close").addEventListener("click", () => {
        const modal = document.getElementById("author-modal");
        modal.style.display = "none";
        modal.classList.remove("show");
    });

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
        
        svg.selectAll("text").remove();

        // Generate word cloud
        d3.layout.cloud()
            .size([svgWidth, svgHeight])
            .words(words)
            .padding(8)
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
        
        // Calculate dynamic sizes
        const sizes = calculateWordSizes(data);
        
        const words = data.map((d, i) => ({
            text: d.nombre_completo,
            size: sizes[i],
            idAutor: d.ID_Autor
        }));

        svg.selectAll("text").remove();

        d3.layout.cloud()
            .size([svgWidth, svgHeight])
            .words(words)
            .padding(11)
            .rotate(() => Math.random() * 60 - 30) // -30 to 30 degrees
            .font("Impact")
            .fontSize(d => d.size)
            .spiral("archimedean")
            .on("end", draw)
            .start();
        });
    };
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
