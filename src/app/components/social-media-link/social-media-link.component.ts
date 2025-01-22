import { Component, OnInit, Input, OnDestroy, EventEmitter, Output } from '@angular/core';
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
  imports: [CommonModule],
  template: `
    <div class="embed-container" [class]="getEmbedType(link.url)">
      <iframe
        *ngIf="embedUrl"
        [src]="embedUrl"
        frameborder="0"
        [class.edit-mode]="isEditMode"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    </div>
  `,
  styles: [`
    .embed-container {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    
    iframe.edit-mode {
      pointer-events: none;
    }
  `]
})
export class SocialMediaLinkComponent implements OnInit {
  @Input() link!: any;
  @Input() isEditMode = false;
  @Output() dimensionsChange = new EventEmitter<{width: number, height: number}>();
  
  embedUrl?: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.embedUrl = this.getEmbedUrl(this.link.url);
  }

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
}
