<template>
   <div id="app">	

      <div class="buttons">
         <button @click="changeData">Change Data</button>
      </div>
         
      <div 
         id="scatterplot-chart"
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
         
         this.chart = new charts.scatterplot('#scatterplot-chart', {
            datasets: {
               'conversions': {
                  color: '#008067',
                  strokeWidth: 3,
                  radius: 5,
                  hasBestFit: true,
                  values: [
                     {x: 1, y: 700},
                     {x: 1.4, y: 1200},
                     {x: 2, y: 1020},
                     {x: 2.5, y: 1000},
                     {x: 3, y: 400},
                     {x: 3.5, y: 1240},
                     {x: 4, y: 1400},
                     {x: 4.5, y: 1900},
                     {x: 5, y: 1200}
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
               datasets: {
                  'conversions': {
                     hasBestFit: true,
                     values: [
                        {x: 1, y: 100},
                        {x: 2, y: 200},
                        {x: 3, y: 270},
                        {x: 4, y: 470},
                        {x: 5, y: 500}
                     ]
                  }
               } 
            })
         }
      }
	}
</script>
