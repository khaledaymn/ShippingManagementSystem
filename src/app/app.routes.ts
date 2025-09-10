import { Routes } from '@angular/router';
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
import { deliveryDashboardComponent } from './components/delivery/delivery-dashboard/delivery-dashboard.component';
import { DeliveryOrdersViewComponent } from './components/delivery/order/order-view/order-view.component';
import { DeliveryOrderDetailsComponent } from './components/delivery/order/order-details/order-details.component';
import { merchantDashboardComponent } from './components/merchant/merchant-dashboard/merchant-dashboard.component';
import { MerchantOrdersViewComponent } from './components/merchant/order/order-view/order-view.component';
import { MerchantOrderDetailsComponent } from './components/merchant/order/order-details/order-details.component';
import { MerchantOrdersAddComponent } from './components/merchant/order/order-add/order-add.component';

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
            canActivate: [permissionOrRoleGuard('Branchs', 'View', [Role.ADMIN])],
          },
          {
            path: 'branches/create',
            component: BranchesEditComponent,
            canActivate: [permissionOrRoleGuard('Branchs', 'Create', [Role.ADMIN])],
          },
          {
            path: 'branches/edit/:id',
            component: BranchesEditComponent,
            canActivate: [permissionOrRoleGuard('Branchs', 'Edit', [Role.ADMIN])],
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
        canActivate: [permissionOrRoleGuard('Orders', 'View',[Role.ADMIN])],
        component: OrdersViewComponent
      },
      {
        path: 'orders/details/:id',
        canActivate: [permissionOrRoleGuard('Orders', 'View',[Role.ADMIN])],
        component: OrderDetailsComponent
      },
      {
        path: 'orders/create',
        canActivate: [permissionOrRoleGuard('Orders', 'Create',[Role.ADMIN])],
        component: OrdersAddComponent
      },
    ],
  },
  {
    path: 'delivery',
    canActivate: [authGuard, roleGuard([Role.SALES_REPRESENTATIVE])],
     children: [
      {
        path: 'dashboard',
        component: deliveryDashboardComponent,
      },
      {
        path: 'orders',
        component: DeliveryOrdersViewComponent
      },
      {
        path: 'orders/details/:id',
        component: DeliveryOrderDetailsComponent
      },
    ]
  },
  {
    path: 'merchant',
    canActivate: [authGuard, roleGuard([Role.MERCHANT])],
     children: [
      {
        path: 'dashboard',
        component: merchantDashboardComponent,
      },
      {
        path: 'orders',
        component: MerchantOrdersViewComponent
      },
      {
        path: 'orders/details/:id',
        component: MerchantOrderDetailsComponent
      },
      {
        path: 'orders/create',
        component: MerchantOrdersAddComponent
      },
    ]
  },
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
