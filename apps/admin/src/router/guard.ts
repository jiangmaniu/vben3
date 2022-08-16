import type { Router } from 'vue-router'
import nProgress from 'nprogress'
import { config } from '@/config'
import { BASIC_LOGIN_PATH } from '@vben/constants'
import { useUserStoreWithout } from '@/store/user'
import { useAuthStoreWithout } from '@/store/auth'

const LOADED_PAGE_POOL = new Map<string, boolean>()
const LOGIN_PATH = BASIC_LOGIN_PATH
const whitePathList: string[] = [LOGIN_PATH]

async function setupRouteGuard(router: Router) {
  const { enableProgress } = config
  router.beforeEach(async (to) => {
    // The page has already been loaded, it will be faster to open it again, you don’t need to do loading and other processing
    to.meta.loaded = !!LOADED_PAGE_POOL.get(to.path)

    // Display a progress bar at the top when switching pages
    // Only works when the page is loaded for the first time
    if (enableProgress && !to.meta.loaded) {
      nProgress.start()
    }
    return true
  })

  router.afterEach((to) => {
    // Indicates that the page has been loaded
    // When opening again, you can turn off some progress display interactions
    LOADED_PAGE_POOL.set(to.path, true)

    // Close the page loading progress bar
    if (enableProgress && !to.meta.loaded) {
      nProgress.done()
    }
  })

  createAuthGuard(router)
}

export function createAuthGuard(router: Router) {
  const userStore = useUserStoreWithout()
  const authStore = useAuthStoreWithout()

  //
  router.beforeEach(async (to, from) => {
    // token does not exist
    if (!userStore.getAccessToken) {
      // You can access without permission. You need to set the routing meta.ignoreAuth to true
      // Whitelist can be directly entered
      if (to.meta.ignoreAuth || whitePathList.includes(to.path)) {
        return true
      }

      // redirect login page
      return {
        path: LOGIN_PATH,
        replace: true,
        // After logging in, jump to the previous page. If you don't need it, just delete the `query`
        query: { redirect: encodeURIComponent(to.fullPath) },
      }
    }

    const routes = await authStore.generatorRoutes()
    console.log(111, routes)

    return true

    // if (permissionStore.getIsDynamicAddedRoute) {
    //   next()
    //   return
    // }

    // const routes = await permissionStore.buildRoutesAction()

    // routes.forEach((route) => {
    //   router.addRoute(route)
    // })

    // router.addRoute(PAGE_NOT_FOUND_ROUTE)

    // permissionStore.setDynamicAddedRoute(true)

    // if (to.name === PAGE_NOT_FOUND_ROUTE.name) {
    //   // 动态添加路由后，此处应当重定向到fullPath，否则会加载404页面内容
    //   next({ path: to.fullPath, replace: true, query: to.query })
    // } else {
    //   const redirectPath = (from.query.redirect || to.path) as string
    //   const redirect = decodeURIComponent(redirectPath)
    //   const nextData =
    //     to.path === redirect ? { ...to, replace: true } : { path: redirect }
    //   next(nextData)
    // }
  })
}

export { setupRouteGuard }