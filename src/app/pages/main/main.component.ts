import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PoButtonModule, PoPageModule } from '@po-ui/ng-components';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [PoButtonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {
  constructor(private router: Router) {}
  goToHome() {
    this.router.navigate(['/home']);
  }
}
