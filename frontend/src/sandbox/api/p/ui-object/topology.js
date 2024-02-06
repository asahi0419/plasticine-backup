import Base from './base';
import { find } from 'lodash';

export default class TopologyObject extends Base {
    
    getType() {
        const strType = this.attributes.target._private.group;
        if (strType === 'nodes') {
            return 'node';
        } else {
            return 'edge';
        }
    }

    getTarget() {
        const targetObjectId = this.attributes.target._private.data.id;
        
        switch (this.getType()) {
            case 'node':
                const topologyObjectNode = find(this.attributes.graph.nodes, {id: targetObjectId});
                return JSON.stringify(topologyObjectNode);
            case 'edge':
                const topologyObjectEdge = find(this.attributes.graph.edges, {id: targetObjectId});
                return JSON.stringify(topologyObjectEdge);
        }
    }               

    getParent() {
        const objTopology = {
            graph: this.attributes.graph,
            options: null, 
            state: null,
            legend: null,
        };
        const objTopologyToJson = JSON.stringify(objTopology);
        return objTopologyToJson;
    }

    getGraph() {
        const graph = this.attributes.graph;
        const graphToJson = JSON.stringify(graph);
        return graphToJson;
    }
}