import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialMediaLinkComponent } from './social-media-link.component';

describe('SocialMediaLinkComponent', () => {
  let component: SocialMediaLinkComponent;
  let fixture: ComponentFixture<SocialMediaLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialMediaLinkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialMediaLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
