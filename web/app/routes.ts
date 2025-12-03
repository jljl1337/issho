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
      route("change-username", "routes/account/change-username.tsx"),
      route("change-email", "routes/account/change-email.tsx"),
      route("change-password", "routes/account/change-password.tsx"),
      route("language", "routes/account/language.tsx"),
      route("sign-out", "routes/account/sign-out.tsx"),
      route("sign-out-all", "routes/account/sign-out-all.tsx"),
      route("delete", "routes/account/delete.tsx"),
    ]),

    ...prefix("home", [index("routes/home/index.tsx")]),

    ...prefix("posts", [
      index("routes/posts/index.tsx"),
      route("create", "routes/posts/create.tsx"),
      route(":id", "routes/posts/$id.tsx"),
      route("edit/:id", "routes/posts/edit.$id.tsx"),
      route("delete/:id", "routes/posts/delete.$id.tsx"),
    ]),

    ...prefix("prices", [
      index("routes/prices/index.tsx"),
      route("create", "routes/prices/create.tsx"),
      route("edit/:id", "routes/prices/edit.$id.tsx"),
    ]),
  ]),

  route("error", "routes/error.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
