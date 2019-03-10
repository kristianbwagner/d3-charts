<template>
  <div id="app">	

     <button @click="updateData">Update Data</button>
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

   import charts from  '@/scripts/charts.js'

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
         
         this.chart = new charts.groupedColumn({
            containerId: '#chart',
            datasets: {
               'visits': {
                  color: 'green',
                  borderRadius: 4,
                  values: [
                     {x: 'DK', y: 1120},
                     {x: 'SE', y: 1160},
                     {x: 'NO', y: 1040},
                     {x: 'FI', y: 1030},
                     {x: 'DE', y: 980}
                  ]
               },
               'transactions': {
                  color: 'blue',
                  borderRadius: 4,
                  values: [
                     {x: 'DK', y: 180},
                     {x: 'SE', y: 360},
                     {x: 'NO', y: 440},
                     {x: 'FI', y: 630},
                     {x: 'DE', y: 280}
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

      },
      methods: {
         updateData() {
            this.chart.update({
               leftYAxis: {
                  min: 100,
               },
               bottomXAxis: {
                  padding: 0.3
               },
               dataset: {
                  name: 'visits',
                  color: 'red'
               }
            })
         },
         changeData() {
            this.chart.update({
               datasets: {
                  'visits': {
                     color: 'green',
                     values: [
                        {x: 'DK', y: 2020},
                        {x: 'SE', y: 1160},
                        {x: 'NO', y: 1040},
                        {x: 'FI', y: 1030},
                        {x: 'DE', y: 1280}
                     ]
                  }
               }
            })
         }
      }
	}
</script>
