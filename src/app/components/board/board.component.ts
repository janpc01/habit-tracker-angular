import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BoardService } from '../../services/board.service';
import { ActivatedRoute } from '@angular/router';
import { SocialMediaLinkComponent } from '../social-media-link/social-media-link.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    SocialMediaLinkComponent
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent implements OnInit {
  boardId: string = '';
  board: any;
  isLoading = true;
  error = '';

  constructor(
    private boardService: BoardService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.boardId = this.route.snapshot.paramMap.get('id') || '';
    this.loadBoard();
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
