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
    logForm: FormGroup;
    selectedHabit: any = null;

    constructor(
        private habitService: HabitService,
        private fb: FormBuilder
    ) {
        this.createForm = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required]  // Made required as per Habit entity
        });

        this.logForm = this.fb.group({
            date: [new Date().toISOString().split('T')[0], Validators.required],
            completed: [true],
            notes: ['']
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

    toggleLogForm(habit: any) {
        if (this.selectedHabit?.id === habit.id) {
            this.selectedHabit = null;
        } else {
            this.selectedHabit = habit;
            this.logForm.reset({
                date: new Date().toISOString().split('T')[0],
                completed: true,
                notes: ''
            });
        }
    }

    cancelLog() {
        this.selectedHabit = null;
        this.logForm.reset({
            date: new Date().toISOString().split('T')[0],
            completed: true,
            notes: ''
        });
    }

    logCompletion(habitId: number) {
        if (this.logForm.valid) {
            this.isLoading = true;
            const formValue = this.logForm.value;
            
            this.habitService.logHabitCompletion(
                habitId,
                formValue.date,
                formValue.completed,
                formValue.notes
            ).subscribe({
                next: () => {
                    this.selectedHabit = null;
                    this.logForm.reset({
                        date: new Date().toISOString().split('T')[0],
                        completed: true,
                        notes: ''
                    });
                    this.isLoading = false;
                },
                error: (error) => {
                    this.error = error.message;
                    this.isLoading = false;
                }
            });
        }
    }

    deleteHabit(habitId: number) {
        if (confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
            this.isLoading = true;
            this.habitService.deleteHabit(habitId).subscribe({
                next: () => {
                    this.loadHabits();
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