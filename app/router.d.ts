// router.d.ts
import 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface RouteMap {
      StaticRoutes:
        | '/'
        | '/(screens)'
        | '/(screens)/index'
        | '/(screens)/signup'
        | '/(screens)/passwordReset'
        | '/(screens)/main'
        | '/(screens)/config'
        | '/_sitemap'
        | '/signup';
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}