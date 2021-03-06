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
        path: "users",
        component: () => import("pages/Users.vue")
      },
      {
        path: "listProductTypes",
        component: () => import("pages/ProductTypes.vue")
      },
      {
        path: "reservationsAfterDeadline",
        component: () => import("pages/ReservationsAfterDeadline.vue")
      },
      {
        path: "/:id?",
        component: () => import("pages/StockLevels.vue")
      }
    ]
  },

  {
    path: "*",
    component: () => import("pages/Error404.vue")
  }
];

export default routes;
