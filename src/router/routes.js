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
   }
]