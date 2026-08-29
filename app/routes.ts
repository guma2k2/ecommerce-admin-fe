import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
  index("pages/IndexPage.tsx"),
  layout("core/layouts/unauthenticate/UnAuthenticateLayout.tsx", [
    route("login", "pages/unAuthenticate/LoginPage.tsx")
  ]),
  layout("core/layouts/authenticate/AuthenticateLayout.tsx", [
    route("admin", "core/layouts/authenticate/admin/AdminLayout.tsx", [
      index("pages/authenticate/admin/DashboardPage.tsx"),
      route("manage-product", "pages/authenticate/admin/manageProduct/ManageProductPage.tsx"),
      route("manage-product/create", "pages/authenticate/admin/manageProduct/CreateProductPage.tsx"),
      route("manage-product/edit/:id", "pages/authenticate/admin/manageProduct/UpdateProductPage.tsx"),
      route("manage-category", "pages/authenticate/admin/manageCategory/ManageCategoryPage.tsx"),
      route("manage-category/create", "pages/authenticate/admin/manageCategory/CreateCategoryPage.tsx"),
      route("manage-category/edit/:id", "pages/authenticate/admin/manageCategory/UpdateCategoryPage.tsx"),
      route("manage-brand", "pages/authenticate/admin/manageBrand/ManageBrandPage.tsx"),
      route("manage-brand/create", "pages/authenticate/admin/manageBrand/CreateBrandPage.tsx"),
      route("manage-brand/edit/:id", "pages/authenticate/admin/manageBrand/UpdateBrandPage.tsx"),
      route("manage-product-attribute", "pages/authenticate/admin/manageProductAttribute/ManageProductAttributePage.tsx"),
      route("manage-product-attribute/create", "pages/authenticate/admin/manageProductAttribute/CreateProductAttributePage.tsx"),
      route("manage-product-attribute/edit/:id", "pages/authenticate/admin/manageProductAttribute/UpdateProductAttributePage.tsx"),
      route("manage-product-attribute-template", "pages/authenticate/admin/manageProductAttributeTemplate/ManageProductAttributeTemplatePage.tsx"),
      route("manage-product-attribute-template/create", "pages/authenticate/admin/manageProductAttributeTemplate/CreateProductAttributeTemplatePage.tsx"),
      route("manage-product-attribute-template/edit/:id", "pages/authenticate/admin/manageProductAttributeTemplate/UpdateProductAttributeTemplatePage.tsx"),
      route("manage-media", "pages/authenticate/admin/manageMedia/ManageMediaPage.tsx"),
      route("account", "pages/authenticate/admin/manageAccount/ManageAccountPage.tsx")
    ])
  ])
] satisfies RouteConfig
