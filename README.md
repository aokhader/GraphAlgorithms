# Graph Algorithms Visualizer

An interactive web application for visualizing classic graph algorithms step-by-step. Built with Next.js, TypeScript, and Cytoscape.js.

## Overview

This project ports a C++ graph algorithms implementation into an animated web app visualizer. Each algorithm is broken into discrete frames that can be played back, paused, and stepped through one at a time. A live log panel records every decision the algorithm makes, and a queue/stack panel shows the internal data structure updating in real time.

## Features

- **Five algorithms** — BFS, DFS, Dijkstra, Connected Components, and Smallest Threshold (Union-Find)
- **Step-by-step animation** — play, pause, step forward, step back, and stop at any point
- **Live queue/stack panel** — shows the current contents of the algorithm's internal data structure on every frame, with the front of queue or top of stack highlighted
- **Algorithm log** — colour-coded step log with category labels (visit, explore, relax, union, etc.)
- **Metadata panel** — Dijkstra shows a live distance table; Connected Components shows component assignments
- **CSV graph loading** — paste or type a graph in `nodeA,nodeB,weight` format and load it onto the canvas
- **Multiple layouts** — Force-directed (CoSE), Circle, Grid, and Breadth-First Tree


## Algorithms

### BFS — Breadth-First Search
Finds the shortest unweighted path between two nodes using a FIFO queue. The queue panel shows the current queue contents, with the front highlighted.

### DFS — Depth-First Search
Traverses the graph depth-first using a LIFO stack. The stack panel shows items with the top of stack on the right, highlighted in blue, with `← top` markers.

### Dijkstra's Algorithm
Finds the shortest weighted path using a binary min-heap priority queue. Each entry in the priority queue panel is shown as `node(cost)`, sorted by cost. The metadata panel shows the live distance table updating as nodes are relaxed.

### Connected Components
Finds all connected subgraphs using iterative DFS. Reports the number of components and the minimum cross-component edge weight.

### Smallest Threshold (Union-Find)
Finds the smallest edge weight `T` such that all edges with weight ≤ `T` connect a start node to an end node. Uses a Union-Find (Disjoint Set) data structure with union-by-size and path compression.

## Project Structure

```
web-graph/
├── app/
│   └── page.tsx                  # Main page — composes all UI components
├── src/
│   ├── algorithms/
│   │   ├── types.ts              # Shared types: Graph, StepFrame, AlgorithmResult
│   │   ├── bfs.ts                # BFS implementation
│   │   ├── dfs.ts                # DFS implementation
│   │   ├── dijkstra.ts           # Dijkstra + binary min-heap
│   │   ├── connected-components.ts
│   │   └── union-find.ts         # Smallest threshold + UnionFind class
│   ├── graph-setup/
│   │   └── graphParser.ts        # CSV parsing, Cytoscape ↔ Graph conversion
│   └── ui/
│       ├── useAnimator.ts        # React hook — animation playback state machine
│       ├── useCytoscape.ts       # React hook — Cytoscape instance + style application
│       ├── AlgorithmPanel.tsx    # Left sidebar: algorithm picker, inputs, CSV loader
│       ├── LogPanel.tsx          # Right sidebar: step log + queue/stack panel
│       └── ControlPanel.tsx      # Bottom bar: transport controls + progress + speed
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/aokhader/GraphAlgorithms
cd web-graph
npm install
```

### Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for production

```bash
npm run build
npm start
```

## Usage

1. **Load a graph** — paste a CSV into the left panel in `nodeA,nodeB,weight` format (one edge per line) and click **Load Graph**. Weight is optional and defaults to 1.

   ```
   A,B,4
   A,C,2
   B,C,1
   B,D,5
   C,D,8
   ```

2. **Select an algorithm** — click one of the five algorithm buttons in the left panel.

3. **Set start and end nodes** — for BFS, DFS, Dijkstra, and Min Threshold, type the node IDs into the **From** and **To** fields. Node IDs are case-sensitive and must match exactly what's in the CSV.

4. **Run** — click **▶ Run** or press Enter. The animation starts automatically.

5. **Control playback** — use the bottom bar to play, pause, step forward/back, stop, or adjust speed (0.25× to 4×).

6. **Read the log** — the right panel shows every step the algorithm took, colour-coded by type. The queue/stack panel above the log shows the current state of the internal data structure.

## CSV Format

Each line represents one undirected edge:

```
nodeA,nodeB,weight
```

- Lines starting with `#` are treated as comments and ignored
- Weight is optional — omitting it defaults to `1`
- Node IDs can be any string without commas

## Node Colours

| Colour | Meaning |
|--------|---------|
| Blue border | Active — currently being processed |
| Green border | Visited — fully settled |
| Orange border | Path — on the final answer path |

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Cytoscape.js** — graph rendering and interaction
- **Tailwind CSS** — styling

## Assumptions for C++ Use
System Assumptions: 
- This program assumes you are running on a Linux machine or a virtual Linux machine such as Ubuntu's WSL. If you are running on a Windows then use a virtual Linux machine to run the program, or install a package that allows you to run a makefile if you want to use the ease of running it. To get Ubuntu, you follow the instructions in this [link](https://ubuntu.com/desktop/wsl).
- To run the makefile without installing Ubuntu's WSL, install [GNU make](https://www.gnu.org/software/make/) with [chocolatey](https://chocolatey.org/install) to add ``make`` to the global path and runs on all Command Line Interfaces (powershell, git bash, cmd, etc…), then run the command ``choco install make``.

Input File Assumptions:
- The file is a CSV file formatted in the following manner: ``<node_A>,<node_B>,<edge_weight>``.
- The edge weights are non-negative.
- There are no self-edges.
- The graph is **not** a multigraph, so there is at most one edge between node_A and node_B.
- The edges are undirected, and there is at least one edge in the graph.

## Usage for C++ Use
After running the makefile using the command ``make``, the executable name is ``./GraphTest``. The usage is shown below: 
```
./GraphTest <edgelist_csv> <test>
```
The first argument is the CSV file that contains the graph as a list of edges. The second argument is the type of test you would like to run on the graph. The possible tests you can run are:
- ``graph_properties``: Tests building a ``Graph`` object and checking its basic properties.
- ``shortest_unweighted``: Tests the function for finding the shortest unweighted path for all possible start and end nodes in the graph.
- ``shortest_weighted``: Tests the function for finding the shortest weighted path for all possible start and end nodes in the graph.
- ``connected_components``: Tests the function for getting the connected components in the graph and finds the minimum edge weight between the components as the threshold.
- ``smallest_threshold``: Tests the function for finding the smallest threshold for all possible starting and ending nodes in the graph.