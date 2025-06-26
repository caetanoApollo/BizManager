// client/app/types/router.d.ts
import 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface RouteMap {
      StaticRoutes:
        | '/'
        | '/screens'
        | '/screens/home'
        | '/screens/signup'
        | '/screens/passwordReset'
        | '/screens/main'
        | '/screens/config'
        | '/screens/notaFiscal'
        | '/screens/addNota'
        | '/screens/financeiro'
        | '/screens/addFinan'
        | '/screens/agenda'
        | '/screens/addEvento'      
        | '/screens/estoque'      
        | '/screens/addEstoque'      
        | '/screens/graficos'      
        | '/screens/clientes' // Nova rota para clientes
        | '/screens/addCliente' // Nova rota para adicionar cliente
        | '/_sitemap'
        | '/signup';
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}