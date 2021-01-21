import { TestBed } from '@angular/core/testing';

import { CatRecommendService } from './cat-recommend.service';

describe('CatRecommendService', () => {
  let service: CatRecommendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatRecommendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
