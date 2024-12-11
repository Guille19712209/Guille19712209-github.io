var theme = themes.green;
var imagenCambiada = false; // Variable para rastrear el estado de la imagen Boton "Eye"


nodeDataArray.forEach((node) => {
    node.data.size = node.data.value / 100;
    node.label = node.data.name;
    const parent = nodeDataArray.find(
        (n) => n.id === node.data.id.split(".")[0]
    );
    if (parent && parent.id !== node.id) {
        node.data.parent = parent.name;
    }
    if (node.data && node.data.symbol) {
        node.data.unit = node.data.symbol;
    }
});
console.log(nodeDataArray, edgeDataArray);

function setTheme(newTheme) {
    theme = newTheme;
    init();
}

function init(ret = null) {

    var body = document.getElementsByTagName('body')[0];
    body.style.backgroundImage = 'url(' + theme.background + ')';
    body.style.backgroundSize = 'cover';

    var cy = cytoscape({
        container: document.getElementById("cy"),

        wheelSensitivity: 0.2, // Sensibilidad de rueda de mouse para zoom

        minZoom: 0.5,
        maxZoom: 2,
        zoomingEnabled: true,
        userZoomingEnabled: true,
        zoomingFactor: 0.05,

        elements: {
            nodes: nodeDataArray,
            edges: edgeDataArray,
        },
        style: [
            {
                selector: "node",
                style: {
                    label: "data(title)",
                    "font-family": "Roboto Condensed", 
                    "font-weight": "200",
                    "text-margin-y": -42,
                    shape: "data(shape)",
                    "border-width": "5px",
                    "border-color": theme.node.borderColor,
                    "border-opacity": 0.3,
                    // "label-background-color": "#FF2620",
                    "background-color": "data(color)",
                    "background-opacity": 0.5,
                    "text-valign": "top",
                    "font-size": 28,
                    color: theme.node.color,
                    width: "data(size)",
                    height: "data(size)",
                    "text-wrap": "none",
                    "text-max-width": "data(size)",
                },
            },
            {
                selector: "edge[value >= 0]",
                style: {
                    width: 4,
                    "line-color": "#456F49",
                    opacity: "0.5",
                    "target-arrow-shape": "chevron",
                    "target-arrow-color": "#456F49",
                    "arrow-scale": 2,
                    "curve-style": "unbundled-bezier",
                    "control-point-step-size": 20,
                },
            },
            {
                selector: "edge[value < 0]",
                style: {
                    width: 4,
                    "line-color": "#B45757",
                    opacity: "0.5",
                    "target-arrow-shape": "chevron",
                    "target-arrow-color": "#B45757",
                    "arrow-scale": 2,
                    "curve-style": "unbundled-bezier",
                    "control-point-step-size": 20,
                },
            },
            {
                selector: "node.highlight",
                style: {
                    "border-color": theme.node.borderColor,
                    "border-width": "4px",
                    "border-opacity": "0.5",
                },
            },
            {
                selector: "node.semitransp",
                style: { opacity: "0.5" },
            },
            {
                selector: "edge.highlight",
                style: {
                    "line-color": theme.edge.borderColor,
                    "target-arrow-color": theme.edge.borderColor,
                    opacity: "0.5",
                },
            },
            {
                selector: "edge.semitransp",
                style: { opacity: "0.1" },
            },
        ],
        layout: {
            name: "fcose",
            quality: "proof",
            randomize: true,
            animate: false,
            fit: true,
            padding: 30,
            nodeDimensionsIncludeLabels: true,
            uniformNodeDimensions: false,
            packComponents: true,
            step: "all",
            sampleSize: 25,
            nodeSeparation: 75,
            nodeRepulsion: (node) => 6500,
            idealEdgeLength: (edge) => 50,
            edgeElasticity: (edge) => 0.45,
            nestingFactor: 1,
            numIter: 2500,
            tile: false,
            tilingCompareBy: undefined,
            tilingPaddingVertical: 10,
            tilingPaddingHorizontal: 10,
            gravity: 0.25,
            gravityRangeCompound: 1.5,
            gravityCompound: 1.0,
            gravityRange: 3.8,
            initialEnergyOnIncremental: 0.3,
        },
    });

    function makePopper(ele) {
        let ref = ele.popperRef(); // used only for positioning
        ele.tippy = tippy(ref, {
            // tippy options:
            content: () => {
                let content = document.createElement("div");
                content.innerHTML = ele.data("value");
                content.style = "font-family: Oswald";
                return content;
            },
            trigger: "manual", // probably want manual mode
        });
    }

    cy.ready(function () {
        cy.elements().forEach(function (ele) {
            makePopper(ele);
        });
    });

    cy.elements().unbind("mouseover");
    cy.elements().bind("mouseover", (event) => event.target.tippy.show());

    cy.elements().unbind("mouseout");
    cy.elements().bind("mouseout", (event) => event.target.tippy.hide());

    cy.on("mouseover", "node", function (e) {
        var sel = e.target;
        cy.elements()
            .difference(sel.incomers())
            .not(sel)
            .addClass("semitransp");
        sel.addClass("highlight").incomers().addClass("highlight");
    });

    cy.on("mouseout", "node", function (e) {
        var sel = e.target;
        cy.elements().removeClass("semitransp");
        sel.removeClass("highlight").incomers().removeClass("highlight");
    });

    cy.nodeHtmlLabel([
        {
            query: "node",
            tpl: function (data) {
                return `<div style="text-align: center; font-family:  Roboto Condensed, sans-serif;">
            <div style= "color: ${theme.txtcolor.color}; font-weight: 300 ; font-size:24px; line-height:1.5em;">${data.name}</div>
            <div style= "color: ${theme.txtcolor.color}; font-weight: 600 ;font-size: 18px; line-height:1em;">${data.value}</div>
            <div style= "color: ${theme.txtcolor.color}; font-weight: 200 ;font-size: 16px; line-height:1em;">${data.symbol}</div>
          </div>`;
            },
        },
    ]);

   
    
    cy.fit(cy.getElementById(null), 50); // El segundo parámetro es un padding opcional



    document.querySelector('#White').addEventListener('click', function() {
        setTheme (themes.white)
      });

    document.querySelector('#Green').addEventListener('click', function() {
        setTheme (themes.green)
      });

    document.querySelector('#Black').addEventListener('click', function() {
        setTheme (themes.black)
      });

    document.getElementById('New').addEventListener('click', function() {
        alert('Vas a crear un nuevo elemento. Felicitaciones!');
      });

    document.getElementById('File').addEventListener('click', function() {
         alert('Por este menu se accede a Open, Save, Rename y Export');
       
      });

    document.getElementById('Quanboard').addEventListener('click', function() {
        alert('Accede a Funciones Quanboard: Buscar valores / Proyecciones /IA');
      
     });

     document.getElementById('ZoomMore').addEventListener('click', function() {
        alert('Ver una capa mas de parentescos');
      
     });

     document.getElementById('ZoomLess').addEventListener('click', function() {
        alert('Ver una capa menos de parentescos');
      
     });


    document.getElementById("Title").textContent = fileName; 
    document.getElementById("Title").style.color = theme.title.color; 

    document.getElementById('Eye').addEventListener('click', function() {
       
        var boton = document.getElementById('Eye');

        if (imagenCambiada) {
            boton.style.backgroundImage = "url('./assets/eye-on.png')"; alert('Mostrar objetos ocultos');
        } else {
            boton.style.backgroundImage = "url('./assets/eye-off.png')"; alert('No mostrar objetos ocultos');
        }
        imagenCambiada = !imagenCambiada; // Alterna el estado
    });


}
