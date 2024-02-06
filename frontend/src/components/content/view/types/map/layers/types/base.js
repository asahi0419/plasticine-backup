import { CompositeLayer } from '@deck.gl/core'
import { DataFilterExtension } from '@deck.gl/extensions'

export default class extends CompositeLayer {
  static defaultProps = {
    extensions: { type: 'array', value: [ new DataFilterExtension({ filterSize: 1 }) ] },
    filterRange: { type: 'array', value: [ 1, 1 ] },
    getPosition: { type: 'accessor', value: (f) => f.geometry.coordinates },
    getFilterValue: { type: 'accessor', value: (f) => 1 },
  }

  static getProperty = (f = {}, name) => {
    return (f.properties || {})[name]
  }
}
