<template>
  <div id="app">	

      <div class="buttons">
         <button @click="updateData">Update Data</button>
         <button @click="changeData">Change Data</button>
      </div>
         
      <div 
         id="grouped-column-chart"
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
         
         this.chart = new charts.groupedColumn('#grouped-column-chart', {
            bottomXAxis: {
               format: {
                  string: '%_d %b',
                  isDate: true
               }
            },
            datasets: {
               'visits': {
                  color: '#008067',
                  borderRadius: 5,
                  values: [
                     {x: new Date(2019,1,10), y: 480},
                     {x: new Date(2019,1,1), y: 1020},
                     {x: new Date(2019,1,2), y: 560},
                     {x: new Date(2019,1,3), y: 2240},
                     {x: new Date(2019,1,4), y: 730},
                     {x: new Date(2019,1,5), y: 480},
                     {x: new Date(2019,1,6), y: 720},
                     {x: new Date(2019,1,7), y: 560},
                     {x: new Date(2019,1,8), y: 2040},
                     {x: new Date(2019,1,9), y: 530},    
                  ]
               },
               'sessions': {
                  color: '#b1b1b1',
                  borderRadius: 5,
                  values: [
                     {x: new Date(2019,1,1), y: 20},
                     {x: new Date(2019,1,2), y: 460},
                     {x: new Date(2019,1,3), y: 940},
                     {x: new Date(2019,1,4), y: 530},
                     {x: new Date(2019,1,5), y: 680},
                     {x: new Date(2019,1,6), y: 520},
                     {x: new Date(2019,1,7), y: 460},
                     {x: new Date(2019,1,8), y: 640},
                     {x: new Date(2019,1,9), y: 430},
                     {x: new Date(2019,1,10), y: 380}
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
         },200),
         updateData() {
            this.chart.update({
               leftYAxis: {
                  min: 100,
               },
               bottomXAxis: {
                  padding: 0.3
               }
            })
         },
         changeData() {
            this.chart.update({
               datasets: {
                  'visits': {
                     values: [
                        {x: new Date(2019,1,1), y: 820},
                        {x: new Date(2019,1,2), y: 560},
                        {x: new Date(2019,1,3), y: 640},
                        {x: new Date(2019,1,4), y: 1230},
                        {x: new Date(2019,1,5), y: 880},
                        {x: new Date(2019,1,6), y: 920},
                        {x: new Date(2019,1,7), y: 760},
                        {x: new Date(2019,1,8), y: 1040},
                        {x: new Date(2019,1,9), y: 830},
                        {x: new Date(2019,1,10), y: 480}
                     ]
                  },
               }
            })
         }
      }
	}
</script>
