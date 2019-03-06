import * as d3 from 'd3';
const charts = {};

charts.column = (chartConfig) => {
   const bottomXAxis = chartConfig.bottomXAxis || {};
   const leftYAxis = chartConfig.leftYAxis || {};
   const margin = chartConfig.margin || {};

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

   const chartObject = {
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

         // Create main group
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

         // Update dataset
         chart.dataset = update.dataset || chart.dataset;
         chart.container.dimensions = chart.container.el.node().getBoundingClientRect();

         // Update svg
         chart.svg.el.attr("width", chart.container.dimensions.width).attr("height", chart.container.dimensions.height);

         // Update dimensions and margins
         chart.g.dimensions.width = +chart.container.dimensions.width - chart.g.margin.left - chart.g.margin.right;
         chart.g.dimensions.height = +chart.container.dimensions.height - chart.g.margin.top - chart.g.margin.bottom;
         chart.g.el.attr("transform", "translate(" + chart.g.margin.left + "," + chart.g.margin.top + ")")
         
         // Update overlay dimensions
         chart.svg.el.selectAll(".overlay")
            .attr("transform", "translate(" + chart.g.margin.left + "," + chart.g.margin.top + ")")
            .attr("width", chart.g.dimensions.width)
            .attr("height", chart.g.dimensions.height)

         
         chart.leftYAxis.min = d3.min(chart.dataset.values, d => d.y);
         chart.leftYAxis.max = d3.max(chart.dataset.values, d => d.y)
         
         // Update left axis
         const leftYMin = chart.leftYAxis.min;
         const leftYMax = chart.leftYAxis.max;
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3.scaleLinear().rangeRound([chart.g.dimensions.height, 0]).domain(leftYDomain);
         const gridlineLength = -chart.g.dimensions.width;
         const leftYAxis = d3.axisLeft(leftYScale).tickSize(gridlineLength);
         chart.leftYAxis.scale = leftYScale;
         chart.leftYAxis.el.call(leftYAxis);

         // Update bottom axis
         const bottomXDomain = chart.dataset.values.map(d => d.x);
         const bottomXScale = d3.scaleBand().rangeRound([0, chart.g.dimensions.width]).domain(bottomXDomain).padding(0.1);
         const bottomXAxis = d3.axisBottom(bottomXScale);
         chart.bottomXAxis.scale = bottomXScale;
         chart.bottomXAxis.el.call(bottomXAxis);

         // Create group per x group
         const columns = chart.g.el.selectAll(".column").data(chart.dataset.values, (d) => d.x);
         
         columns.enter()
            .append("rect")
            .attr("class", "column")
            .attr("width", bottomXScale.bandwidth())
            .attr("height", d => chart.g.dimensions.height - leftYScale(d.y))
            .attr("y", d => leftYScale(d.y))
            .attr("x", d => bottomXScale(d.x))

         columns
            .attr("width", bottomXScale.bandwidth())
            .attr("height", d => chart.g.dimensions.height - leftYScale(d.y))
            .attr("y", d => leftYScale(d.y))
            .attr("x", d => bottomXScale(d.x))

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
               const mouseCoordinates = d3.mouse(nodes[i]);
               const mouseX = mouseCoordinates[0];
               const mouseY = mouseCoordinates[1];
               const xValues = chart.bottomXAxis.scale.domain();
               const columnCenterPoints = xValues.map(d => chart.bottomXAxis.scale(d) + (chart.bottomXAxis.scale.bandwidth() / 2));
               const distancesToMouseX = xValues.map((d, i) => Math.abs(columnCenterPoints[i] - mouseX));
               let closestColumnIndex = 0;
               let closestDistance = distancesToMouseX[0];
               distancesToMouseX.forEach((d, i) => {
                  if (d < closestDistance) {
                     closestColumnIndex = i;
                     closestDistance = d;
                  }
               })

               const closestColumn = chart.dataset.values[closestColumnIndex];
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