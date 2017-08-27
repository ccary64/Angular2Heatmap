import { Shape } from './Shape';

export class Bounds {
  rows: Array<number> = [];
  columns: Array<number> = [];
  gridSize: number;
  constructor(polygon: Shape, gridSize: number) {
    this.gridSize = gridSize || 0.001;
    let i = polygon.bottom;
    let j = polygon.right;

    for (i; i < polygon.top; i = i + this.gridSize) {
     this.rows.push(parseFloat(i.toFixed(3)));
    }

    for (j; j < polygon.left; j = j + this.gridSize) {
     this.columns.push(parseFloat(j.toFixed(3)));
    }
  }
}
