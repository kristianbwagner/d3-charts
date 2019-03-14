<template>
   <div id="app">	

      <div class="buttons">
         <button @click="changeData">Change Data</button>
      </div>
         
      <div 
         id="line-chart"
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
         
         this.chart = new charts.line('#line-chart', {
            datasets: {
               'conversions': {
                  color: '#008067',
                  strokeWidth: 3,
                  radius: 5,
                  isSmooth: true,
                  values: [
                     {x: 'DK', y: 1020},
                     {x: 'SE', y: 560},
                     {x: 'NO', y: 2240},
                     {x: 'FI', y: 730},
                     {x: 'DE', y: 480}
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
                  'visits': {
                     color: 'red',
                     strokeWidth: 3,
                     smooth: true,
                     radius: 5,
                     values: [
                        {x: 'DK', y: -620},
                        {x: 'SE', y: 1160},
                        {x: 'NO', y: 1040},
                        {x: 'FI', y: 1030},
                        {x: 'DE', y: 1080}
                     ]
                  },
                  'conversions': {
                     values: [
                        {x: 'DK', y: 1020},
                        {x: 'SE', y: 560},
                        {x: 'NO', y: 2240},
                        {x: 'FI', y: 730},
                        {x: 'DE', y: 480}
                     ]
                  }
               } 
            })
         }
      }
	}
</script>
