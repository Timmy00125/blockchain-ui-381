import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockchainViewerComponent } from './blockchain-viewer.component';

describe('BlockchainViewerComponent', () => {
  let component: BlockchainViewerComponent;
  let fixture: ComponentFixture<BlockchainViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockchainViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockchainViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
