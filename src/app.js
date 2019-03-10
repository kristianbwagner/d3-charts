// Main vue app file that sets up Vue instance
import Vue from 'vue';
import App from './App.vue';
import router from './router';

// Init new Vue instance
new Vue({
  el: '#app',
  router,
  render: r => r(App)
});