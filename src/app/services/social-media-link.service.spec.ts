import { TestBed } from '@angular/core/testing';

import { SocialMediaLinkService } from './social-media-link.service';

describe('SocialMediaLinkService', () => {
  let service: SocialMediaLinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocialMediaLinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
