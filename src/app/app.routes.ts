import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { VirtualMachineComponent } from './pages/virtual-machine/virtual-machine.component';
import { MainComponent } from './pages/main/main.component';

export const routes: Routes = [
    { path: "", component: MainComponent },
    { path: "home", component: HomeComponent },
    { path: "vm", component: VirtualMachineComponent },
    { path: "**", redirectTo: "", pathMatch: "full" } // Redireciona para a rota principal se não encontrar o caminho
];
