<template>
  <div id="app">	

      <div class="buttons">
         <button @click="changeData">Change Data</button>
      </div>

      <div 
         id="column-chart"
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

   import charts from  '@/scripts/charts.js';
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
         
         this.chart = new charts.column('#column-chart', {
            leftYAxis: {
               max: 1200,
               min: -1200,
            },
            bottomXAxis: {
               format: {
                  string: '%_d %b',
                  isDate: true
               }
            },
            datasets: {
               'visits': {
                  color: '#008067',
                  borderRadius: 4,
                  values: [
                     {x: new Date(2019,1,2), y: 1160},
                     {x: new Date(2019,1,5), y: 1080},
                     {x: new Date(2019,1,1), y: -620},
                     {x: new Date(2019,1,3), y: 1040},
                     {x: new Date(2019,1,4), y: 1030},
                     {x: new Date(2019,1,10), y: 1030},
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
         },200),
         changeData() {
            this.chart.update({

               leftYAxis: {
                  max: 'auto',
                  min: 'auto',
               },
               bottomXAxis: {
                  format: {
                     string: '',
                     isDate: false
                  }
               },
               datasets: {
                  'visits': null,
                  'conversions' : {
                     color: 'red',
                     values: [
                        {x: 'DK', y: 160},
                        {x: 'SE', y: 140},
                        {x: 'NO', y: 120}
                     ]
                  }
               }
            })
         }
      }
	}
</script>
