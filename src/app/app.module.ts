import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { CountdownComponent } from './countdown/countdown.component';
import { TimerComponent } from './timer/timer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MessageComponent } from './message/message.component';
import { LoginComponent } from './login/login.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Routes, RouterModule, RouterOutlet } from '@angular/router';
import { ShopCartComponent } from './shop-cart/shop-cart.component';
import { ProductListComponent } from './product-list/product-list.component';

const appRoutes: Routes = [
  { path: '', component: AppComponent },
  {
    path: 'form',
    component: TimerComponent,
  },
  {
    path: 'countdown',
    component: CountdownComponent,
  },
  {
    path: 'message',
    component: MessageComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'shop-cart',
    component: ShopCartComponent,
  },
];

@NgModule({
  declarations: [
    AppComponent,
    CountdownComponent,
    TimerComponent,
    MessageComponent,
    LoginComponent,
    ShopCartComponent,
    ProductListComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forRoot(appRoutes),
    RouterOutlet,
  ],
})
export class AppModule {}
