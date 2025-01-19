import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
    dashboards: any[] = [];
    isLoading = false;
    error = '';

    constructor(
        private dashboardService: DashboardService,
        private router: Router
    ) {}

    ngOnInit() {
        this.loadDashboards();
    }

    loadDashboards() {
        this.isLoading = true;
        this.dashboardService.getUserDashboards().subscribe({
            next: (dashboards) => {
                this.dashboards = dashboards;
                this.isLoading = false;
            },
            error: (error) => {
                this.error = error.message;
                this.isLoading = false;
            }
        });
    }

    createDashboard() {
        this.isLoading = true;
        this.dashboardService.createDashboard().subscribe({
            next: (response) => {
                this.router.navigate(['/dashboard', response.id]);
            },
            error: (error) => {
                this.error = error.message;
                this.isLoading = false;
            }
        });
    }
}
