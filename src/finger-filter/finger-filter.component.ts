import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
  model,
  signal,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';

type FilterType = 'invert' | 'grayscale' | 'sepia' | 'thermal';

interface Point {
  x: number;
  y: number;
}
@Component({
  selector: 'app-finger-filter',
  standalone: true,
  templateUrl: './finger-filter.component.html',
  styleUrl: './finger-filter.styles.css',
  imports: [
    CommonModule,
    FormsModule,
    MatSliderModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
  ],
})
export class FingerFilterComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: true })
  videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('outputCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  effects: FilterType[] = ['invert', 'grayscale', 'sepia', 'thermal'];

  // Angular 19 two-way signal (model) — enables [(ngModel)]="amount" without manual (ngModelChange)
  selectedEffect = model<FilterType>('invert');

  amount = model(50);
  redAmount = model(128);
  greenAmount = model(128);
  blueAmount = model(128);

  error = signal<string | null>(null);

  // Material display helpers — compact density, full Spanish labels
  readonly effectLabels: Record<FilterType, string> = {
    invert: 'Invertir',
    grayscale: 'Grises',
    sepia: 'Sepia',
    thermal: 'Térmico',
  };

  readonly effectIcons: Record<FilterType, string> = {
    invert: 'invert_colors',
    grayscale: 'filter_b_and_w',
    sepia: 'filter_vintage',
    thermal: 'whatshot',
  };

  // Computed hex & rgb preview for color picker sync (both: sliders + picker)
  hexColor = computed(() => {
    const r = this.clamp255(this.redAmount());
    const g = this.clamp255(this.greenAmount());
    const b = this.clamp255(this.blueAmount());
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  });

  rgbLabel = computed(() => `rgb(${this.redAmount()}, ${this.greenAmount()}, ${this.blueAmount()})`);

  displayWithPercent = (v: number): string => `${Math.round(v)}%`;
  displayWith255 = (v: number): string => `${Math.round(v)}`;

  onHexColorChange(event: Event): void {
    const hex = (event.target as HTMLInputElement).value;
    const { r, g, b } = this.hexToRgb(hex);
    this.redAmount.set(r);
    this.greenAmount.set(g);
    this.blueAmount.set(b);
  }

  private clamp255(v: number): number {
    return Math.max(0, Math.min(255, Math.round(v)));
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const n = hex.replace('#', '');
    const full = n.length === 3 ? n.split('').map((c) => c + c).join('') : n;
    const int = parseInt(full, 16);
    if (Number.isNaN(int) || full.length !== 6) return { r: 128, g: 128, b: 128 };
    return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
  }

  private handLandmarker!: HandLandmarker;
  private animationFrameId = 0;
  private ctx!: CanvasRenderingContext2D;
  private stream: MediaStream | null = null;
  private isDestroyed = false;

  // Smoothed Landmark Coordinates (Lerp memory)
  private smoothedTopThumb: Point | null = null;
  private smoothedTopIndex: Point | null = null;
  private smoothedBottomThumb: Point | null = null;
  private smoothedBottomIndex: Point | null = null;
  private lerpFactor = 0.35; // Lower values = smoother/slower, Higher values = faster/sharper

  async ngOnInit(): Promise<void> {
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) {
      this.error.set('Canvas 2D context unavailable — browser may not support canvas rendering.');
      return;
    }
    this.ctx = ctx;

    try {
      await this.initMediaPipe();
      await this.setupWebcam();
      if (!this.isDestroyed) {
        this.renderLoop();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.error.set(msg);
      console.error('[FingerFilter] init failed:', e);
    }
  }

  private async initMediaPipe(): Promise<void> {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
    );

    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 2,
      minHandDetectionConfidence: 0.7,
      minHandPresenceConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });
  }

  private async setupWebcam(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
      });
      this.stream = stream;
      const video = this.videoRef.nativeElement;
      video.srcObject = stream;
      await video.play();

      this.canvasRef.nativeElement.width = video.videoWidth;
      this.canvasRef.nativeElement.height = video.videoHeight;
    } catch (e: unknown) {
      if (e instanceof DOMException) {
        if (e.name === 'NotAllowedError') {
          throw new Error('Camera permission denied — please allow camera access and reload.');
        }
        if (e.name === 'NotFoundError') {
          throw new Error('No camera found — please connect a camera device.');
        }
        if (e.name === 'OverconstrainedError') {
          throw new Error('Camera does not support requested resolution.');
        }
      }
      throw e;
    }
  }

  private renderLoop = (): void => {
    if (this.isDestroyed) return;

    if (!this.handLandmarker) {
      this.animationFrameId = requestAnimationFrame(this.renderLoop);
      return;
    }

    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;

    if (!video || video.readyState < 2) {
      this.animationFrameId = requestAnimationFrame(this.renderLoop);
      return;
    }

    const results = this.handLandmarker.detectForVideo(
      video,
      performance.now(),
    );

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (results.landmarks && results.landmarks.length >= 2) {
      const handA = results.landmarks[0];
      const handB = results.landmarks[1];

      const handACenterY = (handA[4].y + handA[8].y) / 2;
      const handBCenterY = (handB[4].y + handB[8].y) / 2;

      const topHand = handACenterY < handBCenterY ? handA : handB;
      const bottomHand = handACenterY < handBCenterY ? handB : handA;

      // Raw coordinates
      const targetTopThumb = {
        x: topHand[4].x * canvas.width,
        y: topHand[4].y * canvas.height,
      };
      const targetTopIndex = {
        x: topHand[8].x * canvas.width,
        y: topHand[8].y * canvas.height,
      };
      const targetBottomThumb = {
        x: bottomHand[4].x * canvas.width,
        y: bottomHand[4].y * canvas.height,
      };
      const targetBottomIndex = {
        x: bottomHand[8].x * canvas.width,
        y: bottomHand[8].y * canvas.height,
      };

      // Apply Lerp Interpolation
      this.smoothedTopThumb = this.lerpPoint(
        this.smoothedTopThumb,
        targetTopThumb,
      );
      this.smoothedTopIndex = this.lerpPoint(
        this.smoothedTopIndex,
        targetTopIndex,
      );
      this.smoothedBottomThumb = this.lerpPoint(
        this.smoothedBottomThumb,
        targetBottomThumb,
      );
      this.smoothedBottomIndex = this.lerpPoint(
        this.smoothedBottomIndex,
        targetBottomIndex,
      );

      this.applyFilterMask(
        this.smoothedTopThumb,
        this.smoothedTopIndex,
        this.smoothedBottomThumb,
        this.smoothedBottomIndex,
        video,
      );
    } else {
      // Reset smoothed points on hand tracking loss
      this.smoothedTopThumb = null;
      this.smoothedTopIndex = null;
      this.smoothedBottomThumb = null;
      this.smoothedBottomIndex = null;
    }

    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  };

  private lerpPoint(current: Point | null, target: Point): Point {
    if (!current) return { ...target };
    return {
      x: current.x + (target.x - current.x) * this.lerpFactor,
      y: current.y + (target.y - current.y) * this.lerpFactor,
    };
  }

  private applyFilterMask(
    tThumb: Point,
    tIndex: Point,
    bThumb: Point,
    bIndex: Point,
    video: HTMLVideoElement,
  ): void {
    const canvas = this.canvasRef.nativeElement;

    const topLeft = tThumb.x < tIndex.x ? tThumb : tIndex;
    const topRight = tThumb.x < tIndex.x ? tIndex : tThumb;
    const bottomLeft = bThumb.x < bIndex.x ? bThumb : bIndex;
    const bottomRight = bThumb.x < bIndex.x ? bIndex : bThumb;

    this.ctx.save();

    // Polygon Path
    this.ctx.beginPath();
    this.ctx.moveTo(topLeft.x, topLeft.y);
    this.ctx.lineTo(topRight.x, topRight.y);
    this.ctx.lineTo(bottomRight.x, bottomRight.y);
    this.ctx.lineTo(bottomLeft.x, bottomLeft.y);
    this.ctx.closePath();

    this.ctx.clip();

    // 1. Base Effect Filter
    this.ctx.filter = this.getFilterString();
    this.ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Custom RGB Tint Layer Blend
    const tintOpacity = (this.amount() / 100) * 0.4;
    this.ctx.filter = 'none';
    this.ctx.fillStyle = `rgba(${this.redAmount()}, ${this.greenAmount()}, ${this.blueAmount()}, ${tintOpacity})`;
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Polygon Border Outline
    this.ctx.strokeStyle = `rgb(${this.redAmount()}, ${this.greenAmount()}, ${this.blueAmount()})`;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    this.ctx.restore();
  }

  private getFilterString(): string {
    const factor = this.amount() / 100;

    switch (this.selectedEffect()) {
      case 'invert':
        return `invert(${100 * factor}%) contrast(${100 + 120 * factor}%) grayscale(${100 * factor}%)`;
      case 'grayscale':
        return `grayscale(${100 * factor}%) contrast(${100 + 30 * factor}%) brightness(${100 - 10 * factor}%)`;
      case 'thermal':
        return `invert(${100 * factor}%) hue-rotate(${180 * factor}deg) saturate(${100 + 300 * factor}%)`;
      case 'sepia':
        return `sepia(${100 * factor}%) contrast(${100 + 50 * factor}%) brightness(${90 + 20 * factor}%)`;
    }

    return '';
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.handLandmarker?.close();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }
}
