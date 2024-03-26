import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
})
export class CountdownComponent implements OnInit, OnDestroy {
  countdownDate!: Date;
  countdownInterval: any;
  countdown: string = '';

  ngOnInit(): void {
    this.countdownDate = new Date('2023-10-26');

    this.countdownInterval = setInterval(() => {
      const currentTime = new Date().getTime();
      const distance = this.countdownDate.getTime() - currentTime;

      // Calculate days, hours, minutes, and seconds
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Format the countdown string
      this.countdown = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      // Check if the countdown has reached zero
      if (distance < 0) {
        clearInterval(this.countdownInterval);
        this.countdown = 'Countdown expired!';
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownInterval);
  }
}
