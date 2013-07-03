/////////////////////
///Algorithm paramaters
var graph;
var attraction;
var repulsion;
var centered = 0;

//////////////////////
////Drawing attributes
imageSize = 50;
var width;
var height;


////////////////
////Dom elements
var attractionSlider;
var repulsionSlider;
var canvas;
var ctx;



///We do the drwaing here
function draw(graph) {
    ctx.clearRect(0, 0, width, height);

    edges = graph.edges;
    vertices = graph.vertices;

    for (a = 0; a < edges.length; a++) {
        v1 = vertices[a];
        inner = edges[a];

        for (b = 0; b < inner.length; b++) {
            if (inner[b] != undefined) {
                v2 = vertices[b];

                edge = edges[i];
                ctx.beginPath();
                ctx.moveTo(v1.x, v1.y);
                ctx.lineTo(v2.x, v2.y);
                ctx.stroke();
            }
        }
    }

    ctx.fillStyle = "blue";
    for (i = 0; i < vertices.length; i++) {
        p = vertices[i];
        ctx.beginPath();

        if (p.image) {
            ctx.drawImage(p.image, 0, 0, 250, 250, p.x - imageSize / 2, p.y - imageSize / 2, imageSize, imageSize);
        } else {
            ctx.arc(p.x, p.y, imageSize / 2, 0, Math.PI * 2, true);
        }
        ctx.fill();
    }

    if (selected !== null) {
        ctx.beginPath();
        ctx.rect(selected.x - imageSize / 2, selected.y - imageSize / 2, imageSize, imageSize);
        ctx.stroke();
    }
}


///Construts graph from json data
function graphFromJson(json) {
    n = json.osebe.length;
    vertices = new Array(n);

    idMap = {};
    for (i = 0; i < n; i++) {
        num = i + 1;
        var image = "pics/" + num + ".jpg";

        p = new Point(randInteger(0, 500), randInteger(0, 500), image);
        vertices[i] = p;

        idMap[json.osebe[i].id] = i;
    }

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    vertices[0].x = width / 2;
    vertices[0].y = height / 2;


    edges = create2DArray(n, n);
    povezave = json.povezave;
    for (i = 0; i < povezave.length; i++) {
        var item = povezave[i];
        i1 = idMap[item[0]];
        i2 = idMap[item[1]];

        edges[i1][i2] = 1;
        edges[i2][i1] = 1;
    }


    return new Graph(vertices, edges);
}


///Creates new graph with circles
function newGraph() {
    clear();
    graph = createGraph(20);
    Run(graph);
}


////Runs the force algorithm again with a new set of starting positions
function runAgain() {
    vertices = graph.vertices;
    for (i = 0; i < vertices.length; i++) {
        if (i == centered) continue;
        vertices.x = randInteger(0, 500);
        vertices.y = randInteger(0, 500);
    }

    Run(graph);
}

///Creates a graph with n vertexes and a random ammount of edges, no pictures here
function createGraph(n) {
    vertices = new Array(n);
    for (i = 0; i < n; i++) {
        p = new Point(randInteger(0, 500), randInteger(0, 500), "");
        vertices[i] = p;
    }

    vertices[0].x = width / 2;
    vertices[0].y = height / 2;

    edges = create2DArray(n, n);
    numEdges = randInteger(1, n * (n - 1) / 4);
    for (i = 0; i < numEdges; i++) {
        a = randInteger(0, n);
        b = randInteger(0, n);
        if (a != b && edges[a][b] === undefined) {
            edges[a][b] = 1;
            edges[b][a] = 1;
        }
    }
    return new Graph(vertices, edges);
}




function Run() {


    ///Sets all velocity to 0, could be set from last run
    for (i = 0; i < graph.vertices.length; i++) {
        v = graph.vertices[i];
        v.velocityX = 0;
        v.velocityY = 0;
    }


    ///Run algorithm for a given ammount of itterations
    var i = 0;
    while (i < 20) {
        UpdateWeights(graph,attraction,repulsion);
        ///Normalizes all positions so that they will fit into canvas window
        normalize(vertices, imageSize, width - imageSize, imageSize, height - imageSize);
        i++;
    }
    draw(graph);
}




///Initialization function
function init() {


    ///Wait for all pictures to be loaded
    preload(function () {

        attractionSlider = document.getElementById("attraction");
        repulsionSlider = document.getElementById("repulsion");
        canvas = document.getElementById("canvas");
        ctx = canvas.getContext("2d");

        width = canvas.width;
        height = canvas.height;

        attractionSlider.onchange = valueChanged;
        repulsionSlider.onchange = valueChanged;
        canvas.onmousedown = canvasMouseDown;
        canvas.onmouseup = canvasMouseUp;
        canvas.onmousemove = canvasMouseMove;


        graph = graphFromJson(data);
        valueChanged();
        Run(graph);
    });
}



//////////////////////////////////////////////////////////////////////////////////////////////
///Events
var selected = null;
var down = false;

function loadJsonData() {
    d = JSON.parse(window.prompt("enter json", ""));

    clear();
    graph = graphFromJson(d);
    Run(graph);
}

function predefined() {
    clear();
    graph = graphFromJson(data);
    Run(graph);
}




function canvasMouseDown(e) {
    down = true;

    coords = RelativeCoords(e);
    x = coords[0];
    y = coords[1];

    selected = null;
    for (i = 0; i < graph.vertices.length; i++) {
        v = graph.vertices[i];
        if (Math.abs(x - v.x) < imageSize / 2 && Math.abs(y - v.y) < imageSize / 2) {
            selected = v;
            centered = i;
            draw(graph);
            return;
        }
    }
    draw(graph);
}
function canvasMouseUp(e) {
    down = false;
}

function canvasMouseMove(e) {
    if (down && selected !== null) {
        coords = RelativeCoords(e);
        x = coords[0];
        y = coords[1];



        selected.x = x;
        selected.y = y;


        runAgain();
    }
}

function valueChanged() {
    attraction = attractionSlider.value / 100;
    repulsion = repulsionSlider.value;

    Run(graph);
}


////////////////////////////////////////////////////////////////////////////////////
/////////Helpers


function preload(continuation) {
    var count = 0;
    
    for (i = 1; i < 21; i++) {
        var img = new Image();
        img.onload=function () {
            count += 1;
            if (count == 20) {
                continuation();
            }
        };
        img.src = "pics/" + i + ".jpg";
    }
}

function clear() {
    selected = null;
    centered = 0;
    down = false;
}

function create2DArray(length) {
    var arr = new Array(length);
    for (i = 0; i < length; i++) {
        arr[i] = new Array(length);
    }
    return arr;
}


function RelativeCoords(e) {
    var x;
    var y;
    if (e.pageX || e.pageY) {
        x = e.pageX;
        y = e.pageY;
    }
    else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    return [x, y];
}

function randInteger(min, max) {
    return Math.floor((Math.random() * (max - min)) + min);
}

function normalize(vertices, lowX, highX, lowY, highY) {
    x = vertices.map(function (x) { return x.x; });
    minX = x.min();
    maxX = x.max();

    scaleX = 1;
    if (maxX - minX > (highX - lowX)) {
        scaleX = (highX - lowX) / (maxX - minX);
    }
    translateX = -lowX + minX;

    y = vertices.map(function (x) { return x.y; });
    minY = y.min();
    maxY = y.max();

    scaleY = 1;
    if (maxY - minY > (highY - lowY)) {
        scaleY = (highY - lowY) / (maxY - minY);
    }
    translateY = -lowY + minY;

    for (i = 0; i < vertices.length; i++) {
        if (centered == i) continue;
        v = vertices[i];
        v.x = (v.x - translateX) * scaleX;
        v.y = (v.y - translateY) * scaleY;
    }
}

Array.prototype.max = function () {
    return Math.max.apply(null, this);
};

Array.prototype.min = function () {
    return Math.min.apply(null, this);
};