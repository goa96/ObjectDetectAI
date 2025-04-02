import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';

// Lazy-loaded components
const HomePage = () => import('../views/HomePage.vue');
const DetectionPage = () => import('../views/DetectionPage.vue');
const ResultsPage = () => import('../views/ResultsPage.vue');
const HistoryPage = () => import('../views/HistoryPage.vue');
const LoginPage = () => import('../views/LoginPage.vue');
const RegisterPage = () => import('../views/RegisterPage.vue');
const UserProfilePage = () => import('../views/UserProfilePage.vue');
const NotFoundPage = () => import('../views/NotFoundPage.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: false }
  },
  {
    path: '/detect',
    name: 'Detection',
    component: DetectionPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/results/:id',
    name: 'Results',
    component: ResultsPage,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { guest: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: UserProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundPage
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Navigation Guards
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['user/isAuthenticated'];

  // Show loading indicator for page transitions
  store.dispatch('app/setLoading', true);

  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else {
      next();
    }
  } else if (to.matched.some(record => record.meta.guest) && isAuthenticated) {
    // Redirect authenticated users away from guest routes
    next({ path: '/detect' });
  } else {
    next();
  }
});

// After route change
router.afterEach(() => {
  // Hide loading indicator
  store.dispatch('app/setLoading', false);
  
  // Track page view for analytics (if implemented)
  if (process.env.NODE_ENV === 'production') {
    // Analytics tracking could go here
  }
});

export default router; 