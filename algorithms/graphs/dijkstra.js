export default function dijkstra(g, grid) {
  return new Promise(resolve => {
    /****************** Global variables ******************/
    // Speed of graph traversal
    const progressLimit = 30;
    /******************************************************/
    // Initialize grid with graph
    grid.InitWith(g);
    /********************************************************/
    let { x, y } = g.source;

    // Destination vertex coordinates
    let [destX, destY] = [g.destination.x, g.destination.y];

    // Color and tag source node
    g.nodes[y][x].distance = 0;
    g.nodes[y][x].wasVisited = true;
    g.nodes[y][x].isWall = false;
    g.nodes[y][x].color = g.srcColor;

    // Color destination node
    g.nodes[destY][destX].color = g.destColor;
    g.nodes[destY][destX].isWall = false;

    //**************************
    // g.nodes[10][10].color = g.destColor;
    // g.nodes[10][10].isWall = false;

    // g.nodes[9][9].isWall = true;
    // g.nodes[9][10].isWall = true;
    // g.nodes[9][11].isWall = true;
    // g.nodes[10][9].isWall = true;
    // g.nodes[10][11].isWall = true;
    // g.nodes[11][9].isWall = true;
    // g.nodes[11][10].isWall = true;
    // g.nodes[11][11].isWall = true;

    // g.nodes[9][9].color = '#fff';
    // g.nodes[9][10].color = '#fff';
    // g.nodes[9][11].color = '#fff';
    // g.nodes[10][9].color = '#fff';
    // g.nodes[10][11].color = '#fff';
    // g.nodes[11][9].color = '#fff';
    // g.nodes[11][10].color = '#fff';
    // g.nodes[11][11].color = '#fff';
    //**************************

    let adjList = g.GetAdjacentNodes(x, y);
    // console.log(`adjList = ${adjList}`);
    let coords = [];
    let adjX = [],
      adjY = [];

    let start = null;
    let stopId;

    grid.Clear();
    function dijkstraAnimate(timestamp) {
      let progress = timestamp - start;

      if (!start || progress > progressLimit) {
        start = timestamp;

        if (adjList.length > 0) {
          coords = adjList.shift();
          [adjX, adjY] = coords;

          // Retrieves adjacent nodes
          if (!g.nodes[adjY][adjX].isWall) {
            let tmpAdjList = g.GetAdjacentNodes(adjX, adjY);

            adjList = [...adjList, ...tmpAdjList];

            // Removes any duplicates that adjList may have
            removeDuplicates();

            if (adjX === destX && adjY === destY) {
              // if (adjX === 10 && adjY === 10) {
              g.nodes[adjY][adjX].color = g.destFoundColor;
            } else {
              g.nodes[adjY][adjX].color = g.visitedColor;
            }

            g.nodes[adjY][adjX].wasVisited = true;
          }
          grid.Clear();
          grid.Color(g);
        }
      }

      stopId = requestAnimationFrame(dijkstraAnimate);

      if (adjX == destX && adjY == destY) {
        // if (adjX == 10 && adjY == 10) {
        cancelAnimationFrame(stopId);

        start = null;
        stopId = requestAnimationFrame(pathAnimation);
      } else if (adjList.length < 1) {
        cancelAnimationFrame(stopId);
        resolve(false);
      }
    }

    let travelingNode = g.nodes[destY][destX];
    let pathCompleted = false;

    grid.Clear();
    function pathAnimation(timestamp) {
      let progress = timestamp - start;

      if (!start || progress > progressLimit) {
        if (
          travelingNode.prevNode !== null &&
          travelingNode !== g.nodes[g.source.y][g.source.x]
        ) {
          travelingNode.prevNode.color = g.destFoundColor;
          travelingNode = travelingNode.prevNode;
          grid.Clear();
          grid.Color(g);
        } else {
          pathCompleted = true;
        }
      }
      stopId = requestAnimationFrame(pathAnimation);
      if (pathCompleted) {
        cancelAnimationFrame(stopId);
        setTimeout(() => {
          grid.Clear();
          resolve(true);
        }, 1500);
      }
    }

    setTimeout(() => (stopId = requestAnimationFrame(dijkstraAnimate)), 500);

    // Removes duplicates from coordinates array
    function removeDuplicates() {
      // Split array of coordinates into x- & y-coordinate arrays
      let xCoords = adjList.map(coord => coord[0]);
      let yCoords = adjList.map(coord => coord[1]);

      // Used to map ordinate's value to indices
      let xMap = {};

      xCoords.forEach((x, idx) => {
        if (xMap[x]) xMap[x] = [...xMap[x], idx];
        else xMap[x] = [idx];
      });

      // Used to tag potential duplicates
      let pDups = {};

      // Used to save duplicates' indices
      let dupIndices = [];

      // Retrieve duplicates
      for (let x in xMap) {
        if (xMap[x].length > 1) {
          xMap[x].forEach(idx => {
            if (yCoords[idx] in pDups) {
              dupIndices = [...dupIndices, idx];
            } else {
              pDups[yCoords[idx]] = idx;
            }
          });
        }
        pDups = {};
      }

      // Sorting from largest to smallest lets us splice duplicates
      // | in decreasing order of indices. This lets us modify array
      // | w/o modifying the indices of previous coordinates
      dupIndices.sort((el1, el2) => el1 < el2);

      // Remove duplicates
      dupIndices.forEach(idx => adjList.splice(idx, 1));
    }
  });
}
