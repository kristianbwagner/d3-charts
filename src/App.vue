<template>
  <div id="app">	
      <div id="header">
         <router-link to="/column">Column</router-link>
         <router-link to="/grouped-column">Grouped Column</router-link>
         <router-link to="/stacked-column">Stacked Column</router-link>
         <router-link to="/line">Line</router-link>
         <router-link to="/area">Area</router-link>
         <router-link to="/stacked-area">Stacked Area</router-link>
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
   }

</style>