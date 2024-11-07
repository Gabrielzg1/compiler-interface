import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PoCodeEditorModule } from '@po-ui/ng-code-editor';
import { PoButtonModule, PoPageModule } from '@po-ui/ng-components';
import axios from 'axios';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PoCodeEditorModule, PoButtonModule, FormsModule, PoPageModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  editorContent: string = '';
  outputContent: string = '';
  vmDisabled: boolean = true;
  constructor(private router: Router) {} // Injeção do Router para navegação

  // Método que envia o código para a API e atualiza a saída
  onClick() {
    // Enviar uma requisição POST para a API Flask
    console.log('Enviando código para a API:', this.editorContent);
    console.log('Enviando código para a API:', this.editorContent);

    axios
      .post('http://127.0.0.1:5000/compile', {
        code: this.editorContent.toString(), // O conteúdo do editor é enviado
      })
      .then((response) => {
        // Manipular a resposta de sucesso
        console.log(response.data);

        // Separar o número da linha e a mensagem de erro
        const output = response.data.output;
        const outputParts = output.split('\n'); // Dividir o conteúdo por '\n'

        if (outputParts.length >= 2) {
          const errorLine = outputParts[0]; // Primeira parte é a linha do erro
          const errorMessage = outputParts.slice(1).join('\n'); // Resto é a mensagem do erro

          console.log('Linha do erro:', errorLine);
          console.log('Mensagem do erro:', errorMessage);

          // Exemplo de uso com o conteúdo separado
          this.outputContent = `Mensagem: ${errorMessage}`;
        } else {
          // Caso o formato da mensagem não corresponda ao esperado
          this.outputContent = output;
        }
      })
      .catch((error) => {
        // Manipular erros
        console.error('Erro ao enviar o código para a API:', error);
        this.outputContent = 'Erro ao enviar o código para a API.';
      });
  }
  toVm() {
    this.router.navigate(['/vm']);
  }

  // Método que atualiza o conteúdo do editor
  onEditorChange(event: any) {
    this.editorContent = event;
  }
}
