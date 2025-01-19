import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { HabitComponent } from '../habit/habit.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, HabitComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
    dashboardId: string = '';
    dashboard: any;
    isLoading: boolean = true;
    error: string = '';

    constructor(
        private route: ActivatedRoute,
        private dashboardService: DashboardService
    ) {}

    ngOnInit() {
        this.dashboardId = this.route.snapshot.paramMap.get('id') || '';
        this.loadDashboard();
    }

    private loadDashboard() {
        if (!this.dashboardId) {
            this.error = 'Dashboard ID not found';
            this.isLoading = false;
            return;
        }

        this.dashboardService.getDashboard(this.dashboardId).subscribe({
            next: (dashboard) => {
                this.dashboard = dashboard;
                this.isLoading = false;
            },
            error: (error) => {
                this.error = error.message || 'Failed to load dashboard';
                this.isLoading = false;
            }
        });
    }
}
