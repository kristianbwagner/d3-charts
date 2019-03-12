export default [
   {
      path: '/column',
      name: "column",
      component: () => import('@/pages/column.vue'),
   },
   {
      path: '/grouped-column',
      name: "grouped column",
      component: () => import('@/pages/grouped-column.vue'),
   },
   {
      path: '/stacked-column',
      name: "stacked column",
      component: () => import('@/pages/stacked-column.vue'),
   },
   {
      path: '/line',
      name: "line",
      component: () => import('@/pages/line.vue'),
   },
   {
      path: '/area',
      name: "area",
      component: () => import('@/pages/area.vue'),
   },
   {
      path: '/stacked-area',
      name: "stacked area",
      component: () => import('@/pages/stacked-area.vue'),
   },
   {
      path: '/line-column',
      name: "line column",
      component: () => import('@/pages/line-column.vue'),
   },
   {
      path: '/time-line',
      name: "time-line",
      component: () => import('@/pages/time-line.vue'),
   }
]