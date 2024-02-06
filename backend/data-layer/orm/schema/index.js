import TableOperation from './operations/table.js';
import ColumnOperation from './operations/column/index.js';

class Schema {
  constructor(connection) {
    this.connection = connection;
    this.table = new TableOperation(connection);
    this.column = new ColumnOperation(connection);

    this.SYSTEM_FIELDS = [
      'id',
      'created_at',
      'created_by',
      'updated_at',
      'updated_by',
    ];
    this.VIRTUAL_FIELDS = [
      'reference_to_list',
      'journal',
    ];
    this.CROSS_FIELDS = [
      'global_reference',
      'reference_to_list',
    ];
    this.GEO_FIELDS = [
      'geo_geometry',
      'geo_line_string',
      'geo_point',
      'geo_polygon',
    ];
  }
}

export default Schema;
