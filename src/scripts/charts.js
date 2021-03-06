import * as d3 from 'd3';
import _get from 'lodash/get';
import _set from 'lodash/set';
import regression from 'regression';

// Helpers for creating charts
const utils = {
   formatValue: (value, config) => {
      const formatter = config || {};
      const formattedString = formatter.string === '' 
         ? value 
         : formatter.isDate 
         ? d3.timeFormat(formatter.string)(value) 
         : d3.format(formatter.string)(value);
      if (formattedString === 'auto') {
         return
      } else {
         return `${formatter.prefix || ''} ${formattedString} ${formatter.suffix || ''}`
      }
   },
   createBaseChart(elementId, customConfig) {

      const config = {
         container: {
            id: '',
            el: '',
            dimensions: {}
         },
         animation: {
            duration: 0
         },
         axis: {
            el: ''
         },
         overlay: {
            el: ''
         },
         svg: {
            dimensions: {},
            el: ''
         },
         g: {
            dimensions: {},
            el: '',
            clip: '',
            margin: {
               top: 32,
               right: 32,
               bottom: 40,
               left: 60
            }
         },
         datasets: {},
         bottomXAxis: {
            el: '', 
            padding: 0.1,
            margin: {
               left: 0,
               right: 0,
            },
            min: 'auto',
            max: 'auto',
            gridlines: {
               hidden: false,
               position: 'center'
            },
            format: {
               string: '',
               prefix: '',
               suffix: '',
               isDate: false
            }
         },
         leftYAxis: {
            el: '',
            min: 'auto',
            max: 'auto',
            gridlines: {
               hidden: false
            },
            format: {
               string: ',.0f',
               prefix: '',
               suffix: '',
               isDate: false
            }
         },
         rightYAxis: {
            el: '',
            min: 'auto',
            max: 'auto',
            gridlines: {
               hidden: false,
            },
            format: {
               string: ',.0f',
               prefix: '',
               suffix: '',
               isDate: false
            }
         }
      };

      // Add custom config
      const customAdditions = customConfig || {};
      Object.keys(customAdditions).forEach(key => {
         const value = customAdditions[key];
         _set(config, key, value);   
      })

      // Get a reference to the container and store dimensions
      config.container.el = d3.select(elementId);
      config.container.dimensions = config.container.el.node().getBoundingClientRect();

      // Create svg element
      config.svg.el = config.container.el.append('svg')
         .attr('class', 'chart-svg')
         .attr('width', config.container.dimensions.width)
         .attr('height', config.container.dimensions.height);

      // Create dimensions for main group
      config.g.dimensions.width = +config.container.dimensions.width - config.g.margin.left - config.g.margin.right;
      config.g.dimensions.height = +config.container.dimensions.height - config.g.margin.top - config.g.margin.bottom;

      // Create a group for axis elements
      config.axis.el = config.svg.el.append('g')
         .attr('class', 'axis-group')
         .attr('transform', 'translate(' + config.g.margin.left + ',' + config.g.margin.top + ')')

      // Create main group
      config.g.el = config.svg.el.append('g')
         .attr('class', 'chart-group')
         .attr('transform', 'translate(' + config.g.margin.left + ',' + config.g.margin.top + ')')

      // Create x axis
      config.bottomXAxis.el = config.axis.el.append('g')
         .attr('class', 'bottom-x-axis')
         .attr('transform', 'translate(0,' + config.g.dimensions.height + ')');

      // Create y axis
      config.leftYAxis.el = config.axis.el.append('g')
         .attr('class', 'left-y-axis')

      // Create y axis
      config.rightYAxis.el = config.axis.el.append('g')
         .attr('class', 'right-y-axis')
         .attr('transform', 'translate(' + config.g.dimensions.width + ',0)');

      // Create hover overlay
      config.overlay.el = config.svg.el.append('rect')
         .attr('class', 'overlay')
         .style('opacity', 0)
         .attr('transform', 'translate(' + config.g.margin.left + ',' + config.g.margin.top + ')')
         .attr('width', config.g.dimensions.width)
         .attr('height', config.g.dimensions.height)	

      // Add clip to not allow overflow. Especially useful for time line so you can change the time period.
      config.defs = config.svg.el.append("defs");
      config.clipPath = config.defs.append("svg:clipPath")
         .attr("id", `clip`)
         
      config.clipPath.rect = config.clipPath.append("rect")
         .attr("class", "clip-rect")
         .attr("width", config.g.dimensions.width)
         .attr("height", config.g.dimensions.height + 20)
         .attr("x", 0)
         .attr("y", -6)

      config.g.el.attr("clip-path", `url(#clip)`);   

      // Add default mouse over callback
      config.mouseOver = (callback) => {
         config.overlay.el.on('mouseover', () => {
            callback()
         })
      }
      
      // Add default mouse out callback
      config.mouseOut = (callback) => {
         config.svg.el.selectAll('.overlay').on('mouseout', () => callback())
      }

      // Add default mouse move callback
      config.mouseMove = (callback) => {
         config.svg.el.selectAll('.overlay').on('mousemove', (d, i, nodes) => {
            const mouseCoordinates = d3.mouse(nodes[i]);
            const mouseX = mouseCoordinates[0];
            const mouseY = mouseCoordinates[1];
            const xValues = config.bottomXAxis.definedValues ||config.bottomXAxis.scale.domain();
      
            // Check for bandwidth and get mouse coordinates
            const hasBandWidth = typeof config.bottomXAxis.scale.bandwidth === 'function';
      
            // Calculate closest column
            let closestColumnIndex = -1;
            let closestDistance = config.g.dimensions.width;
            const bandWidthAdjust = hasBandWidth ? (config.bottomXAxis.scale.bandwidth() / 2) : 0;
            
            // Loop over xValues and get closest value
            xValues.forEach((d, i) => {
               const xValue = config.bottomXAxis.scale(d) + bandWidthAdjust;
               const distance = Math.abs(xValue - mouseX)
               if (distance < closestDistance) {
                  closestColumnIndex = i;
                  closestDistance = distance;
               }
            })
      
            // Calculate closest group
            const closestGroup = xValues[closestColumnIndex];
            const closestValues = Object.values(config.datasets).map(d => {
               const groupValues = d.values.filter(d => {
                  // In order to compare dates you have to transform them to time
                  const isDate = typeof d.x.getTime === 'function';
                  const xValue = isDate ? d.x.getTime() : d.x;
                  const closestValue = isDate ? closestGroup.getTime() : closestGroup;
                  return xValue === closestValue;
               }) || [];
               const firstMatch = groupValues[0] || {};
               return firstMatch.y;
            })
      
            // Send information about hover in callback
            callback({
               name: closestGroup,
               left: config.bottomXAxis.scale(closestGroup) + config.g.margin.left + bandWidthAdjust,
               top: mouseY + config.g.margin.top,
               y: closestValues,
            })
         })
      }

      // Add default delete callback
      config.delete = () => {
         config.svg.el.remove();
      }

      return config;
   },
   updateBaseDimensions(chart) {
      // Update dataset and dimensions
      chart.container.dimensions = chart.container.el.node().getBoundingClientRect();

      // Update svg dimensions
      chart.svg.el.attr('width', chart.container.dimensions.width).attr('height', chart.container.dimensions.height);
      chart.axis.el.attr('transform', 'translate(' + chart.g.margin.left + ',' + chart.g.margin.top + ')');

      // Update dimensions and margins og main group
      chart.g.dimensions.width = +chart.container.dimensions.width - chart.g.margin.left - chart.g.margin.right;
      chart.g.dimensions.height = +chart.container.dimensions.height - chart.g.margin.top - chart.g.margin.bottom;
      chart.g.el.attr('transform', 'translate(' + chart.g.margin.left + ',' + chart.g.margin.top + ')')

      // Update overlay dimensions
      chart.overlay.el
         .attr('transform', 'translate(' + chart.g.margin.left + ',' + chart.g.margin.top + ')')
         .attr('width', chart.g.dimensions.width)
         .attr('height', chart.g.dimensions.height)

      // Update right axis
      chart.rightYAxis.el
         .attr('transform', 'translate(' + chart.g.dimensions.width + ',0)')

      // Updatea clip path rect
      chart.clipPath.rect
         .attr("width", chart.g.dimensions.width)
   },
   updateBaseConfig(chart, updates) {
      
      if (updates !== undefined) {

         // Helper to map udpates
         function mapUpdate(updatePath, chartPath) {
            const updateValue = _get(updates, updatePath);
            if (updateValue !== undefined) {
               _set(chart, chartPath, updateValue);   
            }
         }

         // Update datasets
         Object.keys(updates.datasets || {}).forEach(key => {
            if (updates.datasets[key] === null) {
               delete chart.datasets[key];
            } else if (!chart.datasets.hasOwnProperty(key)) {
               mapUpdate(`datasets.['${key}']`, `datasets.['${key}']`);
            } else {
               mapUpdate(`datasets.['${key}'].values`, `datasets.['${key}'].values`);
               mapUpdate(`datasets.['${key}'].color`, `datasets.['${key}'].color`);
               mapUpdate(`datasets.['${key}'].radius`, `datasets.['${key}'].radius`);
               mapUpdate(`datasets.['${key}'].borderRadius`, `datasets.['${key}'].borderRadius`);
               mapUpdate(`datasets.['${key}'].lineWidth`, `datasets.['${key}'].lineWidth`);
               mapUpdate(`datasets.['${key}'].hasBestFit`, `datasets.['${key}'].hasBestFit`);
            }
         })

         // Map other updates
         mapUpdate('margin.top', 'g.margin.top');
         mapUpdate('margin.right', 'g.margin.right');
         mapUpdate('margin.bottom', 'g.margin.bottom');
         mapUpdate('margin.left', 'g.margin.left')

         // mapUpdate('animation.duration', `animation.duration`);
         mapUpdate('isSmooth', `isSmooth`);
         mapUpdate('isPercent', `isPercent`);

         mapUpdate('leftYAxis.min', `leftYAxis.min`);
         mapUpdate('leftYAxis.max', `leftYAxis.max`);
         mapUpdate('leftYAxis.format.string', `leftYAxis.format.string`);
         mapUpdate('leftYAxis.format.prefix', `leftYAxis.format.prefix`);
         mapUpdate('leftYAxis.format.suffix', `leftYAxis.format.suffix`);
         mapUpdate('leftYAxis.format.isDate', `leftYAxis.format.isDate`);

         mapUpdate('rightYAxis.min', `rightYAxis.min`);
         mapUpdate('rightYAxis.max', `rightYAxis.max`);
         mapUpdate('rightYAxis.format.string', `rightYAxis.format.string`);
         mapUpdate('rightYAxis.format.prefix', `rightYAxis.format.prefix`);
         mapUpdate('rightYAxis.format.suffix', `rightYAxis.format.suffix`);
         mapUpdate('rightYAxis.format.isDate', `rightYAxis.format.isDate`);

         mapUpdate('bottomXAxis.padding', `bottomXAxis.padding`);
         mapUpdate('bottomXAxis.min', `bottomXAxis.min`);
         mapUpdate('bottomXAxis.max', `bottomXAxis.max`);
         mapUpdate('bottomXAxis.format.string', `bottomXAxis.format.string`);
         mapUpdate('bottomXAxis.format.prefix', `bottomXAxis.format.prefix`);
         mapUpdate('bottomXAxis.format.suffix', `bottomXAxis.format.suffix`);
         mapUpdate('bottomXAxis.format.isDate', `bottomXAxis.format.isDate`);
         mapUpdate('bottomXAxis.margin.left', `bottomXAxis.margin.left`);
         mapUpdate('bottomXAxis.margin.right', `bottomXAxis.margin.right`);
         mapUpdate('bottomXAxis.filter', `bottomXAxis.filter`);
         mapUpdate('bottomXAxis.gridlines.hidden', `bottomXAxis.gridlines.hidden`);
         mapUpdate('bottomXAxis.gridlines.position', `bottomXAxis.gridlines.position`);
      }
   },
   adjustBandGridlines(chart) {
      // Adjust gridlines so they are between groups
      const gridLines = chart.bottomXAxis.el.selectAll('line');
      const bandWidth = chart.bottomXAxis.scale.bandwidth();
      const tickAdjust = (bandWidth + (bandWidth * chart.bottomXAxis.padding)) / 2;
      gridLines
         .style('transform', `translateX(${tickAdjust}px)`)
         .style('opacity', (d,i) => i === gridLines.size() - 1 ? 0 : 1);
   },
   bestFitLine(dataset) {
      
      const data = dataset.values.map(d => [d.x, d.y])

      const curvesToTest = [
         {name: 'linear'},
         {name: 'polynomial', order: 2},
         {name: 'exponential'},
         {name: 'power'}
      ]

      let bestCurve = {r2: -1};
      curvesToTest.forEach(d => {
         let result = regression[d.name](data, {order: d.order});
         if (result.r2 > bestCurve.r2) {bestCurve = result};
      })

      const curvePoints = bestCurve.points || [];
      const points = curvePoints.map(d => {return {x: d[0], y: d[1]}})

      return [{
         values: points,
         name: dataset.name,
         color: dataset.color
      }]
   }
};


// Charts object
const charts = {

   /** 
    * @name column
    * Scale: scaleBand
    * Axes: left, bottom
    **/

   column: (elementId, update) => {
      const chart = utils.createBaseChart(elementId, {
         'bottomXAxis.gridlines.position': 'betweenGroups'
      });
      chart.update = (updates) => {

         // Update dimensions and base dimensions
         utils.updateBaseConfig(chart, updates);
         utils.updateBaseDimensions(chart);

         // Set min and max values for left axis
         let leftYMin = chart.leftYAxis.min === 'auto'
            ? d3.min(Object.values(chart.datasets).map(d => d3.min(d.values, v => v.y)))
            : chart.leftYAxis.min
         leftYMin = d3.min([0, leftYMin]);

         let leftYMax = chart.leftYAxis.max === 'auto'
            ? d3.max(Object.values(chart.datasets).map(d => d3.max(d.values, v => v.y)))
            : chart.leftYAxis.max 
         leftYMax = d3.max([0, leftYMax]);

         // Update left axis
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.g.dimensions.height, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const leftYAxis = d3
            .axisLeft(leftYScale)
            .tickSize(!chart.leftYAxis.gridlines.hidden ? -chart.g.dimensions.width : 0)
            .tickFormat(d => utils.formatValue(d, chart.leftYAxis.format))
         
         chart.leftYAxis.el
            .call(leftYAxis)
            .selectAll('text').style('transform', 'translateX(-6px)');

         // Update bottom axis
         let bottomXDomain = []
         Object.values(chart.datasets).forEach(d => d.values.forEach(v => {
            if (bottomXDomain.indexOf(v.x) === -1){bottomXDomain.push(v.x)}
         }));

         bottomXDomain = bottomXDomain.sort((a,b) => {
            if (a < b) { return -1; }
            if (a > b) { return 1; }
            return 0;
         });

         const bottomXScale = d3
            .scaleBand() // Type of scale used for axis
            .rangeRound([chart.bottomXAxis.margin.left, chart.g.dimensions.width-chart.bottomXAxis.margin.right]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis
            .padding(chart.bottomXAxis.padding) // Padding between columns
         
         const bottomXAxis = d3
            .axisBottom(bottomXScale)
            .tickFormat(d => utils.formatValue(d, chart.bottomXAxis.format))
            .tickSize(!chart.bottomXAxis.gridlines.hidden ? -chart.g.dimensions.height : 0)
            
         chart.bottomXAxis.scale = bottomXScale;
         chart.bottomXAxis.el
            .call(bottomXAxis)
            .selectAll('text').style('transform', 'translateY(6px)');

         // Adjust gridlines so they are between groups
         if (chart.bottomXAxis.gridlines.position === 'betweenGroups') {
            utils.adjustBandGridlines(chart)
         }
         
         // Create column data
         const columnGroupData = bottomXDomain.map(groupName => {
            const groupValues = Object.keys(chart.datasets).map(datasetName => {
               const dataset = chart.datasets[datasetName];
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

         const columnGroup = chart.g.el.selectAll(".column-group").data(columnGroupData, (d) => d.x);

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
      }
      chart.update(update);
      return chart;
   },


   /** 
    * @name groupedColumn
    * Scale: scaleBand
    * Axes: left, bottom
    **/

   groupedColumn: (elementId, update) => {
      const chart = utils.createBaseChart(elementId, {
         'bottomXAxis.gridlines.position': 'betweenGroups'
      });
      chart.update = (updates) => {
         
         // Update dimensions and base dimensions
         utils.updateBaseConfig(chart, updates);
         utils.updateBaseDimensions(chart);

         // Set min and max values for left axis
         let leftYMin = chart.leftYAxis.min === 'auto'
            ? d3.min(Object.values(chart.datasets).map(d => d3.max(d.values, d => d.y)))
            : chart.leftYAxis.min; 
         leftYMin = d3.min([0, leftYMin]);

         let leftYMax = chart.leftYAxis.max === 'auto'
            ? d3.max(Object.values(chart.datasets).map(d => d3.max(d.values, d => d.y)))
            : chart.leftYAxis.max;
         leftYMax = d3.max([0, leftYMax]);

         // Update left axis
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.g.dimensions.height, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const leftYAxis = d3
            .axisLeft(leftYScale)
            .tickSize(!chart.leftYAxis.gridlines.hidden ? -chart.g.dimensions.width : 0)
            .tickFormat(d => utils.formatValue(d, chart.leftYAxis.format))
         chart.leftYAxis.el
            .call(leftYAxis)
            .selectAll('text').style('transform', 'translateX(-6px)')

         // Get all x values from all datasets
         let bottomXDomain = []
         Object.values(chart.datasets).forEach(d => d.values.forEach(v => {
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
            .rangeRound([chart.bottomXAxis.margin.left, chart.g.dimensions.width-chart.bottomXAxis.margin.right]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis
            .padding(chart.bottomXAxis.padding) // Padding between columns
         
         const bottomXAxis = d3
            .axisBottom(bottomXScale)
            .tickSize(!chart.bottomXAxis.gridlines.hidden ? -chart.g.dimensions.height : 0)
            .tickFormat(d => utils.formatValue(d, chart.bottomXAxis.format));
         
         chart.bottomXAxis.scale = bottomXScale;
         chart.bottomXAxis.el
            .call(bottomXAxis)
            .selectAll('text').style('transform', 'translateY(6px)')

         // Adjust gridlines so they are between groups
         if (chart.bottomXAxis.gridlines.position === 'betweenGroups') {
            utils.adjustBandGridlines(chart)
         }

         let bottomXGroupDomain = Object.keys(chart.datasets);
         const bottomXGroupScale = d3
            .scaleBand() // Type of scale used for axis
            .rangeRound([0, bottomXScale.bandwidth()]) // The range of the axis
            .domain(bottomXGroupDomain) // The values on the axis
            .padding(0.1)

         // Create column data
         const columnGroupData = bottomXDomain.map(groupName => {
            const groupValues = Object.keys(chart.datasets).map(datasetName => {
               const dataset = chart.datasets[datasetName];
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

         const columnGroup = chart.g.el.selectAll(".column-group").data(columnGroupData, (d) => d.x);

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
      }
      chart.update(update);
      return chart;
   },

   /** 
    * @name stackedColumn
    * Scale: scaleBand
    * Axes: left, bottom
    **/


   stackedColumn: (elementId, update) => {
      const chart = utils.createBaseChart(elementId, {
         'bottomXAxis.gridlines.position': 'betweenGroups'
      });
      chart.update = (updates) => {
         
         // Update dimensions and base dimensions
         utils.updateBaseConfig(chart, updates);
         utils.updateBaseDimensions(chart);

         // Update bottom axis
         let bottomXDomain = []
         Object.values(chart.datasets).forEach(d => d.values.forEach(v => {
            if (bottomXDomain.indexOf(v.x) === -1){bottomXDomain.push(v.x)}
         }));
         
         bottomXDomain = bottomXDomain.sort((a,b) => {
            if (a < b) { return -1; }
            if (a > b) { return 1; }
            return 0;
         });

         const bottomXScale = d3
            .scaleBand() // Type of scale used for axis
            .rangeRound([chart.bottomXAxis.margin.left, chart.g.dimensions.width-chart.bottomXAxis.margin.right]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis
            .padding(chart.bottomXAxis.padding) // Padding between columns
         const bottomXAxis = d3
            .axisBottom(bottomXScale)
            .tickSize(!chart.bottomXAxis.gridlines.hidden ? -chart.g.dimensions.height : 0)
            .tickFormat(d => utils.formatValue(d, chart.bottomXAxis.format));

         chart.bottomXAxis.scale = bottomXScale;
         chart.bottomXAxis.el
            .call(bottomXAxis)
            .selectAll('text').style('transform', 'translateY(6px)');

         // Adjust gridlines so they are between groups
         if (chart.bottomXAxis.gridlines.position === 'betweenGroups') {
            utils.adjustBandGridlines(chart)
         }

         // Stacked Data
         const columnGroupData = bottomXDomain.map(groupName => {
            const datasetNames = Object.keys(chart.datasets);
            const groupValues = datasetNames.map(datasetName => {
               const dataset = chart.datasets[datasetName];
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
         let leftYMax = chart.leftYAxis.max === 'auto'
            ? d3.max(groupTotals)
            : chart.leftYAxis.max 
         leftYMax = d3.max([0, leftYMax]);

         // Update left axis
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.g.dimensions.height, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const leftYAxis = d3
            .axisLeft(leftYScale)
            .tickSize(!chart.leftYAxis.gridlines.hidden ? -chart.g.dimensions.width : 0)
            .tickFormat(d => utils.formatValue(d, chart.leftYAxis.format))
         
            chart.leftYAxis.el
            .call(leftYAxis)
            .selectAll('text').style('transform', 'translateX(-6px)');

         const columnGroup = chart.g.el.selectAll(".column-group").data(columnGroupData, (d) => d.x);

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

      }
      chart.update(update);
      return chart;
   },


   /** 
    * @name line
    * Scale: scalePoint
    * Axes: left, bottom
    **/

   line: (elementId, update) => {
      const chart = utils.createBaseChart(elementId, {
         'bottomXAxis.margin.left': 20,
         'bottomXAxis.margin.right': 20
      });
      chart.update = (updates) => {
      
         // Update dimensions and base dimensions
         utils.updateBaseConfig(chart, updates);
         utils.updateBaseDimensions(chart); 

         // Set min and max values for left axis
         let leftYMin = chart.leftYAxis.min === 'auto'
            ? d3.min(Object.values(chart.datasets).map(d => d3.min(d.values, v => v.y)))
            : chart.leftYAxis.min
         leftYMin = d3.min([0, leftYMin]);
         
         let leftYMax = chart.leftYAxis.max === 'auto'
            ? d3.max(Object.values(chart.datasets).map(d => d3.max(d.values, v => v.y)))
            : chart.leftYAxis.max 
         leftYMax = d3.max([0, leftYMax]);

         // Update left axis
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.g.dimensions.height-6, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const leftYAxis = d3
            .axisLeft(leftYScale)
            .tickSize(!chart.leftYAxis.gridlines.hidden ? -chart.g.dimensions.width : 0)
            .tickFormat(d => utils.formatValue(d, chart.leftYAxis.format))
         
         chart.leftYAxis.el
            .call(leftYAxis)
            .selectAll('text').style('transform', 'translateX(-6px)');

         // Update bottom axis
         let bottomXDomain = []
         Object.values(chart.datasets).forEach(d => d.values.forEach(v => {
            if (bottomXDomain.indexOf(v.x) === -1){bottomXDomain.push(v.x)}
         }));
         
         bottomXDomain = bottomXDomain.sort((a,b) => {
            if (a < b) { return -1; }
            if (a > b) { return 1; }
            return 0;
         });

         const bottomXScale = d3
            .scalePoint() // Type of scale used for axis
            .rangeRound([chart.bottomXAxis.margin.left, chart.g.dimensions.width - chart.bottomXAxis.margin.right]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis
         
         const bottomXAxis = d3
            .axisBottom(bottomXScale)
            .tickSize(!chart.bottomXAxis.gridlines.hidden ? -chart.g.dimensions.height : 0)
            .tickFormat(d => utils.formatValue(d, chart.bottomXAxis.format));

         chart.bottomXAxis.scale = bottomXScale;
         chart.bottomXAxis.el
            .call(bottomXAxis)
            .selectAll('text').style('transform', 'translateY(6px)');

         const createLine = (dataset) => {
            const line = d3.line()
               .x(d => bottomXScale(d.x))
               .y(d => leftYScale(d.y))
               .defined(d => { return d.y !== undefined})
               .curve(dataset.isSmooth === true ? d3.curveCatmullRom.alpha(0) : d3.curveLinear)
            return line(dataset.values);
         }

         const seriesData = Object.keys(chart.datasets).map(d => {
            const dataset = chart.datasets[d];
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

         const series = chart.g.el.selectAll(".series-group").data(seriesData, (d) => d.name);

         const newSeries = series.enter().append("g")
            .attr("class", "series-group")

         newSeries.selectAll(".line").data(d => [d], d => d.name).enter()
            .append("path")
            .attr("class", "line")
            .style("stroke-width", d => d.lineWidth || 3)
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

         line.style("stroke-width", d => d.lineWidth || 3)
            .style("stroke", d => d.color)
            .attr("d", d => createLine(d))

         series.exit().remove();
      }
      chart.update(update);
      return chart;
   },


      /** 
    * @name line
    * Scale: scalePoint
    * Axes: left, bottom
    **/

   scatterplot: (elementId, update) => {
      const chart = utils.createBaseChart(elementId, {
         'bottomXAxis.margin.left': 20,
         'bottomXAxis.margin.right': 20
      });
      chart.update = (updates) => {
      
         // Update dimensions and base dimensions
         utils.updateBaseConfig(chart, updates);
         utils.updateBaseDimensions(chart); 

         // Set min and max values for left axis
         let leftYMin = chart.leftYAxis.min === 'auto'
            ? d3.min(Object.values(chart.datasets).map(d => d3.min(d.values, v => v.y)))
            : chart.leftYAxis.min
         leftYMin = d3.min([0, leftYMin]);
         
         let leftYMax = chart.leftYAxis.max === 'auto'
            ? d3.max(Object.values(chart.datasets).map(d => d3.max(d.values, v => v.y)))
            : chart.leftYAxis.max 
         leftYMax = d3.max([0, leftYMax]);

         // Update left axis
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.g.dimensions.height-6, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const leftYAxis = d3
            .axisLeft(leftYScale)
            .tickSize(!chart.leftYAxis.gridlines.hidden ? -chart.g.dimensions.width : 0)
            .tickFormat(d => utils.formatValue(d, chart.leftYAxis.format))
         
         chart.leftYAxis.el
            .call(leftYAxis)
            .selectAll('text').style('transform', 'translateX(-6px)');

         // Set min and max values for left axis
         let bottomXMin = chart.bottomXAxis.min === 'auto'
            ? d3.min(Object.values(chart.datasets).map(d => d3.min(d.values, v => v.x)))
            : chart.bottomXAxis.min
         
         let bottomXMax = chart.bottomXAxis.max === 'auto'
            ? d3.max(Object.values(chart.datasets).map(d => d3.max(d.values, v => v.x)))
            : chart.bottomXAxis.max 

         // Update left axis
         const bottomXDomain = [bottomXMin, bottomXMax];

         const bottomXScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.bottomXAxis.margin.left, chart.g.dimensions.width - chart.bottomXAxis.margin.right]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis
         
         const bottomXAxis = d3
            .axisBottom(bottomXScale)
            .tickSize(!chart.bottomXAxis.gridlines.hidden ? -chart.g.dimensions.height : 0)
            .tickFormat(d => utils.formatValue(d, chart.bottomXAxis.format));

         chart.bottomXAxis.scale = bottomXScale;
         chart.bottomXAxis.el
            .call(bottomXAxis)
            .selectAll('text').style('transform', 'translateY(6px)');

      
         const xValues = [];
         const seriesData = Object.keys(chart.datasets).map(d => {
            const dataset = chart.datasets[d];
            dataset.name = d;
            dataset.values.forEach(d => {
               if (xValues.indexOf(d.x) === -1) {xValues.push(d.x)};
            })
            return dataset;
         })

         chart.bottomXAxis.definedValues = xValues;

         const series = chart.g.el.selectAll(".series-group").data(seriesData, (d) => d.name);

         const newSeries = series.enter().append("g")
            .attr("class", "series-group")

         const createLine = (dataset) => {
            const line = d3.line()
               .x(d => bottomXScale(d.x))
               .y(d => leftYScale(d.y))
               .defined(d => { return d.y !== undefined})
               .curve(d3.curveNatural)
            return line(dataset.values);
         }

         newSeries.selectAll(".line").data(d => {
            return d.hasBestFit ? utils.bestFitLine(d) : {name: ''};
         }, d => d.name).enter()
            .append("path")
            .attr("class", "line")
            .style("stroke-width", d => d.lineWidth || 3)
            .style("opacity", 0.15)
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

         const line = series.selectAll(".line").data(d => {
            return d.hasBestFit ? utils.bestFitLine(d) : {name: ''};
         }, d => d.name)

         line.enter()
            .append("path")
            .attr("class", "line")
            .style("stroke-width", d => d.lineWidth || 3)
            .style("opacity", 0.15)
            .style("stroke", d => d.color)
            .style("fill", 'none')
            .attr("d", d => createLine(d))

         line.style("stroke-width", d => d.lineWidth || 3)
            .style("stroke", d => d.color)
            .style("opacity", 0.15)
            .attr("d", d => createLine(d))
         
         line.exit().remove();

         series.exit().remove();
      }
      chart.update(update);
      return chart;
   },



   /** 
    * @name area
    * Scale: scalePoint
    * Axes: left, bottom
    **/

   area: (elementId, update) => {
      const chart = utils.createBaseChart(elementId);
      chart.update = (updates) => {
         
         // Update dimensions and base dimensions
         utils.updateBaseConfig(chart, updates);
         utils.updateBaseDimensions(chart);

         // Set min and max values for left axis
         let leftYMin = chart.leftYAxis.min === 'auto'
            ? d3.min(Object.values(chart.datasets).map(d => d3.min(d.values, v => v.y)))
            : chart.leftYAxis.min
         leftYMin = d3.min([0, leftYMin]);

         let leftYMax = chart.leftYAxis.max === 'auto'
            ? d3.max(Object.values(chart.datasets).map(d => d3.max(d.values, v => v.y)))
            : chart.leftYAxis.max 
         leftYMax = d3.max([0, leftYMax]);

         // Update left axis
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.g.dimensions.height-6, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const leftYAxis = d3
            .axisLeft(leftYScale)
            .tickSize(!chart.leftYAxis.gridlines.hidden ? -chart.g.dimensions.width : 0)
            .tickFormat(d => utils.formatValue(d, chart.leftYAxis.format))
         chart.leftYAxis.el
            .call(leftYAxis)
            .selectAll('text').style('transform', 'translateX(-6px)');;

         // Update bottom axis
         let bottomXDomain = []
         Object.values(chart.datasets).forEach(d => d.values.forEach(v => {
            if (bottomXDomain.indexOf(v.x) === -1){bottomXDomain.push(v.x)}
         }));

         bottomXDomain = bottomXDomain.sort((a,b) => {
            if (a < b) { return -1; }
            if (a > b) { return 1; }
            return 0;
         });

         const bottomXScale = d3
            .scalePoint() // Type of scale used for axis
            .rangeRound([chart.bottomXAxis.margin.left, chart.g.dimensions.width-chart.bottomXAxis.margin.right]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis
         
         const bottomXAxis = d3
            .axisBottom(bottomXScale)
            .tickSize(!chart.bottomXAxis.gridlines.hidden ? -chart.g.dimensions.height : 0)
            .tickFormat(d => utils.formatValue(d, chart.bottomXAxis.format));

         chart.bottomXAxis.scale = bottomXScale;
         chart.bottomXAxis.el
            .call(bottomXAxis)
            .selectAll('text').style('transform', 'translateY(6px)');;

         const createLine = (dataset) => {
            const line = d3.line()
               .x(d => bottomXScale(d.x))
               .y(d => leftYScale(d.y))
               .defined(d => { return d.y !== undefined})
               .curve(dataset.isSmooth === true ? d3.curveCatmullRom.alpha(0) : d3.curveLinear)
            return line(dataset.values);
         }

         const createArea = (dataset) => {
            const area = d3.area()
               .x(d => bottomXScale(d.x))
               .y0(() => leftYScale(0))
               .y1(d => leftYScale(d.y))
               .defined(d => { return d.y !== undefined})
               .curve(dataset.isSmooth === true ? d3.curveCatmullRom.alpha(0) : d3.curveLinear)
            return area(dataset.values);
         }

         const seriesData = Object.keys(chart.datasets).map(d => {
            const dataset = chart.datasets[d];
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

         const series = chart.g.el.selectAll(".series-group").data(seriesData, (d) => d.name);

         const newSeries = series.enter().append("g")
            .attr("class", "series-group")

         newSeries.selectAll(".line").data(d => [d], d => d.name).enter()
            .append("path")
            .attr("class", "line")
            .style("stroke-width", d => d.lineWidth || 3)
            .style("stroke", d => d.color)
            .style("fill", 'none')
            .attr("d", d => createLine(d))

         newSeries.selectAll(".area").data(d => [d], d => d.name).enter()
            .append("path")
            .attr("class", "area")
            .style("stroke-width", d => d.lineWidth || 3)
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

         line.style("stroke-width", d => d.lineWidth || 3)
            .style("stroke", d => d.color)
            .attr("d", d => createLine(d))

         const area = series.selectAll(".area").data(d => [d], d => d.name)

         area.style("stroke-width", d => d.lineWidth || 3)
            .style("stroke", 'none')
            .style("fill", d => d.color)
            .style("opacity", d => d.opacity || 0.2)
            .attr("d", d => createArea(d))   

         series.exit().remove();
      }
      chart.update(update);
      return chart;
   },


   /** 
    * @name stackedArea
    * Scale: scalePoint
    * Axes: left, bottom
    **/

   stackedArea: (elementId, update) => {
      const chart = utils.createBaseChart(elementId);
      chart.update = (updates) => {
         
         // Update dimensions and base dimensions
         utils.updateBaseConfig(chart, updates);
         utils.updateBaseDimensions(chart);

         // Update bottom axis
         let bottomXDomain = []
         Object.values(chart.datasets).forEach(d => d.values.forEach(v => {
            if (bottomXDomain.indexOf(v.x) === -1){bottomXDomain.push(v.x)}
         }));

         bottomXDomain = bottomXDomain.sort((a,b) => {
            if (a < b) { return -1; }
            if (a > b) { return 1; }
            return 0;
         });

         const bottomXScale = d3
            .scalePoint() // Type of scale used for axis
            .rangeRound([chart.bottomXAxis.margin.left, chart.g.dimensions.width-chart.bottomXAxis.margin.right]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis

         const bottomXAxis = d3
            .axisBottom(bottomXScale)
            .tickSize(!chart.bottomXAxis.gridlines.hidden ? -chart.g.dimensions.height : 0)
            .tickFormat(d => utils.formatValue(d, chart.bottomXAxis.format));

         chart.bottomXAxis.scale = bottomXScale;
         chart.bottomXAxis.el
            .call(bottomXAxis)
            .selectAll('text').style('transform', 'translateY(6px)');

         const seriesKeys = Object.keys(chart.datasets);
         const seriesData = seriesKeys.map((key, index) => {
            const dataset = chart.datasets[key];       
            const previousKey = seriesKeys[index - 1];
            const previousDataset = chart.datasets[previousKey] || {};
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
         let leftYMax = chart.leftYAxis.max === 'auto'
            ? d3.max(totalValues, d => d.y1)
            : chart.leftYAxis.max 
         leftYMax = d3.max([0, leftYMax]);
         let leftYFormat = chart.leftYAxis.format;

         // Update settings if chart is percent
         if (chart.isPercent) {
            leftYMax = 1;
            leftYFormat = {
               string: ',.0%'
            }
         }

         // Update left axis
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.g.dimensions.height-6, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const leftYAxis = d3
            .axisLeft(leftYScale)
            .tickSize(!chart.leftYAxis.gridlines.hidden ? -chart.g.dimensions.width : 0)
            .tickFormat(d => utils.formatValue(d, leftYFormat))
         
         chart.leftYAxis.el
            .call(leftYAxis)
            .selectAll('text').style('transform', 'translateX(-6px)');

         const createLine = (dataset) => {
            const line = d3.line()
               .x(d => bottomXScale(d.x))
               .y(d => leftYScale(chart.isPercent ? d.y1Percent : d.y1))
               .defined(d => { return d.y !== undefined})
               .curve(chart.isSmooth === true ? d3.curveCatmullRom.alpha(0) : d3.curveLinear)
            return line(dataset.values);
         }

         const createArea = (dataset) => {
            const area = d3.area()
               .x(d => bottomXScale(d.x))
               .y0(d => leftYScale(chart.isPercent ? d.y0Percent : d.y0))
               .y1(d => leftYScale(chart.isPercent ? d.y1Percent : d.y1))
               .defined(d => { return d.y !== undefined})
               .curve(chart.isSmooth === true ? d3.curveCatmullRom.alpha(0) : d3.curveLinear)
               return area(dataset.values);
         }

         const series = chart.g.el.selectAll(".series-group").data(seriesData, (d) => d.name);

         const newSeries = series.enter().append("g")
            .attr("class", "series-group")

         newSeries.selectAll(".line").data(d => [d], d => d.name).enter()
            .append("path")
            .attr("class", "line")
            .style("stroke-width", d => d.lineWidth || 3)
            .style("stroke", d => d.color)
            .style("fill", 'none')
            .attr("d", d => createLine(d))

         newSeries.selectAll(".area").data(d => [d], d => d.name).enter()
            .append("path")
            .attr("class", "area")
            .style("stroke-width", d => d.lineWidth || 3)
            .style("stroke", 'none')
            .style("fill", d => d.color)
            .style("opacity", d => d.opacity || 0.2)
            .attr("d", d => createArea(d))   

         const line = series.selectAll(".line").data(d => [d], d => d.name)

         line.style("stroke-width", d => d.lineWidth || 3)
            .style("stroke", d => d.color)
            .attr("d", d => createLine(d))

         const area = series.selectAll(".area").data(d => [d], d => d.name)

         area.style("stroke-width", d => d.lineWidth || 3)
            .style("stroke", 'none')
            .style("fill", d => d.color)
            .style("opacity", d => d.opacity || 0.2)
            .attr("d", d => createArea(d))   

         series.exit().remove();

      }
      chart.update(update);
      return chart;
   },


   /** 
    * @name lineColumn
    * Scale: scaleBand
    * Axes: left, bottom
    **/

   lineColumn: (elementId, update) => {
      const chart = utils.createBaseChart(elementId, {
         'bottomXAxis.gridlines.position': 'betweenGroups'
      });
      chart.update = (updates) => {
        
         // Update dimensions and base dimensions
         utils.updateBaseConfig(chart, updates);
         utils.updateBaseDimensions(chart);

         // Line Data
         const allData = [];
         const lineData = [];
         const columnData = [];
         const leftData = [];
         const rightData = [];

         Object.keys(chart.datasets).forEach(key => {
            const dataset = chart.datasets[key];
            dataset.name = key;
            allData.push(dataset);
            if (dataset.type === 'line') {lineData.push(dataset)};
            if (dataset.type !== 'line') {columnData.push(dataset)};
            if (dataset.axis === 'right') {rightData.push(dataset)};
            if (dataset.axis !== 'right') {leftData.push(dataset)};
         })

         // Set min and max values for left axis
         let leftYMin = chart.leftYAxis.min === 'auto'
            ? d3.min(leftData.map(d => d3.min(d.values, v => v.y)))
            : chart.leftYAxis.min
         leftYMin = d3.min([0, leftYMin]);

         let leftYMax = chart.leftYAxis.max === 'auto'
            ? d3.max(leftData.map(d => d3.max(d.values, v => v.y)))
            : chart.leftYAxis.max 
         leftYMax = d3.max([0, leftYMax]);

         // Update left axis
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.g.dimensions.height, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const leftYAxis = d3
            .axisLeft(leftYScale)
            .tickSize(!chart.leftYAxis.gridlines.hidden ? -chart.g.dimensions.width : 0)
            .tickFormat(d => utils.formatValue(d, chart.leftYAxis.format))
         
         chart.leftYAxis.el
            .call(leftYAxis)
            .selectAll('text').style('transform', 'translateX(-6px)');;

         // Set min and max values for left axis
         let rightYMin = chart.rightYAxis.min === 'auto'
            ? d3.min(rightData.map(d => d3.min(d.values, v => v.y)))
            : chart.rightYAxis.min
         rightYMin = d3.min([0, rightYMin]);

         let rightYMax = chart.rightYAxis.max === 'auto'
            ? d3.max(rightData.map(d => d3.max(d.values, v => v.y)))
            : chart.rightYAxis.max 
         rightYMax = d3.max([0, rightYMax]);

         // Update left axis
         const rightYDomain = [rightYMin, rightYMax];
         const rightYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.g.dimensions.height, 0]) // The range of the axis
            .domain(rightYDomain) // All values on axis;
         chart.rightYAxis.scale = rightYScale;

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
         const rightTickSize = leftDataExists ? 0 : -chart.g.dimensions.width;
         const rightYAxis = d3
            .axisRight(rightYScale)
            .tickSize(rightTickSize)
            .tickValues(rightValues)
            .tickFormat(d => utils.formatValue(d, chart.rightYAxis.format))
         
         chart.rightYAxis.el
            .call(rightYAxis)
            .selectAll('text').style('transform', 'translateX(6px)');;  

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
            .rangeRound([chart.bottomXAxis.margin.left, chart.g.dimensions.width-chart.bottomXAxis.margin.right]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis
            .padding(chart.bottomXAxis.padding)
         
         const bottomXAxis = d3
            .axisBottom(bottomXScale)
            .tickSize(!chart.bottomXAxis.gridlines.hidden ? -chart.g.dimensions.height : 0)
            .tickFormat(d => utils.formatValue(d, chart.bottomXAxis.format));

         chart.bottomXAxis.scale = bottomXScale;
         chart.bottomXAxis.el
            .call(bottomXAxis)
            .selectAll('text').style('transform', 'translateY(6px)');

         // Adjust gridlines so they are between groups
         if (chart.bottomXAxis.gridlines.position === 'betweenGroups') {
            utils.adjustBandGridlines(chart)
         }

         const createLine = (dataset) => {
            const line = d3.line()
               .x(d => bottomXScale(d.x) + (bottomXScale.bandwidth() / 2))
               .y(d => {
                  const scale = dataset.axis === 'left' ? leftYScale : rightYScale;
                  return scale(d.y);
               })
               .defined(d => { return d.y !== undefined})
               .curve(dataset.smooth === true ? d3.curveCatmullRom.alpha(0) : d3.curveLinear)
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

         const columnGroup = chart.g.el.selectAll(".column-group").data(columnGroupData, (d) => d.x);

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
         const series = chart.g.el.selectAll(".series-group").data(seriesData, (d) => d.name);

         const newSeries = series.enter().append("g")
            .attr("class", "series-group")

         newSeries.selectAll(".line").data(d => [d], d => d.name).enter()
            .append("path")
            .attr("class", "line")
            .style("stroke-width", d => d.lineWidth || 3)
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

         line.style("stroke-width", d => d.lineWidth || 3)
            .style("stroke", d => d.color)
            .attr("d", d => createLine(d))

         series.exit().remove();
      };
      chart.update(update);
      return chart;
   },


   /** 
    * @name timeLine
    * Scale: scaleTime
    * Axes: left, bottom
    **/

   timeLine: (elementId, update) => {
      const chart = utils.createBaseChart(elementId, {
         'bottomXAxis.format.string': 'auto',
         'bottomXAxis.format.isDate': true,
         'bottomXAxis.margin.left': 20,
         'bottomXAxis.margin.right': 20,
         'bottomXAxis.filter': d => d.getHours() === 0
      });
      chart.update = (updates) => {
         
         // Define all possible updates
         utils.updateBaseConfig(chart, updates);
         utils.updateBaseDimensions(chart);

         // Get animation duration from update 
         const animationDuration = (updates || {}).animationDuration || 0;

         // Set min and max values for left axis
         let leftYMin = chart.leftYAxis.min === 'auto'
            ? d3.min(Object.values(chart.datasets).map(d => d3.min(d.values, v => v.y)))
            : chart.leftYAxis.min
         leftYMin = d3.min([0, leftYMin]);

         let leftYMax = chart.leftYAxis.max === 'auto'
            ? d3.max(Object.values(chart.datasets).map(d => d3.max(d.values, v => v.y)))
            : chart.leftYAxis.max 
         leftYMax = d3.max([0, leftYMax]);

         // Update left axis
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.g.dimensions.height - 6, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const leftYAxis = d3
            .axisLeft(leftYScale)
            .tickSize(!chart.leftYAxis.gridlines.hidden ? -chart.g.dimensions.width : 0)
            .tickFormat(d => utils.formatValue(d, chart.leftYAxis.format))
         
         chart.leftYAxis.el.transition().duration(animationDuration)
            .call(leftYAxis)
            .selectAll('text').style('transform', 'translateX(-6px)');;

         // Set min and max values for left axis
         let bottomXMin = chart.bottomXAxis.min === 'auto'
            ? d3.min(Object.values(chart.datasets).map(d => d3.min(d.values, v => v.x)))
            : chart.bottomXAxis.min

         let bottomXMax = chart.bottomXAxis.max === 'auto'
            ? d3.max(Object.values(chart.datasets).map(d => d3.max(d.values, v => v.x)))
            : chart.bottomXAxis.max 

         // Update bottom axis
         let bottomXDomain = [bottomXMin, bottomXMax]
         const bottomXScale = d3
            .scaleTime() // Type of scale used for axis
            .rangeRound([chart.bottomXAxis.margin.left, chart.g.dimensions.width-chart.bottomXAxis.margin.right]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis

         const bottomXAxis = d3
            .axisBottom(bottomXScale)
            .tickSize(!chart.bottomXAxis.gridlines.hidden ? -chart.g.dimensions.height : 0)
            .tickSize(-chart.g.dimensions.height)

         if (chart.bottomXAxis.format.string !== 'auto') {
            bottomXAxis.tickFormat(d => utils.formatValue(d, chart.bottomXAxis.format))
         }
            
         // Calculate which ticks to remove for readability
         let ticks = bottomXScale.ticks()
         
         if (chart.bottomXAxis.filter) {
            ticks = ticks.filter(chart.bottomXAxis.filter);
         }

         if (ticks.length > 1) {
            const firstTick = ticks[0];
            const firstTickX = bottomXScale(firstTick);
            const secondTick = ticks[1];
            const secondTickX = bottomXScale(secondTick);
            const distanceBetween = secondTickX - firstTickX;
            const removalIndex = Math.ceil(60 / distanceBetween);
            bottomXAxis.tickValues(ticks.filter((d, i) => {
               return i % removalIndex === 0;
            }))
         }

         chart.bottomXAxis.scale = bottomXScale;
         chart.bottomXAxis.el.transition().duration(animationDuration)
            .call(bottomXAxis)
            .selectAll('text').style('transform', 'translateY(6px)');;

         const createLine = (dataset) => {
            const line = d3.line()
               .x(d => bottomXScale(d.x))
               .y(d => leftYScale(d.y))
               .defined(d => d.y !== undefined)
               .curve(dataset.isSmooth === true ? d3.curveCatmullRom.alpha(0) : d3.curveLinear)
            return line(dataset.values);
         }

         const xValues = [];
         const seriesData = Object.keys(chart.datasets).map(d => {
            const dataset = chart.datasets[d];
            dataset.name = d;
            dataset.values.forEach(d => {
               if (xValues.indexOf(d.x) === -1) {xValues.push(d.x)};
            })
            return dataset;
         })
         
         chart.bottomXAxis.definedValues = xValues;

         const series = chart.g.el.selectAll(".series-group").data(seriesData, (d) => d.name);
         const newSeries = series.enter().append("g")
            .attr("class", "series-group")

         newSeries.selectAll(".line").data(d => [d], d => d.name).enter()
            .append("path")
            .attr("class", "line")
            .style("stroke-width", d => d.lineWidth || 3)
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

         circles.transition().duration(animationDuration)
            .attr("r", d => d.radius !== undefined ? d.radius : 5)
            .attr("cx", d => bottomXScale(d.x))
            .attr("cy", d => leftYScale(d.y || 0))
            .attr("fill", d => d.y === undefined ? 'none' : d.color)

         circles.exit().remove();

         const line = series.selectAll(".line").data(d => [d], d => d.name)

         line.transition().duration(animationDuration)
            .style("stroke-width", d => d.lineWidth || 3)
            .style("stroke", d => d.color)
            .attr("d", d => createLine(d))

         series.exit().remove();
      };
      chart.update(update);
      return chart;
   },


   /** 
    * @name sparkLine
    * Scale: scaleTime
    * Axes: left, bottom
    **/

   sparkLine: (elementId, update) => {
      const chart = utils.createBaseChart(elementId, {
         'bottomXAxis.format.string': 'auto',
         'bottomXAxis.format.isDate': true,
         'g.margin.top': 0,
         'g.margin.bottom': 0,
         'g.margin.left': 0,
         'g.margin.right': 0,
      });
      chart.update = (updates) => {
         
         // Define all possible updates
         utils.updateBaseConfig(chart, updates);
         utils.updateBaseDimensions(chart);

         // Get animation duration from update 
         const animationDuration = (updates || {}).animationDuration || 0;

         // Set min and max values for left axis
         let leftYMin = chart.leftYAxis.min === 'auto'
            ? d3.min(Object.values(chart.datasets).map(d => d3.min(d.values, v => v.y)))
            : chart.leftYAxis.min

         let leftYMax = chart.leftYAxis.max === 'auto'
            ? d3.max(Object.values(chart.datasets).map(d => d3.max(d.values, v => v.y)))
            : chart.leftYAxis.max 

         // Set padding on either side of left margin
         let leftYRange = leftYMax - leftYMin;
         const padding = leftYRange * 0.25;
         leftYMin = leftYMin - padding;
         leftYMax = leftYMax + padding;
         leftYRange = leftYMax - leftYMin;

         // Calculate left gridlines values
         const leftYValues = [];
         const gridlines = 3;
         const step = leftYRange / (gridlines + 1);
         
         for (let i = 1; i <= gridlines; i++) {
            const axisValue = leftYMin + (i * step)
            leftYValues.push(axisValue)
         } 

         // Update left axis
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.g.dimensions.height, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const leftYAxis = d3
            .axisLeft(leftYScale)
            .tickValues(leftYValues) 
            .tickSize(!chart.leftYAxis.gridlines.hidden ? -chart.g.dimensions.width : 0)
            .tickFormat(d => utils.formatValue(d, chart.leftYAxis.format))
         
         chart.leftYAxis.el.call(leftYAxis)

         // Set min and max values for left axis
         let bottomXMin = chart.bottomXAxis.min === 'auto'
            ? d3.min(Object.values(chart.datasets).map(d => d3.min(d.values, v => v.x)))
            : chart.bottomXAxis.min;

         let bottomXMax = chart.bottomXAxis.max === 'auto'
            ? d3.max(Object.values(chart.datasets).map(d => d3.max(d.values, v => v.x)))
            : chart.bottomXAxis.max;

         // Update bottom axis
         let bottomXDomain = [bottomXMin, bottomXMax]
         const bottomXScale = d3
            .scaleTime() // Type of scale used for axis
            .rangeRound([chart.bottomXAxis.margin.left, chart.g.dimensions.width-chart.bottomXAxis.margin.right]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis

         // Calculate which ticks to remove for readability
         chart.bottomXAxis.scale = bottomXScale;

         const createLine = (dataset) => {
            const line = d3.line()
               .x(d => bottomXScale(d.x))
               .y(d => leftYScale(d.y))
               .defined(d => d.y !== undefined)
               .curve(dataset.isSmooth === true ? d3.curveCatmullRom.alpha(0) : d3.curveLinear)
            return line(dataset.values);
         }

         const createArea = (dataset) => {
            const area = d3.area()
               .x(d => bottomXScale(d.x))
               .y0(() => leftYScale(leftYMin))
               .y1(d => leftYScale(d.y))
               .defined(d => { return d.y !== undefined})
               .curve(dataset.isSmooth === true ? d3.curveCatmullRom.alpha(0) : d3.curveLinear)
            return area(dataset.values);
         }

         const xValues = [];
         const seriesData = Object.keys(chart.datasets).map(d => {
            const dataset = chart.datasets[d];
            dataset.name = d;
            dataset.values.forEach(d => {
               if (xValues.indexOf(d.x) === -1) {xValues.push(d.x)};
            })
            return dataset;
         })
         
         chart.bottomXAxis.definedValues = xValues;

         const series = chart.g.el.selectAll(".series-group").data(seriesData, (d) => d.name);
         const newSeries = series.enter().append("g")
            .attr("class", "series-group")

         newSeries.selectAll(".line").data(d => [d], d => d.name).enter()
            .append("path")
            .attr("class", "line")
            .style("stroke-width", d => d.lineWidth || 3)
            .style("stroke", d => d.color)
            .style("fill", 'none')
            .attr("d", d => createLine(d))
            
         const line = series.selectAll(".line").data(d => [d], d => d.name)

         line.transition().duration(animationDuration)
            .style("stroke-width", d => d.lineWidth || 3)
            .style("stroke", d => d.color)
            .attr("d", d => createLine(d))

         newSeries.selectAll(".area").data(d => [d], d => d.name).enter()
            .append("path")
            .attr("class", "area")
            .style("stroke-width", d => d.lineWidth || 3)
            .style("stroke", 'none')
            .style("fill", d => d.color)
            .style("opacity", d => d.opacity || 0.2)
            .attr("d", d => createArea(d))   

         const area = series.selectAll(".area").data(d => [d], d => d.name)

         area.style("stroke-width", d => d.lineWidth || 3)
            .style("stroke", 'none')
            .style("fill", d => d.color)
            .style("opacity", d => d.opacity || 0.2)
            .attr("d", d => createArea(d))  

         series.exit().remove();
      };
      chart.update(update);
      return chart;
   },


   /** 
    * @name sparkColumn
    * Scale: scaleBand
    * Axes: left, bottom
    **/

   sparkColumn: (elementId, update) => {
      const chart = utils.createBaseChart(elementId, {
         'bottomXAxis.gridlines.position': 'betweenGroups',
         'g.margin.top': 0,
         'g.margin.bottom': 0,
         'g.margin.left': 0,
         'g.margin.right': 0,
      });
      chart.update = (updates) => {

         // Update dimensions and base dimensions
         utils.updateBaseConfig(chart, updates);
         utils.updateBaseDimensions(chart);

         // Set min and max values for left axis
         let leftYMin = chart.leftYAxis.min === 'auto'
            ? d3.min(Object.values(chart.datasets).map(d => d3.min(d.values, v => v.y)))
            : chart.leftYAxis.min

         let leftYMax = chart.leftYAxis.max === 'auto'
            ? d3.max(Object.values(chart.datasets).map(d => d3.max(d.values, v => v.y)))
            : chart.leftYAxis.max 

         // Set padding on either side of left margin
         let leftYRange = leftYMax - leftYMin;
         const padding = leftYRange * 0.25;
         leftYMin = leftYMin - padding;
         leftYMax = leftYMax + padding;
         leftYRange = leftYMax - leftYMin;

         // Calculate left gridlines values
         const leftYValues = [];
         const gridlines = 3;
         const step = leftYRange / (gridlines + 1);
         
         for (let i = 1; i <= gridlines; i++) {
            const axisValue = leftYMin + (i * step)
            leftYValues.push(axisValue)
         } 

         // Update left axis
         const leftYDomain = [leftYMin, leftYMax];
         const leftYScale = d3
            .scaleLinear() // Type of scale used for axis
            .rangeRound([chart.g.dimensions.height, 0]) // The range of the axis
            .domain(leftYDomain) // All values on axis;
         chart.leftYAxis.scale = leftYScale;

         // Draw axis with .call d3 function
         const leftYAxis = d3
            .axisLeft(leftYScale)
            .tickValues(leftYValues)
            .tickSize(!chart.leftYAxis.gridlines.hidden ? -chart.g.dimensions.width : 0)
            .tickFormat(d => utils.formatValue(d, chart.leftYAxis.format))
         
         chart.leftYAxis.el
            .call(leftYAxis)

         // Update bottom axis
         let bottomXDomain = []
         Object.values(chart.datasets).forEach(d => d.values.forEach(v => {
            if (bottomXDomain.indexOf(v.x) === -1){bottomXDomain.push(v.x)}
         }));

         bottomXDomain = bottomXDomain.sort((a,b) => {
            if (a < b) { return -1; }
            if (a > b) { return 1; }
            return 0;
         });

         const bottomXScale = d3
            .scaleBand() // Type of scale used for axis
            .rangeRound([chart.bottomXAxis.margin.left, chart.g.dimensions.width-chart.bottomXAxis.margin.right]) // The range of the axis
            .domain(bottomXDomain) // The values on the axis
            .padding(chart.bottomXAxis.padding) // Padding between columns
         
         chart.bottomXAxis.scale = bottomXScale;

         const dataKeys = Object.keys(chart.datasets) || [];
         const columnData = chart.datasets[dataKeys[0]] || {};
         const columns = chart.g.el.selectAll(".column").data(columnData.values, (d) => d.x);

         columns.enter().append("rect")
            .attr("class", "column")
            .attr('width', bottomXScale.bandwidth())
            .attr('rx', columnData.borderRadius !== undefined ? columnData.borderRadius : 0)
            .style('fill', columnData.color)
            .attr('height', d => {
               return d.y < 0 
                  ? leftYScale(d.y) - leftYScale(leftYMin)
                  : leftYScale(leftYMin) - leftYScale(d.y)
            })
            .attr('y', d => d.y < 0 ? leftYScale(0) : leftYScale(d.y))
            .attr('x', d => bottomXScale(d.x))

         
         columns
            .attr('width', bottomXScale.bandwidth())
            .attr('rx', columnData.borderRadius !== undefined ? columnData.borderRadius : 0)
            .style('fill', columnData.color)
            .attr('height', d => {
               return d.y < 0 
                  ? leftYScale(d.y) - leftYScale(leftYMin)
                  : leftYScale(leftYMin) - leftYScale(d.y)
            })
            .attr('y', d => d.y < 0 ? leftYScale(0) : leftYScale(d.y))
            .attr('x', d => bottomXScale(d.x))

         columns.exit().remove()
         
      }
      chart.update(update);
      return chart;
   },

   // TODO
   // heatMap: (chartConfig) => {},
   // bar: (chartConfig) => {},
   // stackedBar: (chartConfig) => {},
   // groupedBar: (chartConfig) => {},
   // pieChart: (chartConfig) => {}

}

// Export charts
export default charts