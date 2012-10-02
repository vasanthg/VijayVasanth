var w = 960,
    h = 550,
    r = 520,
    x = d3.scale.linear().range([0, r]),
    y = d3.scale.linear().range([0, r]),
    node,
    root,
    nodes,
    k,
    zoomType;

var pack = d3.layout.pack()
    .size([r, r])
    .value(function(d) { return d.value });

var vis = d3.select("form").insert("svg:svg", "h2")
    .attr("width", w)
    .attr("height", h)
    .append("svg:g")
    .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

//vis.append("rect")
//    .attr("width", 960)
//    .attr("height", 550)
//    .attr("x", 0-(w-r)/2)
//    .attr("y", 0-(h - r) / 2)
//
//    .attr("class","background");

d3.json("data/IBM_full.json", afterLoad);

var rad = document.scopeForm.scopeRadios;
var prev = null;
for(var i = 0; i < rad.length; i++) {
    rad[i].onclick = function() {
//        (prev) ? console.log(prev.value):null;
        if(this !== prev) {
            prev = this;
            changeScope(this.value);
        }
//        console.log(this.value);
    };
}

function changeScope(scope) {
    if(scope == 'company') {
        console.log("Loading company");
        d3.json("data/IBM_nodomain.json", afterFirstLoad);
    } else if(scope == 'domain') {
        console.log("Loading domain");
        d3.json("data/IBM_full.json", afterFirstLoad);
    }
}

function afterLoad(data) {
    node = root = data;

    nodes = pack.nodes(root);

    vis.selectAll("circle")
        .data(nodes)
        .enter().append("svg:circle")
        .attr("class", circleClassMatch)
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", 0)
        .on("click", function(d) { return zoom(node == d ? root : d); })
        .transition().duration(2000).delay(function(d, i) { return i * 2.5; })
            .attr("r", function(d) { return d.r; });

    vis.selectAll("text")
        .data(nodes)
        .enter().append("svg:text")
        .attr("class", textClassMatch)
        .attr("x", function(d) { return d.x; })
        .attr("y", textYPlacement)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("opacity", 0)
        .text(function(d) { return d.name; })
        .transition().duration(2500)
            .style("opacity", showLabels);

    d3.select(window).on("click", function() { zoom(root); });
}

function afterFirstLoad(data) {
    node = root = data;

    nodes = pack.nodes(root);

    vis.selectAll("circle").data(nodes).enter().append("svg:circle")
        .attr("class", circleClassMatch)
        .attr("r",0)
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .on("click", function(d) { return zoom(node == d ? root : d); })
        .transition().duration(2000).delay(function(d, i) { return i * 2.5; })
            .attr("r", function(d) { return d.r; });

    vis.selectAll("circle").data(nodes).transition().duration(2000).delay(function(d, i) { return i * 2.5; })
        .attr("class", circleClassMatch)
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { return d.r; });

    vis.selectAll("circle").data(nodes).exit().transition().duration(2000).delay(function(d, i) { return i * 2.5; }).attr("r", 0).remove();

    vis.selectAll("text").data(nodes).transition().duration(2000).delay(1000)
        .attr("class", textClassMatch)
        .attr("x", function(d) { return d.x; })
        .attr("y", textYPlacement)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("opacity", showLabels)
        .text(function(d) { return d.name; });

    vis.selectAll("text").data(nodes).exit().transition().duration(2000).delay(1000).style("opacity", 0).remove();

    vis.selectAll("text").data(nodes).enter().append("svg:text")
        .attr("class", textClassMatch)
        .attr("x", function(d) { return d.x; })
        .attr("y", textYPlacement)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("opacity", 0)
        .text(function(d) { return d.name; })
        .transition().duration(2000).delay(1000)
        .style("opacity", showLabels);

    // Temporary solution but this sorts the texts which forces text infront of some circles in strange cases
    vis.selectAll("text").sort(function(a,b){return 1});
}

function circleClassMatch(d) {
    if(d.type == "beginner" || d.type == "intermediate" || d.type == "advanced" || d.type == "company" || d.type == "domain")
        return d.type;
    if(d.type == "level")
        return d.parent.type + "_" + d.type;
    return d.children ? "parent" : "child";
}

function textClassMatch(d) {
    if(d.type == "company" || d.type == "domain" || d.type == "status" || d.type == "group" || d.type == "assignment")
        return d.type;
    if(d.type == "level")
        return d.parent.type + "_" + d.type;
    if(d.type == "beginner" || d.type == "intermediate" || d.type == "advanced")
        return "hidden";
    return d.children ? "parent" : "child";
}

function textYPlacement(d) {
    if(d.type == "company")
        return 20+12;
    if(d.type == "domain")
        return (d.y+ d.r)+(7+5);
    return d.y;
}

function showLabels(d) {
    if(d.type == "domain")
        return 1;
    if(d.type == "level")
        return d.r > 10 ? 1 : 0;
    return d.r > 75 ? 1 : 0
}

function showLabelsZoom(d) {
    if(d.type == "domain") return 1;
    if(zoomType == "level")
        if(d.type == "assignment")
            return k * d.r > 10 ? 1 : 0;
        else
            return 1;
    if(d.type == "level")
        return k * d.r > 10 ? 1 : 0;
    return k * d.r > 75 ? 1 : 0
}

function zoom(d, i) {
    k = r / d.r / 2;
    x.domain([d.x - d.r, d.x + d.r]);
    y.domain([d.y - d.r, d.y + d.r]);

    var t = vis.transition()
        .duration(d3.event.altKey ? 7500 : 750);

    t.selectAll("circle")
        .attr("cx", function(d) { return x(d.x); })
        .attr("cy", function(d) { return y(d.y); })
        .attr("r", function(d) { return k * d.r; });

    zoomType = d.type;

    t.selectAll("text")
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function (d) { return y(textYPlacement(d))})
        .style("opacity", showLabelsZoom)
        .style("font-size", function(d) {
            if(d.type == "level") {
                var zoomedValue = Math.min(d.r*k,(k * 14));
                return zoomedValue.toString() + "px";
            }

        });



    node = d;
    d3.event.stopPropagation();
}

//function shiftData() {
//    // Reset data since value function uses Math.random()
//    nodes = pack.nodes(root);
//
//    vis.selectAll("circle").transition().delay(1000).duration(5000).attr("class", function(d) { return d.children ? "parent" : "child"; })
//        .attr("cx", function(d) { return d.x; })
//        .attr("cy", function(d) { return d.y; })
//        .attr("r", function(d) { return d.r; });
//
//    showLabels();
//}
//
//function showLabels(d) {
//    vis.selectAll("text").transition().delay(1000).duration(5000)
//        .attr("x", function(d) { return d.x; })
//        .attr("y", function(d) { return d.y; })
//        .style("opacity", function(d) {
//            if(d.r < 20 || d.r > 400)
//                return 0;
//            else
//                return 1;
//        });
//}
//
//function hideLabels() {
//    vis.selectAll("text").transition().duration(1000).style("opacity", function(d) {return 0});
//}