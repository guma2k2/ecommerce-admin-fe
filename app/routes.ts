import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

export default [
  index('pages/IndexPage.tsx'),
  layout('core/layouts/unauthenticate/UnAuthenticateLayout.tsx', [
    route('login', 'pages/unAuthenticate/LoginPage.tsx')
  ]),
  layout('core/layouts/authenticate/AuthenticateLayout.tsx', [
    route('admin', 'core/layouts/authenticate/admin/AdminLayout.tsx', [
      index('pages/authenticate/admin/DashboardPage.tsx'),
      route('manage-product', 'pages/authenticate/admin/manageProduct/ManageProductPage.tsx'),
      route('manage-product/create', 'pages/authenticate/admin/manageProduct/CreateProductPage.tsx'),
      route('manage-category', 'pages/authenticate/admin/manageCategory/ManageCategoryPage.tsx'),
      route('manage-brand', 'pages/authenticate/admin/manageBrand/ManageBrandPage.tsx'),
      route('manage-media', 'pages/authenticate/admin/manageMedia/ManageMediaPage.tsx')
    ])
  ])
] satisfies RouteConfig
