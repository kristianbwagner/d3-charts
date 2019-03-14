<template>
   <div id="app">	

      <div class="buttons">
         <button @click="changeData">Change Data</button>
      </div>
		
      <div 
         id="chart"
         class="chart">
         
         <div 
            class="chart-hover"
            v-if="hoverValue !== ''"
            :style="{
               top: hoverTop + 'px',
               left: hoverLeft + 'px',
            }">
            {{hoverValue}}
         </div>
      </div>

   </div>
</template>

<style lang="scss">
</style>

<script>

   import charts from  '@/scripts/charts.js'
   import debounce from 'lodash/debounce';

	export default {
		components: {},
      computed: {},
      data() {
         return {
            chart: {},
            hoverValue: '',
            hoverTop: 0,
            hoverLeft: 0,
         }
      },
      mounted() {
         const vm = this;
         
         this.chart = new charts.lineColumn('#chart', {
            rightYAxis: {
               format: {string: ',.0%'},
               max: 1
            },
            datasets: {
               'visits': {
                  type: 'column',
                  axis: 'left',
                  color: '#008067',
                  borderRadius: 5,
                  values: [
                     {x: 'DK', y: 1540},
                     {x: 'SE', y: 430},
                     {x: 'NO', y: 820},
                     {x: 'FI', y: 930},
                     {x: 'DE', y: 1080}
                  ]
               },
               'visits last year': {
                  type: 'column',
                  axis: 'left',
                  color: '#b1b1b1',
                  borderRadius: 5,
                  values: [
                     {x: 'DK', y: 1240},
                     {x: 'SE', y: 630},
                     {x: 'NO', y: 620},
                     {x: 'FI', y: 430},
                     {x: 'DE', y: 680}
                  ]
               },
               'interaction rate': {
                  type: 'line',
                  axis: 'right',
                  color: '#424242',
                  strokeWidth: 3,
                  radius: 5,
                  values: [
                     {x: 'DK', y: 0.820},
                     {x: 'SE', y: 0.460},
                     {x: 'NO', y: 0.440},
                     {x: 'FI', y: 0.930},
                     {x: 'DE', y: 0.1080}
                  ]
               }
            } 
         })

         this.chart.mouseMove(d => {
            vm.hoverValue = d.y;
            vm.hoverTop = d.top;
            vm.hoverLeft = d.left;
         })

         this.chart.mouseOut(d => {
            vm.hoverValue = ''
         })

         window.addEventListener('resize', this.onResize);
      },
      destroyed() {
         window.removeEventListener('resize', this.onResize);
      },
      methods: {
         onResize: debounce(function(){
            this.chart.update()
         }, 200),
         changeData() {
            this.chart.update({
               rightYAxis: {max: 1},
               datasets: {
                  'interaction rate': null,
                  'visits': null
               }
            })
         }
      }
	}
</script>
