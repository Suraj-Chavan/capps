# CAPPS Menu JS Documentation

## Overview

`menu.js` files define the navigation structure for a CAPPS application. These files are loaded at runtime and provide the complete menu configuration for your application's header navigation bar.

The menu system supports:
- **Nested multi-level menus** with unlimited depth
- **Role-based access control** for different user types
- **Dynamic menu generation** based on runtime conditions
- **Complex routing** with filters and parameters
- **Responsive design** with overflow handling
- **PrimeVue integration** for modern UI components

## File Location

Menu files must be placed in the `public/layout/` directory of your application:

```
{APP_NAME}/public/layout/menu.js
```

For example:
```
my_financial_app/public/layout/menu.js
capps-guinea-pig/public/layout/menu.js
corporate/public/layout/menu.js
```

## File Format

Menu files use ES module default export syntax (recommended):
```js
export default [ ... ];
```

> **Note:** CommonJS syntax (`module.exports = [ ... ];`) is also supported but ES modules are recommended for new applications.

## Menu Structure

A menu file exports an array of menu item objects. Each object can represent a single menu item, a menu group with sub-items, or dynamically generated menu structures.

### Basic Menu Structure

```js
export default [
  {
    label: "Dashboard",
    icon: "pi pi-home",
    route: "myapp/pages/dashboard"
  },
  {
    label: "Investment Management",
    icon: "pi pi-money-bill",
    items: [
      {
        label: "All Investments",
        icon: "pi pi-list",
        route: "myapp/doc/investments/view/list"
      },
      {
        label: "Add New Investment",
        icon: "pi pi-plus",
        route: "myapp/doc/investments/view/form"
      }
    ]
  }
];
```

### Menu Item Properties

#### Core Properties
- **`label`** (string, required): Display text for the menu item
- **`icon`** (string, optional): PrimeVue icon class (e.g., "pi pi-home", "pi pi-users")
- **`route`** (string, optional): Navigation route path
- **`items`** (array, optional): Array of sub-menu items for nested menus

#### Route Formats

Routes follow the CAPPS routing convention:

```js
// Collection routes
"app_name/doc/collection_name/view/list"     // List view
"app_name/doc/collection_name/view/card"     // Card view
"app_name/doc/collection_name/view/form"     // New form

// Page routes
"app_name/pages/dashboard"                    // Custom pages

// Filtered routes
"app_name/doc/collection/view/list?filter={\"STATUS\":\"Active\"}"
```

### Advanced Route Examples

```js
export default [
  {
    label: "Active Investments",
    icon: "pi pi-check-circle",
    route: "myapp/doc/investments/view/list?filter={\"STATUS\":\"Active\"}"
  },
  {
    label: "High Value Investments",
    icon: "pi pi-star",
    route: "myapp/doc/investments/view/list?filter={\"AMOUNT\":{\"$gte\":1000000}}"
  },
  {
    label: "Investment Cards",
    icon: "pi pi-th-large",
    route: "myapp/doc/investments/view/card"
  }
];
```

## Role-Based Access Control

CAPPS menus support dynamic role-based access control using session storage integration.

### Accessing User Roles

```js
const userRoles = config.getSessionStorage().roles();
console.log("User roles:", userRoles); // ["ADMIN", "USER"]
```

### Role-Based Menu Mapping

```js
const userRoles = config.getSessionStorage().roles();

const roleMenuMap = {
  TCIL_ADMIN: [
    { label: "Corporates", route: "corporate/doc/corporates/view/list" },
    { label: "User Management", route: "corporate/doc/users/view/list" },
    { label: "Branch Management", route: "corporate/doc/branches/view/list" }
  ],
  CORP_COORDINATOR: [
    { label: "Requests", route: "corporate/doc/requests/view/list" },
    { label: "Transactions", route: "corporate/doc/transactions/view/list" }
  ],
  TCIL_COORDINATOR: [
    { label: "TCIL Requests", route: "corporate/doc/tcil_coordinator_requests/view/list" },
    { label: "TCIL Transactions", route: "corporate/doc/tcil_coordinator_transactions/view/list" }
  ]
};

const matchedRole = Object.keys(roleMenuMap).find(role => userRoles.includes(role));
const menu = matchedRole ? roleMenuMap[matchedRole] : [];

export default menu;
```

### Conditional Menu Items

```js
const userRoles = config.getSessionStorage().roles();

export default [
  {
    label: "Dashboard",
    icon: "pi pi-home",
    route: "myapp/pages/dashboard"
  },
  {
    label: "Investment Management",
    icon: "pi pi-money-bill",
    items: [
      {
        label: "All Investments",
        icon: "pi pi-list",
        route: "myapp/doc/investments/view/list"
      },
      {
        label: "Add New Investment",
        icon: "pi pi-plus",
        route: "myapp/doc/investments/view/form"
      }
    ]
  },
  // Admin-only section - will be filtered out in rendering if condition is false
  {
    label: "Administration",
    icon: "pi pi-cog",
    hidden: !userRoles.includes('ADMIN'),
    items: [
      {
        label: "User Management",
        icon: "pi pi-users",
        route: "myapp/doc/users/view/list"
      },
      {
        label: "System Settings",
        icon: "pi pi-sliders-h",
        route: "myapp/doc/settings/view/list"
      }
    ]
  }
];
```

## Dynamic Menu Generation

Menus can be dynamically generated based on runtime conditions, user permissions, or external data.

### Runtime Filtering

```js
const userRoles = config.getSessionStorage().roles();

const allMenuItems = [
  {
    label: "Dashboard",
    icon: "pi pi-home",
    route: "myapp/pages/dashboard",
    requiredRoles: ["USER", "ADMIN"]
  },
  {
    label: "Administration",
    icon: "pi pi-cog",
    route: "myapp/doc/admin/view/list",
    requiredRoles: ["ADMIN"]
  },
  {
    label: "Reports",
    icon: "pi pi-chart-bar",
    route: "myapp/doc/reports/view/list",
    requiredRoles: ["MANAGER", "ADMIN"]
  }
];

// Filter menu items based on user roles
const authorizedMenu = allMenuItems.filter(item => {
  return item.requiredRoles.some(role => userRoles.includes(role));
});

export default authorizedMenu;
```

### Complex Dynamic Menu

```js
const userRoles = config.getSessionStorage().roles();
const userId = config.getSessionStorage().user_id();

// Base menu structure
let dynamicMenu = [
  {
    label: "Home",
    icon: "pi pi-home",
    route: "capps-guinea-pig/pages/credbooks"
  }
];

// Add administration menus for specific roles
if (userRoles.includes('ADMIN') || userRoles.includes('SUPER_USER')) {
  dynamicMenu.push({
    label: "Administration",
    icon: "pi pi-user",
    items: [
      {
        label: "Upload Configurations",
        icon: "pi pi-cog",
        items: [
          {
            label: "Attachments",
            icon: "pi pi-paperclip",
            route: "capps-guinea-pig/doc/attachments/view/list"
          },
          {
            label: "File Exceptions",
            icon: "pi pi-exclamation-triangle",
            route: "capps-guinea-pig/doc/file_exceptions/view/list"
          }
        ]
      }
    ]
  });
}

// Add user-specific menus
if (userRoles.includes('COORDINATOR')) {
  dynamicMenu.push({
    label: "My Tasks",
    icon: "pi pi-check-square",
    route: `myapp/doc/tasks/view/list?filter={"ASSIGNED_TO":"${userId}"}`
  });
}

export default dynamicMenu;
```

## Nested Menu Structures

CAPPS supports unlimited nesting levels for complex menu hierarchies:

```js
export default [
  {
    label: "Financial Management",
    icon: "pi pi-building",
    items: [
      {
        label: "Investments",
        icon: "pi pi-money-bill",
        items: [
          {
            label: "Equity",
            icon: "pi pi-chart-line",
            items: [
              {
                label: "Large Cap",
                route: "myapp/doc/investments/view/list?filter={\"TYPE\":\"EQUITY\",\"CATEGORY\":\"LARGE_CAP\"}"
              },
              {
                label: "Mid Cap",
                route: "myapp/doc/investments/view/list?filter={\"TYPE\":\"EQUITY\",\"CATEGORY\":\"MID_CAP\"}"
              }
            ]
          },
          {
            label: "Bonds",
            icon: "pi pi-bookmark",
            items: [
              {
                label: "Government Bonds",
                route: "myapp/doc/investments/view/list?filter={\"TYPE\":\"BOND\",\"CATEGORY\":\"GOVERNMENT\"}"
              },
              {
                label: "Corporate Bonds",
                route: "myapp/doc/investments/view/list?filter={\"TYPE\":\"BOND\",\"CATEGORY\":\"CORPORATE\"}"
              }
            ]
          }
        ]
      }
    ]
  }
];
```

## Framework Integration

### Loading Mechanism

Menus are automatically loaded by the CAPPS framework using:

1. **File Path**: `{APP_NAME}/public/layout/menu.js`
2. **Loading Method**: `capps.require()` with `{ asModule: true }`
3. **Integration**: Passed to PrimeVue MenuBar component
4. **Navigation**: Uses `capps.set_route()` for navigation

### Responsive Design

The framework automatically handles:
- **Overflow Management**: Items that don't fit are moved to a "More" dropdown
- **Mobile Adaptation**: Responsive breakpoints for different screen sizes
- **Touch Support**: Full touch/gesture support on mobile devices

### PrimeVue Integration

Menus use PrimeVue's MenuBar component which provides:
- **Modern UI**: Clean, professional appearance
- **Keyboard Navigation**: Full accessibility support
- **Theming**: Consistent with CAPPS design system
- **Animation**: Smooth transitions and hover effects

## Complete Real-World Examples

### Financial Application Menu

```js
// Get user roles for role-based navigation
const userRoles = config.getSessionStorage().roles();

export default [
    {
        "label": "Dashboard",
        "icon": "pi pi-home",
        "route": "my_financial_app/pages/dashboard"
    },
    {
        "label": "Investment Management",
        "icon": "pi pi-money-bill",
        "items": [
            {
                "label": "All Investments",
                "icon": "pi pi-list",
                "route": "my_financial_app/doc/investments/view/list"
            },
            {
                "label": "Add New Investment",
                "icon": "pi pi-plus",
                "route": "my_financial_app/doc/investments/view/form"
            },
            {
                "label": "Investment Cards",
                "icon": "pi pi-th-large",
                "route": "my_financial_app/doc/investments/view/card"
            },
            {
                "label": "Active Investments",
                "icon": "pi pi-check-circle",
                "route": "my_financial_app/doc/investments/view/list?filter={\"STATUS\":\"Active\"}"
            }
        ]
    },
    {
        "label": "Reports & Analytics",
        "icon": "pi pi-chart-bar",
        "items": [
            {
                "label": "Investment Summary",
                "icon": "pi pi-chart-pie",
                "route": "my_financial_app/doc/investments/view/list?view=summary"
            },
            {
                "label": "Portfolio Performance",
                "icon": "pi pi-trending-up",
                "route": "my_financial_app/pages/portfolio_performance"
            }
        ]
    },
    {
        "label": "Administration",
        "icon": "pi pi-cog",
        "hidden": !userRoles.includes('ADMIN'),
        "items": [
            {
                "label": "User Management",
                "icon": "pi pi-users",
                "route": "my_financial_app/doc/users/view/list"
            },
            {
                "label": "System Settings",
                "icon": "pi pi-sliders-h",
                "route": "my_financial_app/doc/settings/view/list"
            }
        ]
    }
];
```

### Role-Based Corporate Menu

```js
const userRoles = config.getSessionStorage().roles();

const roleMenuMap = {
  TCIL_ADMIN: [
    { 
      label: "Corporate Management", 
      icon: "pi pi-building",
      items: [
        { label: "Corporates", route: "corporate/doc/corporates/view/list" },
        { label: "Branches", route: "corporate/doc/branches/view/list" }
      ]
    },
    { 
      label: "User Management", 
      icon: "pi pi-users",
      route: "corporate/doc/users/view/list" 
    }
  ],
  CORP_COORDINATOR: [
    { 
      label: "Daily Operations", 
      icon: "pi pi-calendar",
      items: [
        { label: "Requests", route: "corporate/doc/requests/view/list" },
        { label: "Transactions", route: "corporate/doc/transactions/view/list" }
      ]
    }
  ],
  TCIL_COORDINATOR: [
    { 
      label: "TCIL Operations", 
      icon: "pi pi-briefcase",
      items: [
        { label: "TCIL Requests", route: "corporate/doc/tcil_coordinator_requests/view/list" },
        { label: "TCIL Transactions", route: "corporate/doc/tcil_coordinator_transactions/view/list" }
      ]
    }
  ]
};

const matchedRole = Object.keys(roleMenuMap).find(role => userRoles.includes(role));
const menu = matchedRole ? roleMenuMap[matchedRole] : [];

export default menu;
```

## Debugging and Development

### Debug Menu Loading

```js
const userRoles = config.getSessionStorage().roles();
console.log("User roles:", userRoles);

const menu = [
  // ... your menu items
];

console.log("Generated menu:", menu);
export default menu;
```

### Development Tools

- Menu files are debuggable in browser devtools (Sources panel)
- Use browser console to inspect `config.getSessionStorage()`
- Check Network tab for menu.js loading
- Inspect Vue devtools for menu component state

## Best Practices

### Structure and Organization
- Keep menu definitions simple and declarative
- Use consistent naming conventions for routes and labels
- Group related functionality under parent menu items
- Limit nesting depth to maintain usability (3-4 levels max)

### Performance
- Avoid complex computations in menu.js files
- Cache role-based menu configurations when possible
- Use route-based filtering over hiding menu items when appropriate

### Security
- Always validate permissions on the server side
- Menu visibility is UI-only - implement proper API authorization
- Use role-based routing to prevent unauthorized access

### Maintainability
- Document role requirements for each menu item
- Use constants for role names to avoid typos
- Consider extracting complex role logic to separate functions
- Keep menu structures in sync with actual application routes
