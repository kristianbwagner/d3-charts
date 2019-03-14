<template>
  <div id="app">	
      <div id="header">
         <router-link class="link" to="/column">Column</router-link>
         <router-link class="link" to="/grouped-column">Grouped Column</router-link>
         <router-link class="link" to="/stacked-column">Stacked Column</router-link>
         <router-link class="link" to="/line">Line</router-link>
         <router-link class="link" to="/area">Area</router-link>
         <router-link class="link" to="/stacked-area">Stacked Area</router-link>
         <router-link class="link" to="/line-column">Line Column</router-link>
         <router-link class="link" to="/time-line">Time line</router-link>
      </div>
      <router-view>
		</router-view>
  </div>
</template>

<style lang="scss">

   @import url("https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900,");

   body {
      margin: 0;
      background: #ECECEC;
      font-size: 14px;
   }

   body, button, text {
      font-family: "Roboto", "Helvetica Neue", sans-serif;
   }

   #header {
      padding: 20px;
      overflow-x: scroll;
      overflow-y: hidden;
      border-bottom: 1px solid #E4E4E4;
   }

   .link {
      padding: 0 4px;
      opacity: 1;
      text-decoration: none;
      color: #000;
      opacity: 0.5;

      &:hover {
         opacity: 1;
      }
      
      &.router-link-active {
         opacity: 1;
         text-decoration: underline;
      }

   }

   .chart {
      position: relative;
      cursor: pointer;
      height: 350px;
      background: #FFF;
      border: 1px solid #E4E4E4;
      margin: 0 30px;
   }

   .chart-hover {
      position: absolute;
      background: #FFF;
      border: 1px solid #E4E4E4;
      padding: 4px 6px;
      pointer-events: none;
      transform: translateX(-50%);
      box-shadow: 0 0 5px rgba(0,0,0,0.1)
   }

   line {
      stroke: #EFEFEF
   }

   .domain {
      stroke: none
   }

   .buttons {
      margin: 12px 30px;
   }

   button {
      font-size: 12px;
      height: 30px;
      background: #FFF;
      border: 1px solid #E4E4E4;
      outline: none;
      cursor: pointer;
      
      &:hover {
         background: #EFEFEF;
      }
   }

   text {
      font-size: 12px;
   }

   

</style>