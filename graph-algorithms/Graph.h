#ifndef GRAPH_H
#define GRAPH_H
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
#include <unordered_map>
using namespace std;

/**
 * Class to implement an undirected graph with non-negative edge weights.
 */
class Graph {
    public:
        /** 
         * A class that implements the Disjoint Set ADT. It creates a forest of nodes 
         * so the scope of all the unions is in one object.
         */
        class DisjointSet{
            private:
                unordered_map<string, string> parent;
                unordered_map<string, int> sizes;

            public:
                /**
                 * Makes each node in the vector a disjoint set
                 */
                void makeSet(vector<string> & nodes){
                    for(string node : nodes){
                        parent[node] = node;
                        sizes[node] = 1;
                    }
                }
                /**
                * Finds the sentinel of the set you are in, and compresses
                * the path of the nodes you visited along the way.
                * @return The sentinel node of the set.
                */
                string find(string node){
                    vector<string> compressPaths;
                    while(parent[node].compare(node) != 0){
                        compressPaths.push_back(node);
                        node = parent[node];
                    }
                    for(string child : compressPaths){
                        parent[child] = node;
                    }
                    return node;
                }
                /** 
                 * Unions two sets based on their sizes, and increments the 
                 * larger set by its child.
                 */
                void unionBySize(string first, string second){
                    string firstSen = find(first);
                    string secondSen = find(second);

                    if(firstSen.compare(secondSen) == 0){
                        return;
                    }

                    if(sizes[firstSen] >= sizes[secondSen]){
                        parent[secondSen] = firstSen;
                        sizes[firstSen] += sizes[secondSen];
                    }
                    else if(sizes[firstSen] < sizes[secondSen]){
                        parent[firstSen] = secondSen;
                        sizes[secondSen] += sizes[firstSen];
                    }
                }
        };

        unordered_map<string, unordered_map<string,double>> adjacencyList;
        /**
         * Initialize a Graph object from a given edge list CSV, where each line `u,v,w` represents an edge between nodes `u` and `v` with weight `w`.
         * @param edgelist_csv_fn The filename of an edge list from which to load the Graph.
         */
        Graph(const char* const & edgelist_csv_fn);

        /**
         * Return the number of nodes in this graph.
         * @return The number of nodes in this graph.
         */
        unsigned int num_nodes();

        /**
         * Return a `vector` of node labels of all nodes in this graph, in any order.
         * @return A `vector` containing the labels of all nodes in this graph, in any order.
         */
        vector<string> nodes();

        /**
         * Return the number of (undirected) edges in this graph.
         * Example: If our graph has edges "A"<-(0.1)->"B" and "A"<-(0.2)->"C", this function should return 2.
         * @return The number of (undirected) edges in this graph.
         */
        unsigned int num_edges();

        /**
         * Return the weight of the edge between a given pair of nodes, or -1 if there does not exist an edge between the pair of nodes.
         * @param u_label The label of the first node.
         * @param v_label The label of the second node.
         * @return The weight of the edge between the nodes labeled by `u_label` and `v_label`, or -1 if there does not exist an edge between the pair of nodes.
         */
        double edge_weight(string const & u_label, string const & v_label);

        /**
         * Return the number of neighbors of a given node.
         * @param node_label The label of the query node.
         * @return The number of neighbors of the node labeled by `node_label`.
         */
        unsigned int num_neighbors(string const & node_label);

        /**
         * Return a `vector` containing the labels of the neighbors of a given node.
         * The neighbors can be in any order within the `vector`.
         * @param node_label The label of the query node.
         * @return A `vector` containing the labels of the neighbors of the node labeled by `node_label`.
         */
        vector<string> neighbors(string const & node_label);

        /**
         * Return the shortest unweighted path from a given start node to a given end node as a `vector` of `node_label` strings, including the start node.
         * If there does not exist a path from the start node to the end node, return an empty `vector`.
         * If there are multiple equally short unweighted paths from the start node to the end node, arbitrarily return any path.
         * If the start and end are the same, the vector should just contain a single element: that node's label.
         * @param start_label The label of the start node.
         * @param end_label The label of the end node.
         * @return The shortest unweighted path from the node labeled by `start_label` to the node labeled by `end_label`, or an empty `vector` if no such path exists.
         */
        vector<string> shortest_path_unweighted(string const & start_label, string const & end_label);

        /**
         * Return the shortest weighted path from a given start node to a given end node as a `vector` of (`from_label`, `to_label`, `edge_weight`) tuples.
         * If there does not exist a path from the start node to the end node, return an empty `vector`.
         * If there are multiple equally short weighted paths from the start node to the end node, arbitrarily return any path.
         * If the start and end are the same, the vector should just contain a single element: (`node_label`, `node_label`, -1)
         * Example: If our graph has edges "A"<-(0.1)->"B", "A"<-(0.5)->"C", "B"<-(0.1)->"C", and "C"<-(0.1)->"D", if we start at "A" and end at "D", we would return the following `vector`: {("A","B",0.1), ("B","C",0.1), ("C","D",0.1)}
         * Example: If we start and end at "A", we would return the following `vector`: {("A","A",-1)}
         * @param start_label The label of the start node.
         * @param end_label The label of the end node.
         * @return The shortest weighted path from the node labeled by `start_label` to the node labeled by `end_label`, or an empty `vector` if no such path exists.
         */
        vector<tuple<string,string,double>> shortest_path_weighted(string const & start_label, string const & end_label);

        /**
         * Given a threshold, ignoring all edges with a weight greater than the threshold, return the connected components of the resulting graph as a `vector` of `vector` of `string` (i.e., each connected component is a `vector` of `string`, and you return a `vector` containing all of the connected components).
         * The components can be in any order, and the node labels within a component can be in any order.
         * Example: If our graph has edges "A"<-(0.1)->"B", "B"<-(0.2)->"C", "D"<-(0.3)->"E", and "E"<-(0.4)->"F", if our threshold is 0.3, we would output the following connected components: {{"A","B","C"}, {"D","E"}, {"F"}}
         * @param threshold The maximum edge weight to consider
         * @return The connected components of this graph, if we ignore edges with weight greater than `threshold`, as a `vector<vector<string>>`.
         */
        vector<vector<string>> connected_components(double const & threshold);

        /**
         * Return the smallest `threshold` such that, given a start node and an end node, if we only considered all edges with weights <= `threshold`, there would exist a path from the start node to the end node.
         * If there does not exist such a threshold (i.e., it's impossible to go from the start node to the end node even if we consider all edges), return -1.
         * Example: If our graph has edges "A"<-(0.2)->"B", "B"<-(0.4)->"C", and "A"<-(0.5)->"C", if we start at "A" and end at "C", we would return 0.4.
         * Example: If we start and end at "A", we would return 0
         * Note: The smallest connecting threshold isn't necessarily part of the shortest weighted path (such as in the first example above)
         * @param start_label The label of the start node.
         * @param end_label The label of the end node.
         * @return The smallest `threshold` such that, if we only considered all edges with weights <= `threshold, there would exist a path connecting the nodes labeled by `start_label` and `end_label`, or -1 if no such threshold exists.
         */
        double smallest_connecting_threshold(string const & start_label, string const & end_label);
};
#endif