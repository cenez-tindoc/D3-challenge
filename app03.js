var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.9,
      d3.max(stateData, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);
  return xLinearScale;
}

// Function used for updating y-scale variable upon click on axis label.
function yScale(stateData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.8,
            d3.max(stateData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// Function used for updating yAxis var upon click on axis label.
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

  // update circles group with transitions
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }  
  // update circles group with transitions
  function renderStates(stateGroup, newXscale, newYscale, chosenXaxis, chosenYaxis) {
    stateGroup.transition()
        .duration(1000)
        .attr("x", d => newXscale(d[chosenXaxis]))
        .attr("y", d => newYscale(d[chosenYaxis]));
    return stateGroup;
  };
  
  // update circles group with new tooltip
  function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {
  
    if (chosenXAxis === "poverty") {
      var xlabel = "In Poverty (%): ";
    }
    else if (chosenXAxis === "age") {
        var xlabel = "Age (Median): ";
    }
    else {
      var xlabel = "Household Income (Median): $";
    };  

    if (chosenYAxis === "healthcare") {
      var ylabel = "Lacks Healthcare (%): ";
    }
    else if (chosenYAxis === "obesity") {
        var ylabel = "Obesity (%): ";
    }
    else {
      var ylabel = "Smokers (%): ";
    }
  
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .html(d => {
        return (`${d.state} (${d.abbr})<br>${ylabel}${d[chosenYAxis]}<br>${xlabel}${d[chosenXAxis]}`)
      });
      
  
    circlesGroup.call(toolTip);

    // mouseover event - show tooltip
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event - hide tooltip
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
    return circlesGroup;
  };

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function(stateData, err) {
  if (err) throw err;

  // parse data
  stateData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(stateData, chosenXAxis);

  // yLinearScale function above csv import.
  var yLinearScale = yScale(stateData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
  .call(leftAxis);
    
  // Create group for  x axis labels
  var labelsGroupX = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty");

  var ageLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

        // Create group for  y axis labels
  var labelsGroupY = chartGroup.append("g")
    .attr("transform", "rotate(-90)");  

  var healthcareLabel = labelsGroupY.append("text")
    // .attr("transform", "rotate(-90)")
    .attr("y", 55 - margin.left)
    .attr("x",  0 - (height / 2))
    .attr("value", "healthcare") // value to grab for event listener.
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokeLabel = labelsGroupY.append("text")
    // .attr("transform", "rotate(-90)")
    .attr("y", 35 - margin.left)
    .attr("x",  0 - (height / 2))
    .attr("value", "smokes") // value to grab for event listener.
    .classed("inactive", true)
    .text("Smokes (%)");

  var obesityLabel = labelsGroupY.append("text")
    .attr("y", 15 - margin.left)
    .attr("x",  0 - (height / 2))
    .attr("value", "obesity") // value to grab for event listener.
    .classed("inactive", true)
    .text("Obesity (%)");

    // append initial circles
  var circlesGroup = chartGroup.selectAll(".stateCircle")
    .data(stateData)
    .enter()
    .append("circle")
    .classed("stateCircle",true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  var stateGroup = chartGroup.selectAll(".stateText")
    .data(stateData)
    .enter()
    .append("text")
    .classed("stateText",true)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .text(d => d.abbr)
    .attr('alignment-baseline','middle')
    .attr("font-size","10")
    // .attr("color", "black");  

    // updateToolTip function above csv import
  var circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

  // x axis labels event listener
  labelsGroupX.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");

  // replaces chosenXAxis with value
      if (value !== chosenXAxis) {
            chosenXAxis = value;
            // console.log(chosenXAxis,chosenYAxis);

        // xLinearScale function above csv import
        xLinearScale = xScale(stateData, chosenXAxis);
        // yLinearScale function above csv import.
        yLinearScale = yScale(stateData, chosenYAxis);

        xAxis = renderXAxes(xLinearScale, xAxis);
        // updates circles with new x and y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        // updates circles with new state abbr values
        stateGroup = renderStates(stateGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
 
        // updates tooltips with new info
        circlesGroup = updateToolTip(circlesGroup,chosenXAxis,chosenYAxis);
        // changes  x classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });
 
    // Y axis labels event listener
    labelsGroupY.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      
      if (value !== chosenYAxis) {
        // replaces chosenXAxis with value
        chosenYAxis = value;
         //console.log(chosenXAxis,chosenYAxis);
        // functions here found above csv import
        // updates x and y scales for new data
        xLinearScale = xScale(stateData, chosenXAxis);
        yLinearScale = yScale(stateData, chosenYAxis);
        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);
        // updates circles with new x and y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis,yLinearScale, chosenYAxis);
        stateGroup = renderStates(stateGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        
        // updates tooltips with new info
        circlesGroup = updateToolTip(circlesGroup,chosenXAxis,chosenYAxis);
      // changes Y classes to change bold text
      if (chosenYAxis === "healthcare") {
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
          smokeLabel
          .classed("active", false)
          .classed("inactive", true);
          obesityLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "smokes") {
        smokeLabel
          .classed("active", true)
          .classed("inactive", false);
          healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
          obesityLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        obesityLabel
          .classed("active", true)
          .classed("inactive", false);
          smokeLabel
          .classed("active", false)
          .classed("inactive", true);
          healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        }
      }
    });
 
}).catch(function(error) {
    console.log(error);
});

// d3.select(window).on("resize", makeResponsive);