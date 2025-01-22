import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BoardService } from '../../services/board.service';
import { ActivatedRoute } from '@angular/router';
import { SocialMediaLinkComponent } from '../social-media-link/social-media-link.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SocialMediaLinkService } from '../../services/social-media-link.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    ReactiveFormsModule,
    SocialMediaLinkComponent
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent implements OnInit {
  boardId: string = '';
  board: any;
  links: any[] = [];
  isLoading = true;
  error = '';
  isEditMode = false;
  showCreateForm = false;
  createForm: FormGroup;
  
  private dragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    startTop: 0,
    startLeft: 0,
    currentLinkId: ''
  };

  constructor(
    private boardService: BoardService,
    private socialMediaLinkService: SocialMediaLinkService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      url: ['', [Validators.required, Validators.pattern('https?://.+')]]
    });
  }

  ngOnInit() {
    this.boardId = this.route.snapshot.paramMap.get('id') || '';
    this.loadBoard();
    this.loadLinks();
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

  private loadLinks() {
    if (!this.boardId) return;
    
    this.isLoading = true;
    this.socialMediaLinkService.getBoardLinks(this.boardId).subscribe({
      next: (links) => {
        this.links = links.map(link => ({
          ...link,
          width: link.width || 550,
          height: link.height || 300,
          x: link.x || 0,
          y: link.y || 0
        }));
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.createForm.reset();
    }
  }

  createLink() {
    if (this.createForm.valid) {
      this.isLoading = true;
      this.socialMediaLinkService.createLink(this.boardId, this.createForm.value.url).subscribe({
        next: () => {
          this.loadLinks();
          this.showCreateForm = false;
          this.createForm.reset();
        },
        error: (error) => {
          this.error = error.message;
          this.isLoading = false;
        }
      });
    }
  }

  deleteLink(linkId: string) {
    if (confirm('Are you sure you want to delete this link?')) {
      this.isLoading = true;
      this.socialMediaLinkService.deleteLink(linkId).subscribe({
        next: () => {
          this.loadLinks();
        },
        error: (error) => {
          this.error = error.message;
          this.isLoading = false;
        }
      });
    }
  }

  onDragStart(event: MouseEvent, link: any) {
    event.preventDefault();
    this.dragState = {
      isDragging: true,
      startX: event.clientX,
      startY: event.clientY,
      startTop: link.y,
      startLeft: link.x,
      currentLinkId: link.id
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!this.dragState.isDragging) return;

      const deltaX = e.clientX - this.dragState.startX;
      const deltaY = e.clientY - this.dragState.startY;

      const link = this.links.find(l => l.id === this.dragState.currentLinkId);
      if (link) {
        link.x = this.dragState.startLeft + deltaX;
        link.y = this.dragState.startTop + deltaY;
      }
    };

    const onMouseUp = () => {
      if (!this.dragState.isDragging) return;

      const link = this.links.find(l => l.id === this.dragState.currentLinkId);
      if (link) {
        this.socialMediaLinkService.updateLinkPosition(link.id, link.x, link.y).subscribe();
      }

      this.dragState.isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  onDimensionsChange(dimensions: {width: number, height: number}, linkId: string) {
    const link = this.links.find(l => l.id === linkId);
    if (link) {
      link.width = dimensions.width;
      link.height = dimensions.height;
      this.socialMediaLinkService.updateLinkDimensions(linkId, dimensions.width, dimensions.height).subscribe();
    }
  }
}
