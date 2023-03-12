// @TODO: YOUR CODE HERE!
var svgWidth = 1200;
var svgHeight = 800;

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


//Initial parameters
chosenXAxis = "BRR3M";
chosenYAxis = "TWRR3M";

//Function for updating xscale
function xScale(healthData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.2])
        .range([0, width]);

    return xLinearScale;

}

//Function for updating yscale
function yScale(healthData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
        d3.max(healthData, d => d[chosenYAxis]) * 1.2])
        .range([height, 0]);

    return yLinearScale;

}

//function for updating xAxis var upon clicking on x label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

//function for updating yAxis var upon clicking on x label
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

function renderText(circlesText, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesText.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]) + 3);

    return circlesText;
}
// function used for updating circles group 
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var xlabel;
    var ylabel;

    if (chosenXAxis === "BRR3M") {
        xlabel = "BRR3M :";
    }
    else if (chosenXAxis === "BRR6M") {
        xlabel = "BRR6M : ";
    }
    else if (chosenXAxis === "BRR12M") {
        xlabel = "BRR12M : ";
    }
    if (chosenYAxis === 'TWRR3M') {
        ylabel = "TWRR3M : "
    }
	else if (chosenYAxis === 'TWRR6M') {
        ylabel = "TWRR6M : "
    }
    else if (chosenYAxis === 'TWRR12M') {
        ylabel = "TWRR12M : "
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function (d) {
            if (chosenXAxis === "BRR6M") {
                return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}%`);
            } else if (chosenXAxis === "BRR12M") {
                return (`${d.state}<br>${xlabel} $${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}%`);
            } else if (chosenXAxis === "BRR3M") {
                return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}%<br>${ylabel} ${d[chosenYAxis]}%`);
            }
            
        });

        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function (healthData) {
        toolTip.show(healthData, this);
    })
    // onmouseout event
        .on("mouseout", function (healthData, index) {
            toolTip.hide(healthData);
        });

    return circlesGroup;
}

//Read csv
d3.csv("assets/data/data.csv").then(function(healthData, err){
    if (err) throw err;

    healthData.forEach(function(data){

        data.BRR3M = +data.BRR3M;
        data.BRR6M = +data.BRR6M;
        data.BRR12M = +data.BRR12M;
        data.TWRR3M = +data.TWRR3M;
        data.TWRR6M = +data.TWRR6M;
        data.TWRR12M = +data.TWRR12M;
    });

    // Create Scales
    var xLinearScale = xScale(healthData, chosenXAxis);

    var yLinearScale = yScale(healthData, chosenYAxis);

    //create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale); 

    //Append x axis
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    //Append y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);
        
    //Append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d=> yLinearScale(d[chosenYAxis]))
        .attr("r",10)
        .classed('stateCircle', true);
    
    var circlesText = chartGroup.selectAll()
        .data(healthData)
        .enter()
        .append("text")
        //.text(d => d.abbr)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("font-size", "9px")
        .classed("stateText", true);

     // Create group for x-axis labels
     var xlabelsGroup = chartGroup.append("g")
     .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "BRR3M") // value to grab for event listener
        .classed("active", true)
        .text("Three Month Benchmark RoR (%)");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "BRR6M") // value to grab for event listener
        .classed("inactive", true)
        .text("Six Month Benchmark RoR (%)");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "BRR12M") // value to grab for event listener
        .classed("inactive", true)
        .text("Twelve Month Benchmark RoR (%)");
    
        // Create group for y-axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", `rotate(-90)`);

    var healthcareLabel = ylabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - 20)
        .attr("value", "TWRR3M") // value to grab for event listener
        .classed("active", true)
        .text("Three Month Timeweighted RoR (%)");

	var obeseLabel = ylabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - 60)
        .attr("value", "TWRR6M") // value to grab for event listener
        .classed("inactive", true)
        .text("Six Month Timeweighted RoR (%)"); 

    var smokesLabel = ylabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - 40)
        .attr("value", "TWRR12M") // value to grab for event listener
        .classed("inactive", true)
        .text("Twelve Month Time Weighted RoR (%)"); 
    
    // updateToolTip function above csv import    
    circles = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    circlesText = renderText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(healthData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxis(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            circlesText = renderText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenXAxis === "BRR3M") {
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
            else if (chosenXAxis === "BRR6M"){
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
            else if (chosenXAxis === "BRR12M"){
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
        }
    });

      // y axis labels event listener
    ylabelsGroup.selectAll("text")
        .on("click", function() {
      // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

          // replaces chosenXAxis with value
            chosenYAxis = value;

            // functions here found above csv import
            // updates y scale for new data
            yLinearScale = yScale(healthData, chosenYAxis);

            // updates y axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);

            // updates circles with new y values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            circlesText = renderText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenYAxis === "TWRR3M") {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "TWRR12M"){
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "TWRR6M"){
                obeseLabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
          }
      }
  });

}).catch(function (error) {
    console.log(error);
});

