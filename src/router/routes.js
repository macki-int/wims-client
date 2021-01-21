const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/Index.vue")
      },
      {
        path: "products",
        component: () => import("pages/Products.vue")
      },
      {
        path: "login",
        component: () => import("pages/Login.vue")
      },
      {
        path: "/:id?",
        component: () => import("pages/StockLevels.vue")
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "*",
    component: () => import("pages/Error404.vue")
  }
];

export default routes;
