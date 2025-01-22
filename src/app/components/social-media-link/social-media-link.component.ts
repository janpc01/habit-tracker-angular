import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SocialMediaLinkService } from '../../services/social-media-link.service';
import { firstValueFrom } from 'rxjs';

interface SocialMediaLink {
  id: string;
  url: string;
  width?: number;
  height?: number;
  embedUrl?: SafeResourceUrl;
  x?: number;
  y?: number;
}

@Component({
  selector: 'app-social-media-link',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './social-media-link.component.html',
  styleUrls: ['./social-media-link.component.css']
})
export class SocialMediaLinkComponent implements OnInit, OnDestroy {
  @Input() boardId!: string;
  links: SocialMediaLink[] = [];
  isLoading = false;
  error = '';
  showCreateForm = false;
  isEditMode = false;
  createForm: FormGroup;

  private resizeObserver: ResizeObserver;
  private dragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    startTop: 0,
    startLeft: 0,
    currentLinkId: ''
  };
  private changes: Record<string, { width?: number; height?: number; x?: number; y?: number }> = {};

  constructor(
    private service: SocialMediaLinkService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.createForm = this.fb.group({
      url: ['', [Validators.required, Validators.pattern('https?://.+')]]
    });
    this.resizeObserver = new ResizeObserver(entries => this.handleResize(entries));
  }

  ngOnInit() {
    if (this.boardId) this.loadLinks();
  }

  ngOnDestroy() {
    this.resizeObserver.disconnect();
  }

  private async loadLinks() {
    try {
      this.isLoading = true;
      const links = await firstValueFrom(this.service.getBoardLinks(this.boardId));
      this.links = links.map(link => ({
        ...link,
        width: link.width,
        height: link.height,
        x: link.x || 0,
        y: link.y || 0,
        embedUrl: this.getEmbedUrl(link.url)
      }));
      setTimeout(() => this.setupObservers(), 0);
    } catch (error: any) {
      this.error = error.message || 'Failed to load links';
    } finally {
      this.isLoading = false;
    }
  }

  private setupObservers() {
    this.resizeObserver.disconnect();
    document.querySelectorAll('.embed-container').forEach(container => {
      const linkId = container.getAttribute('data-link-id');
      if (linkId) this.resizeObserver.observe(container);
    });
  }

  private handleResize(entries: ResizeObserverEntry[]) {
    if (!this.isEditMode) return;

    entries.forEach(entry => {
      const container = entry.target as HTMLElement;
      const linkId = container.getAttribute('data-link-id');
      if (!linkId) return;

      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);

      if (width > 0 && height > 0) {
        this.trackChange(linkId, { width, height });
      }
    });
  }

  private trackChange(linkId: string, change: { width?: number; height?: number; x?: number; y?: number }) {
    this.changes[linkId] = { ...this.changes[linkId], ...change };
    const linkIndex = this.links.findIndex(l => l.id === linkId);
    if (linkIndex !== -1) {
      this.links[linkIndex] = { ...this.links[linkIndex], ...change };
    }
  }

  async toggleEditMode() {
    if (this.isEditMode) {
      await this.saveChanges();
    }
    this.isEditMode = !this.isEditMode;
  }

  private async saveChanges() {
    if (!Object.keys(this.changes).length) return;

    try {
      this.isLoading = true;
      await Promise.all(
        Object.entries(this.changes).map(async ([linkId, changes]) => {
          const promises = [];
          if (changes.width && changes.height) {
            promises.push(firstValueFrom(this.service.updateLinkDimensions(linkId, changes.width, changes.height)));
          }
          if (changes.x !== undefined && changes.y !== undefined) {
            promises.push(firstValueFrom(this.service.updateLinkPosition(linkId, changes.x, changes.y)));
          }
          await Promise.all(promises);
        })
      );
      this.changes = {};
    } catch (error: any) {
      this.error = error.message || 'Failed to save changes';
    } finally {
      this.isLoading = false;
    }
  }

  onDragStart(event: MouseEvent, link: SocialMediaLink) {
    if (!(event.target as HTMLElement).classList.contains('drag-handle')) return;

    const container = (event.target as HTMLElement).closest('.embed-container') as HTMLElement;
    if (!container) return;

    this.dragState = {
      isDragging: true,
      startX: event.clientX,
      startY: event.clientY,
      startTop: container.offsetTop,
      startLeft: container.offsetLeft,
      currentLinkId: link.id
    };

    document.addEventListener('mousemove', this.onDragMove);
    document.addEventListener('mouseup', this.onDragEnd);
  }

  private onDragMove = (event: MouseEvent) => {
    if (!this.dragState.isDragging) return;

    const deltaX = event.clientX - this.dragState.startX;
    const deltaY = event.clientY - this.dragState.startY;

    const link = this.links.find(l => l.id === this.dragState.currentLinkId);
    if (link) {
      this.trackChange(link.id, {
        x: Math.max(0, this.dragState.startLeft + deltaX),
        y: Math.max(0, this.dragState.startTop + deltaY)
      });
    }
  };

  private onDragEnd = () => {
    if (!this.dragState.isDragging) return;
    this.dragState.isDragging = false;
    document.removeEventListener('mousemove', this.onDragMove);
    document.removeEventListener('mouseup', this.onDragEnd);
  };

  private getEmbedUrl(url: string): SafeResourceUrl | undefined {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com.*(?:\/|v=|\/v\/|embed\/))([a-zA-Z0-9_-]{11})/)?.[1];
    if (videoId) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
    }

    const instaId = url.match(/instagram\.com\/p\/([^/?#&]+)/)?.[1];
    if (instaId) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.instagram.com/p/${instaId}/embed`);
    }

    return undefined;
  }

  getEmbedType(url: string): string {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('instagram.com')) {
      return 'instagram';
    }
    return 'default';
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.createForm.reset();
    }
  }

  async createLink() {
    if (!this.createForm.valid) return;

    try {
      this.isLoading = true;
      await firstValueFrom(this.service.createLink(this.boardId, this.createForm.value.url));
      this.showCreateForm = false;
      await this.loadLinks();
    } catch (error: any) {
      this.error = error.message || 'Failed to create link';
    } finally {
      this.isLoading = false;
    }
  }

  async deleteLink(linkId: string) {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      this.isLoading = true;
      await firstValueFrom(this.service.deleteLink(linkId));
      await this.loadLinks();
    } catch (error: any) {
      this.error = error.message || 'Failed to delete link';
    } finally {
      this.isLoading = false;
    }
  }
}
