import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PoTableColumn, PoButtonModule, PoRadioGroupModule, PoTableModule } from '@po-ui/ng-components';

@Component({
  selector: 'app-code-execution',
  standalone: true,
  imports: [PoTableModule, PoButtonModule, PoRadioGroupModule, FormsModule ,CommonModule],
  templateUrl: './virtual-machine.component.html',
  styleUrls: ['./virtual-machine.component.css']
})
export class VirtualMachineComponent {
  isExecuting = false;
  index: number = 0;
  s: number = -1; // Representa o topo da pilha
  instructions: Array<{ line: number, instruction: string, attribute1: string | null, attribute2: string | null }> = [
    { instruction: "LDC", attribute1: "10", attribute2: null },
    { instruction: "LDC", attribute1: "20", attribute2: null },
    { instruction: "ADD", attribute1: null, attribute2: null },
    { instruction: "LDC", attribute1: "30", attribute2: null },
    { instruction: "MULT", attribute1: null, attribute2: null },
    // Outras instruções conforme necessário
  ].map((instruction, index) => ({ line: index + 1, ...instruction }));

  stack: Array<{ address: number, value: number }> = [];

  currentLine: number | null = null;
  intervalId: any;

  // Executa a instrução atual
  executeInstruction(instruction: string, param1: string | null, param2: string | null) {
    switch (instruction) {
      case 'LDC': // Carregar constante
        this.s += 1;
        this.stack.push({ address: this.s, value: parseInt(param1 || "0", 10) });
        break;

      case 'LDV': // Carregar valor da posição `n`
        this.s += 1;
        const address = parseInt(param1 || "0", 10);
        const value = this.stack.find(item => item.address === address)?.value || 0;
        this.stack.push({ address: this.s, value });
        break;

      case 'ADD': // Somar
        if (this.s > 0) {
          const a = this.stack.pop()?.value || 0;
          const b = this.stack[this.s - 1].value;
          this.stack[this.s - 1].value = a + b;
          this.s -= 1;
        }
        break;

      case 'MULT': // Multiplicar
        if (this.s > 0) {
          const a = this.stack.pop()?.value || 0;
          const b = this.stack[this.s - 1].value;
          this.stack[this.s - 1].value = a * b;
          this.s -= 1;
        }
        break;

      // Outras instruções seguem a mesma lógica

      default:
        console.log(`Instrução desconhecida: ${instruction}`);
    }
  }

  // Executa todas as instruções sequencialmente com intervalo
  startExecution() {
    this.isExecuting = true;
    this.resetExecution(); // Limpa os valores antes de iniciar uma nova execução
    this.intervalId = setInterval(() => {
      if (this.index < this.instructions.length) {
        const { instruction, attribute1, attribute2 } = this.instructions[this.index];
        this.executeInstruction(instruction, attribute1, attribute2);
        this.currentLine = this.instructions[this.index].line;
        this.index++;
      } else {
        this.finishExecution();
      }
    }, 1000); // Intervalo de 1 segundo, ajuste conforme necessário
  }

  // Método para parar a execução e limpar valores temporários
  stopExecution() {
    this.isExecuting = false;
    clearInterval(this.intervalId);
    this.currentLine = null;
  }

  // Limpa valores e variáveis para uma nova execução
  resetExecution() {
    clearInterval(this.intervalId);
    this.index = 0;
    this.s = -1;
    this.stack = [];
    this.currentLine = null;
  }

  // Finaliza a execução e redefine variáveis ao final da execução completa
  finishExecution() {
    clearInterval(this.intervalId);
    this.isExecuting = false;
    this.currentLine = null;
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  // Método para empilhar um valor manualmente (opcional)
  pushStack(value: number) {
    this.s += 1;
    this.stack.push({ address: this.s, value });
  }

  // Método para desempilhar um valor manualmente (opcional)
  popStack() {
    if (this.stack.length > 0) {
      this.stack.pop();
      this.s -= 1;
    }
  }
}
