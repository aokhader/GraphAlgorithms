#include "Graph.h"
#include <string>
#include <tuple>
#include <vector>
#include <fstream>
#include <sstream>
#include <set>
#include <stack>
#include <queue>
#include <map>
#include <iostream>
#include <algorithm>
#include <limits>
#include <cstddef>
using namespace std;

Graph::Graph(const char* const & edgelist_csv_fn) {
    // TODO
    ifstream edgeListCSV(edgelist_csv_fn);                  // open the file
    string line;                                            // helper var to store current line
    while(getline(edgeListCSV, line)) {                     // read one line from the file
        istringstream ss(line);                             // create istringstream of current line
        string first, second, third;                        // helper vars
        getline(ss, first, ',');                            // store first column in "first"
        getline(ss, second, ',');                           // store second column in "second"
        getline(ss, third, '\n');                           // store third column column in "third"

        double edgeWeight = stod(third);

        adjacencyList[first][second] = edgeWeight;
        adjacencyList[second][first] = edgeWeight;
    }
    edgeListCSV.close();                                    // close file when done
}

unsigned int Graph::num_nodes() {
    // TODO
    return adjacencyList.size();
}

vector<string> Graph::nodes() {
    // TODO
    vector<string> nodes;
    for(auto& pair : adjacencyList){
        nodes.push_back(pair.first);
    }
    return nodes;
}

unsigned int Graph::num_edges() {
    // TODO
    int numEdges = 0;
    for(auto& pair : adjacencyList){
        numEdges += pair.second.size();
    }
    return numEdges / 2;
}

unsigned int Graph::num_neighbors(string const & node_label) {
    // TODO
    int numOfNeighbors = 0;
    for(auto& pair : adjacencyList){
        if(node_label.compare(pair.first) == 0){
            return pair.second.size();
        }
    }

    return numOfNeighbors;
}

double Graph::edge_weight(string const & u_label, string const & v_label) {
    // TODO
    unordered_map<string, double> listOfNeighbors = adjacencyList.at(u_label);
    if(listOfNeighbors.find(v_label) != listOfNeighbors.end()){
        double neighborEdgeWeight = listOfNeighbors.at(v_label);
        return neighborEdgeWeight;
    }

    return -1;
}

vector<string> Graph::neighbors(string const & node_label) {
    // TODO
    vector<string> neighbors;
    unordered_map<string,double> listOfNeighbors = adjacencyList.at(node_label);
    for(pair<string,double> pairs : listOfNeighbors){
        neighbors.push_back(pairs.first);
    }
    return neighbors;
}

vector<string> Graph::shortest_path_unweighted(string const & start_label, string const & end_label) {
    // TODO
    queue<pair<string,int>> bfsQueue;
    unordered_map<string, string> parent;                   //array to store parents of nodes
    unordered_map<string, int> distances;                   //keeps track of distances via current node
    set<string> visited;
    vector<string> path; 
    bfsQueue.push(make_pair(start_label, 0));
    visited.insert(start_label);
    distances[start_label] = 0;
    
    while(!bfsQueue.empty()){
        pair<string, int> currentNodeAndDist = bfsQueue.front();
        bfsQueue.pop();
        string currentNode = currentNodeAndDist.first;
        int currentDist = currentNodeAndDist.second;
        distances[currentNode] = currentDist;

        if(currentNode.compare(end_label) == 0){

            stack<string> reversedPath;
            string revPathName = currentNode;

            while(revPathName.compare("") != 0){
                reversedPath.push(revPathName);
                revPathName = parent[revPathName];
            }

            while(!reversedPath.empty()){
                string startToEnd = reversedPath.top();
                reversedPath.pop();
                path.push_back(startToEnd);
            }

            return path;
        }

        //find the neighbors
        vector<string> neighborVector = neighbors(currentNode);
        for(string nbr : neighborVector){

            //if the neighbor wasn't visited, visit it and add it to the queue
            if(visited.find(nbr) == visited.end()){
                visited.insert(nbr);
                bfsQueue.push(make_pair(nbr, currentDist + 1));
                if(parent[nbr].compare("") == 0){
                    parent[nbr] = currentNode;
                }

                distances[nbr] = currentDist + 1;
            }
        }
    }

    //we reached the end vertex, so reconstruct the path
    vector<string> empty;
    return empty;
}

vector<tuple<string,string,double>> Graph::shortest_path_weighted(string const & start_label, string const & end_label) {
    // TODO
    priority_queue<pair<double, string>, vector<pair<double, string>>, greater<pair<double,string>>> dijkstraPQ;

    unordered_map<string, string> parent;                   //array to store parents of nodes
    unordered_map<string, double> totalDistances;           //keeps track of total distance via current node as index 
    unordered_map<string, double> singleEdgeWeights;        //keeps track of the individual edge weights.
    set<string> visited;
    vector<tuple<string,string,double>> path;

    //if the start and end are the same, return one tuple
    if(start_label.compare(end_label) == 0){
        vector<tuple<string,string,double>> sameStartEnd;
        sameStartEnd.push_back(make_tuple(start_label,end_label,-1));
        return sameStartEnd;
    }

    //make all the distances infinity and no parents yet
    for(auto& pairing : adjacencyList){
        totalDistances[pairing.first] = numeric_limits<double>::max();
        parent[pairing.first] = "";
    }

    //set start to 0 and push to pq
    totalDistances[start_label] = 0;
    dijkstraPQ.push(make_pair(0, start_label));

    while(!dijkstraPQ.empty()){
        pair<double, string> currentNodeAndDist = dijkstraPQ.top();
        dijkstraPQ.pop();
        double currentTotalWeight = currentNodeAndDist.first;
        string currentName = currentNodeAndDist.second;

        if(visited.find(currentName) == visited.end()){
            visited.insert(currentName);

            for(auto& listOfNeighbors : adjacencyList.at(currentName)){
                string neighborName = listOfNeighbors.first;
                double neighborWeight = listOfNeighbors.second;

                if(currentTotalWeight + neighborWeight < totalDistances[neighborName]){
                    totalDistances[neighborName] = currentTotalWeight + neighborWeight;
                    parent[neighborName] = currentName;
                    dijkstraPQ.push(make_pair(currentTotalWeight + neighborWeight, neighborName));
                }
            }
        }
    }
    
    string endToStart = end_label;
    while(endToStart.compare("") != 0){
        string par = parent[endToStart];
        if(!par.empty()){
            //the adjacencyList[current][neighbor] = the edge weight 
                path.push_back(make_tuple(par, endToStart, adjacencyList.at(endToStart).at(par)));
        }
        endToStart = parent[endToStart];
    }

    if(!path.empty()){
        reverse(path.begin(), path.end());
        return path;
    }
    
    vector<tuple<string,string,double>> empty;
    return empty;
}

vector<vector<string>> Graph::connected_components(double const & threshold) {
    // TODO
    queue<string> bfsQueue;
    vector<vector<string>> allComponents;
    set<string> visited; 

    for(auto& pairing : adjacencyList){
        string vertex = pairing.first;
        
        //if it wasn't visited, perform BFS starting with that vertex
        if(visited.find(vertex) == visited.end()){
            vector<string> elementsOneComponent;
            
            bfsQueue.push(vertex);
            visited.insert(vertex);
            elementsOneComponent.push_back(vertex);

            while(!bfsQueue.empty()){
                string currentNode = bfsQueue.front();
                bfsQueue.pop();

                for(auto& neighborAndEdge : adjacencyList.at(currentNode)){
                    string neighborName = neighborAndEdge.first;
                    double neighborWeight = neighborAndEdge.second;

                    if(neighborWeight <= threshold && (visited.find(neighborName) == visited.end())){
                        bfsQueue.push(neighborName);
                        visited.insert(neighborName);
                        elementsOneComponent.push_back(neighborName);
                    }
                }
            }

            //now add the elements to the vector of components
            allComponents.push_back(elementsOneComponent);
        }
    }

    return allComponents;
}

bool tupleWeightComparator(tuple<string,string,double> first, tuple<string,string,double> second){
    double firstWeight = get<2>(first);
    double secondWeight = get<2>(second);

    if(firstWeight != secondWeight){
        return firstWeight < secondWeight;
    }
    
    string firstNeighbor = get<1>(first);
    string secondNeighbor = get<1>(second);
    if(firstNeighbor.compare(secondNeighbor) != 0){
        return (firstNeighbor.compare(secondNeighbor) < 0);
    }

    string firstName = get<0>(first);
    string secondName = get<0>(second);
    return (firstName.compare(secondName) < 0);
}

double Graph::smallest_connecting_threshold(string const & start_label, string const & end_label) {
    // TODO
    vector<string> allNodes = nodes();
    DisjointSet ds;
    ds.makeSet(allNodes);
    vector<tuple<string,string,double>> edgeTuple;

    if(start_label.compare(end_label) == 0){
        return 0;
    }

    //getting all the edges into the vector
    for(auto& currentAndList : adjacencyList){
        string currentName = currentAndList.first;
        for(pair<string, double> pairing : adjacencyList.at(currentName)){
            string neighborName = pairing.first;
            double neighborWeight = pairing.second;
            edgeTuple.push_back(make_tuple(currentName, neighborName, neighborWeight));
        }
    }

    //sort the edges by weight
    sort(edgeTuple.begin(), edgeTuple.end(), tupleWeightComparator);

    //add the nodes into a larger set to get the min edge weight
    for(tuple<string,string,double> minEdge : edgeTuple){
        string one = get<0>(minEdge);
        string two = get<1>(minEdge);
        ds.unionBySize(one,two);

        string argOneParent = ds.find(start_label);
        string argTwoParent = ds.find(end_label);

        if(argOneParent.compare(argTwoParent) == 0){
            //then they are in the same set
            double min = get<2>(minEdge);
            return min;
        }
    }
    
    //unreachable, so return -1
    return -1;
}