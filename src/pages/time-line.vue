<template>
   <div id="app">	

         <div class="buttons">
            <button @click="changeTimePeriod">Change time period</button>
            <button @click="resetTimePeriod">Reset time period</button>
         </div>
      
         <div 
            id="time-line-chart"
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
         
         this.chart = new charts.timeLine('#time-line-chart', {
            datasets: {
               'visits': {
                  color: '#008067',
                  lineWidth: 3,
                  radius: 5,
                  values: [
                     {x: new Date(2019,1,1), y: 1020},
                     {x: new Date(2019,1,2), y: 840},
                     {x: new Date(2019,1,3), y: 1640},
                     {x: new Date(2019,1,4), y: 730},
                     {x: new Date(2019,1,5), y: 480},
                     {x: new Date(2019,1,6), y: 720},
                     {x: new Date(2019,1,7), y: 560},
                     {x: new Date(2019,1,8), y: 2040},
                  ]
               },
               'sessions': {
                  color: '#b1b1b1',
                  lineWidth: 3,
                  radius: 5,
                  values: [
                     {x: new Date(2019,1,1), y: 0},
                     {x: new Date(2019,1,3), y: 940},
                     {x: new Date(2019,1,4), y: 130},
                     {x: new Date(2019,1,6), y: 520},
                     {x: new Date(2019,1,7), y: 260},
                     {x: new Date(2019,1,8), y: 640}
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
         changeTimePeriod() {
            this.chart.update({
               bottomXAxis: {
                  min: new Date(2019,1,4),
                  max: new Date(2019,1,6)
               }
            })
         },
         resetTimePeriod() {
            this.chart.update({
               bottomXAxis: {
                  min: 'auto',
                  max: 'auto'
               },
            })
         }
      }
	}
</script>
