import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PoCodeEditorModule } from '@po-ui/ng-code-editor'; 
import { PoButtonModule } from '@po-ui/ng-components';
import axios from 'axios';

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

  // Método que envia o código para a API e atualiza a saída
  onClick() {
    // Enviar uma requisição POST para a API Flask
    console.log('Enviando código para a API:', this.editorContent);
    axios.post('http://127.0.0.1:5000/compile', { 
      code: this.editorContent.toString() // O conteúdo do editor é enviado
    })
    .then(response => {
      // Manipular a resposta de sucesso
      if(response.data.errorLine !== null) {
      this.outputContent = `Linha de erro: ${response.data.errorLine}\n${response.data.message}`;
      }
      else {
        this.outputContent = `${response.data.message}`;
      }
    })
    .catch(error => {
      // Manipular erros
      console.error('Erro ao enviar o código para a API:', error);
      this.outputContent = 'Erro ao enviar o código para a API.';
    });
  }

  // Método que atualiza o conteúdo do editor
  onEditorChange(event: any) {
    this.editorContent = event; 
  }
}
