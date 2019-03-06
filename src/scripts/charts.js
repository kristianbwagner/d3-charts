import * as d3 from 'd3';
const charts = {};

charts.column = (chartConfig) => {
   const bottomXAxis = chartConfig.bottomXAxis || {};
   const leftYAxis = chartConfig.leftYAxis || {};
   const margin = chartConfig.margin || {};

   // Chart config
   let chart = {
      container: {
         id: chartConfig.containerId,
         el: "",
         dimensions: {}
      },
      axis: {
         el: ""
      },
      svg: {
         dimensions: {},
         el: ""
      },
      g: {
         dimensions: {},
         el: "",
         clip: "",
         margin: {
            top: margin.top !== undefined ? margin.top : 36,
            right: margin.right !== undefined ? margin.right : 36,
            bottom: margin.bottom !== undefined ? margin.bottom : 36,
            left: margin.left !== undefined ? margin.left : 50
         }
      },
      dataset: chartConfig.dataset || [],
      bottomXAxis: {
         el: "",
         min: bottomXAxis.min !== undefined ? bottomXAxis.min : null,
         max: bottomXAxis.max !== undefined ? bottomXAxis.max : null
      },
      leftYAxis: {
         el: "",
         min: leftYAxis.min !== undefined ? leftYAxis.min : null,
         max: leftYAxis.max !== undefined ? leftYAxis.max : null
      }
   };

   // Chart object with relevant methods
   const chartObject = {

      // Used to add base svg elements, only called once per chart
      init: () => {

         // Get a reference to the container and store dimensions
         chart.container.el = d3.select(chart.container.id);
         chart.container.dimensions = chart.container.el.node().getBoundingClientRect();

         // Create svg element
         chart.svg.el = chart.container.el.append("svg")
            .attr("class", "chart-svg")
            .attr("width", chart.container.dimensions.width)
            .attr("height", chart.container.dimensions.height);

         // Create dimensions for main group
         chart.g.dimensions.width = +chart.container.dimensions.width - chart.g.margin.left - chart.g.margin.right;
         chart.g.dimensions.height = +chart.container.dimensions.height - chart.g.margin.top - chart.g.margin.bottom;

         // Create a group for axis elements
         chart.axis.el = chart.svg.el.append("g")
            .attr("class", "axis-group")
            .attr("transform", "translate(" + chart.g.margin.left + "," + chart.g.margin.top + ")")

         // Create main group
         chart.g.el = chart.svg.el.append("g")
            .attr("class", "chart-group")
            .attr("transform", "translate(" + chart.g.margin.left + "," + chart.g.margin.top + ")")

         // Create x axis
         chart.bottomXAxis.el = chart.axis.el.append("g")
            .attr("class", "bottom-x-axis")
            .attr("transform", "translate(0," + chart.g.dimensions.height + ")");

         // Create y axis
         chart.leftYAxis.el = chart.axis.el.append("g")
            .attr("class", "left-y-axis");

         // Create hover overlay
         chart.svg.el.append("rect")
            .attr("class", "overlay")
            .style("opacity", 0)
            .attr("transform", "translate(" + chart.g.margin.left + "," + chart.g.margin.top + ")")
            .attr("width", chart.g.dimensions.width)
            .attr("height", chart.g.dimensions.height)	

         // Make first chart update
         chartObject.update(chart.dataset);

      },
      update: (update) => {

         // Update dataset and dimensions
         chart.dataset = update.dataset || chart.dataset;
         chart.container.dimensions = chart.container.el.node().getBoundingClientRect();

         // Update svg dimensions
         chart.svg.el.attr("width", chart.container.dimensions.width).attr("height", chart.container.dimensions.height);

         // Update dimensions and margins og main group
         chart.g.dimensions.width = +chart.container.dimensions.width - chart.g.margin.left - chart.g.margin.right;
         chart.g.dimensions.height = +chart.container.dimensions.height - chart.g.margin.top - chart.g.margin.bottom;
         chart.g.el.attr("transform", "translate(" + chart.g.margin.left + "," + chart.g.margin.top + ")")
         
         // Update overlay dimensions
         chart.svg.el.selectAll(".overlay")
            .attr("transform", "translate(" + chart.g.margin.left + "," + chart.g.margin.top + ")")
            .attr("width", chart.g.dimensions.width)
            .attr("height", chart.g.dimensions.height)

         // Set min and max values for left axis
         chart.leftYAxis.min = d3.min(chart.dataset.values, d => d.y);
         chart.leftYAxis.max = d3.max(chart.dataset.values, d => d.y)
         
         // Update left axis
         const leftYDomain = [chart.leftYAxis.min, chart.leftYAxis.max];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.g.dimensions.height, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const gridlineLength = -chart.g.dimensions.width;
         const leftYAxis = d3.axisLeft(leftYScale).tickSize(gridlineLength);
         chart.leftYAxis.el.call(leftYAxis);

         // Update bottom axis
         const bottomXDomain = chart.dataset.values.map(d => d.x);
         const bottomXScale = d3
            .scaleBand() // Type of scale used for axis
            .rangeRound([0, chart.g.dimensions.width]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis
            .padding(0.1) // Padding between columns
         const bottomXAxis = d3.axisBottom(bottomXScale);
         chart.bottomXAxis.scale = bottomXScale;
         chart.bottomXAxis.el.call(bottomXAxis);

         // Create a reference to all columns and assign data
         const columns = chart.g.el.selectAll(".column").data(
            chart.dataset.values,
            (d) => d.x // Used as a key (identifier) per data row. Used to determine which rows have been added, remained same or removed
         );
         
         // .enter handles all new rows that are added
         columns.enter()
            .append("rect")
            .attr("class", "column")
            .attr("width", bottomXScale.bandwidth())
            .attr("height", d => chart.g.dimensions.height - leftYScale(d.y))
            .attr("y", d => leftYScale(d.y))
            .attr("x", d => bottomXScale(d.x))

         // Update existing columns
         columns
            .attr("width", bottomXScale.bandwidth())
            .attr("height", d => chart.g.dimensions.height - leftYScale(d.y))
            .attr("y", d => leftYScale(d.y))
            .attr("x", d => bottomXScale(d.x))

         // .exit handles columns that are being removed
         columns.exit()
            .remove();
            
      },
      mouseOver: (callback) => {
         chart.svg.el.selectAll(".overlay")
            .on("mouseover", () => callback())
      },
      mouseOut: (callback) => {
         chart.svg.el.selectAll(".overlay")
            .on("mouseout", () => callback())
      },
      mouseMove: (callback) => {
         chart.svg.el.selectAll(".overlay")
            .on("mouseover", () => {})
            .on("mouseout", () => {})
            .on("mousemove", (d, i, nodes) => {

               // Get coordinates of mouse
               const mouseCoordinates = d3.mouse(nodes[i]);
               const mouseX = mouseCoordinates[0];
               const mouseY = mouseCoordinates[1];

               // Get all values on x axis
               const xValues = chart.bottomXAxis.scale.domain();

               // Calculate center points of all columns
               const columnCenterPoints = xValues.map(d => chart.bottomXAxis.scale(d) + (chart.bottomXAxis.scale.bandwidth() / 2));

               // Get distances to x mouse position
               const distancesToMouseX = xValues.map((d, i) => Math.abs(columnCenterPoints[i] - mouseX));

               // Calculate closest column
               let closestColumnIndex = 0;
               let closestDistance = distancesToMouseX[0];
               distancesToMouseX.forEach((d, i) => {
                  if (d < closestDistance) {
                     closestColumnIndex = i;
                     closestDistance = d;
                  }
               })
               const closestColumn = chart.dataset.values[closestColumnIndex];

               // Send information about hover in callback
               callback({
                  name: closestColumn.x,
                  left: columnCenterPoints[closestColumnIndex] + chart.g.margin.left,
                  top: mouseY + chart.g.margin.top,
                  y: closestColumn.y,
               })
            })
      },
      delete: () => {
         chart.svg.el.remove();
      }
   };

   chartObject.init();
   return chartObject;
};

export default charts