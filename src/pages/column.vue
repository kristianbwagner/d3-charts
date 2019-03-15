<template>
   <div id="app">	

      <div class="buttons">
         <button @click="changeData">Change Data</button>
         <button @click="resetData">Reset Data</button>
      </div>

      <column-chart-widget
         :value="columnChart">
      </column-chart-widget>

   </div>
</template>

<style lang="scss">
</style>

<script>

   import ColumnChartWidget from '@/components/dashboard-widgets/charts/column.vue'
   import GroupedColumnChartWidget from '@/components/dashboard-widgets/charts/grouped-column.vue'
   import charts from  '@/scripts/charts.js';
   import debounce from 'lodash/debounce';

	export default {
		components: {
         ColumnChartWidget,
         GroupedColumnChartWidget
      },
      computed: {},
      data() {
         return {
            columnChart: {}
         }
      },
      mounted() {
         setTimeout(d => {
             this.columnChart = {
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
               },
               bottomXAxis: {
                  format: {
                     string: '%_d %b',
                     isDate: true
                  }
               }
            }
         }, 1000)
      },
      destroyed() {},
      methods: {
         changeData() {
            this.columnChart = {
               datasets: {
                  'visits': {
                     values: [
                        {x: new Date(2019,1,2), y: 260},
                        {x: new Date(2019,1,5), y: 380},
                        {x: new Date(2019,1,1), y: 620},
                     ]
                  }
               },
            }
         },
         resetData() {
            this.columnChart = {
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
               },
               bottomXAxis: {
                  format: {
                     string: '%_d %b',
                     isDate: true
                  }
               }
            }
         }
      }
	}
</script>
