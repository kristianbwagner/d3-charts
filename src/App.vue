<template>
  <div id="app">	
		
     <div 
         id="chart"
         style="width: 600px; height: 300px; background: #EFEFEF">
         
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

	export default {
		components: {},
      computed: {},
      data() {
         return {
            hoverValue: 0,
            hoverTop: 0,
            hoverLeft: 0,
         }
      },
      mounted() {
         const vm = this;
         const chart = new charts.column({
            containerId: '#chart',
            dataset: {
               name: 'visits',
               values: [
                  {x: 'DK', y: 120},
                  {x: 'SE', y: 60},
                  {x: 'NO', y: 40},
                  {x: 'FI', y: 30},
                  {x: 'DE', y: 80}
               ]
            } 
         })

         chart.mouseMove(d => {
            vm.hoverValue = d.y;
            vm.hoverTop = d.top;
            vm.hoverLeft = d.left;
         })

         chart.mouseOut(d => {
            vm.hoverValue = ''
         })

         setTimeout(d => {
            chart.update({
               dataset: {
                  name: 'visits',
                  values: [
                     {x: 'DK', y: 60},
                     {x: 'SE', y: 40},
                     {x: 'NO', y: 120},
                     {x: 'FI', y: 130},
                     {x: 'DE', y: 80}
                  ]
               }
            })
         }, 1500)

         setTimeout(d => {
            chart.update({
               dataset: {
                  name: 'visits',
                  values: [
                     {x: 'DK', y: 30},
                     {x: 'SE', y: 40},
                     {x: 'FI', y: 50},
                  ]
               }
            })
         }, 3000)
      }
	}
</script>
