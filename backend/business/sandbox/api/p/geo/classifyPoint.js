import robustPointInPolygon from 'robust-point-in-polygon';


export default (sandbox) => (vs, point) => robustPointInPolygon(vs, point);