import "../selection/each";
import "transition";

d3_transitionPrototype.duration = function(value) {
  var id = this.id;
  if (arguments.length < 1) return this.node().__transition__[id].duration;
  return d3_selection_each(this, typeof value === "function"
      ? function(node, i, j) { node.__transition__[id].duration = Math.max(1, value.call(node, node.__data__, i, j)); }
      : (value = Math.max(1, value), function(node) { node.__transition__[id].duration = value; }));
};
