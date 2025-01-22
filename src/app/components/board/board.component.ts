import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { SocialMediaLinkComponent } from '../social-media-link/social-media-link.component';
import { SocialMediaLinkService } from '../../services/social-media-link.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, RouterLink, SocialMediaLinkComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  boardId: string = '';
  links: any[] = [];
  isLoading: boolean = false;
  error: string = '';
  isEditMode: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private socialMediaLinkService: SocialMediaLinkService
  ) {}

  ngOnInit() {
    this.boardId = this.route.snapshot.paramMap.get('id') || '';
    this.loadLinks();
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    
    if (!this.isEditMode) {
      this.saveAllPositions();
    }
  }

  private saveAllPositions() {
    const container = document.querySelector('.links-container') as HTMLElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const linkElements = document.querySelectorAll('.social-media-link-container');
    
    linkElements.forEach(element => {
      const linkId = element.closest('app-social-media-link')?.getAttribute('ng-reflect-link-id');
      if (!linkId) return;

      const rect = element.getBoundingClientRect();
      // Calculate position relative to container
      const relativeX = rect.left - containerRect.left;
      const relativeY = rect.top - containerRect.top;

      this.socialMediaLinkService.updateLinkPositionAndDimensions(
        linkId,
        relativeX,
        relativeY,
        rect.width,
        rect.height
      ).subscribe({
        error: (error) => {
          console.error('Error saving position:', error);
          this.error = 'Failed to save some positions';
        }
      });
    });
  }

  loadLinks() {
    if (!this.boardId) return;
    
    this.isLoading = true;
    this.socialMediaLinkService.getBoardLinks(this.boardId).subscribe({
      next: (links) => {
        this.links = links.map(link => ({
          ...link,
          x: link.x,
          y: link.y,
          width: link.width,
          height: link.height
        }));
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  addLink() {
    if (!this.boardId) return;
    
    this.isLoading = true;
    this.socialMediaLinkService.createLink(this.boardId, 'https://example.com').subscribe({
      next: (newLink) => {
        this.links.push(newLink);
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }
}
