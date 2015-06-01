var setup_structure = function() {

  var tendril_pot = document.createElement("div");
  tendril_pot.className = "pot";
  tendril_pot.id = "gmuPlant";
  tendril_pot.style.height = window.innerHeight;
  tendril_pot.style.width = window.innerWidth;
  tendril_pot.style.paddingTop = "0px"; 
  tendril_pot.style.paddingLeft =  "0px";

  tendril_pot.style.position = "absolute";
  tendril_pot.style.top =  0;
  tendril_pot.style.left =  0;
  tendril_pot.style.zIndex = "99999999999999999999999";
  tendril_pot.style.pointerEvents =  "none";

  var grid = document.createElement("div");
  grid.className = "grid";
  grid.id = "gmuGrid";
  grid.style.height = window.innerHeight;
  grid.style.width = window.innerWidth;
  grid.style.paddingTop = "0px"; 
  grid.style.paddingLeft =  "0px";

  grid.style.position = "absolute";
  grid.style.top = 0;
  grid.style.left =  0;

  var body = document.body
  body.appendChild(tendril_pot)
  body.appendChild(grid)

}
setup_structure();
console.log("setup finished!");
alert("TETS");
