import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'dashboard/:id', loadComponent: () => 
    import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'boards/:id', loadComponent: () => 
    import('./components/board/board.component').then(m => m.BoardComponent) }
];
