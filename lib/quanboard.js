let config, themes, theme, quandboardDocument
let currentFileName = './files/new-file.json'
let currrentTheme = ''
let showHiddenObjects = false
let cy = null

const setCurrentTheme = (themeName) => {
    console.log('setCurrentTheme', themeName)
    currrentTheme = themeName
    theme = themes[themeName]
    $('body').css('background-color', theme.backgroundColor)
    $('body').css('background-image', 'url(' + theme.backgroundImage + ')')
    $('body').css('background-size', 'cover')
    $('body').css('background-repeat', 'no-repeat')
    $('body').css('background-attachment', 'fixed')
    $('body').css('background-position', 'center')
    $('#title-label').css('color', theme.title.color)
    render()
}

const loadCurrentDocument = async () => {
    console.log('loadCurrentDocument', currentFileName)
    quandboardDocument = await (await fetch(currentFileName)).json()
    if (quandboardDocument.theme) {
        setCurrentTheme(quandboardDocument.theme)
    }
    $('#title-label').text(quandboardDocument.name)
    console.log(quandboardDocument)
    render()
}

const newNode = () => {
    $('[href="#data"]').tab('show');
    $('#edit-node-label').text('NEW OBJECT')
    $('#edit-node-id').val(null)
    $('#edit-node-title').val(null)
    $('#edit-node-name').val(null)
    $('#edit-node-parent').val(null)
    $('#edit-node-kind').val(null)
    $('#edit-node-value-type').val(null)
    $('#edit-node-value-data').val(null)
    $('#edit-node-text-color').val(null)
    $('#edit-node-background-color').val(null)
    $('#edit-node-background-opacity').val(null)
    $('#edit-node-link-color').val(null)
    $('#edit-node-link-auto').val(null)
    $('#edit-node-notes').val(null)
    $('#edit-node-button-delete').hide()
    $('#edit-node').modal('show')
    populateParentOptions()
}

const addNode = () => {
    const id = uuidv4()
    quandboardDocument.nodeDataArray.push(
        {
            /*
                edit-node-title
                edit-node-name
                edit-node-parent
                edit-node-kind

                edit-node-value-type
                edit-node-value-data

                edit-node-min-value
                edit-node-max-value
                edit-node-step-value

                edit-node-text-color
                edit-node-background-color
                edit-node-background-opacity
                edit-node-link-color
                edit-node-link-auto

                edit-node-notes
            */
            "data": {
                "id": id,
                "title": $('#edit-node-title').val().toUpperCase(),
                "name": $('#edit-node-name').val(),
                "kind": $('#edit-node-kind').val(),
                "valueType": $('#edit-node-value-type').val(),
                "valueData": $('#edit-node-value-data').val(),
                "textColor": $('#edit-node-text-color').val(),
                "backgroundColor": $('#edit-node-background-color').val(),
                "backgroundOpacity": $('#edit-node-background-opacity').val(),
                "linkColor": $('#edit-node-link-color').val(),
                "linkAuto": $('#edit-node-link-auto').val(),
                "notes": $('#edit-node-notes').val(),
            }
        })
    checkEdges(id)
    render()
}

const editNode = (node) => {
    $('[href="#data"]').tab('show');
    $('#edit-node-label').text('EDIT OBJECT')
    $('#edit-node-id').val(node.id)
    $('#edit-node-title').val(node.title)
    $('#edit-node-name').val(node.name)
    $('#edit-node-parent').val(node.parent)
    $('#edit-node-kind').val(node.kind)
    $('#edit-node-value-type').val(node.valueType)
    $('#edit-node-value-data').val(node.valueData)
    $('#edit-node-text-color').val(node.textColor)
    $('#edit-node-background-color').val(node.backgroundColor)
    $('#edit-node-background-opacity').val(node.backgroundOpacity)
    $('#edit-node-link-color').val(node.linkColor)
    $('#edit-node-link-auto').val(node.linkAuto)
    $('#edit-node-notes').val(node.notes)
    $('#edit-node-button-delete').show()
    $('#edit-node').modal('show')
    populateParentOptions()
}

const saveNode = () => {
    quandboardDocument.nodeDataArray.forEach((node) => {
        if (node.data.id === $('#edit-node-id').val()) {
            node.data.title = $('#edit-node-title').val().toUpperCase()
            node.data.name = $('#edit-node-name').val()
            node.data.parent = $('#edit-node-parent').val()
            node.data.kind = $('#edit-node-kind').val()
            node.data.valueType = $('#edit-node-value-type').val()
            node.data.valueData = $('#edit-node-value-data').val()
            node.data.textColor = $('#edit-node-text-color').val()
            node.data.backgroundColor = $('#edit-node-background-color').val()
            node.data.backgroundOpacity = $('#edit-node-background-opacity').val()
            node.data.linkColor = $('#edit-node-link-color').val()
            node.data.linkAuto = $('#edit-node-link-auto').val()
            node.data.notes = $('#edit-node-notes').val()
        }
    })
    checkEdges($('#edit-node-id').val())
    render()
}

const deleteNode = () => {
    $('#edit-node').modal('hide')
    quandboardDocument.nodeDataArray = quandboardDocument.nodeDataArray.filter(
        (node) => node.data.id !== $('#edit-node-id').val()
    )
    quandboardDocument.edgeDataArray = quandboardDocument.edgeDataArray.filter((edge) =>
        edge.data.source !== node.data.id && edge.data.target !== node.data.id);

    render()
}

const checkEdges = (nodeId) => {
    const node = quandboardDocument.nodeDataArray.find((node) => node.data.id === nodeId)

    quandboardDocument.edgeDataArray = quandboardDocument.edgeDataArray.filter((edge) =>
        edge.data.source !== node.data.id)

    if (node.data.valueType === 'formula') {

        const objects = []
        quandboardDocument.nodeDataArray.forEach((node) => {
            objects.push(node.data.name)
        })

        const literalRegex = /\b([a-zA-Z_]\w*)\b/g;

        while ((match = literalRegex.exec(node.data.valueData)) !== null) {
            if (objects.includes(match[1]) && match[1] !== node.data.name) {
                quandboardDocument.edgeDataArray.push({
                    "data": {
                        "source": node.data.id,
                        "target": quandboardDocument.nodeDataArray.find((n) => n.data.name === match[1]).data.id,
                        "value": 0
                    }
                }
                )
            }
        }
    }
}

const init = async () => {

    config = await (await fetch('./config.json')).json()
    themes = await (await fetch('./themes.json')).json()

    $('#new-button').click(() => {
        newNode();
    })

    $('#edit-node-button-save').click(() => {
        if ($('#edit-node-name').val() === '') {
            $('[href="#data"]').tab('show');
            showError('Name is required')
            $('#edit-node-name').focus()
            return
        } else if (quandboardDocument.nodeDataArray.find((node) => node.data.name === $('#edit-node-name').val())
            && quandboardDocument.nodeDataArray.find((node) => node.data.name === $('#edit-node-name').val()).data.id !== $('#edit-node-id').val()) {
            showError('Name is already in use')
            return
        } else if ($('#edit-node-kind').val() === '') {
            $('[href="#data"]').tab('show');
            showError('Kind is required')
            $('#edit-node-kind').focus()
            return
        } else if ($('#edit-node-value-type').val() === '') {
            $('[href="#value"]').tab('show');
            showError('Value type is required')
            $('#edit-node-value-type').focus()
            return
        } else if ($('#edit-node-value-data').val() === '') {
            $('[href="#value"]').tab('show');
            showError('Value data is required')
            $('#edit-node-value-data').focus()
            return
        } else if ($('#edit-node-value-type').val() === 'constant' && !isNumeric($('#edit-node-value-data').val())) {
            $('[href="#value"]').tab('show');
            showError('Value data should be a number')
            $('#edit-node-value-data').focus()
            return
        } else {
            $('#edit-node').modal('hide')
            if ($('#edit-node-id').val()) {
                saveNode()
            } else {
                addNode()
            }
        }
    })

    $('#edit-node-button-delete').click(() => {
        deleteNode()
    })


    $('#selected-period').click(() => {
        $('#proyection-modal').modal('show')

    })

    $('#file-button').click(() => {
        $('#file-sidebar').modal('show')
    })

    $('#menu-new-file').click(() => {
        $('#file-sidebar').modal('hide')
    })

    $('#time-unit-control-label').click(() => {
        $('#proyection-modal').modal('show')
    })

    $('#sheet-view').click(() => {
        $('#proyection-modal').modal('hide')
        $('#proyection-modal-form').trigger('reset')
        $('#proyection-sheet').modal('show')
    })

    $('#value-series').click(() => {
        const nameObject = document.getElementById('edit-node-name').value;
        $('#valueSeriesLabel').text(nameObject + " values series")
        createValuesTable()
        $('#value-series-modal').modal('show')
    })

    $('#date').change(() => {
        createProyectionTable()
    })

    $('#unit').change(() => {
        const unit = document.getElementById('unit').value;
        $('#time-unit').text(unit)
        createProyectionTable()
    })

    $('#periods').change(() => {
        createProyectionTable()
    })

    $('#edit-node-value-type').change(() => {
        changeValueLabel()
    })

    setCurrentTheme(config.defaultValues.theme)
    loadCurrentDocument()
}

const render = () => {

    if (!quandboardDocument) return

    quandboardDocument.nodeDataArray.forEach((node) => {
        if (node.data.valueType === 'constant') {
            node.data.value = parseFloat(node.data.valueData)
        }
        node.data.size = node.data.value / 100
        // node.data.label = node.data.name
        const parent = quandboardDocument.nodeDataArray.find(
            (n) => n.id === node.data.id.split(".")[0]
        )
        if (parent && parent.id !== node.id) {
            node.data.parent = parent.name
        }
        if (node.data && node.data.symbol) {
            node.data.unit = node.data.symbol
        }
        if (node.data && node.data.kind) {
            node.data.unit = node.data.kind
        }
    })

    cy = cytoscape({
        container: document.getElementById("cy"),

        wheelSensitivity: 0.2, // Sensibilidad de rueda de mouse para zoom

        minZoom: 0.5,
        maxZoom: 2,
        zoomingEnabled: true,
        userZoomingEnabled: true,
        zoomingFactor: 0.05,

        elements: {
            nodes: quandboardDocument.nodeDataArray,
            edges: quandboardDocument.edgeDataArray,
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
                selector: "edge[value > 0]",
                style: {
                    width: 4,
                    "line-color": "#456F49",
                    opacity: "0.5",
                    "source-arrow-shape": "chevron",
                    "source-arrow-color": "#456F49",
                    "arrow-scale": 1,
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
                    "source-arrow-shape": "chevron",
                    "source-arrow-color": "#B45757",
                    "arrow-scale": 1,
                    "curve-style": "unbundled-bezier",
                    "control-point-step-size": 20,
                },
            },

            {
                selector: "edge[value == 0]",
                style: {
                    width: 4,
                    "line-color": "#fff",
                    opacity: "0.5",
                    "source-arrow-shape": "chevron",
                    "source-arrow-color": "#fff",
                    "arrow-scale": 1,
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
    })

    const makePopper = (ele) => {
        let ref = ele.popperRef(); // used only for positioning
        ele.tippy = tippy(ref, {
            // tippy options:
            content: () => {
                let content = document.createElement("div")
                content.innerHTML = ele.data("value")
                content.style = "font-family: Roboto Condensed"
                return content
            },
            trigger: "manual", // probably want manual mode
        })
    }

    cy.nodeHtmlLabel([
        {
            query: "node",
            tpl: (data) => {
                return `<div style="text-align: center; font-family:  Roboto Condensed, sans-serif;">
            <div style= "color: ${theme.txtcolor.color}; font-weight: 300 ; font-size:24px; line-height:1em;">${data.name}</div>
            <div style= "color: ${theme.txtcolor.color}; font-weight: 600 ;font-size: 18px; line-height:1em;">${data.value}</div>
            <div style= "color: ${theme.txtcolor.color}; font-weight: 200 ;font-size: 16px; line-height:1em;">${data.symbol || data.kind}</div>
          </div>`
            },
        },
    ])

    cy.one('tap', 'node', function () {
        console.log('tap!');
    });

    cy.fit(cy.getElementById(null), 50);

    cy.on('click', 'node', function (evt) {
        console.log('clicked ' + this.id(), evt);
        editNode(this.data());
    });

    // Actualizar el valor de periodo cuando se mueve el control 
    $('#proyection-control').change(() => {
        $('#selected-period').text($('#proyection-control').val());
    });

    // Actualizar el valor de unidades cuando se definan
    $('#unit').change(() => {
        $('#proyectionUnitLabel').text($('#unit').val() + "s");
        $('#valueSeriesUnitLabel').text($('#unit').val() + "s");
    });

    // Actualizar el valor maximo de periodos en range  
    $('#periods').change(() => {
        $('#proyection-control').attr({
            "max": $('#periods').val()
        });
    });

    // proyection range display if period !== 1 
    if (periods.value !== 1) {
        $('#proyection-control').show();
    } else {
        $('#proyection-control').hide();
    };
}

const createProyectionTable = () => {
    const columnInput = $("#periods").val();
    const rowInput = 10 // esto es el numero total de objetos

    $('#tableHeader').empty();
    $('#tableBody').empty();

    const th = document.createElement("th");
    th.textContent = "";
    $('#tableHeader').append(th);
    for (let i = 0; i < columnInput; i++) {
        const th = document.createElement("th");
        th.textContent = headerPeriods(i);
        $('#tableHeader').append(th);
    }
    for (let i = 1; i <= rowInput; i++) {
        const tr = document.createElement("tr");
        const textoObjeto = document.createElement("td");
        const label = document.createElement("label");
        label.textContent = "Objeto " + i;
        label.className = "table-label";
        textoObjeto.appendChild(label);
        tr.appendChild(textoObjeto);
        for (let j = 1; j <= columnInput; j++) {
            const td = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.className = "table-input";
            input.value = 0;
            input.setAttribute("row", i); // Agregar atributo de fila
            input.setAttribute("col", j); // Agregar atributo de columna
            td.appendChild(input);
            tr.appendChild(td);
        }
        $("#tableBody").append(tr);
    }
}

const createValuesTable = () => {
    const columnInput = $("#periods").val();
    const tableHeader2 = document.getElementById("valuesTableHeader");
    const tableBody2 = document.getElementById("valuesTableBody");

    tableHeader2.innerHTML = "";
    tableBody2.innerHTML = "";


    for (let i = 0; i < columnInput; i++) {
        const th = document.createElement("th");
        th.textContent = headerPeriods(i);
        tableHeader2.appendChild(th);
    }
    for (let i = 1; i <= 1; i++) {
        const tr = document.createElement("tr");
        for (let j = 1; j <= columnInput; j++) {
            const td = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.className = "table-input-custom";
            input.value = 0;
            input.setAttribute("row", 1); // Agregar atributo de fila
            input.setAttribute("col", j); // Agregar atributo de columna
            td.appendChild(input);
            tr.appendChild(td);
        }
        tableBody2.appendChild(tr);
    }
}

const headerPeriods = (i) => {
    const date = new Date($('#date').val());
    switch ($('#unit').val()) {
        case "Year":
            date.setFullYear(date.getFullYear() + i);
            return new Intl.DateTimeFormat('en-EN', { year: 'numeric' }).format(date);
        case "Month":
            date.setMonth(date.getMonth() + i);
            return new Intl.DateTimeFormat('en-EN', { month: 'short', year: '2-digit' }).format(date);
        case "Week":
            date.setDate(date.getDate() + 1 + (i * 7));
            return new Intl.DateTimeFormat('en-EN', { day: 'numeric', month: 'short' }).format(date);
        case "Day":
            date.setDate(date.getDate() + i + 1);
            return new Intl.DateTimeFormat('en-EN', { day: 'numeric', month: 'short' }).format(date);
    }
}

const changeValueLabel = () => {
    switch ($('#edit-node-value-type').val()) {
        case "constant":
            $('#edit-node-value-data-label').html("Enter a value");
            $('#edit-node-value-data').attr("type", "number");
            $('#edit-node-value-data').attr("rows", "1");
            break;
        case "serie":
            $('#edit-node-value-data-label').html("Values separated by space");
            $('#edit-node-value-data').attr("type", "text");
            $('#edit-node-value-data').attr("rows", "2");
            break;
        case "formula":
            $('#edit-node-value-data-label').html("Enter a formula");
            $('#edit-node-value-data').attr("type", "text");
            $('#edit-node-value-data').attr("rows", "5");
            break;
        case "external":
            $('#edit-node-value-data-label').html("Enter source's URL");
            $('#edit-node-value-data').attr("type", "text");
            $('#edit-node-value-data').attr("rows", "1");
            break;
        case "ia":
            $('#edit-node-value-data-label').html("Enter a prompt");
            $('#edit-node-value-data').attr("type", "text");
            $('#edit-node-value-data').attr("rows", "2");
            break;
    }
}

const populateParentOptions = () => {
    $('#edit-node-parent').empty()
    $('#edit-node-parent').append(new Option('Select parent object', ''))
    quandboardDocument.nodeDataArray.forEach((node) => {
        $('#edit-node-parent').append(new Option(node.data.name, node.data.id))
    })
}