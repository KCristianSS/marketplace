import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Products from '../views/Products.vue';
import Login from '../views/Login.vue';
import MyProducts from '../views/MyProducts.vue';
import ProductDetail from '../views/ProductDetail.vue';
import History from '../views/History.vue';
import AdminPanel from '../views/AdminPanel.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/products', component: Products },
  { path: '/productos/:id', component: ProductDetail, name: 'product-detail' },
  { path: '/login', component: Login },
  { path: '/my-products', component: MyProducts },
  { path: '/historial', component: History },
  { path: '/admin', component: AdminPanel },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
