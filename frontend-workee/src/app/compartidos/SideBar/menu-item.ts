export interface MenuItem {
  titulo: string;
  ruta?: string;
  codigoPermiso?: string;  
  children?: MenuItem[];
  icono: string;
}