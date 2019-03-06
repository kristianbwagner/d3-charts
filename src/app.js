// Main vue app file that sets up Vue instance
import Vue from 'vue';
import App from './App.vue';

// Init new Vue instance
new Vue({
  el: '#app',
  render: r => r(App)
});