<template>
   <div 
      :id="chartId"
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
      <div 
         class="loading-overlay"
         v-if="isLoading">
         Loading...
      </div>
   </div>
</template>

<script>

   import charts from  '@/scripts/charts.js'
   import debounce from 'lodash/debounce';

	export default {
      components: {},
      props: {
         value: {
            type: Object,
            required: true
         }
      },
      data() {
         return {
            chart: {},
            isLoading: true,
            hoverValue: '',
            hoverTop: 0,
            hoverLeft: 0
         }
      },
      computed: {
         noData() {
            return this.value.datasets === undefined;
         },
         chartId() {
            return `column-chart-${this._uid}`;
         }
      },
      mounted() {
         const vm = this;
         this.isLoading = this.noData;
         this.chart = new charts.column(`#${this.chartId}`, this.value)
         this.chart.mouseMove(d => {
            vm.hoverValue = d.y;
            vm.hoverTop = d.top;
            vm.hoverLeft = d.left;
         })
         this.chart.mouseOut(d => vm.hoverValue = '')
         window.addEventListener('resize', debounce(() => vm.chart.update(), 200));
      },
      watch: {
         value() {
            this.chart.update(this.value);
            this.isLoading = false
         }
      },
      destroyed() {
         window.removeEventListener('resize', this.onResize);
      }
	}
</script>

