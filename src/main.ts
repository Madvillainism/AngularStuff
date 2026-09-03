import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { FingerFilterComponent } from './finger-filter/finger-filter.component';

bootstrapApplication(FingerFilterComponent, appConfig).catch((err) =>
  console.error(err),
);
