import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ShoppingCart, /*, User*/
  User,
  UtilityPole,
  Building2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  //CalenderIcon,
  ChevronDownIcon,
  DocsIcon,
  //GridIcon,
  HorizontaLDots,
  //ListIcon,
  //PageIcon,
  PieChartIcon,
  //PlugInIcon,
  //TableIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles?: string[]; // NUEVO - roles permitidos para este item
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    roles?: string[]; // NUEVO - roles permitidos para este subitem
  }[];
};

const navItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Inicio",
    path: "/dashboard",
    roles: ["ADMIN", "SUPERVISOR"], // USUARIO no ve esto
  },
  {
    icon: <DocsIcon />,
    name: "Cotizaciones",
    subItems: [
      { name: "Resumen", path: "/quotes", pro: false, roles: ["ADMIN", "SUPERVISOR"] },
      { name: "Nueva Cotización", path: "/quotes/new", pro: false }, // TODOS
      { name: "Mis cotizaciónes", path: "/quotes/my-quotes", pro: false }, // TODOS
      { name: "Seguimiento", path: "/quotes/follow-ups", pro: false, roles: ["ADMIN", "SUPERVISOR"] },
      { name: "Historial", path: "/quotes/history", pro: false }, // TODOS
      { name: "Asignación", path: "/quotes/assignment", pro: false, roles: ["SUPERVISOR", "ADMIN"] },
    ],
  },
  {
    icon: <ShoppingCart />,
    name: "Compras",
    roles: ["ADMIN", "SUPERVISOR"], // USUARIO no ve este menú
    subItems: [
      { name: "Resumen", path: "/shopping", pro: false },
      { name: "Seguimiento", path: "/shopping/follow-ups", pro: false },
      { name: "Aprobación de Compras", path: "/shopping/aprobacion", pro: false },
      { name: "Documentos", path: "/shopping/documents", pro: false },
      { name: "Historial", path: "/shopping/history", pro: false },
    ],
  },
  {
    icon: <Building2 />,
    name: "Proveedores",
    roles: ["ADMIN", "SUPERVISOR"],
    path: "/providers",
  },
  {
    icon: <UtilityPole />,
    name: "Proyectos",
    roles: ["ADMIN", "SUPERVISOR"], // USUARIO no ve esto
    subItems: [
      { name: "ver Proyectos", path: "/projects", pro: false },
      { name: "Nuevo Proyecto", path: "/projects/new", pro: false },
    ],
  },
  {
    icon: <User />,
    name: "Usuarios",
    roles: ["ADMIN"], // Solo ADMIN
    subItems: [
      { name: "Gestión de Usuarios", path: "/profiles", pro: false },
      { name: "Configuración", path: "/settings", pro: false },
      { name: "Roles", path: "/roles", pro: false },
    ],
  },
];

const othersItems: NavItem[] = [
  /*{
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: false },
      { name: "Bar Chart", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts", pro: false },
      { name: "Avatar", path: "/avatars", pro: false },
      { name: "Badge", path: "/badge", pro: false },
      { name: "Buttons", path: "/buttons", pro: false },
      { name: "Images", path: "/images", pro: false },
      { name: "Videos", path: "/videos", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
    ],
  },
  */
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { user } = useAuth(); // NUEVO

  // NUEVO - Función para verificar si tiene permiso
  const hasPermission = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true; // Sin restricción
    const userRole = user?.rol?.nombre;
    return userRole ? roles.includes(userRole) : false;
  };

  // NUEVO - Filtrar items según permisos
  const filterItemsByRole = (items: NavItem[]): NavItem[] => {
    return items
      .filter(item => hasPermission(item.roles)) // Filtrar items principales
      .map(item => ({
        ...item,
        subItems: item.subItems?.filter(sub => hasPermission(sub.roles)) // Filtrar subitems
      }))
      .filter(item => !item.subItems || item.subItems.length > 0); // Quitar menús vacíos
  };

  const filteredNavItems = filterItemsByRole(navItems); // NUEVO
  const filteredOthersItems = filterItemsByRole(othersItems); // NUEVO

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo-pd-light.svg"
                alt="Logo"
                width={210}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-pd-dark.svg"
                alt="Logo"
                width={210}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-pd.svg"
              alt="Logo"
              width={64}
              height={64}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Otros"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(filteredOthersItems, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;