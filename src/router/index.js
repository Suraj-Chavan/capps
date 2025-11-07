import Vue from "vue";
import VueRouter from "vue-router";
import CappsRoute, { LAUNCHER_ROUTE } from "./capps.layout.route.js";

Vue.use(VueRouter);

const routes = [
    {
        path: "*",
        redirect: "/not-found",
    },
    {
        path: "/not-found",
        name: "not-found",
        component: () => import("@/components/NotFoundComponent/NotFound.vue")
    },
    {
        path: "/",
        redirect: LAUNCHER_ROUTE,
    },
    ...CappsRoute({
        appLayoutIndexComponent: () => import("@/components/AppLayout/AppLayout1.vue"),
        appLayoutLauncherComponent: () => import("@/components/AppLayout/AppLayout2.vue"),
        appLayoutIndexPath: "/:moduleName",
    }),
    {
        path: "/vue3-component-test",
        component: () => import("@/components/Test/Test.vue"),
    }
];

const router = new VueRouter({ mode: "hash", routes });

export default router;
