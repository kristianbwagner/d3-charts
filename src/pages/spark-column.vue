<template>
   <div id="app">	

      <div class="buttons">
         <button @click="changeData">Change Data</button>
         <button @click="deleteChart">Delete Chart</button>
         <button @click="createChart">Create Chart</button>
      </div>
         
      <div 
         id="line-chart"
         class="spark-chart">
         
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
         
         this.chart = new charts.sparkColumn('#line-chart', {
            datasets: {
               'conversions': {
                  color: '#008067',
                  values: [
                     {x: 'Monday', y: 1020},
                     {x: 'Tuesday', y: 820},
                     {x: 'Wednesday', y: 920},
                     {x: 'Thursday', y: 1050},
                     {x: 'Friday', y: 960},
                     {x: 'Saturday', y: 720},
                     {x: 'Sunday', y: 1020}
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
                     color: '#008067',
                     lineWidth: 3,
                     values: [
                        {x: 'Monday', y: 720},
                        {x: 'Tuesday', y: 420},
                        {x: 'Wednesday', y: 620},
                        {x: 'Thursday', y: 850},
                        {x: 'Friday', y: 460},
                        {x: 'Saturday', y: 520},
                        {x: 'Sunday', y: 420}
                     ]
                  }
               } 
            })
         },
         deleteChart() {
            this.chart.delete()
         },
         createChart() {
            this.chart.delete();
            this.chart = new charts.sparkColumn('#line-chart', {
               datasets: {
                  'conversions': {
                     color: '#008067',
                     values: [
                        {x: 'Monday', y: 1020},
                        {x: 'Tuesday', y: 820},
                        {x: 'Wednesday', y: 920},
                        {x: 'Thursday', y: 1050},
                        {x: 'Friday', y: 960},
                        {x: 'Saturday', y: 720},
                        {x: 'Sunday', y: 1020}
                     ]
                  }
               } 
            })
         }
      }
	}
</script>
