import { Component, AfterViewInit, Input, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialMediaLinkService } from '../../services/social-media-link.service';

@Component({
  selector: 'app-social-media-link',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-media-link.component.html',
  styleUrls: ['./social-media-link.component.css']
})
export class SocialMediaLinkComponent implements AfterViewInit {
  @Input() boardId!: string;
  @Input() linkId!: string;
  @Input() isEditMode: boolean = false;
  @Input() link: any;

  private element: HTMLElement;
  private pos1 = 0;
  private pos2 = 0;
  private pos3 = 0;
  private pos4 = 0;

  constructor(
    private elementRef: ElementRef,
    private socialMediaLinkService: SocialMediaLinkService
  ) {
    this.element = this.elementRef.nativeElement;
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