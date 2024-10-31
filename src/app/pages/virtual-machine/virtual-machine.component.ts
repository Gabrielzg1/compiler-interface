import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PoButtonModule, PoCheckboxModule, PoRadioGroupModule, PoTableModule } from '@po-ui/ng-components';

@Component({
  selector: 'app-code-execution',
  standalone: true,
  imports: [PoTableModule, PoButtonModule, PoRadioGroupModule, PoCheckboxModule, FormsModule ,CommonModule],
  templateUrl: './virtual-machine.component.html',
  styleUrls: ['./virtual-machine.component.css']
})
export class VirtualMachineComponent {
  isExecuting = false;
  index: number = 0;
  s: number = -1; // Representa o topo da pilha
  stepByStep: boolean = false; // Variável controlada pelo checkbox

  instructions: Array<{ line: number, instruction: string, attribute1: string | null, attribute2: string | null }> = [
    { instruction: "LDC", attribute1: "100", attribute2: null }, // Carrega 10 na pilha
    { instruction: "LDC", attribute1: "20", attribute2: null }, // Carrega 20 na pilha
    { instruction: "LDC", attribute1: "11", attribute2: null }, // Carrega 10 na pilha
    { instruction: "LDC", attribute1: "12", attribute2: null }, // Carrega 10 na pilha
    { instruction: "LDC", attribute1: "13", attribute2: null }, // Carrega 10 na pilha
    { instruction: "LDC", attribute1: "14", attribute2: null }, // Carrega 10 na pilha
    { instruction: "STR", attribute1: "0", attribute2: null }, // Carrega 10 na pilha
    
    
].map((instruction, index) => ({ line: index + 1, ...instruction }));


  stack: Array<{ address: number, value: number }> = [];

  currentLine: number | null = null;
  intervalId: any;

  // Executa a instrução atual
  executeInstruction(instruction: string, param1: string | null, param2: string | null) {
    switch (instruction) {
      case 'LDC': // Carregar constante
        this.s += 1;
        this.stack[this.s] = { address: this.s, value: parseInt(param1 || "0", 10) };
        break;

      case 'LDV': // Carregar valor
        this.s += 1;
        const n = parseInt(param1 || "0", 10);
        this.stack[this.s] = { address: this.s, value: this.stack[n]?.value || 0 };
        break;

      case 'ADD': // Somar
        if (this.s > 0) {
          this.stack[this.s - 1].value += this.stack[this.s].value;
          this.s -= 1; // Reduz o ponteiro de topo sem remover o valor
        }
        break;

      case 'SUB': // Subtrair
        if (this.s > 0) {
          this.stack[this.s - 1].value -= this.stack[this.s].value;
          this.s -= 1;
        }
        break;

      case 'MULT': // Multiplicar
        if (this.s > 0) {
          this.stack[this.s - 1].value *= this.stack[this.s].value;
          this.s -= 1;
        }
        break;

      case 'DIVI': // Dividir
        if (this.s > 0) {
          this.stack[this.s - 1].value = Math.floor(this.stack[this.s - 1].value / this.stack[this.s].value);
          this.s -= 1;
        }
        break;

      case 'INV': // Inverter sinal
        this.stack[this.s].value = -this.stack[this.s].value;
        break;

      case 'AND': // Conjunção
        if (this.s > 0) {
          this.stack[this.s - 1].value = (this.stack[this.s - 1].value === 1 && this.stack[this.s].value === 1) ? 1 : 0;
          this.s -= 1;
        }
        break;

      case 'OR': // Disjunção
        if (this.s > 0) {
          this.stack[this.s - 1].value = (this.stack[this.s - 1].value === 1 || this.stack[this.s].value === 1) ? 1 : 0;
          this.s -= 1;
        }
        break;

      case 'NEG': // Negação
        this.stack[this.s].value = 1 - this.stack[this.s].value;
        break;

      case 'CME': // Comparar menor
        if (this.s > 0) {
          this.stack[this.s - 1].value = (this.stack[this.s - 1].value < this.stack[this.s].value) ? 1 : 0;
          this.s -= 1;
        }
        break;

      case 'CMA': // Comparar maior
        if (this.s > 0) {
          this.stack[this.s - 1].value = (this.stack[this.s - 1].value > this.stack[this.s].value) ? 1 : 0;
          this.s -= 1;
        }
        break;

      case 'CEQ': // Comparar igual
        if (this.s > 0) {
          this.stack[this.s - 1].value = (this.stack[this.s - 1].value === this.stack[this.s].value) ? 1 : 0;
          this.s -= 1;
        }
        break;

      case 'CDIF': // Comparar desigual
        if (this.s > 0) {
          this.stack[this.s - 1].value = (this.stack[this.s - 1].value !== this.stack[this.s].value) ? 1 : 0;
          this.s -= 1;
        }
        break;

      case 'CMEQ': // Comparar menor ou igual
        if (this.s > 0) {
          this.stack[this.s - 1].value = (this.stack[this.s - 1].value <= this.stack[this.s].value) ? 1 : 0;
          this.s -= 1;
        }
        break;

      case 'CMAQ': // Comparar maior ou igual
        if (this.s > 0) {
          this.stack[this.s - 1].value = (this.stack[this.s - 1].value >= this.stack[this.s].value) ? 1 : 0;
          this.s -= 1;
        }
        break;

      case 'STR': // Armazenar valor
        const storeIndex = parseInt(param1 || "0", 10);
        this.stack[storeIndex].value = this.stack[this.s].value;
        this.s -= 1;
        break;

      default:
        console.log(`Instrução desconhecida: ${instruction}`);
    }
  }


  // Método de execução usando `setTimeout` para evitar congestionamento com `setInterval`
  startExecution() {
    this.isExecuting = true;
    this.resetExecution();
    this.executeNextInstruction();
  }

  executeNextInstruction() {
    if (this.index < this.instructions.length) {
      const { instruction, attribute1, attribute2 } = this.instructions[this.index];
      this.executeInstruction(instruction, attribute1, attribute2);
      this.currentLine = this.instructions[this.index].line;
      this.index++;
      
      const time = this.stepByStep ? 1000 : 10;
      
      this.intervalId = setTimeout(() => this.executeNextInstruction(), time);
    } else {
      this.finishExecution();
    }
  }

  stopExecution() {
    this.isExecuting = false;
    clearTimeout(this.intervalId);
    this.currentLine = null;
  }

  resetExecution() {
    clearTimeout(this.intervalId);
    this.index = 0;
    this.s = -1;
    this.stack = [];
    this.currentLine = null;
  }

  finishExecution() {
    clearTimeout(this.intervalId);
    this.isExecuting = false;
    this.currentLine = null;
  }

  ngOnDestroy() {
    clearTimeout(this.intervalId);
  }
}
