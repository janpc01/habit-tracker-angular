import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BoardService } from '../../services/board.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
    dashboards: any[] = [];
    boards: any[] = [];
    isLoading = false;
    error = '';
    showCreateForm = false;
    showCreateBoardForm = false;
    createForm: FormGroup;
    createBoardForm: FormGroup;

    constructor(
        private dashboardService: DashboardService,
        private boardService: BoardService,
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.createForm = this.fb.group({
            name: ['', Validators.required]
        });
        this.createBoardForm = this.fb.group({
            name: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.loadDashboards();
        this.loadBoards();
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

    loadBoards() {
        this.isLoading = true;
        this.boardService.getUserBoards().subscribe({
            next: (boards) => {
                this.boards = boards;
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

    toggleCreateBoardForm() {
        this.showCreateBoardForm = !this.showCreateBoardForm;
        if (this.showCreateBoardForm) {
            this.createBoardForm.reset();
        }
    }

    createBoard() {
        if (this.createBoardForm.valid) {
            this.isLoading = true;
            this.boardService.createBoard(this.createBoardForm.value.name).subscribe({
                next: (response) => {
                    this.router.navigate(['/boards', response.id]);
                },
                error: (error) => {
                    this.error = error.message;
                    this.isLoading = false;
                }
            });
        }
    }

    deleteBoard(boardId: string, event: Event) {
        event.preventDefault();
        if (confirm('Are you sure you want to delete this board? This will also delete all social media links associated with it.')) {
            this.isLoading = true;
            this.boardService.deleteBoard(boardId).subscribe({
                next: () => {
                    this.loadBoards();
                },
                error: (error) => {
                    this.error = error.message;
                    this.isLoading = false;
                }
            });
        }
    }
}
