import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BoardService } from '../../services/board.service';
import { ActivatedRoute } from '@angular/router';
import { SocialMediaLinkComponent } from '../social-media-link/social-media-link.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    SocialMediaLinkComponent
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent implements OnInit {
  boards: any[] = [];
  isLoading = true;
  error = '';
  showCreateForm = false;
  createForm: FormGroup;
  boardId: string = '';
  board: any;

  constructor(
    private boardService: BoardService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.createForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.boardId = this.route.snapshot.paramMap.get('id') || '';
    this.loadBoards();
    this.loadBoard();
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

  createBoard() {
    if (this.createForm.valid) {
      this.isLoading = true;
      this.boardService.createBoard(this.createForm.value.name).subscribe({
        next: () => {
          this.loadBoards();
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

  deleteBoard(boardId: string) {
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

  private loadBoard() {
    if (!this.boardId) {
      this.error = 'Board ID not found';
      this.isLoading = false;
      return;
    }

    this.boardService.getBoard(this.boardId).subscribe({
      next: (board) => {
        this.board = board;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load board';
        this.isLoading = false;
      }
    });
  }
}
