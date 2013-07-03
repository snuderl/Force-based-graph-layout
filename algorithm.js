//////////////////////////////////////////////////////////////////
///Vertices are represemted as an array of Points
///Edges are represented as a 2D matrix, integer value means an edge exists


function Graph(vertices, edges) {
    this.vertices = vertices;
    this.edges = edges;
}


///////Vertex data structure
function Point(x, y, image) {
    this.x = x;
    this.y = y;
    if (image === "") {
        this.image = undefined;
    } else {
        this.image = new Image(25, 25);
        this.image.src = image;
    }

    this.velocityX = 0;
    this.velocityY = 0;
}



///Algorithm for calculating vertex positions
function UpdateWeights(graph, attraction, repulsion) {
    ///We calculate the graph layout by a simple formula
    ///All vertexes repel each other with a force dependent on their distance
    ///FRepel = constant/ distance**2
    ///Edges attrat each other
    ///We update positions based on the sum of forces on a given vertex


    edges = graph.edges;
    vertices = graph.vertices;

    ///Forces on each vertex will go in here
    var totalDx = new Array(edges.length);
    var totalDy = new Array(edges.length);

    totalVelocity = 0;
    for (a = 0; a < edges.length; a++) {

        totalDx[a] = 0;
        totalDy[a] = 0;

        ///We dont have to calculate for the one that is selected/ in center
        if (a == centered) {
            continue;
        }

        v1 = vertices[a];
        inner = edges[a];

        for (b = 0; b < inner.length; b++) {
            if (a == b) continue;

            v2 = vertices[b];


            dx = (v1.x - v2.x);
            dy = (v1.y - v2.y);
            distance = (dx * dx + dy * dy);
            if (distance == 0) distance = 0.001;

            totalDx[a] += repulsion * dx / distance;
            totalDy[a] += repulsion * dy / distance;

            ///If edge exists calculate attraction
            if (inner[b] !== undefined) {

                totalDx[a] -= dx * attraction;
                totalDy[a] -= dy * attraction;
            }

        }

    }

    for (a = 0; a < edges.length; a++) {
        if (a == centered) continue;

        v1 = vertices[a];

        v1.velocityX = (v1.velocityX + totalDx[a]) * 0.9;
        v1.velocityY = (v1.velocityY + totalDy[a]) * 0.9;
        v1.x += v1.velocityX;
        v1.y += v1.velocityY;

    }

}
