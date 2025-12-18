import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  index("routes/root.tsx"),

  ...prefix("auth", [
    route("sign-in", "routes/auth/sign-in.tsx"),
    route("sign-up", "routes/auth/sign-up.tsx"),
  ]),

  layout("layouts/sidebar.tsx", [
    route("about", "routes/about.tsx"),

    ...prefix("account", [
      index("routes/account/index.tsx"),
      route(
        "request-email-verification",
        "routes/account/request-email-verification.tsx",
      ),
      route(
        "confirm-email-verification",
        "routes/account/confirm-email-verification.tsx",
      ),
      route("change-username", "routes/account/change-username.tsx"),
      route("request-email-change", "routes/account/request-email-change.tsx"),
      route("confirm-email-change", "routes/account/confirm-email-change.tsx"),
      route("change-password", "routes/account/change-password.tsx"),
      route("language", "routes/account/language.tsx"),
      route("sign-out", "routes/account/sign-out.tsx"),
      route("sign-out-all", "routes/account/sign-out-all.tsx"),
      route("delete", "routes/account/delete.tsx"),
    ]),

    ...prefix("home", [index("routes/home/index.tsx")]),

    ...prefix("posts", [route(":id", "routes/posts/$id.tsx")]),

    ...prefix("admin", [
      ...prefix("posts", [
        index("routes/admin/posts/index.tsx"),
        route("create", "routes/admin/posts/create.tsx"),
        route(":id/edit", "routes/admin/posts/$id.edit.tsx"),
        route(":id/delete", "routes/admin/posts/$id.delete.tsx"),
      ]),

      ...prefix("prices", [
        index("routes/admin/prices/index.tsx"),
        route("create", "routes/admin/prices/create.tsx"),
        route(":id/edit", "routes/admin/prices/$id.edit.tsx"),
      ]),

      ...prefix("products", [
        index("routes/admin/products/index.tsx"),
        route("create", "routes/admin/products/create.tsx"),
        route(":id/edit", "routes/admin/products/$id.edit.tsx"),
      ]),
    ]),
  ]),

  route("error", "routes/error.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
