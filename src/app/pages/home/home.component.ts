import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PoCodeEditorModule } from '@po-ui/ng-code-editor';
import { PoButtonModule, PoPageModule } from '@po-ui/ng-components';
import { PoLoadingModule } from '@po-ui/ng-components';
import axios from 'axios';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    PoCodeEditorModule,
    PoButtonModule,
    FormsModule,
    PoPageModule,
    PoLoadingModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  editorContent: string = '';
  outputContent: string = '';
  vmDisabled: boolean = true;
  isLoading: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Recuperar o conteúdo salvo do editor ao carregar o componente
    this.editorContent = localStorage.getItem('savedEditorContent') || '';
  }

  // Método que envia o código para a API e atualiza a saída
  onClick() {
    this.isLoading = true;
    axios
      .post('http://127.0.0.1:5000/compile', {
        code: this.editorContent.toString(),
      })
      .then((response) => {
        const output = response.data.output;
        const outputParts = output.split('\n');

        if (outputParts.length >= 2) {
          const errorMessage = outputParts.slice(1).join('\n');
          this.outputContent = `Mensagem: ${errorMessage}`;
        } else {
          this.outputContent = output;
          if (output === 'Compilado com sucesso!') {
            this.vmDisabled = false;
          }
        }
        this.isLoading = false;
      })
      .catch((error) => {
        this.isLoading = false;
        console.error('Erro ao enviar o código para a API:', error);
        this.outputContent = 'Erro ao enviar o código para a API.';
      });
  }

  toVm() {
    // Salvar o conteúdo do editor no localStorage antes de navegar
    localStorage.setItem('savedEditorContent', this.editorContent);
    this.router.navigate(['/vm']);
  }

  // Método que atualiza o conteúdo do editor e salva no localStorage
  onEditorChange(event: any) {
    this.editorContent = event;
    localStorage.setItem('savedEditorContent', this.editorContent);
  }

  fileContent: string = '';

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editorContent = e.target.result; // Armazena o conteúdo do arquivo na variável
      };
      reader.readAsText(file); // Lê o conteúdo do arquivo como texto
    }
  }
}
