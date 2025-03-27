import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SocialMediaLinkComponent } from '../social-media-link/social-media-link.component';
import { SocialMediaLinkService } from '../../services/social-media-link.service';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, SocialMediaLinkComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  boardId: string = '';
  boardName: string = '';
  links: any[] = [];
  isLoading: boolean = false;
  error: string = '';
  isEditMode: boolean = false;
  showUrlInput: boolean = false;
  urlForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private socialMediaLinkService: SocialMediaLinkService,
    private boardService: BoardService,
    private fb: FormBuilder
  ) {
    console.log('BoardComponent: Initializing component');
    this.urlForm = this.fb.group({
      link: ['', [Validators.required, Validators.pattern('https?://.+')]],
      x: [0],       // Add default value for x
      y: [0],       // Add default value for y
      width: [300], // Add default value for width
      height: [200] // Add default value for height
    });
  }

  ngOnInit() {
    console.log('BoardComponent: Loading board data');
    this.boardId = this.route.snapshot.paramMap.get('id') || '';
    this.boardService.getBoard(this.boardId).subscribe({
      next: (board) => {
        this.boardName = board.title;
        this.loadLinks();
      },
      error: (error) => {
        this.error = error.message;
        this.loadLinks();
      }
    });
  }

  toggleEditMode() {
    console.log('BoardComponent: Toggling edit mode:', !this.isEditMode);
    this.isEditMode = !this.isEditMode;
    
    if (!this.isEditMode) {
      this.saveAllPositions();
    }
  }

  private saveAllPositions() {
    console.log('BoardComponent: Saving positions for all links');
    const container = document.querySelector('.links-container') as HTMLElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const linkElements = document.querySelectorAll('.social-media-link-container');

    linkElements.forEach(element => {
      const linkId = element.closest('app-social-media-link')?.getAttribute('ng-reflect-link-id');
      if (!linkId) return;

      const rect = element.getBoundingClientRect();
      const relativeX = rect.left - containerRect.left;
      const relativeY = rect.top - containerRect.top;

      this.socialMediaLinkService.updateLinkPositionAndDimensions(
        this.boardId,
        linkId,
        relativeX,
        relativeY,
        rect.width,
        rect.height
      ).subscribe({
        error: (error) => {
          this.error = 'Failed to save some positions';
        }
      });
    });
  }

  loadLinks() {
    this.isLoading = true;
    this.socialMediaLinkService.getBoardLinks(this.boardId).subscribe({
        next: (links) => {
            this.links = Array.isArray(links) ? links : [];
            console.log("Links after fetch:", this.links);
            this.isLoading = false;
        },
        error: (error) => {
            this.error = error.message;
            this.isLoading = false;
        }
    });
  }

  addLink() {
    console.log('BoardComponent: Adding new link with URL:', this.urlForm.value.url);
    console.log(this.urlForm.value);
    if (!this.boardId || !this.urlForm.valid) return;
    
    this.isLoading = true;
    this.socialMediaLinkService.createLink(this.boardId, this.urlForm.value).subscribe({
      next: (newLink) => {
        if (newLink && newLink.id) {
          this.links.push({
            ...newLink,
            x: 0,
            y: 0,
            width: 300,
            height: 200
          });
          this.isLoading = false;
          this.showUrlInput = false;
          this.urlForm.reset();
        } else {
          this.loadLinks();
          this.showUrlInput = false;
          this.urlForm.reset();
        }
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  toggleUrlInput() {
    console.log('BoardComponent: Toggling URL input visibility:', !this.showUrlInput);
    this.showUrlInput = !this.showUrlInput;
    if (!this.showUrlInput) {
      this.urlForm.reset();
    }
  }

  onLinkDeleted(linkId: string) {
    console.log('BoardComponent: Removing deleted link:', linkId);
    this.links = this.links.filter(link => link.id !== linkId);
  }
}
