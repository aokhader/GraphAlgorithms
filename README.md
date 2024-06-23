# GraphAlgorithms
## Description
This program will take in a graph as a CSV file and allows you to run different graph algorithms. Given a graph, you can find the:
- Number of edges, nodes, and neighbors for each node.
- Shortest unweighted path in the graph from a given starting node to a given ending node.
- Shortest weighted path in the graph from a given starting node to a given ending node.
- Connected components in a graph, which are the discrete groups of nodes who form a cycle between them.
- Smallest connecting threshold needed to have a path from a given starting node to a given ending node.

## Assumptions
System Assumptions: 
- This program assumes you are running on a Linux machine or a virtual Linux machine such as Ubuntu's WSL. If you are running on a Windows then use a virtual Linux machine to run the program, or install a package that allows you to run a makefile if you want to use the ease of running it. To get Ubuntu, you follow the instructions in this [link](https://ubuntu.com/desktop/wsl).
- To run the makefile without installing Ubuntu's WSL, install [GNU make](https://www.gnu.org/software/make/) with [chocolatey](https://chocolatey.org/install) to add ``make`` to the global path and runs on all Command Line Interfaces (powershell, git bash, cmd, etc…), then run the command ``choco install make``.

Input File Assumptions:
- 


## Usage
After running the makefile using the command ``make``, the executable name is ``./GraphTest``. The usage is shown below: 
```
./GraphTest <edgelist_csv> <test>
```
The first argument is the CSV file that contains the graph as a list of edges. The second argument is the type of test you would like to run on the graph. 