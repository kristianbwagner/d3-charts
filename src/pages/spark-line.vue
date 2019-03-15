<template>
   <div id="app">	

      <div class="buttons">
         <button @click="changeData">Change Data</button>
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
         
         this.chart = new charts.sparkLine('#line-chart', {
            datasets: {
               'conversions': {
                  color: '#008067',
                  lineWidth: 3,
                  values: [
                     {x: new Date(2019, 1, 1), y: 1020},
                     {x: new Date(2019, 1, 2), y: 820},
                     {x: new Date(2019, 1, 3), y: 920},
                     {x: new Date(2019, 1, 4), y: 1050},
                     {x: new Date(2019, 1, 5), y: 960},
                     {x: new Date(2019, 1, 6), y: 720},
                     {x: new Date(2019, 1, 7), y: 1020},
                     {x: new Date(2019, 1, 8), y: 820},
                     {x: new Date(2019, 1, 9), y: 920},
                     {x: new Date(2019, 1, 10), y: 1050},
                     {x: new Date(2019, 1, 11), y: 960},
                     {x: new Date(2019, 1, 12), y: 720},
                     {x: new Date(2019, 1, 13), y: 620},
                     {x: new Date(2019, 1, 14), y: 820},
                     {x: new Date(2019, 1, 15), y: 920},
                     {x: new Date(2019, 1, 16), y: 750},
                     {x: new Date(2019, 1, 17), y: 960},
                     {x: new Date(2019, 1, 18), y: 720},
                     {x: new Date(2019, 1, 19), y: 820},
                     {x: new Date(2019, 1, 20), y: 920},
                     {x: new Date(2019, 1, 21), y: 1050},
                     {x: new Date(2019, 1, 22), y: 960},
                     {x: new Date(2019, 1, 23), y: 720},
                     {x: new Date(2019, 1, 24), y: 620},
                     {x: new Date(2019, 1, 25), y: 820},
                     {x: new Date(2019, 1, 26), y: 920},
                     {x: new Date(2019, 1, 27), y: 750},
                     {x: new Date(2019, 1, 28), y: 960},
                     {x: new Date(2019, 1, 29), y: 720},
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
                        {x: new Date(2019, 1, 1), y: 520},
                        {x: new Date(2019, 1, 2), y: 320},
                        {x: new Date(2019, 1, 3), y: 420},
                        {x: new Date(2019, 1, 4), y: 1050},
                        {x: new Date(2019, 1, 5), y: 960},
                        {x: new Date(2019, 1, 6), y: 420},
                        {x: new Date(2019, 1, 7), y: 1020},
                        {x: new Date(2019, 1, 8), y: 820},
                        {x: new Date(2019, 1, 9), y: 920},
                        {x: new Date(2019, 1, 10), y: 750},
                        {x: new Date(2019, 1, 11), y: 960},
                        {x: new Date(2019, 1, 12), y: 720},
                        {x: new Date(2019, 1, 13), y: 420},
                        {x: new Date(2019, 1, 14), y: 320},
                        {x: new Date(2019, 1, 15), y: 220},
                        {x: new Date(2019, 1, 16), y: 350},
                        {x: new Date(2019, 1, 17), y: 560},
                        {x: new Date(2019, 1, 18), y: 420},
                     ]
                  }
               } 
            })
         }
      }
	}
</script>
