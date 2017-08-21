'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var HeatMapSchema = new Schema({
  username: {
    type: String,
    required: 'username required'
  },
  Created_date: {
    type: Date,
    default: Date.now
  },
  coords: {
    type: Array,
    required: 'Coords required'
  }
});

module.exports = mongoose.model('HeatMaps', HeatMapSchema);