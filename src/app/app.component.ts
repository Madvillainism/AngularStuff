import { Component } from '@angular/core';
import { Player } from './player.model';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  players: Player[] = [
    {
      name: ' Carlos ',
      position: ' CAM ',
    },
    {
      name: ' David ',
      position: ' GK ',
    },
  ];

  title = 'refresh';

  name = 'Carlos';

  model: string = 'Test';

  image = 'assets/lobo.png';
}
