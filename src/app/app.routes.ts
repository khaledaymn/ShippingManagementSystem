import { Routes } from '@angular/router';
import { EmployeeSidebarComponent } from './components/employee/employee-sidebar/employee-sidebar.component';
import { DashboardComponent } from './shared/dashboard/dashboard.component';
import { EmployeeDashboardComponent } from './components/employee/employee-dashboard/employee-dashboard.component';
import { StandardsViewComponent } from './components/employee/settings/standards-view/standards-view.component';
import { StandardsEditComponent } from './components/employee/settings/standards-edit/standards-edit.component';
import { ShippingTypesComponent } from './components/employee/shipping-types/shipping-types.component';
import { ShippingTypesFormComponent } from './components/employee/shipping-types/shipping-types-form/shipping-types-form.component';
import { BranchesViewComponent } from './components/employee/branches/branches-view/branches-view.component';
import { BranchesEditComponent } from './components/employee/branches/branches-edit/branches-edit.component';
import { PermissionsViewComponent } from './components/employee/permissions/permissions-view/permissions-view.component';
import { PermissionsEditComponent } from './components/employee/permissions/permissions-edit/permissions-edit.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { permissionGuard } from './core/guards/permission.guard';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './core/models/user';
import { permissionOrRoleGuard } from './core/guards/permission-or-role.guard';
import { UnauthorizedComponent } from './shared/unauthorized/unauthorized.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { EmployeesViewComponent } from './components/employee/users/employee/employees-view/employees-view.component';
import { EmployeeDetailsComponent } from './components/employee/users/employee/employee-details/employee-details.component';
import { EmployeesEditComponent } from './components/employee/users/employee/employee-edit/employee-edit.component';
import { CitiesViewComponent } from './components/employee/places/cities/cities-view/cities-view.component';
import { CitiesEditComponent } from './components/employee/places/cities/cities-edit/cities-edit.component';
import { GovernoratesEditComponent } from './components/employee/places/governorate/governorate-edit/governorate-edit.component';
import { GovernoratesViewComponent } from './components/employee/places/governorate/governorate-view/governorate-view.component';
import { MerchantsViewComponent } from './components/employee/users/merchants/merchant-view/merchants-view.component';
import { MerchantsDetailsComponent } from './components/employee/users/merchants/merchants-details/merchants-details.component';
import { MerchantsEditComponent } from './components/employee/users/merchants/merchant-edit/merchants-edit.component';
import { ShippingRepresentativesViewComponent } from './components/employee/users/shipping-representatives/shipping-representatives-view/shipping-representatives-view.component';
import { ShippingRepresentativeDetailsComponent } from './components/employee/users/shipping-representatives/shipping-representative-details/shipping-representative-details.component';
import { ShippingRepresentativesEditComponent } from './components/employee/users/shipping-representatives/shipping-representatives-edit/shipping-representatives-edit.component';
import { OrdersViewComponent } from './components/employee/order/order-view/order-view.component';
import { OrderDetailsComponent } from './components/employee/order/order-details/order-details.component';
import { OrdersAddComponent } from './components/employee/order/order-add/order-add.component';
import { ProfileComponent } from './shared/profile/profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
    ],
  },
  {
    path: 'employee',
    canActivate: [authGuard, roleGuard([Role.ADMIN,Role.EMPLOYEE])],
    children: [
      {
        path: 'dashboard',
        component: EmployeeDashboardComponent,
        canActivate: [authGuard, roleGuard([Role.ADMIN,Role.EMPLOYEE])],
      },
      {
        path: 'settings',
        canActivate: [authGuard,roleGuard([Role.ADMIN,Role.EMPLOYEE,
              Role.MERCHANT,Role.SALES_REPRESENTATIVE])],
        children: [
          {
            path: 'general-settings',
            component: StandardsViewComponent,
            canActivate: [permissionOrRoleGuard('Settings','View',
              [Role.ADMIN,Role.MERCHANT,Role.SALES_REPRESENTATIVE])]
          },
          {
            path: 'general-settings/edit/:id',
            component: StandardsEditComponent,
            canActivate: [permissionOrRoleGuard('Settings', 'Edit',[Role.ADMIN])],
          },
          {
            path: 'shipping-types',
            component: ShippingTypesComponent,
            canActivate:[permissionOrRoleGuard('ChargeTypes', 'View',
              [Role.ADMIN,Role.MERCHANT,Role.SALES_REPRESENTATIVE])],
          },
          {
            path: 'shipping-types/create',
            component: ShippingTypesFormComponent,
            canActivate: [permissionOrRoleGuard('ChargeTypes', 'Create',[Role.ADMIN])],
          },
          {
            path: 'shipping-types/edit/:id',
            component: ShippingTypesFormComponent,
            canActivate: [permissionOrRoleGuard('ChargeTypes', 'Edit',[Role.ADMIN])],
          },
          {
            path: 'permissions',
            canActivate: [permissionOrRoleGuard('Permissions', 'View',[Role.ADMIN])],
            children: [
              {
                path: '',
                component: PermissionsViewComponent,
                canActivate: [permissionOrRoleGuard('Permissions', 'View',[Role.ADMIN])],
              },
              {
                path: 'create',
                component: PermissionsEditComponent,
                canActivate: [permissionOrRoleGuard('Permissions', 'Create',[Role.ADMIN])],
              },
              {
                path: 'edit/:id',
                component: PermissionsEditComponent,
                canActivate: [permissionOrRoleGuard('Permissions', 'Edit',[Role.ADMIN])],
              },
            ],
          },
          {
            path: 'branches',
            component: BranchesViewComponent,
            canActivate: [permissionOrRoleGuard('Branches', 'View', [Role.ADMIN])],
          },
          {
            path: 'branches/create',
            component: BranchesEditComponent,
            canActivate: [permissionOrRoleGuard('Branches', 'Create', [Role.ADMIN])],
          },
          {
            path: 'branches/edit/:id',
            component: BranchesEditComponent,
            canActivate: [permissionOrRoleGuard('Branches', 'Edit', [Role.ADMIN])],
          },
        ],
      },
      {
        path: 'places',
        canActivate: [authGuard,roleGuard([Role.ADMIN,Role.EMPLOYEE,
              Role.MERCHANT,Role.SALES_REPRESENTATIVE])],
        children: [
        {
          path: 'cities',
          component: CitiesViewComponent,
          canActivate: [permissionOrRoleGuard('Cities', 'View', [Role.ADMIN])],
        },
        {
          path: 'cities/create',
          component: CitiesEditComponent,
          canActivate: [permissionOrRoleGuard('Cities', 'Create', [Role.ADMIN])],
        },
        {
          path: 'cities/edit/:id',
          component: CitiesEditComponent,
          canActivate: [permissionOrRoleGuard('Cities', 'Edit', [Role.ADMIN])],
        },
        {
          path: 'governorates',
          component: GovernoratesViewComponent,
          canActivate: [permissionOrRoleGuard('Governorates', 'View', [Role.ADMIN])],

        },
        {
          path: 'governorates/create',
          component: GovernoratesEditComponent,
          canActivate: [permissionOrRoleGuard('Governorates', 'Create', [Role.ADMIN])],
        },
        {
          path: 'governorates/edit/:id',
          component: GovernoratesEditComponent,
          canActivate: [permissionOrRoleGuard('Governorates', 'Edit', [Role.ADMIN])],
        },
        ],
      },
      {
        path: 'users',
        canActivate: [authGuard, roleGuard([Role.ADMIN,Role.EMPLOYEE])],
        children: [
          {
            path: 'employees',
            component: EmployeesViewComponent,
            canActivate: [permissionOrRoleGuard('Employees', 'View', [Role.ADMIN])],
          },
          {
            path: 'employees/details/:id',
            component: EmployeeDetailsComponent,
          },
          {
            path: 'employees/edit/:id',
            component: EmployeesEditComponent,
            canActivate: [permissionOrRoleGuard('Employees', 'Edit', [Role.ADMIN])],
          },
          {
            path: 'employees/create',
            component: EmployeesEditComponent,
            canActivate: [permissionOrRoleGuard('Employees', 'Create', [Role.ADMIN])],
          },
          {
            path: 'merchants',
            component: MerchantsViewComponent,
            canActivate: [permissionOrRoleGuard('Merchants', 'View', [Role.ADMIN])],
          },
          {
            path: 'merchants/details/:id',
            component: MerchantsDetailsComponent,
          },
          {
            path: 'merchants/edit/:id',
            component: MerchantsEditComponent,
            canActivate: [permissionOrRoleGuard('Merchants', 'Edit', [Role.ADMIN])],
          },
          {
            path: 'merchants/create',
            component: MerchantsEditComponent,
            canActivate: [permissionOrRoleGuard('Merchants', 'Create', [Role.ADMIN])],
          },
          {
            path: 'shipping-representatives',
            component: ShippingRepresentativesViewComponent,
            canActivate: [permissionOrRoleGuard('Delivary', 'View', [Role.ADMIN])],
          },
          {
            path: 'shipping-representatives/details/:id',
            component: ShippingRepresentativeDetailsComponent,
          },
          {
            path: 'shipping-representatives/edit/:id',
            component: ShippingRepresentativesEditComponent,
            canActivate: [permissionOrRoleGuard('Delivary', 'Edit', [Role.ADMIN])],
          },
          {
            path: 'shipping-representatives/create',
            component: ShippingRepresentativesEditComponent,
            canActivate: [permissionOrRoleGuard('Delivary', 'Create', [Role.ADMIN])],
          },
        ],
      },
      {
        path: 'orders',
        // canActivate: [permissionGuard('orders', 'view')],
        component: OrdersViewComponent
      },
      {
        path: 'orders/create',
        // canActivate: [permissionGuard('orders', 'view')],
        component: OrdersAddComponent
      },
      {
        path: 'orders/details/:id',
        component: OrderDetailsComponent
      },
      // {
      //   path: 'changePassword',
      //   component: ChangePasswordComponent,
      //   canActivate: [authGuard],
      // },
    ],
  },
  // {
  //   path: 'employee',
  //   canActivate: [authGuard, roleGuard(['employee'])],
  //   children: [
  //     {
  //       path: 'dashboard',
  //       component: EmployeeDashboardComponent,
  //       canActivate: [permissionGuard('dashboard', 'view')],
  //     },
  //     {
  //       path: 'Settings',
  //       canActivate: [permissionGuard('settings', 'view')],
  //       children: [
  //         {
  //           path: 'generalSetting',
  //           component: StandardComponent,
  //           children: [
  //             {
  //               path: ':id/edit',
  //               component: StandardFormComponent,
  //               canActivate: [permissionGuard('settings', 'edit')],
  //             },
  //           ],
  //         },
  //         {
  //           path: 'Permissions',
  //           canActivate: [permissionGuard('permissions', 'view')],
  //           children: [
  //             {
  //               path: 'Groups',
  //               component: GroupComponent,
  //               children: [
  //                 {
  //                   path: 'add',
  //                   component: MeduleComponent,
  //                   canActivate: [permissionGuard('permissions', 'create')],
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //         // {
  //         //   path: 'Branch',
  //         //   component: BranchComponent,
  //         //   canActivate: [permissionGuard('branch', 'view')],
  //         //   children: [
  //         //     {
  //         //       path: ':id/edit',
  //         //       component: BranchFormComponent,
  //         //       canActivate: [permissionGuard('branch', 'edit')],
  //         //     },
  //         //   ],
  //         // },
  //       ],
  //     },
  //     // {
  //     //   path: 'users',
  //     //   canActivate: [permissionGuard('users', 'view')],
  //     //   children: [
  //     //     {
  //     //       path: 'Employees',
  //     //       component: EmployeeComponent,
  //     //       children: [
  //     //         {
  //     //           path: ':id/edit',
  //     //           component: EmployeeFormComponent,
  //     //           canActivate: [permissionGuard('users', 'edit')],
  //     //         },
  //     //       ],
  //     //     },
  //     //     // {
  //     //     //   path: 'shipping-representatives',
  //     //     //   component: ShippingRepresentativeListComponent,
  //     //     //   children: [
  //     //     //     {
  //     //     //       path: ':id/edit',
  //     //     //       component: AddShippingRepresentativeComponent,
  //     //     //       canActivate: [permissionGuard('users', 'edit')],
  //     //     //     },
  //     //     //   ],
  //     //     // },
  //     //     // {
  //     //     //   path: 'merchants',
  //     //     //   component: MerchantsComponent,
  //     //     // },
  //     //   ],
  //     // },
  //     // {
  //     //   path: 'Places',
  //     //   canActivate: [permissionGuard('places', 'view')],
  //     //   children: [
  //     //     {
  //     //       path: 'City',
  //     //       component: CityComponent,
  //     //       children: [
  //     //         {
  //     //           path: ':id/edit',
  //     //           component: CityFormComponent,
  //     //           canActivate: [permissionGuard('places', 'edit')],
  //     //         },
  //     //       ],
  //     //     },
  //     //   ],
  //     // },
  //     // {
  //     //   path: 'orders',
  //     //   canActivate: [permissionGuard('orders', 'view')],
  //     //   children: [
  //     //     {
  //     //       path: '',
  //     //       component: OrdersListComponent,
  //     //     },
  //     //     {
  //     //       path: 'create',
  //     //       component: OrderCreateComponent,
  //     //       canActivate: [permissionGuard('orders', 'create')],
  //     //     },
  //     //     {
  //     //       path: 'by-status',
  //     //       component: OrdersByStatusComponent,
  //     //     },
  //     //     {
  //     //       path: 'reports',
  //     //       component: OrdersReportComponent,
  //     //       canActivate: [permissionGuard('orders', 'viewReports')],
  //     //     },
  //     //     {
  //     //       path: 'edit/:id',
  //     //       component: OrderEditComponent,
  //     //       canActivate: [permissionGuard('orders', 'edit')],
  //     //     },
  //     //     {
  //     //       path: ':id',
  //     //       component: OrderDetailComponent,
  //     //     },
  //     //   ],
  //     // },
  //     // {
  //     //   path: 'Profile',
  //     //   component: EditprofileComponent,
  //     //   canActivate: [authGuard],
  //     // },
  //   ],
  // },
  // {
  //   path: 'merchant',
  //   canActivate: [authGuard, roleGuard(['merchant'])],
  //   children: [
  //     {
  //       path: 'dashboard',
  //       component: MerchantDashboardComponent,
  //       canActivate: [permissionGuard('dashboard', 'view')],
  //     },
  //     {
  //       path: 'orders',
  //       canActivate: [permissionGuard('orders', 'view')],
  //       children: [
  //         {
  //           path: '',
  //           component: OrderListForMerchantComponent,
  //         },
  //         {
  //           path: 'reports',
  //           component: OrdersReportComponent,
  //           canActivate: [permissionGuard('orders', 'viewReports')],
  //         },
  //       ],
  //     },
  //     {
  //       path: 'Profile',
  //       component: EditprofileComponent,
  //       canActivate: [authGuard],
  //     },
  //     {
  //       path: 'changePassword',
  //       component: ChangePasswordComponent,
  //       canActivate: [authGuard],
  //     },
  //   ],
  // },
  // {
  //   path: 'sales',
  //   canActivate: [authGuard, roleGuard(['sales'])],
  //   children: [
  //     {
  //       path: 'dashboard',
  //       component: SalesDashboardComponent,
  //       canActivate: [permissionGuard('dashboard', 'view')],
  //     },
  //     {
  //       path: 'orders',
  //       canActivate: [permissionGuard('orders', 'view')],
  //       children: [
  //         {
  //           path: '',
  //           component: OrderListForSalesComponent,
  //         },
  //         {
  //           path: 'by-status',
  //           component: OrdersByStatusComponent,
  //         },
  //         {
  //           path: 'reports',
  //           component: OrdersReportComponent,
  //           canActivate: [permissionGuard('orders', 'viewReports')],
  //         },
  //       ],
  //     },
  //     {
  //       path: 'Profile',
  //       component: EditprofileComponent,
  //       canActivate: [authGuard],
  //     },
  //     {
  //       path: 'changePassword',
  //       component: ChangePasswordComponent,
  //       canActivate: [authGuard],
  //     },
  //   ],
  // },

  {
    path: 'profile',
    component: ProfileComponent,
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

// export const routes: Routes = [
//   {
//     path: '',
//     redirectTo:'/dashboard',
//     pathMatch: 'full'
//   },
//   {
//     path:"dashboard",
//     component: EmployeeDashboardComponent
//   },
//   {
//     path:"settings",
//     component: StandardsViewComponent
//   },
//   {
//     path: "settings/edit/:id",
//     component: StandardsEditComponent,
//     data: { title: "Edit Standard" },
//   },
//   {
//     path: "shipping-types",
//     component: ShippingTypesComponent
//   },
//   {
//     path: "shipping-types/create",
//     component: ShippingTypesFormComponent
//   },
//   {
//     path: "shipping-types/edit/:id",
//     component: ShippingTypesFormComponent
//   },
//   {
//     path: "branches",
//     component: BranchesViewComponent
//   },
//   {
//     path: "branches/create",
//     component: BranchesEditComponent
//   },
//   {
//     path: "branches/edit/:id",
//     component: BranchesEditComponent
//   },
//   {
//     path: "permissions",
//     component: PermissionsViewComponent
//   },
//   {
//     path: "permissions/add",
//     component: PermissionsEditComponent
//   },
//   {
//     path: "permissions/edit/:id",
//     component: PermissionsEditComponent
//   },
//   {
//     path: "login",
//     component: LoginComponent
//   },
//   {
//     path: "forgot-password",
//     component: ForgotPasswordComponent
//   },
//   {
//     path: "reset-password",
//     component: ResetPasswordComponent
//   }
// ];
