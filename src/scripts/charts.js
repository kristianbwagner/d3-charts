import * as d3 from 'd3';
import _get from 'lodash/get';
const charts = {};


/** 
 * @name column
 * Scale: scaleBand
 * Axes: left, bottom
 **/

charts.column = (chartConfig) => {

   // Chart object with relevant methods
   const chart = {
      config: {
         container: {id: chartConfig.containerId, el: '', dimensions: {}},
         axis: {el: ''},
         overlay: {el: ''},
         svg: {dimensions: {}, el: ''},
         g: {dimensions: {}, el: '', clip: '', margin: {top: 32, right: 32, bottom: 32, left: 50}},
         datasets: {},
         bottomXAxis: {el: '', padding: 0.1},
         leftYAxis: {el: '', min: 'auto', max: 'auto', format: {number: ',.0f', prefix: '', suffix: ''}}
      },
      init: () => {

         // Get a reference to the container and store dimensions
         chart.config.container.el = d3.select(chart.config.container.id);
         chart.config.container.dimensions = chart.config.container.el.node().getBoundingClientRect();

         // Create svg element
         chart.config.svg.el = chart.config.container.el.append('svg')
            .attr('class', 'chart-svg')
            .attr('width', chart.config.container.dimensions.width)
            .attr('height', chart.config.container.dimensions.height);

         // Create dimensions for main group
         chart.config.g.dimensions.width = +chart.config.container.dimensions.width - chart.config.g.margin.left - chart.config.g.margin.right;
         chart.config.g.dimensions.height = +chart.config.container.dimensions.height - chart.config.g.margin.top - chart.config.g.margin.bottom;

         // Create a group for axis elements
         chart.config.axis.el = chart.config.svg.el.append('g')
            .attr('class', 'axis-group')
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')

         // Create main group
         chart.config.g.el = chart.config.svg.el.append('g')
            .attr('class', 'chart-group')
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')

         // Create x axis
         chart.config.bottomXAxis.el = chart.config.axis.el.append('g')
            .attr('class', 'bottom-x-axis')
            .attr('transform', 'translate(0,' + chart.config.g.dimensions.height + ')');

         // Create y axis
         chart.config.leftYAxis.el = chart.config.axis.el.append('g')
            .attr('class', 'left-y-axis');

         // Create hover overlay
         chart.config.overlay.el = chart.config.svg.el.append('rect')
            .attr('class', 'overlay')
            .style('opacity', 0)
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
            .attr('width', chart.config.g.dimensions.width)
            .attr('height', chart.config.g.dimensions.height)	

      },
      update: (updates) => {

         // Define all possible updates
         if (updates !== undefined) {

            const updateConfigValue = (path, defaultValue) => {
               const updateValue = _get(updates, path);
               return updateValue !== undefined ? updateValue : defaultValue
            }

            // Dimension
            chart.config.g.margin.top = updateConfigValue('margin.top', chart.config.g.margin.top);
            chart.config.g.margin.right = updateConfigValue('margin.right', chart.config.g.margin.right);
            chart.config.g.margin.bottom = updateConfigValue('margin.bottom', chart.config.g.margin.bottom);
            chart.config.g.margin.left = updateConfigValue('margin.left', chart.config.g.margin.left);

            // Update datasets
            Object.keys(updates.datasets).forEach(key => {
               if (updates.datasets[key] === null) {
                  delete chart.config.datasets[key];
               } else if (!chart.config.datasets.hasOwnProperty(key)) {
                  chart.config.datasets[key] = updates.datasets[key];
               } else {
                  chart.config.datasets[key].values = updateConfigValue(`datasets.${key}.values`, chart.config.datasets[key].values);
                  chart.config.datasets[key].color = updateConfigValue(`datasets.${key}.color`, chart.config.datasets[key].color);
                  chart.config.datasets[key].borderRadius = updateConfigValue(`datasets.${key}.borderRadius`, chart.config.datasets[key].borderRadius);
               }
            })

            // LeftYAxis
            chart.config.leftYAxis.min = updateConfigValue('leftYAxis.min', chart.config.leftYAxis.min);
            chart.config.leftYAxis.max = updateConfigValue('leftYAxis.max', chart.config.leftYAxis.max);
            chart.config.leftYAxis.format.number = updateConfigValue('leftYAxis.format.number', chart.config.leftYAxis.format.number);
            chart.config.leftYAxis.format.prefix = updateConfigValue('leftYAxis.format.prefix', chart.config.leftYAxis.format.prefix);
            chart.config.leftYAxis.format.suffix = updateConfigValue('leftYAxis.format.suffix', chart.config.leftYAxis.format.suffix);

            // BottomXAxis
            chart.config.bottomXAxis.padding = updateConfigValue('bottomXAxis.padding', chart.config.bottomXAxis.padding);
         }
         
         // Update dataset and dimensions
         chart.config.container.dimensions = chart.config.container.el.node().getBoundingClientRect();

         // Update svg dimensions
         chart.config.svg.el.attr('width', chart.config.container.dimensions.width).attr('height', chart.config.container.dimensions.height);
         chart.config.axis.el.attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')');

         // Update dimensions and margins og main group
         chart.config.g.dimensions.width = +chart.config.container.dimensions.width - chart.config.g.margin.left - chart.config.g.margin.right;
         chart.config.g.dimensions.height = +chart.config.container.dimensions.height - chart.config.g.margin.top - chart.config.g.margin.bottom;
         chart.config.g.el.attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
         
         // Update overlay dimensions
         chart.config.overlay.el
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
            .attr('width', chart.config.g.dimensions.width)
            .attr('height', chart.config.g.dimensions.height)

         // Set min and max values for left axis
         let leftYMin = chart.config.leftYAxis.min === 'auto'
            ? d3.min(Object.values(chart.config.datasets).map(d => d3.min(d.values, v => v.y)))
            : chart.config.leftYAxis.min
         leftYMin = d3.min([0, leftYMin]);
         
         let leftYMax = chart.config.leftYAxis.max === 'auto'
            ? d3.max(Object.values(chart.config.datasets).map(d => d3.max(d.values, v => v.y)))
            : chart.config.leftYAxis.max 
         leftYMax = d3.max([0, leftYMax]);

         // Update left axis
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.config.g.dimensions.height, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.config.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const gridlineLength = -chart.config.g.dimensions.width;
         const leftYAxis = d3
            .axisLeft(leftYScale)
            .tickSize(gridlineLength)
            .tickFormat(d => {
               const formatter = chart.config.leftYAxis.format || {};
               const formattedValue = `${formatter.prefix} ${d3.format(formatter.number)(d)} ${formatter.suffix}`
               return formattedValue;
            })
         chart.config.leftYAxis.el.call(leftYAxis);

         // Update bottom axis
         let bottomXDomain = []
         Object.values(chart.config.datasets).forEach(d => d.values.forEach(v => {
            if (bottomXDomain.indexOf(v.x) === -1){bottomXDomain.push(v.x)}
         }));
         
         bottomXDomain = bottomXDomain.sort((a,b) => {
            if (a < b) { return -1; }
            if (a > b) { return 1; }
            return 0;
         });

         const bottomXScale = d3
            .scaleBand() // Type of scale used for axis
            .rangeRound([0, chart.config.g.dimensions.width]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis
            .padding(chart.config.bottomXAxis.padding) // Padding between columns
         const bottomXAxis = d3.axisBottom(bottomXScale);
         chart.config.bottomXAxis.scale = bottomXScale;
         chart.config.bottomXAxis.el.call(bottomXAxis);

         // Create column data
         const columnGroupData = bottomXDomain.map(groupName => {
            const groupValues = Object.keys(chart.config.datasets).map(datasetName => {
               const dataset = chart.config.datasets[datasetName];
               const values = dataset.values;
               const matched = values.filter(d => d.x === groupName)[0] || {};
               return {
                  y: matched.y || 0,
                  x: datasetName,
                  color: dataset.color
               }
            });
            return {
               x: groupName,
               values: groupValues
            }
         })

         const columnGroup = chart.config.g.el.selectAll(".column-group").data(columnGroupData, (d) => d.x);

         columnGroup.enter()
				.append("g")
				.attr("class", "column-group")
				.attr("transform", d => "translate(" + bottomXScale(d.x) + ", 0)")
            .attr("width", bottomXScale.bandwidth())
            .selectAll(".column").data(d => d.values, k => k.x)
               .enter().append("rect")
               .attr("class", "column")
               .attr('width', d => bottomXScale.bandwidth())
               .attr('rx', 2)
               .style('fill', d => d.color)
               .attr('height', d => {
                  return d.y < 0 
                     ? leftYScale(d.y) - leftYScale(0)
                     : leftYScale(0) - leftYScale(d.y)
               })
               .attr('y', d => d.y < 0 ? leftYScale(0) : leftYScale(d.y))
               .attr('x', d => bottomXScale(d.x))
            
         // Update groups
         columnGroup
            .attr("transform", d => "translate(" + bottomXScale(d.x) + ", 0)")
            .attr("width", bottomXScale.bandwidth())

         // Delete groups
         columnGroup.exit().remove();

         // Create reference to existing columns
         const existingColumns = columnGroup.selectAll(".column").data(d => d.values, k => k.x);

         // Add new columns 
         existingColumns.enter()
            .append("rect")
            .attr("class", "column")
            .attr('width', d => bottomXScale.bandwidth())
            .attr('rx', 2)
            .style('fill', d => d.color)
            .attr('height', d => {
               return d.y < 0 
                  ? leftYScale(d.y) - leftYScale(0)
                  : leftYScale(0) - leftYScale(d.y)
            })
            .attr('y', d => d.y < 0 ? leftYScale(0) : leftYScale(d.y))
            .attr('x', d => bottomXScale(d.x))

         // Update existing columns 
         existingColumns
            .attr('width', d => bottomXScale.bandwidth())
            .attr('rx', 2)
            .style('fill', d => d.color)
            .attr('height', d => {
               return d.y < 0 
                  ? leftYScale(d.y) - leftYScale(0)
                  : leftYScale(0) - leftYScale(d.y)
            })
            .attr('y', d => d.y < 0 ? leftYScale(0) : leftYScale(d.y))
            .attr('x', d => bottomXScale(d.x))

         // Remove deleting columns 
         existingColumns.exit().remove();
            
      },
      mouseOver: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseover', () => callback())
      },
      mouseOut: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseout', () => callback())
      },
      mouseMove: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseover', () => {})
            .on('mouseout', () => {})
            .on('mousemove', (d, i, nodes) => {

               // Get coordinates of mouse
               const mouseCoordinates = d3.mouse(nodes[i]);
               const mouseX = mouseCoordinates[0];
               const mouseY = mouseCoordinates[1];

               // Get all values on x axis
               const xValues = chart.config.bottomXAxis.scale.domain();

               // Calculate center points of all columns
               const columnCenterPoints = xValues.map(d => chart.config.bottomXAxis.scale(d) + (chart.config.bottomXAxis.scale.bandwidth() / 2));

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

               const closestGroup = xValues[closestColumnIndex];
               const closestValues = Object.values(chart.config.datasets).map(d => {
                  const groupValues = d.values.filter(d => d.x === closestGroup) || [];
                  const firstMatch = groupValues[0] || {};
                  return firstMatch.y;
               })

               // Send information about hover in callback
               callback({
                  name: closestGroup,
                  left: columnCenterPoints[closestColumnIndex] + chart.config.g.margin.left,
                  top: mouseY + chart.config.g.margin.top,
                  y: closestValues,
               })
            })
      },
      delete: () => {
         chart.config.svg.el.remove();
      }
   };

   chart.init();
   chart.update(chartConfig);
   return chart;
};


/** 
 * @name groupedColumn
 * Scale: scaleBand
 * Axes: left, bottom
 **/

charts.groupedColumn = (chartConfig) => {

   // Chart object with relevant methods
   const chart = {
      config: {
         container: {id: chartConfig.containerId, el: '', dimensions: {}},
         axis: {el: ''},
         overlay: {el: ''},
         svg: {dimensions: {}, el: ''},
         g: {dimensions: {}, el: '', clip: '', margin: {top: 32, right: 32, bottom: 32, left: 50}},
         dataset: {name: '', values: [], color: '', borderRadius: ''},
         bottomXAxis: {el: '', padding: 0.1},
         leftYAxis: {el: '', min: 'auto', max: 'auto', format: {number: ',.0f', prefix: '', suffix: ''}}
      },
      init: () => {

         // Get a reference to the container and store dimensions
         chart.config.container.el = d3.select(chart.config.container.id);
         chart.config.container.dimensions = chart.config.container.el.node().getBoundingClientRect();

         // Create svg element
         chart.config.svg.el = chart.config.container.el.append('svg')
            .attr('class', 'chart-svg')
            .attr('width', chart.config.container.dimensions.width)
            .attr('height', chart.config.container.dimensions.height);

         // Create dimensions for main group
         chart.config.g.dimensions.width = +chart.config.container.dimensions.width - chart.config.g.margin.left - chart.config.g.margin.right;
         chart.config.g.dimensions.height = +chart.config.container.dimensions.height - chart.config.g.margin.top - chart.config.g.margin.bottom;

         // Create a group for axis elements
         chart.config.axis.el = chart.config.svg.el.append('g')
            .attr('class', 'axis-group')
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')

         // Create main group
         chart.config.g.el = chart.config.svg.el.append('g')
            .attr('class', 'chart-group')
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')

         // Create x axis
         chart.config.bottomXAxis.el = chart.config.axis.el.append('g')
            .attr('class', 'bottom-x-axis')
            .attr('transform', 'translate(0,' + chart.config.g.dimensions.height + ')');

         // Create y axis
         chart.config.leftYAxis.el = chart.config.axis.el.append('g')
            .attr('class', 'left-y-axis');

         // Create hover overlay
         chart.config.overlay.el = chart.config.svg.el.append('rect')
            .attr('class', 'overlay')
            .style('opacity', 0)
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
            .attr('width', chart.config.g.dimensions.width)
            .attr('height', chart.config.g.dimensions.height)	

      },
      update: (updates) => {


         // Define all possible updates
         if (updates !== undefined) {

            const updateConfigValue = (path, defaultValue) => {
               const updateValue = _get(updates, path); 
               return updateValue !== undefined ? updateValue : defaultValue
            }

            // Dimension
            chart.config.g.margin.top = updateConfigValue('margin.top', chart.config.g.margin.top);
            chart.config.g.margin.right = updateConfigValue('margin.right', chart.config.g.margin.right);
            chart.config.g.margin.bottom = updateConfigValue('margin.bottom', chart.config.g.margin.bottom);
            chart.config.g.margin.left = updateConfigValue('margin.left', chart.config.g.margin.left);

            chart.config.datasets = updateConfigValue('datasets', chart.config.datasets);
            
            // LeftYAxis
            chart.config.leftYAxis.min = updateConfigValue('leftYAxis.min', chart.config.leftYAxis.min);
            chart.config.leftYAxis.max = updateConfigValue('leftYAxis.max', chart.config.leftYAxis.max);
            chart.config.leftYAxis.format.number = updateConfigValue('leftYAxis.format.number', chart.config.leftYAxis.format.number);
            chart.config.leftYAxis.format.prefix = updateConfigValue('leftYAxis.format.prefix', chart.config.leftYAxis.format.prefix);
            chart.config.leftYAxis.format.suffix = updateConfigValue('leftYAxis.format.suffix', chart.config.leftYAxis.format.suffix);

            // BottomXAxis
            chart.config.bottomXAxis.padding = updateConfigValue('bottomXAxis.padding', chart.config.bottomXAxis.padding);
         }
         
         // Update dataset and dimensions
         chart.config.container.dimensions = chart.config.container.el.node().getBoundingClientRect();

         // Update svg dimensions
         chart.config.svg.el.attr('width', chart.config.container.dimensions.width).attr('height', chart.config.container.dimensions.height);
         chart.config.axis.el.attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')');

         // Update dimensions and margins og main group
         chart.config.g.dimensions.width = +chart.config.container.dimensions.width - chart.config.g.margin.left - chart.config.g.margin.right;
         chart.config.g.dimensions.height = +chart.config.container.dimensions.height - chart.config.g.margin.top - chart.config.g.margin.bottom;
         chart.config.g.el.attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
         
         // Update overlay dimensions
         chart.config.overlay.el
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
            .attr('width', chart.config.g.dimensions.width)
            .attr('height', chart.config.g.dimensions.height)

         // Set min and max values for left axis
         let leftYMin = chart.config.leftYAxis.min === 'auto'
            ? d3.min(Object.values(chart.config.datasets).map(d => d3.max(d.values, d => d.y)))
            : chart.config.leftYAxis.min; 
         leftYMin = d3.min([0, leftYMin]);

         let leftYMax = chart.config.leftYAxis.max === 'auto'
            ? d3.max(Object.values(chart.config.datasets).map(d => d3.max(d.values, d => d.y)))
            : chart.config.leftYAxis.max;
         leftYMax = d3.max([0, leftYMax]);

         // Update left axis
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.config.g.dimensions.height, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.config.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const gridlineLength = -chart.config.g.dimensions.width;
         const leftYAxis = d3
            .axisLeft(leftYScale)
            .tickSize(gridlineLength)
            .tickFormat(d => {
               const formatter = chart.config.leftYAxis.format || {};
               const formattedValue = `${formatter.prefix} ${d3.format(formatter.number)(d)} ${formatter.suffix}`
               return formattedValue;
            })
         chart.config.leftYAxis.el.call(leftYAxis);

         // Get all x values from all datasets
         let bottomXDomain = []
         Object.values(chart.config.datasets).forEach(d => d.values.forEach(v => {
            if (bottomXDomain.indexOf(v.x) === -1){
               bottomXDomain.push(v.x)
            }
         }));
         
         bottomXDomain = bottomXDomain.sort((a,b) => {
            if (a < b) { return -1; }
            if (a > b) { return 1; }
            return 0;
         });

         const bottomXScale = d3
            .scaleBand() // Type of scale used for axis
            .rangeRound([0, chart.config.g.dimensions.width]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis
            .padding(chart.config.bottomXAxis.padding) // Padding between columns
         const bottomXAxis = d3.axisBottom(bottomXScale);
         chart.config.bottomXAxis.scale = bottomXScale;
         chart.config.bottomXAxis.el.call(bottomXAxis);

         let bottomXGroupDomain = Object.keys(chart.config.datasets);
         const bottomXGroupScale = d3
            .scaleBand() // Type of scale used for axis
            .rangeRound([0, bottomXScale.bandwidth()]) // The range of the axis
            .domain(bottomXGroupDomain) // The values on the axis
            .padding(0.1)

         // Create column data
         const columnGroupData = bottomXDomain.map(groupName => {
            const groupValues = Object.keys(chart.config.datasets).map(datasetName => {
               const dataset = chart.config.datasets[datasetName];
               const values = dataset.values;
               const matched = values.filter(d => d.x === groupName)[0] || {};
               return {
                  y: matched.y || 0,
                  x: datasetName,
                  color: dataset.color
               }
            });
            return {
               x: groupName,
               values: groupValues
            }
         })

         const columnGroup = chart.config.g.el.selectAll(".column-group").data(columnGroupData, (d) => d.x);

         columnGroup.enter()
				.append("g")
				.attr("class", "column-group")
				.attr("transform", d => "translate(" + bottomXScale(d.x) + ", 0)")
            .attr("width", bottomXScale.bandwidth())
            .selectAll(".column").data(d => d.values, k => k.x)
               .enter().append("rect")
               .attr("class", "column")
               .attr('width', d => bottomXGroupScale.bandwidth())
               .attr('rx', 2)
               .style('fill', d => d.color)
               .attr('height', d => {
                  return d.y < 0 
                     ? leftYScale(d.y) - leftYScale(0)
                     : leftYScale(0) - leftYScale(d.y)
               })
               .attr('y', d => d.y < 0 ? leftYScale(0) : leftYScale(d.y))
               .attr('x', d => bottomXGroupScale(d.x))
            
         // Update groups
         columnGroup
            .attr("transform", d => "translate(" + bottomXScale(d.x) + ", 0)")
            .attr("width", bottomXScale.bandwidth())

         // Delete groups
         columnGroup.exit().remove();

         // Create reference to existing columns
         const existingColumns = columnGroup.selectAll(".column").data(d => d.values, k => k.x);

         existingColumns.enter()
            .append("rect")
            .attr("class", "column")
            .attr('width', d => bottomXGroupScale.bandwidth())
            .attr('rx', 2)
            .style('fill', d => d.color)
            .attr('height', d => {
               return d.y < 0 
                  ? leftYScale(d.y) - leftYScale(0)
                  : leftYScale(0) - leftYScale(d.y)
            })
            .attr('y', d => d.y < 0 ? leftYScale(0) : leftYScale(d.y))
            .attr('x', d => bottomXGroupScale(d.x))

         existingColumns
            .attr('width', d => bottomXGroupScale.bandwidth())
            .attr('rx', 2)
            .style('fill', d => d.color)
            .attr('height', d => {
               return d.y < 0 
                  ? leftYScale(d.y) - leftYScale(0)
                  : leftYScale(0) - leftYScale(d.y)
            })
            .attr('y', d => d.y < 0 ? leftYScale(0) : leftYScale(d.y))
            .attr('x', d => bottomXGroupScale(d.x))

         existingColumns.exit().remove();
            
      },
      mouseOver: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseover', () => callback())
      },
      mouseOut: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseout', () => callback())
      },
      mouseMove: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseover', () => {})
            .on('mouseout', () => {})
            .on('mousemove', (d, i, nodes) => {

               // Get coordinates of mouse
               const mouseCoordinates = d3.mouse(nodes[i]);
               const mouseX = mouseCoordinates[0];
               const mouseY = mouseCoordinates[1];

               // Get all values on x axis
               const xValues = chart.config.bottomXAxis.scale.domain();

               // Calculate center points of all columns
               const columnCenterPoints = xValues.map(d => chart.config.bottomXAxis.scale(d) + (chart.config.bottomXAxis.scale.bandwidth() / 2));

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

               const closestGroup = xValues[closestColumnIndex];
               const closestValues = Object.values(chart.config.datasets).map(d => {
                  const groupValues = d.values.filter(d => d.x === closestGroup) || [];
                  const firstMatch = groupValues[0] || {};
                  return firstMatch.y;
               })

               // Send information about hover in callback
               callback({
                  name: closestGroup,
                  left: columnCenterPoints[closestColumnIndex] + chart.config.g.margin.left,
                  top: mouseY + chart.config.g.margin.top,
                  y: closestValues,
               })
            })
      },
      delete: () => {
         chart.config.svg.el.remove();
      }
   };

   chart.init();
   chart.update(chartConfig);
   return chart;
};

/** 
 * @name stackedColumn
 * Scale: scaleBand
 * Axes: left, bottom
 **/


charts.stackedColumn = (chartConfig) => {

   // Chart object with relevant methods
   const chart = {
      config: {
         container: {id: chartConfig.containerId, el: '', dimensions: {}},
         axis: {el: ''},
         overlay: {el: ''},
         svg: {dimensions: {}, el: ''},
         g: {dimensions: {}, el: '', clip: '', margin: {top: 32, right: 32, bottom: 32, left: 50}},
         datasets: {},
         bottomXAxis: {el: '', padding: 0.1},
         leftYAxis: {el: '', min: 'auto', max: 'auto', format: {number: ',.0f', prefix: '', suffix: ''}}
      },
      init: () => {

         // Get a reference to the container and store dimensions
         chart.config.container.el = d3.select(chart.config.container.id);
         chart.config.container.dimensions = chart.config.container.el.node().getBoundingClientRect();

         // Create svg element
         chart.config.svg.el = chart.config.container.el.append('svg')
            .attr('class', 'chart-svg')
            .attr('width', chart.config.container.dimensions.width)
            .attr('height', chart.config.container.dimensions.height);

         // Create dimensions for main group
         chart.config.g.dimensions.width = +chart.config.container.dimensions.width - chart.config.g.margin.left - chart.config.g.margin.right;
         chart.config.g.dimensions.height = +chart.config.container.dimensions.height - chart.config.g.margin.top - chart.config.g.margin.bottom;

         // Create a group for axis elements
         chart.config.axis.el = chart.config.svg.el.append('g')
            .attr('class', 'axis-group')
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')

         // Create main group
         chart.config.g.el = chart.config.svg.el.append('g')
            .attr('class', 'chart-group')
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')

         // Create x axis
         chart.config.bottomXAxis.el = chart.config.axis.el.append('g')
            .attr('class', 'bottom-x-axis')
            .attr('transform', 'translate(0,' + chart.config.g.dimensions.height + ')');

         // Create y axis
         chart.config.leftYAxis.el = chart.config.axis.el.append('g')
            .attr('class', 'left-y-axis');

         // Create hover overlay
         chart.config.overlay.el = chart.config.svg.el.append('rect')
            .attr('class', 'overlay')
            .style('opacity', 0)
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
            .attr('width', chart.config.g.dimensions.width)
            .attr('height', chart.config.g.dimensions.height)	

      },
      update: (updates) => {

         // Define all possible updates
         if (updates !== undefined) {

            const updateConfigValue = (path, defaultValue) => {
               const updateValue = _get(updates, path);
               return updateValue !== undefined ? updateValue : defaultValue
            }

            // Dimension
            chart.config.g.margin.top = updateConfigValue('margin.top', chart.config.g.margin.top);
            chart.config.g.margin.right = updateConfigValue('margin.right', chart.config.g.margin.right);
            chart.config.g.margin.bottom = updateConfigValue('margin.bottom', chart.config.g.margin.bottom);
            chart.config.g.margin.left = updateConfigValue('margin.left', chart.config.g.margin.left);

            // Update datasets
            Object.keys(updates.datasets).forEach(key => {
               if (updates.datasets[key] === null) {
                  delete chart.config.datasets[key];
               } else if (!chart.config.datasets.hasOwnProperty(key)) {
                  chart.config.datasets[key] = updates.datasets[key];
               } else {
                  chart.config.datasets[key].values = updateConfigValue(`datasets.${key}.values`, chart.config.datasets[key].values);
                  chart.config.datasets[key].color = updateConfigValue(`datasets.${key}.color`, chart.config.datasets[key].color);
                  chart.config.datasets[key].borderRadius = updateConfigValue(`datasets.${key}.borderRadius`, chart.config.datasets[key].borderRadius);
               }
            })

            // LeftYAxis
            chart.config.leftYAxis.min = updateConfigValue('leftYAxis.min', chart.config.leftYAxis.min);
            chart.config.leftYAxis.max = updateConfigValue('leftYAxis.max', chart.config.leftYAxis.max);
            chart.config.leftYAxis.format.number = updateConfigValue('leftYAxis.format.number', chart.config.leftYAxis.format.number);
            chart.config.leftYAxis.format.prefix = updateConfigValue('leftYAxis.format.prefix', chart.config.leftYAxis.format.prefix);
            chart.config.leftYAxis.format.suffix = updateConfigValue('leftYAxis.format.suffix', chart.config.leftYAxis.format.suffix);

            // BottomXAxis
            chart.config.bottomXAxis.padding = updateConfigValue('bottomXAxis.padding', chart.config.bottomXAxis.padding);
         }
         
         // Update dataset and dimensions
         chart.config.container.dimensions = chart.config.container.el.node().getBoundingClientRect();

         // Update svg dimensions
         chart.config.svg.el.attr('width', chart.config.container.dimensions.width).attr('height', chart.config.container.dimensions.height);
         chart.config.axis.el.attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')');

         // Update dimensions and margins og main group
         chart.config.g.dimensions.width = +chart.config.container.dimensions.width - chart.config.g.margin.left - chart.config.g.margin.right;
         chart.config.g.dimensions.height = +chart.config.container.dimensions.height - chart.config.g.margin.top - chart.config.g.margin.bottom;
         chart.config.g.el.attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
         
         // Update overlay dimensions
         chart.config.overlay.el
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
            .attr('width', chart.config.g.dimensions.width)
            .attr('height', chart.config.g.dimensions.height)

         // Update bottom axis
         let bottomXDomain = []
         Object.values(chart.config.datasets).forEach(d => d.values.forEach(v => {
            if (bottomXDomain.indexOf(v.x) === -1){bottomXDomain.push(v.x)}
         }));
         
         bottomXDomain = bottomXDomain.sort((a,b) => {
            if (a < b) { return -1; }
            if (a > b) { return 1; }
            return 0;
         });

         const bottomXScale = d3
            .scaleBand() // Type of scale used for axis
            .rangeRound([0, chart.config.g.dimensions.width]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis
            .padding(chart.config.bottomXAxis.padding) // Padding between columns
         const bottomXAxis = d3.axisBottom(bottomXScale);
         chart.config.bottomXAxis.scale = bottomXScale;
         chart.config.bottomXAxis.el.call(bottomXAxis);

         // Stacked Data
         const columnGroupData = bottomXDomain.map(groupName => {
            const datasetNames = Object.keys(chart.config.datasets);
            const groupValues = datasetNames.map(datasetName => {
               const dataset = chart.config.datasets[datasetName];
               const values = dataset.values;
               const matched = values.filter(d => d.x === groupName)[0] || {};
               return {
                  y: matched.y || 0,
                  x: datasetName,
                  color: dataset.color
               }
            });

            // Stack Data
            groupValues.forEach((d, i) => {
               const previousValue = groupValues[i-1] || {};
               const previousY1 = previousValue.y1 || 0;
               d.y1 = previousY1 + d.y;
               d.y0 = previousY1;
            })

            return {
               x: groupName,
               values: groupValues
            }
         })

         // Calculate group totals
         const groupTotals = columnGroupData.map(d => {
            const groupValues = d.values;
            const lastGroup = groupValues[groupValues.length - 1];
            return lastGroup.y1 || 0;
         })

         // Set min and max values for left axis
         let leftYMin = 0
         let leftYMax = chart.config.leftYAxis.max === 'auto'
            ? d3.max(groupTotals)
            : chart.config.leftYAxis.max 
         leftYMax = d3.max([0, leftYMax]);

         // Update left axis
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.config.g.dimensions.height, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.config.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const gridlineLength = -chart.config.g.dimensions.width;
         const leftYAxis = d3
            .axisLeft(leftYScale)
            .tickSize(gridlineLength)
            .tickFormat(d => {
               const formatter = chart.config.leftYAxis.format || {};
               const formattedValue = `${formatter.prefix} ${d3.format(formatter.number)(d)} ${formatter.suffix}`
               return formattedValue;
            })
         chart.config.leftYAxis.el.call(leftYAxis);

         const columnGroup = chart.config.g.el.selectAll(".column-group").data(columnGroupData, (d) => d.x);

         columnGroup.enter()
				.append("g")
				.attr("class", "column-group")
				.attr("transform", d => "translate(" + bottomXScale(d.x) + ", 0)")
            .attr("width", bottomXScale.bandwidth())
            .selectAll(".column").data(d => d.values, k => k.x)
               .enter().append("rect")
               .attr("class", "column")
               .attr('width', d => bottomXScale.bandwidth())
               .style('fill', d => d.color)
               .attr('height', d => leftYScale(d.y0) - leftYScale(d.y1))
               .attr('y', d => leftYScale(d.y1))
               .attr('x', d => bottomXScale(d.x))
            
         // Update groups
         columnGroup
            .attr("transform", d => "translate(" + bottomXScale(d.x) + ", 0)")
            .attr("width", bottomXScale.bandwidth())

         // Delete groups
         columnGroup.exit().remove();

         // Create reference to existing columns
         const existingColumns = columnGroup.selectAll(".column").data(d => d.values, k => k.x);

         // Add new columns 
         existingColumns.enter()
            .append("rect")
            .attr("class", "column")
            .attr('width', d => bottomXScale.bandwidth())
            .style('fill', d => d.color)
            .attr('height', d => leftYScale(d.y0) - leftYScale(d.y1))
            .attr('y', d => leftYScale(d.y1))
            .attr('x', d => bottomXScale(d.x))

         // Update existing columns 
         existingColumns
            .attr('width', d => bottomXScale.bandwidth())
            .style('fill', d => d.color)
            .attr('height', d => leftYScale(d.y0) - leftYScale(d.y1))
            .attr('y', d => leftYScale(d.y1))
            .attr('x', d => bottomXScale(d.x))

         // Remove deleting columns 
         existingColumns.exit().remove();
            
      },
      mouseOver: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseover', () => callback())
      },
      mouseOut: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseout', () => callback())
      },
      mouseMove: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseover', () => {})
            .on('mouseout', () => {})
            .on('mousemove', (d, i, nodes) => {

               // Get coordinates of mouse
               const mouseCoordinates = d3.mouse(nodes[i]);
               const mouseX = mouseCoordinates[0];
               const mouseY = mouseCoordinates[1];

               // Get all values on x axis
               const xValues = chart.config.bottomXAxis.scale.domain();

               // Calculate center points of all columns
               const columnCenterPoints = xValues.map(d => chart.config.bottomXAxis.scale(d) + (chart.config.bottomXAxis.scale.bandwidth() / 2));

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

               const closestGroup = xValues[closestColumnIndex];
               const closestValues = Object.values(chart.config.datasets).map(d => {
                  const groupValues = d.values.filter(d => d.x === closestGroup) || [];
                  const firstMatch = groupValues[0] || {};
                  return firstMatch.y;
               })

               // Send information about hover in callback
               callback({
                  name: closestGroup,
                  left: columnCenterPoints[closestColumnIndex] + chart.config.g.margin.left,
                  top: mouseY + chart.config.g.margin.top,
                  y: closestValues,
               })
            })
      },
      delete: () => {
         chart.config.svg.el.remove();
      }
   };

   chart.init();
   chart.update(chartConfig);
   return chart;
};


/** 
 * @name line
 * Scale: scalePoint
 * Axes: left, bottom
 **/

charts.line = (chartConfig) => {

   // Chart object with relevant methods
   const chart = {
      config: {
         container: {id: chartConfig.containerId, el: '', dimensions: {}},
         axis: {el: ''},
         overlay: {el: ''},
         svg: {dimensions: {}, el: ''},
         g: {dimensions: {}, el: '', clip: '', margin: {top: 32, right: 32, bottom: 32, left: 50}},
         datasets: {},
         bottomXAxis: {el: '', padding: 0.1},
         leftYAxis: {el: '', min: 'auto', max: 'auto', format: {number: ',.0f', prefix: '', suffix: ''}}
      },
      init: () => {

         // Get a reference to the container and store dimensions
         chart.config.container.el = d3.select(chart.config.container.id);
         chart.config.container.dimensions = chart.config.container.el.node().getBoundingClientRect();

         // Create svg element
         chart.config.svg.el = chart.config.container.el.append('svg')
            .attr('class', 'chart-svg')
            .attr('width', chart.config.container.dimensions.width)
            .attr('height', chart.config.container.dimensions.height);

         // Create dimensions for main group
         chart.config.g.dimensions.width = +chart.config.container.dimensions.width - chart.config.g.margin.left - chart.config.g.margin.right;
         chart.config.g.dimensions.height = +chart.config.container.dimensions.height - chart.config.g.margin.top - chart.config.g.margin.bottom;

         // Create a group for axis elements
         chart.config.axis.el = chart.config.svg.el.append('g')
            .attr('class', 'axis-group')
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')

         // Create main group
         chart.config.g.el = chart.config.svg.el.append('g')
            .attr('class', 'chart-group')
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')

         // Create x axis
         chart.config.bottomXAxis.el = chart.config.axis.el.append('g')
            .attr('class', 'bottom-x-axis')
            .attr('transform', 'translate(0,' + chart.config.g.dimensions.height + ')');

         // Create y axis
         chart.config.leftYAxis.el = chart.config.axis.el.append('g')
            .attr('class', 'left-y-axis');

         // Create hover overlay
         chart.config.overlay.el = chart.config.svg.el.append('rect')
            .attr('class', 'overlay')
            .style('opacity', 0)
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
            .attr('width', chart.config.g.dimensions.width)
            .attr('height', chart.config.g.dimensions.height)	

      },
      update: (updates) => {

         // Define all possible updates
         if (updates !== undefined) {

            const updateConfigValue = (path, defaultValue) => {
               const updateValue = _get(updates, path);
               return updateValue !== undefined ? updateValue : defaultValue
            }

            // Dimension
            chart.config.g.margin.top = updateConfigValue('margin.top', chart.config.g.margin.top);
            chart.config.g.margin.right = updateConfigValue('margin.right', chart.config.g.margin.right);
            chart.config.g.margin.bottom = updateConfigValue('margin.bottom', chart.config.g.margin.bottom);
            chart.config.g.margin.left = updateConfigValue('margin.left', chart.config.g.margin.left);

            // Update datasets
            Object.keys(updates.datasets).forEach(key => {
               if (updates.datasets[key] === null) {
                  delete chart.config.datasets[key];
               } else if (!chart.config.datasets.hasOwnProperty(key)) {
                  chart.config.datasets[key] = updates.datasets[key];
               } else {
                  chart.config.datasets[key].values = updateConfigValue(`datasets.${key}.values`, chart.config.datasets[key].values);
                  chart.config.datasets[key].color = updateConfigValue(`datasets.${key}.color`, chart.config.datasets[key].color);
                  chart.config.datasets[key].radius = updateConfigValue(`datasets.${key}.radius`, chart.config.datasets[key].radius);
               }
            })

            // LeftYAxis
            chart.config.leftYAxis.min = updateConfigValue('leftYAxis.min', chart.config.leftYAxis.min);
            chart.config.leftYAxis.max = updateConfigValue('leftYAxis.max', chart.config.leftYAxis.max);
            chart.config.leftYAxis.format.number = updateConfigValue('leftYAxis.format.number', chart.config.leftYAxis.format.number);
            chart.config.leftYAxis.format.prefix = updateConfigValue('leftYAxis.format.prefix', chart.config.leftYAxis.format.prefix);
            chart.config.leftYAxis.format.suffix = updateConfigValue('leftYAxis.format.suffix', chart.config.leftYAxis.format.suffix);

            // BottomXAxis
            chart.config.bottomXAxis.padding = updateConfigValue('bottomXAxis.padding', chart.config.bottomXAxis.padding);
         }

         // Update dataset and dimensions
         chart.config.container.dimensions = chart.config.container.el.node().getBoundingClientRect();

         // Update svg dimensions
         chart.config.svg.el.attr('width', chart.config.container.dimensions.width).attr('height', chart.config.container.dimensions.height);
         chart.config.axis.el.attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')');

         // Update dimensions and margins og main group
         chart.config.g.dimensions.width = +chart.config.container.dimensions.width - chart.config.g.margin.left - chart.config.g.margin.right;
         chart.config.g.dimensions.height = +chart.config.container.dimensions.height - chart.config.g.margin.top - chart.config.g.margin.bottom;
         chart.config.g.el.attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
         
         // Update overlay dimensions
         chart.config.overlay.el
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
            .attr('width', chart.config.g.dimensions.width)
            .attr('height', chart.config.g.dimensions.height)

         // Set min and max values for left axis
         let leftYMin = chart.config.leftYAxis.min === 'auto'
            ? d3.min(Object.values(chart.config.datasets).map(d => d3.min(d.values, v => v.y)))
            : chart.config.leftYAxis.min
         leftYMin = d3.min([0, leftYMin]);
         
         let leftYMax = chart.config.leftYAxis.max === 'auto'
            ? d3.max(Object.values(chart.config.datasets).map(d => d3.max(d.values, v => v.y)))
            : chart.config.leftYAxis.max 
         leftYMax = d3.max([0, leftYMax]);

         // Update left axis
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.config.g.dimensions.height, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.config.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const gridlineLength = -chart.config.g.dimensions.width;
         const leftYAxis = d3
            .axisLeft(leftYScale)
            .tickSize(gridlineLength)
            .tickFormat(d => {
               const formatter = chart.config.leftYAxis.format || {};
               const formattedValue = `${formatter.prefix} ${d3.format(formatter.number)(d)} ${formatter.suffix}`
               return formattedValue;
            })
         chart.config.leftYAxis.el.call(leftYAxis);

         // Update bottom axis
         let bottomXDomain = []
         Object.values(chart.config.datasets).forEach(d => d.values.forEach(v => {
            if (bottomXDomain.indexOf(v.x) === -1){bottomXDomain.push(v.x)}
         }));
         
         bottomXDomain = bottomXDomain.sort((a,b) => {
            if (a < b) { return -1; }
            if (a > b) { return 1; }
            return 0;
         });

         const bottomXScale = d3
            .scalePoint() // Type of scale used for axis
            .rangeRound([0, chart.config.g.dimensions.width]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis
         const bottomXAxis = d3.axisBottom(bottomXScale);
         chart.config.bottomXAxis.scale = bottomXScale;
         chart.config.bottomXAxis.el.call(bottomXAxis);

         const createLine = (dataset) => {
            const line = d3.line()
               .x(d => bottomXScale(d.x))
               .y(d => leftYScale(d.y))
               .defined(d => { return d.y !== undefined})
               .curve(dataset.smooth === true ? d3.curveCatmullRom : d3.curveLinear)
            return line(dataset.values);
         }

         const seriesData = Object.keys(chart.config.datasets).map(d => {
            const dataset = chart.config.datasets[d];
            dataset.name = d;
            dataset.values = bottomXDomain.map(xValue => {
               const xMatches = dataset.values.filter(d => d.x === xValue); 
               const firstMatch = xMatches[0] || {};
               const yValue = firstMatch.y !== undefined ? firstMatch.y : 0;
               return {x: xValue, y: firstMatch.y}
            })
            return dataset
         })

         //console.log(seriesData);

         const series = chart.config.g.el.selectAll(".series-group").data(seriesData, (d) => d.name);

         const newSeries = series.enter().append("g")
            .attr("class", "series-group")

         newSeries.selectAll(".line").data(d => [d], d => d.name).enter()
            .append("path")
            .attr("class", "line")
            .style("stroke-width", d => d.strokeWidth || 3)
            .style("stroke", d => d.color)
            .style("fill", 'none')
            .attr("d", d => createLine(d))

         newSeries.selectAll(".circle").data(d => d.values.map(c => {
            return {x: c.x, y: c.y, color: d.color, radius: d.radius};
         }), d => d.x).enter()
            .append("circle")
            .attr("class", "circle")
            .attr("r", d => d.radius !== undefined ? d.radius : 5)
            .attr("cx", d => bottomXScale(d.x))
            .attr("cy", d => leftYScale(d.y))
            .attr("fill", d => d.color)

         const circles = series.selectAll(".circle").data(d => d.values.map(c => {
            return {x: c.x, y: c.y, color: d.color, radius: d.radius};
         }), d => d.x)

         circles.attr("r", d => d.radius !== undefined ? d.radius : 5)
            .attr("cx", d => bottomXScale(d.x))
            .attr("cy", d => leftYScale(d.y || 0))
            .attr("fill", d => d.y === undefined ? 'none' : d.color)
         
         circles.exit().remove();

         const line = series.selectAll(".line").data(d => [d], d => d.name)

         line.style("stroke-width", d => d.strokeWidth || 3)
            .style("stroke", d => d.color)
            .attr("d", d => createLine(d))

         series.exit().remove();

      },
      mouseOver: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseover', () => callback())
      },
      mouseOut: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseout', () => callback())
      },
      mouseMove: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseover', () => {})
            .on('mouseout', () => {})
            .on('mousemove', (d, i, nodes) => {

               // Get coordinates of mouse
               const mouseCoordinates = d3.mouse(nodes[i]);
               const mouseX = mouseCoordinates[0];
               const mouseY = mouseCoordinates[1];

               // Get all values on x axis
               const xValues = chart.config.bottomXAxis.scale.domain();
               const xLeftPoints = xValues.map(d => chart.config.bottomXAxis.scale(d));
               const distancesToMouseX = xValues.map((d, i) => Math.abs(xLeftPoints[i] - mouseX));

               // Calculate closest column
               let closestColumnIndex = 0;
               let closestDistance = distancesToMouseX[0];
               distancesToMouseX.forEach((d, i) => {
                  if (d < closestDistance) {
                     closestColumnIndex = i;
                     closestDistance = d;
                  }
               })

               const closestGroup = xValues[closestColumnIndex];
               const closestValues = Object.values(chart.config.datasets).map(d => {
                  const groupValues = d.values.filter(d => d.x === closestGroup) || [];
                  const firstMatch = groupValues[0] || {};
                  return firstMatch.y;
               })

               // Send information about hover in callback
               callback({
                  name: closestGroup,
                  left: xLeftPoints[closestColumnIndex] + chart.config.g.margin.left,
                  top: mouseY + chart.config.g.margin.top,
                  y: closestValues,
               })
            })
      },
      delete: () => {
         chart.config.svg.el.remove();
      }
   };

   chart.init();
   chart.update(chartConfig);
   return chart;
};


/** 
 * @name area
 * Scale: scalePoint
 * Axes: left, bottom
 **/

charts.area = (chartConfig) => {

   // Chart object with relevant methods
   const chart = {
      config: {
         container: {id: chartConfig.containerId, el: '', dimensions: {}},
         axis: {el: ''},
         overlay: {el: ''},
         svg: {dimensions: {}, el: ''},
         g: {dimensions: {}, el: '', clip: '', margin: {top: 32, right: 32, bottom: 32, left: 50}},
         datasets: {},
         bottomXAxis: {el: '', padding: 0.1},
         leftYAxis: {el: '', min: 'auto', max: 'auto', format: {number: ',.0f', prefix: '', suffix: ''}}
      },
      init: () => {

         // Get a reference to the container and store dimensions
         chart.config.container.el = d3.select(chart.config.container.id);
         chart.config.container.dimensions = chart.config.container.el.node().getBoundingClientRect();

         // Create svg element
         chart.config.svg.el = chart.config.container.el.append('svg')
            .attr('class', 'chart-svg')
            .attr('width', chart.config.container.dimensions.width)
            .attr('height', chart.config.container.dimensions.height);

         // Create dimensions for main group
         chart.config.g.dimensions.width = +chart.config.container.dimensions.width - chart.config.g.margin.left - chart.config.g.margin.right;
         chart.config.g.dimensions.height = +chart.config.container.dimensions.height - chart.config.g.margin.top - chart.config.g.margin.bottom;

         // Create a group for axis elements
         chart.config.axis.el = chart.config.svg.el.append('g')
            .attr('class', 'axis-group')
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')

         // Create main group
         chart.config.g.el = chart.config.svg.el.append('g')
            .attr('class', 'chart-group')
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')

         // Create x axis
         chart.config.bottomXAxis.el = chart.config.axis.el.append('g')
            .attr('class', 'bottom-x-axis')
            .attr('transform', 'translate(0,' + chart.config.g.dimensions.height + ')');

         // Create y axis
         chart.config.leftYAxis.el = chart.config.axis.el.append('g')
            .attr('class', 'left-y-axis');

         // Create hover overlay
         chart.config.overlay.el = chart.config.svg.el.append('rect')
            .attr('class', 'overlay')
            .style('opacity', 0)
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
            .attr('width', chart.config.g.dimensions.width)
            .attr('height', chart.config.g.dimensions.height)	

      },
      update: (updates) => {

         // Define all possible updates
         if (updates !== undefined) {

            const updateConfigValue = (path, defaultValue) => {
               const updateValue = _get(updates, path);
               return updateValue !== undefined ? updateValue : defaultValue
            }

            // Dimension
            chart.config.g.margin.top = updateConfigValue('margin.top', chart.config.g.margin.top);
            chart.config.g.margin.right = updateConfigValue('margin.right', chart.config.g.margin.right);
            chart.config.g.margin.bottom = updateConfigValue('margin.bottom', chart.config.g.margin.bottom);
            chart.config.g.margin.left = updateConfigValue('margin.left', chart.config.g.margin.left);

            // Update datasets
            Object.keys(updates.datasets).forEach(key => {
               if (updates.datasets[key] === null) {
                  delete chart.config.datasets[key];
               } else if (!chart.config.datasets.hasOwnProperty(key)) {
                  chart.config.datasets[key] = updates.datasets[key];
               } else {
                  chart.config.datasets[key].values = updateConfigValue(`datasets.${key}.values`, chart.config.datasets[key].values);
                  chart.config.datasets[key].color = updateConfigValue(`datasets.${key}.color`, chart.config.datasets[key].color);
                  chart.config.datasets[key].radius = updateConfigValue(`datasets.${key}.radius`, chart.config.datasets[key].radius);
               }
            })

            // LeftYAxis
            chart.config.leftYAxis.min = updateConfigValue('leftYAxis.min', chart.config.leftYAxis.min);
            chart.config.leftYAxis.max = updateConfigValue('leftYAxis.max', chart.config.leftYAxis.max);
            chart.config.leftYAxis.format.number = updateConfigValue('leftYAxis.format.number', chart.config.leftYAxis.format.number);
            chart.config.leftYAxis.format.prefix = updateConfigValue('leftYAxis.format.prefix', chart.config.leftYAxis.format.prefix);
            chart.config.leftYAxis.format.suffix = updateConfigValue('leftYAxis.format.suffix', chart.config.leftYAxis.format.suffix);

            // BottomXAxis
            chart.config.bottomXAxis.padding = updateConfigValue('bottomXAxis.padding', chart.config.bottomXAxis.padding);
         }

         // Update dataset and dimensions
         chart.config.container.dimensions = chart.config.container.el.node().getBoundingClientRect();

         // Update svg dimensions
         chart.config.svg.el.attr('width', chart.config.container.dimensions.width).attr('height', chart.config.container.dimensions.height);
         chart.config.axis.el.attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')');

         // Update dimensions and margins og main group
         chart.config.g.dimensions.width = +chart.config.container.dimensions.width - chart.config.g.margin.left - chart.config.g.margin.right;
         chart.config.g.dimensions.height = +chart.config.container.dimensions.height - chart.config.g.margin.top - chart.config.g.margin.bottom;
         chart.config.g.el.attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
         
         // Update overlay dimensions
         chart.config.overlay.el
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
            .attr('width', chart.config.g.dimensions.width)
            .attr('height', chart.config.g.dimensions.height)

         // Set min and max values for left axis
         let leftYMin = chart.config.leftYAxis.min === 'auto'
            ? d3.min(Object.values(chart.config.datasets).map(d => d3.min(d.values, v => v.y)))
            : chart.config.leftYAxis.min
         leftYMin = d3.min([0, leftYMin]);
         
         let leftYMax = chart.config.leftYAxis.max === 'auto'
            ? d3.max(Object.values(chart.config.datasets).map(d => d3.max(d.values, v => v.y)))
            : chart.config.leftYAxis.max 
         leftYMax = d3.max([0, leftYMax]);

         // Update left axis
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.config.g.dimensions.height, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.config.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const gridlineLength = -chart.config.g.dimensions.width;
         const leftYAxis = d3
            .axisLeft(leftYScale)
            .tickSize(gridlineLength)
            .tickFormat(d => {
               const formatter = chart.config.leftYAxis.format || {};
               const formattedValue = `${formatter.prefix} ${d3.format(formatter.number)(d)} ${formatter.suffix}`
               return formattedValue;
            })
         chart.config.leftYAxis.el.call(leftYAxis);

         // Update bottom axis
         let bottomXDomain = []
         Object.values(chart.config.datasets).forEach(d => d.values.forEach(v => {
            if (bottomXDomain.indexOf(v.x) === -1){bottomXDomain.push(v.x)}
         }));
         
         bottomXDomain = bottomXDomain.sort((a,b) => {
            if (a < b) { return -1; }
            if (a > b) { return 1; }
            return 0;
         });

         const bottomXScale = d3
            .scalePoint() // Type of scale used for axis
            .rangeRound([0, chart.config.g.dimensions.width]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis
         const bottomXAxis = d3.axisBottom(bottomXScale);
         chart.config.bottomXAxis.scale = bottomXScale;
         chart.config.bottomXAxis.el.call(bottomXAxis);

         const createLine = (dataset) => {
            const line = d3.line()
               .x(d => bottomXScale(d.x))
               .y(d => leftYScale(d.y))
               .defined(d => { return d.y !== undefined})
               .curve(dataset.smooth === true ? d3.curveCatmullRom : d3.curveLinear)
            return line(dataset.values);
         }

         const createArea = (dataset) => {
            const area = d3.area()
               .x(d => bottomXScale(d.x))
               .y0(() => leftYScale(0))
               .y1(d => leftYScale(d.y))
               .defined(d => { return d.y !== undefined})
               .curve(dataset.smooth === true ? d3.curveCatmullRom : d3.curveLinear)
            return area(dataset.values);
         }

         const seriesData = Object.keys(chart.config.datasets).map(d => {
            const dataset = chart.config.datasets[d];
            dataset.name = d;
            dataset.values = bottomXDomain.map(xValue => {
               const xMatches = dataset.values.filter(d => d.x === xValue); 
               const firstMatch = xMatches[0] || {};
               const yValue = firstMatch.y !== undefined ? firstMatch.y : 0;
               return {x: xValue, y: firstMatch.y}
            })
            return dataset
         })

         //console.log(seriesData);

         const series = chart.config.g.el.selectAll(".series-group").data(seriesData, (d) => d.name);

         const newSeries = series.enter().append("g")
            .attr("class", "series-group")

         newSeries.selectAll(".line").data(d => [d], d => d.name).enter()
            .append("path")
            .attr("class", "line")
            .style("stroke-width", d => d.strokeWidth || 3)
            .style("stroke", d => d.color)
            .style("fill", 'none')
            .attr("d", d => createLine(d))

         newSeries.selectAll(".area").data(d => [d], d => d.name).enter()
            .append("path")
            .attr("class", "area")
            .style("stroke-width", d => d.strokeWidth || 3)
            .style("stroke", 'none')
            .style("fill", d => d.color)
            .style("opacity", d => d.opacity || 0.2)
            .attr("d", d => createArea(d))   

         newSeries.selectAll(".circle").data(d => d.values.map(c => {
            return {x: c.x, y: c.y, color: d.color, radius: d.radius};
         }), d => d.x).enter()
            .append("circle")
            .attr("class", "circle")
            .attr("r", d => d.radius !== undefined ? d.radius : 5)
            .attr("cx", d => bottomXScale(d.x))
            .attr("cy", d => leftYScale(d.y))
            .attr("fill", d => d.color)

         const circles = series.selectAll(".circle").data(d => d.values.map(c => {
            return {x: c.x, y: c.y, color: d.color, radius: d.radius};
         }), d => d.x)

         circles.attr("r", d => d.radius !== undefined ? d.radius : 5)
            .attr("cx", d => bottomXScale(d.x))
            .attr("cy", d => leftYScale(d.y || 0))
            .attr("fill", d => d.y === undefined ? 'none' : d.color)
         
         circles.exit().remove();

         const line = series.selectAll(".line").data(d => [d], d => d.name)

         line.style("stroke-width", d => d.strokeWidth || 3)
            .style("stroke", d => d.color)
            .attr("d", d => createLine(d))

         const area = series.selectAll(".area").data(d => [d], d => d.name)

         area.style("stroke-width", d => d.strokeWidth || 3)
            .style("stroke", 'none')
            .style("fill", d => d.color)
            .style("opacity", d => d.opacity || 0.2)
            .attr("d", d => createArea(d))   

         series.exit().remove();

      },
      mouseOver: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseover', () => callback())
      },
      mouseOut: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseout', () => callback())
      },
      mouseMove: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseover', () => {})
            .on('mouseout', () => {})
            .on('mousemove', (d, i, nodes) => {

               // Get coordinates of mouse
               const mouseCoordinates = d3.mouse(nodes[i]);
               const mouseX = mouseCoordinates[0];
               const mouseY = mouseCoordinates[1];

               // Get all values on x axis
               const xValues = chart.config.bottomXAxis.scale.domain();
               const xLeftPoints = xValues.map(d => chart.config.bottomXAxis.scale(d));
               const distancesToMouseX = xValues.map((d, i) => Math.abs(xLeftPoints[i] - mouseX));

               // Calculate closest column
               let closestColumnIndex = 0;
               let closestDistance = distancesToMouseX[0];
               distancesToMouseX.forEach((d, i) => {
                  if (d < closestDistance) {
                     closestColumnIndex = i;
                     closestDistance = d;
                  }
               })

               const closestGroup = xValues[closestColumnIndex];
               const closestValues = Object.values(chart.config.datasets).map(d => {
                  const groupValues = d.values.filter(d => d.x === closestGroup) || [];
                  const firstMatch = groupValues[0] || {};
                  return firstMatch.y;
               })

               // Send information about hover in callback
               callback({
                  name: closestGroup,
                  left: xLeftPoints[closestColumnIndex] + chart.config.g.margin.left,
                  top: mouseY + chart.config.g.margin.top,
                  y: closestValues,
               })
            })
      },
      delete: () => {
         chart.config.svg.el.remove();
      }
   };

   chart.init();
   chart.update(chartConfig);
   return chart;
};


/** 
 * @name stackedArea
 * Scale: scalePoint
 * Axes: left, bottom
 **/

charts.stackedArea = (chartConfig) => {

   // Chart object with relevant methods
   const chart = {
      config: {
         container: {id: chartConfig.containerId, el: '', dimensions: {}},
         axis: {el: ''},
         overlay: {el: ''},
         svg: {dimensions: {}, el: ''},
         g: {dimensions: {}, el: '', clip: '', margin: {top: 32, right: 32, bottom: 32, left: 50}},
         datasets: {},
         isSmooth: false,
         isPercent: false,
         bottomXAxis: {el: '', padding: 0.1},
         leftYAxis: {el: '', min: 'auto', max: 'auto', format: {number: ',.0f', prefix: '', suffix: ''}}
      },
      init: () => {

         // Get a reference to the container and store dimensions
         chart.config.container.el = d3.select(chart.config.container.id);
         chart.config.container.dimensions = chart.config.container.el.node().getBoundingClientRect();

         // Create svg element
         chart.config.svg.el = chart.config.container.el.append('svg')
            .attr('class', 'chart-svg')
            .attr('width', chart.config.container.dimensions.width)
            .attr('height', chart.config.container.dimensions.height);

         // Create dimensions for main group
         chart.config.g.dimensions.width = +chart.config.container.dimensions.width - chart.config.g.margin.left - chart.config.g.margin.right;
         chart.config.g.dimensions.height = +chart.config.container.dimensions.height - chart.config.g.margin.top - chart.config.g.margin.bottom;

         // Create a group for axis elements
         chart.config.axis.el = chart.config.svg.el.append('g')
            .attr('class', 'axis-group')
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')

         // Create main group
         chart.config.g.el = chart.config.svg.el.append('g')
            .attr('class', 'chart-group')
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')

         // Create x axis
         chart.config.bottomXAxis.el = chart.config.axis.el.append('g')
            .attr('class', 'bottom-x-axis')
            .attr('transform', 'translate(0,' + chart.config.g.dimensions.height + ')');

         // Create y axis
         chart.config.leftYAxis.el = chart.config.axis.el.append('g')
            .attr('class', 'left-y-axis');

         // Create hover overlay
         chart.config.overlay.el = chart.config.svg.el.append('rect')
            .attr('class', 'overlay')
            .style('opacity', 0)
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
            .attr('width', chart.config.g.dimensions.width)
            .attr('height', chart.config.g.dimensions.height)	

      },
      update: (updates) => {

         // Define all possible updates

         if (updates !== undefined) {

            const updateConfigValue = (path, defaultValue) => {
               const updateValue = _get(updates, path);
               return updateValue !== undefined ? updateValue : defaultValue
            }

            // Dimension
            chart.config.g.margin.top = updateConfigValue('margin.top', chart.config.g.margin.top);
            chart.config.g.margin.right = updateConfigValue('margin.right', chart.config.g.margin.right);
            chart.config.g.margin.bottom = updateConfigValue('margin.bottom', chart.config.g.margin.bottom);
            chart.config.g.margin.left = updateConfigValue('margin.left', chart.config.g.margin.left);

            // Update datasets
            Object.keys(updates.datasets || {}).forEach(key => {
               if (updates.datasets[key] === null) {
                  delete chart.config.datasets[key];
               } else if (!chart.config.datasets.hasOwnProperty(key)) {
                  chart.config.datasets[key] = updates.datasets[key];
               } else {
                  chart.config.datasets[key].values = updateConfigValue(`datasets.${key}.values`, chart.config.datasets[key].values);
                  chart.config.datasets[key].color = updateConfigValue(`datasets.${key}.color`, chart.config.datasets[key].color);
                  chart.config.datasets[key].radius = updateConfigValue(`datasets.${key}.radius`, chart.config.datasets[key].radius);
               }
            })

            // Update percent setting
            chart.config.isSmooth = updateConfigValue('isSmooth', chart.config.isSmooth);
            chart.config.isPercent = updateConfigValue('isPercent', chart.config.isPercent);

            // LeftYAxis
            chart.config.leftYAxis.min = updateConfigValue('leftYAxis.min', chart.config.leftYAxis.min);
            chart.config.leftYAxis.max = updateConfigValue('leftYAxis.max', chart.config.leftYAxis.max);
            chart.config.leftYAxis.format.number = updateConfigValue('leftYAxis.format.number', chart.config.leftYAxis.format.number);
            chart.config.leftYAxis.format.prefix = updateConfigValue('leftYAxis.format.prefix', chart.config.leftYAxis.format.prefix);
            chart.config.leftYAxis.format.suffix = updateConfigValue('leftYAxis.format.suffix', chart.config.leftYAxis.format.suffix);

            // BottomXAxis
            chart.config.bottomXAxis.padding = updateConfigValue('bottomXAxis.padding', chart.config.bottomXAxis.padding);
         }

         // Update dataset and dimensions
         chart.config.container.dimensions = chart.config.container.el.node().getBoundingClientRect();

         // Update svg dimensions
         chart.config.svg.el.attr('width', chart.config.container.dimensions.width).attr('height', chart.config.container.dimensions.height);
         chart.config.axis.el.attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')');

         // Update dimensions and margins og main group
         chart.config.g.dimensions.width = +chart.config.container.dimensions.width - chart.config.g.margin.left - chart.config.g.margin.right;
         chart.config.g.dimensions.height = +chart.config.container.dimensions.height - chart.config.g.margin.top - chart.config.g.margin.bottom;
         chart.config.g.el.attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
         
         // Update overlay dimensions
         chart.config.overlay.el
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
            .attr('width', chart.config.g.dimensions.width)
            .attr('height', chart.config.g.dimensions.height)

         // Update bottom axis
         let bottomXDomain = []
         Object.values(chart.config.datasets).forEach(d => d.values.forEach(v => {
            if (bottomXDomain.indexOf(v.x) === -1){bottomXDomain.push(v.x)}
         }));
         
         bottomXDomain = bottomXDomain.sort((a,b) => {
            if (a < b) { return -1; }
            if (a > b) { return 1; }
            return 0;
         });

         const bottomXScale = d3
            .scalePoint() // Type of scale used for axis
            .rangeRound([0, chart.config.g.dimensions.width]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis
         const bottomXAxis = d3.axisBottom(bottomXScale);
         chart.config.bottomXAxis.scale = bottomXScale;
         chart.config.bottomXAxis.el.call(bottomXAxis);

         const seriesKeys = Object.keys(chart.config.datasets);
         const seriesData = seriesKeys.map((key, index) => {
            const dataset = chart.config.datasets[key];       
            const previousKey = seriesKeys[index - 1];
            const previousDataset = chart.config.datasets[previousKey] || {};
            const previousValues = previousDataset.values || [];
            dataset.name = key;
            dataset.values = bottomXDomain.map(xValue => {
               const matched = dataset.values.filter(d => d.x === xValue)[0] || {}; 
               const yValue = matched.y !== undefined ? matched.y : 0;
               const previousMatched = previousValues.filter(d => d.x === xValue)[0] || {}; 
               const previousY1 = previousMatched.y1 || 0;
               return {
                  x: xValue,
                  y: yValue,
                  y1: yValue + previousY1,
                  y0: previousY1
               }
            })
            return dataset
         })

         // Calculate group totals
         const totalSeries = seriesData[seriesKeys.length - 1] || {};
         const totalValues = totalSeries.values;

         // If percent stack then recalculate percents
         seriesData.forEach(series => {
            const values = series.values;
            values.map(v => {
               const matched = totalValues.filter(d => d.x === v.x)[0] || {}; 
               const yMax = matched.y1 || 0
               v.yPercent = v.y / yMax;
               v.y0Percent = v.y0 / yMax;
               v.y1Percent = v.y1 / yMax;
            })
         })

         // Set min and max values for left axis
         let leftYMin = 0;
         let leftYMax = chart.config.leftYAxis.max === 'auto'
            ? d3.max(totalValues, d => d.y1)
            : chart.config.leftYAxis.max 
         leftYMax = d3.max([0, leftYMax]);
         let leftYFormat = chart.config.leftYAxis.format;

         // Update settings if chart is percent
         if (chart.config.isPercent) {
            leftYMax = 1;
            leftYFormat = {
               number: ',.0%'
            }
         }

         // Update left axis
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.config.g.dimensions.height, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.config.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const gridlineLength = -chart.config.g.dimensions.width;
         const leftYAxis = d3
            .axisLeft(leftYScale)
            .tickSize(gridlineLength)
            .tickFormat(d => {
               const formatter = leftYFormat || {};
               const formattedValue = `${formatter.prefix || ''} ${d3.format(formatter.number)(d)} ${formatter.suffix || ''}`
               return formattedValue;
            })
         chart.config.leftYAxis.el.call(leftYAxis);

         const createLine = (dataset) => {
            const line = d3.line()
               .x(d => bottomXScale(d.x))
               .y(d => leftYScale(chart.config.isPercent ? d.y1Percent : d.y1))
               .defined(d => { return d.y !== undefined})
               .curve(chart.config.isSmooth === true ? d3.curveCatmullRom : d3.curveLinear)
            return line(dataset.values);
         }

         const createArea = (dataset) => {
            const area = d3.area()
               .x(d => bottomXScale(d.x))
               .y0(d => leftYScale(chart.config.isPercent ? d.y0Percent : d.y0))
               .y1(d => leftYScale(chart.config.isPercent ? d.y1Percent : d.y1))
               .defined(d => { return d.y !== undefined})
               .curve(chart.config.isSmooth === true ? d3.curveCatmullRom : d3.curveLinear)
               return area(dataset.values);
         }

         const series = chart.config.g.el.selectAll(".series-group").data(seriesData, (d) => d.name);

         const newSeries = series.enter().append("g")
            .attr("class", "series-group")

         newSeries.selectAll(".line").data(d => [d], d => d.name).enter()
            .append("path")
            .attr("class", "line")
            .style("stroke-width", d => d.strokeWidth || 3)
            .style("stroke", d => d.color)
            .style("fill", 'none')
            .attr("d", d => createLine(d))

         newSeries.selectAll(".area").data(d => [d], d => d.name).enter()
            .append("path")
            .attr("class", "area")
            .style("stroke-width", d => d.strokeWidth || 3)
            .style("stroke", 'none')
            .style("fill", d => d.color)
            .style("opacity", d => d.opacity || 0.2)
            .attr("d", d => createArea(d))   

         const line = series.selectAll(".line").data(d => [d], d => d.name)

         line.style("stroke-width", d => d.strokeWidth || 3)
            .style("stroke", d => d.color)
            .attr("d", d => createLine(d))

         const area = series.selectAll(".area").data(d => [d], d => d.name)

         area.style("stroke-width", d => d.strokeWidth || 3)
            .style("stroke", 'none')
            .style("fill", d => d.color)
            .style("opacity", d => d.opacity || 0.2)
            .attr("d", d => createArea(d))   

         series.exit().remove();

      },
      mouseOver: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseover', () => callback())
      },
      mouseOut: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseout', () => callback())
      },
      mouseMove: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseover', () => {})
            .on('mouseout', () => {})
            .on('mousemove', (d, i, nodes) => {

               // Get coordinates of mouse
               const mouseCoordinates = d3.mouse(nodes[i]);
               const mouseX = mouseCoordinates[0];
               const mouseY = mouseCoordinates[1];

               // Get all values on x axis
               const xValues = chart.config.bottomXAxis.scale.domain();
               const xLeftPoints = xValues.map(d => chart.config.bottomXAxis.scale(d));
               const distancesToMouseX = xValues.map((d, i) => Math.abs(xLeftPoints[i] - mouseX));

               // Calculate closest column
               let closestColumnIndex = 0;
               let closestDistance = distancesToMouseX[0];
               distancesToMouseX.forEach((d, i) => {
                  if (d < closestDistance) {
                     closestColumnIndex = i;
                     closestDistance = d;
                  }
               })

               const closestGroup = xValues[closestColumnIndex];
               const closestValues = Object.values(chart.config.datasets).map(d => {
                  const groupValues = d.values.filter(d => d.x === closestGroup) || [];
                  const firstMatch = groupValues[0] || {};
                  return firstMatch.y;
               })

               // Send information about hover in callback
               callback({
                  name: closestGroup,
                  left: xLeftPoints[closestColumnIndex] + chart.config.g.margin.left,
                  top: mouseY + chart.config.g.margin.top,
                  y: closestValues,
               })
            })
      },
      delete: () => {
         chart.config.svg.el.remove();
      }
   };

   chart.init();
   chart.update(chartConfig);
   return chart;
};


/** 
 * @name lineColumn
 * Scale: scaleBand
 * Axes: left, bottom
 **/

charts.lineColumn = (chartConfig) => {

   // Chart object with relevant methods
   const chart = {
      config: {
         container: {id: chartConfig.containerId, el: '', dimensions: {}},
         axis: {el: ''},
         overlay: {el: ''},
         svg: {dimensions: {}, el: ''},
         g: {dimensions: {}, el: '', clip: '', margin: {top: 32, right: 50, bottom: 32, left: 50}},
         datasets: {},
         bottomXAxis: {el: '', padding: 0.1},
         leftYAxis: {el: '', min: 'auto', max: 'auto', format: {number: ',.0f', prefix: '', suffix: ''}},
         rightYAxis: {el: '', min: 'auto', max: 'auto', format: {number: ',.0f', prefix: '', suffix: ''}}
      },
      init: () => {

         // Get a reference to the container and store dimensions
         chart.config.container.el = d3.select(chart.config.container.id);
         chart.config.container.dimensions = chart.config.container.el.node().getBoundingClientRect();

         // Create svg element
         chart.config.svg.el = chart.config.container.el.append('svg')
            .attr('class', 'chart-svg')
            .attr('width', chart.config.container.dimensions.width)
            .attr('height', chart.config.container.dimensions.height);

         // Create dimensions for main group
         chart.config.g.dimensions.width = +chart.config.container.dimensions.width - chart.config.g.margin.left - chart.config.g.margin.right;
         chart.config.g.dimensions.height = +chart.config.container.dimensions.height - chart.config.g.margin.top - chart.config.g.margin.bottom;

         // Create a group for axis elements
         chart.config.axis.el = chart.config.svg.el.append('g')
            .attr('class', 'axis-group')
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')

         // Create main group
         chart.config.g.el = chart.config.svg.el.append('g')
            .attr('class', 'chart-group')
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')

         // Create x axis
         chart.config.bottomXAxis.el = chart.config.axis.el.append('g')
            .attr('class', 'bottom-x-axis')
            .attr('transform', 'translate(0,' + chart.config.g.dimensions.height + ')');

         // Create y axis
         chart.config.leftYAxis.el = chart.config.axis.el.append('g')
            .attr('class', 'left-y-axis');

         // Create y axis
         chart.config.rightYAxis.el = chart.config.axis.el.append('g')
            .attr('class', 'right-y-axis')
            .attr('transform', 'translate(' + chart.config.g.dimensions.width + ',0)');

         // Create hover overlay
         chart.config.overlay.el = chart.config.svg.el.append('rect')
            .attr('class', 'overlay')
            .style('opacity', 0)
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
            .attr('width', chart.config.g.dimensions.width)
            .attr('height', chart.config.g.dimensions.height)	

      },
      update: (updates) => {

         // Define all possible updates
         if (updates !== undefined) {

            const updateConfigValue = (path, defaultValue) => {
               const updateValue = _get(updates, path);
               return updateValue !== undefined ? updateValue : defaultValue
            }

            // Dimension
            chart.config.g.margin.top = updateConfigValue('margin.top', chart.config.g.margin.top);
            chart.config.g.margin.right = updateConfigValue('margin.right', chart.config.g.margin.right);
            chart.config.g.margin.bottom = updateConfigValue('margin.bottom', chart.config.g.margin.bottom);
            chart.config.g.margin.left = updateConfigValue('margin.left', chart.config.g.margin.left);

            // Update datasets
            Object.keys(updates.datasets).forEach(key => {
               if (updates.datasets[key] === null) {
                  delete chart.config.datasets[key];
               } else if (!chart.config.datasets.hasOwnProperty(key)) {
                  chart.config.datasets[key] = updates.datasets[key];
               } else {
                  chart.config.datasets[key].values = updateConfigValue(`datasets.${key}.values`, chart.config.datasets[key].values);
                  chart.config.datasets[key].color = updateConfigValue(`datasets.${key}.color`, chart.config.datasets[key].color);
                  chart.config.datasets[key].radius = updateConfigValue(`datasets.${key}.radius`, chart.config.datasets[key].radius);
               }
            })

            // LeftYAxis
            chart.config.leftYAxis.min = updateConfigValue('leftYAxis.min', chart.config.leftYAxis.min);
            chart.config.leftYAxis.max = updateConfigValue('leftYAxis.max', chart.config.leftYAxis.max);
            chart.config.leftYAxis.format.number = updateConfigValue('leftYAxis.format.number', chart.config.leftYAxis.format.number);
            chart.config.leftYAxis.format.prefix = updateConfigValue('leftYAxis.format.prefix', chart.config.leftYAxis.format.prefix);
            chart.config.leftYAxis.format.suffix = updateConfigValue('leftYAxis.format.suffix', chart.config.leftYAxis.format.suffix);

            // rightYAxis
            chart.config.rightYAxis.min = updateConfigValue('rightYAxis.min', chart.config.rightYAxis.min);
            chart.config.rightYAxis.max = updateConfigValue('rightYAxis.max', chart.config.rightYAxis.max);
            chart.config.rightYAxis.format.number = updateConfigValue('rightYAxis.format.number', chart.config.rightYAxis.format.number);
            chart.config.rightYAxis.format.prefix = updateConfigValue('rightYAxis.format.prefix', chart.config.rightYAxis.format.prefix);
            chart.config.rightYAxis.format.suffix = updateConfigValue('rightYAxis.format.suffix', chart.config.rightYAxis.format.suffix);

            // BottomXAxis
            chart.config.bottomXAxis.padding = updateConfigValue('bottomXAxis.padding', chart.config.bottomXAxis.padding);
         }

         // Update dataset and dimensions
         chart.config.container.dimensions = chart.config.container.el.node().getBoundingClientRect();

         // Update svg dimensions
         chart.config.svg.el.attr('width', chart.config.container.dimensions.width).attr('height', chart.config.container.dimensions.height);
         chart.config.axis.el.attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')');

         // Update dimensions and margins og main group
         chart.config.g.dimensions.width = +chart.config.container.dimensions.width - chart.config.g.margin.left - chart.config.g.margin.right;
         chart.config.g.dimensions.height = +chart.config.container.dimensions.height - chart.config.g.margin.top - chart.config.g.margin.bottom;
         chart.config.g.el.attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
         
         // Update overlay dimensions
         chart.config.overlay.el
            .attr('transform', 'translate(' + chart.config.g.margin.left + ',' + chart.config.g.margin.top + ')')
            .attr('width', chart.config.g.dimensions.width)
            .attr('height', chart.config.g.dimensions.height)

         // Update overlay dimensions
         chart.config.rightYAxis.el
            .attr('transform', 'translate(' + chart.config.g.dimensions.width + ',0)')

         // Line Data
         const allData = [];
         const lineData = [];
         const columnData = [];
         const leftData = [];
         const rightData = [];

         Object.keys(chart.config.datasets).forEach(key => {
            const dataset = chart.config.datasets[key];
            dataset.name = key;
            allData.push(dataset);
            if (dataset.type === 'line') {lineData.push(dataset)};
            if (dataset.type !== 'line') {columnData.push(dataset)};
            if (dataset.axis === 'right') {rightData.push(dataset)};
            if (dataset.axis !== 'right') {leftData.push(dataset)};
         })

         // Set min and max values for left axis
         let leftYMin = chart.config.leftYAxis.min === 'auto'
            ? d3.min(leftData.map(d => d3.min(d.values, v => v.y)))
            : chart.config.leftYAxis.min
         leftYMin = d3.min([0, leftYMin]);
         
         let leftYMax = chart.config.leftYAxis.max === 'auto'
            ? d3.max(leftData.map(d => d3.max(d.values, v => v.y)))
            : chart.config.leftYAxis.max 
         leftYMax = d3.max([0, leftYMax]);

         // Update left axis
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.config.g.dimensions.height, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.config.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const gridlineLength = -chart.config.g.dimensions.width;
         const leftYAxis = d3
            .axisLeft(leftYScale)
            .tickSize(gridlineLength)
            .tickFormat(d => {
               const formatter = chart.config.leftYAxis.format || {};
               const formattedValue = `${formatter.prefix} ${d3.format(formatter.number)(d)} ${formatter.suffix}`
               return formattedValue;
            })
         chart.config.leftYAxis.el.call(leftYAxis);
         
         // Set min and max values for left axis
         let rightYMin = chart.config.rightYAxis.min === 'auto'
            ? d3.min(rightData.map(d => d3.min(d.values, v => v.y)))
            : chart.config.rightYAxis.min
         rightYMin = d3.min([0, rightYMin]);
         
         let rightYMax = chart.config.rightYAxis.max === 'auto'
            ? d3.max(rightData.map(d => d3.max(d.values, v => v.y)))
            : chart.config.rightYAxis.max 
         rightYMax = d3.max([0, rightYMax]);

         // Update left axis
         const rightYDomain = [rightYMin, rightYMax];
         const rightYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.config.g.dimensions.height, 0]) // The range of the axis
            .domain(rightYDomain) // All values on axis;
         chart.config.rightYAxis.scale = rightYScale;

         // Draw axis with .call d3 function
         let rightValues = rightYScale.ticks();
         const leftDataExists = leftData.length > 0;
         
         if (leftDataExists) {
            const leftTicks = leftYScale.ticks();
            const rightDomain = rightYScale.domain();
            const rightRange = rightDomain[1] - rightDomain[0];
            rightValues = leftTicks.map((d, i) => {
               const percent = d / leftYMax;
               return rightDomain[0] + (percent * rightRange);
            })
         }
         
         // Calculate right ticks
         const rightTickSize = leftDataExists ? 0 : gridlineLength;
         const rightYAxis = d3
            .axisRight(rightYScale)
            .tickSize(rightTickSize)
            .tickValues(rightValues)
            .tickFormat(d => {
               const formatter = chart.config.rightYAxis.format || {};
               const formattedValue = `${formatter.prefix} ${d3.format(formatter.number)(d)} ${formatter.suffix}`
               return formattedValue;
            })
         chart.config.rightYAxis.el.call(rightYAxis);  

         // Update bottom axis
         let bottomXDomain = []
         allData.forEach(d => d.values.forEach(v => {
            if (bottomXDomain.indexOf(v.x) === -1){bottomXDomain.push(v.x)}
         }));
         
         bottomXDomain = bottomXDomain.sort((a,b) => {
            if (a < b) { return -1; }
            if (a > b) { return 1; }
            return 0;
         });

         const bottomXScale = d3
            .scaleBand() // Type of scale used for axis
            .rangeRound([0, chart.config.g.dimensions.width]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis
            .padding(0.1)
         const bottomXAxis = d3.axisBottom(bottomXScale);
         chart.config.bottomXAxis.scale = bottomXScale;
         chart.config.bottomXAxis.el.call(bottomXAxis);

         const createLine = (dataset) => {
            const line = d3.line()
               .x(d => bottomXScale(d.x) + (bottomXScale.bandwidth() / 2))
               .y(d => {
                  const scale = dataset.axis === 'left' ? leftYScale : rightYScale;
                  return scale(d.y);
               })
               .defined(d => { return d.y !== undefined})
               .curve(dataset.smooth === true ? d3.curveCatmullRom : d3.curveLinear)
            return line(dataset.values);
         }

         let bottomXGroupDomain = columnData.map(d => d.name);
         const bottomXGroupScale = d3
            .scaleBand() // Type of scale used for axis
            .rangeRound([0, bottomXScale.bandwidth()]) // The range of the axis
            .domain(bottomXGroupDomain) // The values on the axis
            .paddingInner(0.1)

         // Create column data
         const columnGroupData = bottomXDomain.map(groupName => {
            const groupValues = columnData.map(dataset => {
               const values = dataset.values;
               const matched = values.filter(d => d.x === groupName)[0] || {};
               return {
                  y: matched.y || 0,
                  x: dataset.name,
                  color: dataset.color,
                  axis: dataset.axis
               }
            });
            return {
               x: groupName,
               values: groupValues
            }
         })

         const columnGroup = chart.config.g.el.selectAll(".column-group").data(columnGroupData, (d) => d.x);

         columnGroup.enter()
				.append("g")
				.attr("class", "column-group")
				.attr("transform", d => "translate(" + bottomXScale(d.x) + ", 0)")
            .attr("width", bottomXScale.bandwidth())
            .selectAll(".column").data(d => d.values, k => k.x)
               .enter().append("rect")
               .attr("class", "column")
               .attr('width', d => bottomXGroupScale.bandwidth())
               .attr('rx', 2)
               .style('fill', d => d.color)
               .attr('height', d => {
                  const scale = d.axis === 'left' ? leftYScale : rightYScale;
                  return d.y < 0 
                     ? scale(d.y) - scale(0)
                     : scale(0) - scale(d.y)
               })
               .attr('y', d => {
                  const scale = d.axis === 'left' ? leftYScale : rightYScale;
                  return d.y < 0 ? scale(0) : scale(d.y)
               })
               .attr('x', d => bottomXGroupScale(d.x))
            
         // Update groups
         columnGroup
            .attr("transform", d => "translate(" + bottomXScale(d.x) + ", 0)")
            .attr("width", bottomXScale.bandwidth())

         // Delete groups
         columnGroup.exit().remove();

         // Create reference to existing columns
         const existingColumns = columnGroup.selectAll(".column").data(d => d.values, k => k.x);

         existingColumns.enter()
            .append("rect")
            .attr("class", "column")
            .attr('width', d => bottomXGroupScale.bandwidth())
            .attr('rx', 2)
            .style('fill', d => d.color)
            .attr('height', d => {
               const scale = d.axis === 'left' ? leftYScale : rightYScale;
               return d.y < 0 
                  ? scale(d.y) - scale(0)
                  : scale(0) - scale(d.y)
            })
            .attr('y', d => {
               const scale = d.axis === 'left' ? leftYScale : rightYScale;
               return d.y < 0 ? scale(0) : scale(d.y)
            })
            .attr('x', d => bottomXGroupScale(d.x))

         existingColumns
            .attr('width', d => bottomXGroupScale.bandwidth())
            .attr('rx', 2)
            .style('fill', d => d.color)
            .attr('height', d => {
               const scale = d.axis === 'left' ? leftYScale : rightYScale;
               return d.y < 0 
                  ? scale(d.y) - scale(0)
                  : scale(0) - scale(d.y)
            })
            .attr('y', d => {
               const scale = d.axis === 'left' ? leftYScale : rightYScale;
               return d.y < 0 ? scale(0) : scale(d.y)
            })
            .attr('x', d => bottomXGroupScale(d.x))

         existingColumns.exit().remove();
         
         // Series data for lines
         const seriesData = lineData.map(dataset => {
            dataset.values = bottomXDomain.map(xValue => {
               const xMatches = dataset.values.filter(d => d.x === xValue); 
               const firstMatch = xMatches[0] || {};
               return {x: xValue, y: firstMatch.y}
            })
            return dataset
         })

         // Draw Series
         const series = chart.config.g.el.selectAll(".series-group").data(seriesData, (d) => d.name);

         const newSeries = series.enter().append("g")
            .attr("class", "series-group")

         newSeries.selectAll(".line").data(d => [d], d => d.name).enter()
            .append("path")
            .attr("class", "line")
            .style("stroke-width", d => d.strokeWidth || 3)
            .style("stroke", d => d.color)
            .style("fill", 'none')
            .attr("d", d => createLine(d))

         newSeries.selectAll(".circle").data(d => d.values.map(c => {
            return {x: c.x, y: c.y, color: d.color, radius: d.radius, axis: d.axis};
         }), d => d.x).enter()
            .append("circle")
            .attr("class", "circle")
            .attr("r", d => d.radius !== undefined ? d.radius : 5)
            .attr("cx", d => bottomXScale(d.x) + (bottomXScale.bandwidth() / 2))
            .attr("cy", d => {
               const scale = d.axis === 'left' ? leftYScale : rightYScale;
               return scale(d.y);
            })
            .attr("fill", d => d.color)

         const circles = series.selectAll(".circle").data(d => d.values.map(c => {
            return {x: c.x, y: c.y, color: d.color, radius: d.radius};
         }), d => d.x)

         circles.attr("r", d => d.radius !== undefined ? d.radius : 5)
            .attr("cx", d => bottomXScale(d.x) + (bottomXScale.bandwidth() / 2))
            .attr("cy", d => {
               const scale = d.axis === 'left' ? leftYScale : rightYScale;
               return scale(d.y);
            })
            .attr("fill", d => d.y === undefined ? 'none' : d.color)
         
         circles.exit().remove();

         const line = series.selectAll(".line").data(d => [d], d => d.name)

         line.style("stroke-width", d => d.strokeWidth || 3)
            .style("stroke", d => d.color)
            .attr("d", d => createLine(d))

         series.exit().remove();

      },
      mouseOver: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseover', () => callback())
      },
      mouseOut: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseout', () => callback())
      },
      mouseMove: (callback) => {
         chart.config.svg.el.selectAll('.overlay')
            .on('mouseover', () => {})
            .on('mouseout', () => {})
            .on('mousemove', (d, i, nodes) => {

               // Get coordinates of mouse
               const mouseCoordinates = d3.mouse(nodes[i]);
               const mouseX = mouseCoordinates[0];
               const mouseY = mouseCoordinates[1];

               // Get all values on x axis
               const xValues = chart.config.bottomXAxis.scale.domain();
               const xLeftPoints = xValues.map(d => chart.config.bottomXAxis.scale(d) + (chart.config.bottomXAxis.scale.bandwidth() / 2));
               const distancesToMouseX = xValues.map((d, i) => Math.abs(xLeftPoints[i] - mouseX));

               // Calculate closest column
               let closestColumnIndex = 0;
               let closestDistance = distancesToMouseX[0];
               distancesToMouseX.forEach((d, i) => {
                  if (d < closestDistance) {
                     closestColumnIndex = i;
                     closestDistance = d;
                  }
               })

               const closestGroup = xValues[closestColumnIndex];
               const closestValues = Object.values(chart.config.datasets).map(d => {
                  const groupValues = d.values.filter(d => d.x === closestGroup) || [];
                  const firstMatch = groupValues[0] || {};
                  return firstMatch.y;
               })

               // Send information about hover in callback
               callback({
                  name: closestGroup,
                  left: xLeftPoints[closestColumnIndex] + chart.config.g.margin.left,
                  top: mouseY + chart.config.g.margin.top,
                  y: closestValues,
               })
            })
      },
      delete: () => {
         chart.config.svg.el.remove();
      }
   };

   chart.init();
   chart.update(chartConfig);
   return chart;
};









/** 
 * @name heatMap
 * Scale: linear
 * Axes: left, top
 **/

charts.heatMap = (chartConfig) => {}


/** 
 * @name bar
 * Scale: scaleBand
 * Axes: left, bottom
 **/

charts.bar = (chartConfig) => {}


/** 
 * @name stackedBar
 * Scale: scaleBand
 * Axes: left, bottom
 **/

charts.stackedBar = (chartConfig) => {}


/** 
 * @name groupedBar
 * Scale: scaleBand
 * Axes: left, bottom
 **/

charts.groupedBar = (chartConfig) => {}


/** 
 * @name timeLine
 * Scale: scaleTime
 * Axes: left, bottom
 **/

charts.timeLine = (chartConfig) => {}


/** 
 * @name sparkLine
 * Scale: scalePoint
 * Axes: bottom
 **/

charts.sparkLine = (chartConfig) => {}


/** 
 * @name pieChart
 * Scale: none
 * Axes: none
 **/

charts.pieChart = (chartConfig) => {}

// Export charts
export default charts