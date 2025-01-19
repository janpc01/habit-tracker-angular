import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HabitService } from '../../services/habit.service';

@Component({
    selector: 'app-habit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './habit.component.html',
    styleUrl: './habit.component.css'
})
export class HabitComponent implements OnInit {
    @Input() dashboardId!: string;
    habits: any[] = [];
    isLoading = false;
    error = '';
    showCreateForm = false;
    createForm: FormGroup;

    constructor(
        private habitService: HabitService,
        private fb: FormBuilder
    ) {
        this.createForm = this.fb.group({
            name: ['', Validators.required],
            description: ['']
        });
    }

    ngOnInit() {
        if (this.dashboardId) {
            this.loadHabits();
        }
    }

    loadHabits() {
        this.isLoading = true;
        this.habitService.getHabits(this.dashboardId).subscribe({
            next: (habits) => {
                this.habits = habits;
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

    createHabit() {
        if (this.createForm.valid) {
            this.isLoading = true;
            this.habitService.createHabit(this.dashboardId, this.createForm.value).subscribe({
                next: () => {
                    this.loadHabits();
                    this.showCreateForm = false;
                    this.createForm.reset();
                    this.isLoading = false;
                },
                error: (error) => {
                    this.error = error.message;
                    this.isLoading = false;
                }
            });
        }
    }
}
