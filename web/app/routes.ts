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

    route("account", "routes/account/index.tsx"),
    route("account/change-username", "routes/account/change-username.tsx"),
    route("account/change-password", "routes/account/change-password.tsx"),

    ...prefix("home", [index("routes/home/index.tsx")]),
  ]),

  route("error", "routes/error.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
