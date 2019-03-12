<template>
  <div id="app">	
     <button @click="changeTimePeriod">Change time period</button>
     <button @click="resetTimePeriod">Reset time period</button>
     <div 
         id="chart"
         style="width: 100%; height: 300px; background: #EFEFEF">
         
         <div 
            id="hover"
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

   #chart {
      position: relative;
      cursor: pointer;
   }

   #hover {
      position: absolute;
      background: #EFEFEF;
      border: 1px solid;
      padding: 4px 6px;
      pointer-events: none;
      transform: translateX(-50%)
   }

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
         
         this.chart = new charts.timeLine('#chart', {
            datasets: {
               'visits': {
                  color: 'green',
                  strokeWidth: 3,
                  radius: 5,
                  isSmooth: true,
                  values: [
                     {x: new Date(2019,1,1), y: 1020},
                     {x: new Date(2019,1,2), y: 840},
                     {x: new Date(2019,1,3), y: 1640},
                     {x: new Date(2019,1,4), y: 730},
                     {x: new Date(2019,1,5), y: 480},
                     {x: new Date(2019,1,6), y: 720},
                     {x: new Date(2019,1,7), y: 560},
                     {x: new Date(2019,1,8), y: 2040},
                     {x: new Date(2019,1,9), y: 530},
                     {x: new Date(2019,1,10), y: 480}
                  ]
               },
               'sessions': {
                  color: 'blue',
                  strokeWidth: 3,
                  radius: 5,
                  isSmooth: true,
                  values: [
                     {x: new Date(2019,1,1), y: 20},
                     {x: new Date(2019,1,3), y: 940},
                     {x: new Date(2019,1,4), y: 130},
                     {x: new Date(2019,1,6), y: 520},
                     {x: new Date(2019,1,7), y: 260},
                     {x: new Date(2019,1,8), y: 640},
                     {x: new Date(2019,1,9), y: 830},
                     {x: new Date(2019,1,10), y: 1580}
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
