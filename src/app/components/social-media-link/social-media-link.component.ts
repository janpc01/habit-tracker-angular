import { Component, AfterViewInit, Input, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SocialMediaLinkService } from '../../services/social-media-link.service';

@Component({
  selector: 'app-social-media-link',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-media-link.component.html',
  styleUrls: ['./social-media-link.component.css']
})
export class SocialMediaLinkComponent implements AfterViewInit, OnInit {
  @Input() boardId!: string;
  @Input() linkId!: string;
  @Input() isEditMode: boolean = false;
  @Input() link: any;
  
  safeUrl: SafeResourceUrl = '';
  isYoutubeEmbed: boolean = false;

  private element: HTMLElement;
  private pos1 = 0;
  private pos2 = 0;
  private pos3 = 0;
  private pos4 = 0;

  constructor(
    private elementRef: ElementRef,
    private socialMediaLinkService: SocialMediaLinkService,
    private sanitizer: DomSanitizer
  ) {
    this.element = this.elementRef.nativeElement;
  }

  ngOnInit() {
    if (this.link?.url) {
      const embedUrl = this.getEmbedUrl(this.link.url);
      if (embedUrl) {
        this.isYoutubeEmbed = true;
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      } else {
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.link.url);
      }
    }
  }

  private getEmbedUrl(url: string): string | null {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.host.includes('youtube.com') || parsedUrl.host.includes('youtu.be')) {
        const videoId = this.extractYoutubeVideoId(parsedUrl);
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  private extractYoutubeVideoId(url: URL): string | null {
    if (url.host.includes('youtu.be')) {
      return url.pathname.substring(1);
    } else if (url.host.includes('youtube.com')) {
      return url.searchParams.get('v');
    }
    return null;
  }

  ngAfterViewInit(): void {
    this.initializeDraggable();
    this.setInitialPosition();
  }

  private setInitialPosition(): void {
    const container = this.element.querySelector('.social-media-link-container') as HTMLElement;
    if (!container || !this.link) return;

    // Set position and dimensions from backend data
    container.style.transform = `translate(${this.link.x}px, ${this.link.y}px)`;
    container.style.width = `${this.link.width}px`;
    container.style.height = `${this.link.height}px`;
  }

  private initializeDraggable(): void {
    const container = this.element.querySelector('.social-media-link-container') as HTMLElement;
    const header = this.element.querySelector('.social-media-link-header') as HTMLElement;
    
    if (!container || !header) return;
    
    header.onmousedown = (e: MouseEvent) => {
      if (!this.isEditMode) return;
      this.dragMouseDown(e, container);
    };
  }

  private dragMouseDown(e: MouseEvent, element: HTMLElement): void {
    if (!this.isEditMode) return;
    
    e.preventDefault();
    this.pos3 = e.clientX;
    this.pos4 = e.clientY;
    
    document.onmouseup = () => this.closeDragElement();
    document.onmousemove = (e: MouseEvent) => this.elementDrag(e, element);
  }

  private elementDrag(e: MouseEvent, element: HTMLElement): void {
    if (!this.isEditMode) return;
    
    e.preventDefault();
    this.pos1 = this.pos3 - e.clientX;
    this.pos2 = this.pos4 - e.clientY;
    this.pos3 = e.clientX;
    this.pos4 = e.clientY;
    
    // Update current position
    const newLeft = element.offsetLeft - this.pos1;
    const newTop = element.offsetTop - this.pos2;
    
    // Update element position
    element.style.left = newLeft + "px";
    element.style.top = newTop + "px";
    
    // Store current position in link object
    this.link.x = newLeft;
    this.link.y = newTop;
  }

  private closeDragElement(): void {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}