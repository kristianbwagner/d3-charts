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

<style>

   body {
      margin: 0
   }

   #header {
      padding: 20px;
      background: rgb(0, 93, 180);
      overflow-x: scroll;
      overflow-y: hidden;
   }

   .link {
      margin: 0 4px;
      color: #FFF;
   }

</style>