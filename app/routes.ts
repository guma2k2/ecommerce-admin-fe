import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

export default [
  layout('core/layouts/unauthenticate/UnAuthenticateLayout.tsx', [route('login', 'pages/unAuthenticate/LoginPage.tsx')]),
  layout('core/layouts/authenticate/AuthenticateLayout.tsx', [
    route('admin', 'core/layouts/authenticate/admin/AdminLayout.tsx', [
      index('pages/authenticate/admin/DashboardPage.tsx'),
      route('manage-product', 'pages/authenticate/admin/manageProduct/ManageProductPage.tsx'),
      route('manage-product/create', 'pages/authenticate/admin/manageProduct/CreateProductPage.tsx')
    ])
  ])
] satisfies RouteConfig
