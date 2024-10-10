import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PoCodeEditorModule } from '@po-ui/ng-code-editor'; 
import { PoButtonModule } from '@po-ui/ng-components';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    PoCodeEditorModule,  
    PoButtonModule,
    FormsModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  editorContent: string = ''; 
  outputContent: string = '';

  onClick() {
    this.outputContent = this.editorContent;
  }

  onEditorChange(event: any) {
    this.editorContent = event; 
  }

}
