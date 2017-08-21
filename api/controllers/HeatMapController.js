'use strict';

var mongoose = require('mongoose'),
  HeatMap = mongoose.model('HeatMaps');

exports.list_all_HeatMaps = function(req, res) {
  HeatMap.find({}, function(err, heatmaps) {
    if (err)
      res.send(err);
    res.json(heatmaps);
  });
};

exports.create_a_HeatMap = function(req, res) {
  var new_heatmap = new HeatMap(req.body);
  new_heatmap.save(function(err, heatmap) {
    if (err)
      res.send(err);
    res.json(heatmap);
  });
};

exports.read_a_HeatMap = function(req, res) {
  Task.findById(req.params.heatmapId, function(err, heatmap) {
    if (err)
      res.send(err);
    res.json(heatmap);
  });
};

exports.update_a_HeatMap = function(req, res) {
  HeatMap.findOneAndUpdate({_id: req.params.heatmapId}, req.body, {new: true}, function(err, heatmap) {
    if (err)
      res.send(err);
    res.json(heatmap);
  });
};

exports.delete_a_HeatMap = function(req, res) {  
  Task.remove({
      _id: req.params.heatmapId
    }, function(err, heatmap) {
      if (err)
        res.send(err);
      res.json({ message: 'HeatMap successfully deleted' });
    });
  };
  