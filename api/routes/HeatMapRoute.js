'use strict';
module.exports = function(app) {
  var HeatMapController = require('../controllers/HeatMapController');

  // todoList Routes
  app.route('/heatmaps')
    .get(HeatMapController.list_all_HeatMaps)
    .post(HeatMapController.create_a_HeatMap);


  app.route('/heatmaps/:heatmapId')
    .get(HeatMapController.read_a_HeatMap)
    .put(HeatMapController.update_a_HeatMap)
    .delete(HeatMapController.delete_a_HeatMap);
};
