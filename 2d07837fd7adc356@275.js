// https://observablehq.com/@ignore_you/map-of-ukraine-with-d3-js-topojson-geojson@275
// let instructors = require("instructors.json");

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}

const getColor = (count) => {
  let color = 'white';

  if(count === 0) color = 'red';
  if(count > 0 && count < 3) color = 'yellow';
  if(count >= 3) color = 'green';

  return color;
}

export default function define(runtime, observer) {
  const main = runtime.module();

  main.variable(observer()).define(["md", "instructors"], function(md, instructors){
    let instructorsCounter = 0;
    Object.values(instructors).map(instructor => {
      instructorsCounter += instructor.amount
    })

    return(md`# Map of Ukraine \ninstructors: ${instructorsCounter} \n\nchildrens: 3500`);
  });
  main.variable(observer()).define(["d3","DOM","width","height","margin","geojson","path","instructors"], function(d3,DOM,width,height,margin,geojson,path,instructors){
      const svg = d3.select(DOM.svg(width, height))
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    UkraineInstructors = instructors;

    svg.selectAll("path")
      .data(geojson.features)
      .enter()
      .append("path")
        .attr("d", path)
        .attr('id', e => { return e.properties.ID_1 })
        // .attr('fill', e => { return getRandomColor() })
        .attr('fill', e => { return getColor(instructors[e.properties.ID_1].amount) })
        .attr('stroke', '#333')
        .attr('opacity', 0.5)
        .attr("x", function(d) {
          UkraineMetaData[d.properties.ID_1] = {...UkraineMetaData[d.properties.ID_1], x: path.centroid(d)[0]} ;
          // console.log(path.centroid(d)[0]);
          // return path.centroid(d)[0];
        })
        .attr("y", function(d) {
          UkraineMetaData[d.properties.ID_1] = {...UkraineMetaData[d.properties.ID_1], y: path.centroid(d)[1]} ;
          // console.log(path.centroid(d)[1]);
          // return path.centroid(d)[1];
        })

    return svg.node();
  });
  main.variable(observer("path")).define("path", ["d3","projection"], function(d3,projection){return(
    d3.geoPath()
      .projection(projection)
  )});
  main.variable(observer("projection")).define("projection", ["d3","width","height","geojson"], function(d3,width,height,geojson){return(
    d3.geoAlbers()
      //.scale(2200)
      .rotate([-30,0,0]) //
      .fitSize([.9*width, .9*height], geojson)
  )});
  main.variable(observer("bounds")).define("bounds", ["path","geojson"], function(path,geojson){return(
    path.bounds(geojson)
  )});
  main.variable(observer("geojson")).define("geojson", ["topojson","topodata"], function(topojson,topodata) {
    var geojson = topojson.feature(topodata, topodata.objects.UKR_adm1);
    return geojson;
  });
  main.variable(observer("topodata")).define("topodata", ["d3"], function(d3){return(
    d3.json("./Ukraine-regions.json")
  )});
  main.variable(observer("margin")).define("margin", function() {return{top: 10, right: 10, bottom: 150, left: 10}});
  main.variable(observer("width")).define("width", ["margin"], function(margin){return(
    window.innerWidth - margin.left - margin.right
  )});
  main.variable(observer("height")).define("height", ["margin"], function(margin){return(
    window.innerHeight - margin.top - margin.bottom
  )});
  main.variable(observer("topojson")).define("topojson", ["require"], function(require){return(
    require("topojson-client")
  )});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
    require("d3")
  )});
  main.variable(observer()).define(["d3"], function(d3){return(
    d3.geoAlbers()
  )});
  main.variable(observer()).define("instructors", ["d3"], function(d3){return(
      d3.json("instructors.json")
  )});
  // main.variable(observer()).define("instructors",["require"], function(require){return(
  //     require("instructors.json")
  // )});

  return main;
}
