import { Component, OnInit, Input, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SocialMediaLinkService } from '../../services/social-media-link.service';

interface SocialMediaLink {
  id: string;
  url: string;
  embedUrl?: SafeResourceUrl;
}

@Component({
  selector: 'app-social-media-link',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './social-media-link.component.html',
  styleUrl: './social-media-link.component.css'
})
export class SocialMediaLinkComponent implements OnInit {
  @Input() boardId!: string;
  links: SocialMediaLink[] = [];
  isLoading = false;
  error = '';
  showCreateForm = false;
  createForm: FormGroup;

  constructor(
    private socialMediaLinkService: SocialMediaLinkService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.createForm = this.fb.group({
      url: ['', [Validators.required, Validators.pattern('https?://.+')]]
    });
  }

  ngOnInit() {
    if (this.boardId) {
      this.loadLinks();
    }
  }

  private getEmbedUrl(url: string | undefined): SafeResourceUrl | undefined {
    if (!url) return undefined;
    
    // YouTube handling
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = this.getYouTubeVideoId(url);
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      }
    }
    
    // Instagram handling
    if (url.includes('instagram.com')) {
      const postId = this.getInstagramPostId(url);
      if (postId) {
        const embedUrl = `https://www.instagram.com/p/${postId}/embed`;
        return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      }
    }
    
    return undefined;
  }

  private getYouTubeVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  private getInstagramPostId(url: string): string | null {
    // Handle both full URLs and shortened ones
    const regExp = /instagram\.com\/p\/([^/?#&]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }

  loadLinks() {
    this.isLoading = true;
    console.log('Loading links for board:', this.boardId);
    
    this.socialMediaLinkService.getBoardLinks(this.boardId)
      .subscribe({
        next: (links: SocialMediaLink[]) => {
          console.log('Load links response:', links);
          this.links = (links || []).map(link => ({
            id: link.id || '',
            url: link.url || '',
            embedUrl: this.getEmbedUrl(link.url)
          }));
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Load links error:', error);
          this.error = error.message || 'Failed to load links';
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

  createLink() {
    if (this.createForm.valid) {
      this.isLoading = true;
      console.log('Form value:', this.createForm.value);
      
      this.socialMediaLinkService.createLink(this.boardId, this.createForm.value.url)
        .subscribe({
          next: (response) => {
            console.log('Create link response:', response);
            this.loadLinks();
            this.showCreateForm = false;
            this.createForm.reset();
            this.isLoading = false;
          },
          error: (error) => {
            if (error.status !== 201) {
              console.error('Create link error:', error);
              this.error = error.message || 'Failed to create link';
            } else {
              this.loadLinks();
              this.showCreateForm = false;
              this.createForm.reset();
            }
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

  getEmbedType(url: string): string {
    if (!url) return '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('instagram.com')) {
      return 'instagram';
    }
    return '';
  }
}
