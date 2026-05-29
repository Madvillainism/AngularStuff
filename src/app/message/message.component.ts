import { Component, Input } from '@angular/core';
import { Player } from '../player.model';

@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.scss'],
    standalone: false
})
export class MessageComponent {
  @Input() message!: Player;
  @Input() index!: number;
}
