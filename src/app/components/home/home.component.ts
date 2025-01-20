import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
    dashboards: any[] = [];
    isLoading = false;
    error = '';
    showCreateForm = false;
    createForm: FormGroup;

    constructor(
        private dashboardService: DashboardService,
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.createForm = this.fb.group({
            name: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.loadDashboards();
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
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

    toggleCreateForm() {
        this.showCreateForm = !this.showCreateForm;
        if (this.showCreateForm) {
            this.createForm.reset();
        }
    }

    createDashboard() {
        if (this.createForm.valid) {
            this.isLoading = true;
            this.dashboardService.createDashboard(this.createForm.value.name).subscribe({
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

    deleteDashboard(dashboardId: string, event: Event) {
        event.preventDefault(); // Prevent navigation
        if (confirm('Are you sure you want to delete this dashboard? This will also delete all habits associated with it.')) {
            this.isLoading = true;
            this.dashboardService.deleteDashboard(dashboardId).subscribe({
                next: () => {
                    this.loadDashboards();
                },
                error: (error) => {
                    this.error = error.message;
                    this.isLoading = false;
                }
            });
        }
    }
}
