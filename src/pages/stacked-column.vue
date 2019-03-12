<template>
  <div id="app">	

     <button @click="changeData">Change Data</button>

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
         this.chart = new charts.stackedColumn('#chart', {
            datasets: {
               'mobile': {
                  color: 'green',
                  borderRadius: 4,
                  values: [
                     {x: 'DK', y: 200},
                     {x: 'SE', y: 240},
                     {x: 'NO', y: 140},
                     {x: 'FI', y: 130},
                     {x: 'DE', y: 180}
                  ]
               },
               'desktop': {
                  color: 'blue',
                  borderRadius: 4,
                  values: [
                     {x: 'DK', y: 120},
                     {x: 'SE', y: 160},
                     {x: 'NO', y: 140},
                     {x: 'FI', y: 110},
                     {x: 'DE', y: 120}
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
            this.chart.update();
         }, 200),
         changeData() {
            this.chart.update({
               datasets: {
                  'mobile': null,
                  'tablet' : {
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
