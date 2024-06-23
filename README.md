# GraphAlgorithms
## Description
This program will take in a graph as a CSV file and allows you to run different graph algorithms. Given a graph, you can find the:
- Number of edges, nodes, and neighbors for each node.
- Shortest unweighted path in the graph from a given starting node to a given ending node.
- Shortest weighted path in the graph from a given starting node to a given ending node.
- Connected components in a graph, which are subgraphs in which any two vertices are connected to each other via some path.
- Smallest connecting threshold needed to have a path from a given starting node to a given ending node:
  - This is done efficiently by using the Disjoint Set ADT, which makes all the nodes into its own DS and uses Union-By-Size to combine them.

## Assumptions
System Assumptions: 
- This program assumes you are running on a Linux machine or a virtual Linux machine such as Ubuntu's WSL. If you are running on a Windows then use a virtual Linux machine to run the program, or install a package that allows you to run a makefile if you want to use the ease of running it. To get Ubuntu, you follow the instructions in this [link](https://ubuntu.com/desktop/wsl).
- To run the makefile without installing Ubuntu's WSL, install [GNU make](https://www.gnu.org/software/make/) with [chocolatey](https://chocolatey.org/install) to add ``make`` to the global path and runs on all Command Line Interfaces (powershell, git bash, cmd, etc…), then run the command ``choco install make``.

Input File Assumptions:
- The file is a CSV file formatted in the following manner: ``<node_A>,<node_B>,<edge_weight>``.
- The edge weights are non-negative.
- There are no self-edges.
- The graph is **not** a multigraph, so there is at most one edge between node_A and node_B.
- The edges are undirected, and there is at least one edge in the graph.


## Usage
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