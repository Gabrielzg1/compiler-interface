import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PoButtonModule,
  PoCheckboxModule,
  PoRadioGroupModule,
  PoTableModule,
} from '@po-ui/ng-components';
import axios from 'axios';

@Component({
  selector: 'app-code-execution',
  standalone: true,
  imports: [
    PoTableModule,
    PoButtonModule,
    PoRadioGroupModule,
    PoCheckboxModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './virtual-machine.component.html',
  styleUrls: ['./virtual-machine.component.css'],
})
export class VirtualMachineComponent implements OnInit {
  isExecuting = false;
  index: number = 0;
  s: number = -1;
  stepByStep: boolean = false;

  instructions: Array<{
    line: number;
    instruction: string;
    attribute1: string | null;
    attribute2: string | null;
  }> = [
    { instruction: 'START', attribute1: null, attribute2: null },
    { instruction: 'ALLOC', attribute1: '0', attribute2: '1' },
    { instruction: 'ALLOC', attribute1: '1', attribute2: '3' },
    { instruction: 'JMP', attribute1: 'L1', attribute2: null },
    { instruction: 'NULL', attribute1: 'L2', attribute2: null },
    { instruction: 'ALLOC', attribute1: '4', attribute2: '4' },
    { instruction: 'JMP', attribute1: 'L3', attribute2: null },
    { instruction: 'NULL', attribute1: 'L4', attribute2: null },
    { instruction: 'RD', attribute1: null, attribute2: null },
    { instruction: 'STR', attribute1: '4', attribute2: null },
    { instruction: 'RD', attribute1: null, attribute2: null },
    { instruction: 'STR', attribute1: '5', attribute2: null },
    { instruction: 'CALL', attribute1: 'L2', attribute2: null },
    { instruction: 'LDV', attribute1: '0', attribute2: null },
    { instruction: 'STR', attribute1: '6', attribute2: null },
    { instruction: 'LDV', attribute1: '6', attribute2: null },
    { instruction: 'PRN', attribute1: null, attribute2: null },
    { instruction: 'RETURN', attribute1: null, attribute2: null },
    { instruction: 'NULL', attribute1: 'L5', attribute2: null },
    { instruction: 'ALLOC', attribute1: '8', attribute2: '1' },
    { instruction: 'RD', attribute1: null, attribute2: null },
    { instruction: 'STR', attribute1: '8', attribute2: null },
    { instruction: 'LDV', attribute1: '8', attribute2: null },
    { instruction: 'LDC', attribute1: '10', attribute2: null },
    { instruction: 'CME', attribute1: null, attribute2: null },
    { instruction: 'JMPF', attribute1: 'L6', attribute2: null },
    { instruction: 'CALL', attribute1: 'L4', attribute2: null },
    { instruction: 'NULL', attribute1: 'L6', attribute2: null },
    { instruction: 'DALLOC', attribute1: '8', attribute2: '1' },
    { instruction: 'RETURN', attribute1: null, attribute2: null },
    { instruction: 'NULL', attribute1: 'L3', attribute2: null },
    { instruction: 'CALL', attribute1: 'L5', attribute2: null },
    { instruction: 'LDV', attribute1: '4', attribute2: null },
    { instruction: 'LDV', attribute1: '5', attribute2: null },
    { instruction: 'ADD', attribute1: null, attribute2: null },
    { instruction: 'STR', attribute1: '0', attribute2: null },
    { instruction: 'DALLOC', attribute1: '4', attribute2: '4' },
    { instruction: 'RETURN', attribute1: null, attribute2: null },
    { instruction: 'NULL', attribute1: 'L1', attribute2: null },
    { instruction: 'CALL', attribute1: 'L2', attribute2: null },
    { instruction: 'LDV', attribute1: '0', attribute2: null },
    { instruction: 'STR', attribute1: '3', attribute2: null },
    { instruction: 'LDV', attribute1: '3', attribute2: null },
    { instruction: 'PRN', attribute1: null, attribute2: null },
    { instruction: 'DALLOC', attribute1: '1', attribute2: '3' },
    { instruction: 'DALLOC', attribute1: '0', attribute2: '1' },
    { instruction: 'HLT', attribute1: null, attribute2: null },
  ].map((instruction, index) => ({ line: index, ...instruction }));

  stack: Array<number> = [];

  currentLine: number | null = null;
  intervalId: any;

  labelMap: Record<string, number> = {};

  ngOnInit() {
    this.mapLabels(); // Chama o mapeamento ao inicializar o componente
    /*axios.get('http://127.0.0.1:5000/get_obj').then((response) => {
      console.log(response.data);
    }); */
  }

  mapLabels() {
    this.instructions.forEach((inst, index) => {
      if (inst.instruction == 'NULL' && inst.attribute1) {
        this.labelMap[inst.attribute1] = index;
      }
    });

    console.log('Label Map:', this.labelMap);
  }

  executeInstruction(
    instruction: string,
    param1: string | null,
    param2: string | null
  ) {
    let shouldIncrement = true; // Flag para controle do incremento
    switch (instruction) {
      case 'START':
        console.log('Início do programa');
        this.s = -1;
        this.isExecuting = true;
        break;

      case 'HLT':
        console.log('Fim do programa');
        this.isExecuting = false;
        clearTimeout(this.intervalId);
        return;

      case 'LDC': // Carregar constante
        this.s += 1;
        this.stack[this.s] = parseInt(param1 || '0', 10);
        break;

      case 'LDV': // Carregar valor
        const n = parseInt(param1 || '0', 10);
        this.s += 1;
        this.stack[this.s] = this.stack[n];
        break;

      case 'STR': // Armazenar valor
        const storeIndex = parseInt(param1 || '0', 10);
        this.stack[storeIndex] = this.stack[this.s];
        this.s -= 1;
        break;

      case 'ADD': // Somar
        this.stack[this.s - 1] += this.stack[this.s];
        this.s -= 1;
        break;

      case 'SUB': // Subtrair
        this.stack[this.s - 1] -= this.stack[this.s];
        this.s -= 1;
        break;

      case 'MULT': // Multiplicar
        this.stack[this.s - 1] *= this.stack[this.s];
        this.s -= 1;
        break;

      case 'DIVI': // Dividir
        // Evita divisão por zero
        this.stack[this.s - 1] = Math.floor(
          this.stack[this.s - 1] / this.stack[this.s]
        );
        this.s -= 1;

        break;

      case 'INV': // Inverter sinal
        this.stack[this.s] = -this.stack[this.s];
        break;

      case 'AND': // Conjunção
        this.stack[this.s - 1] =
          this.stack[this.s - 1] === 1 && this.stack[this.s] === 1 ? 1 : 0;
        this.s -= 1;
        break;

      case 'OR': // Disjunção
        this.stack[this.s - 1] =
          this.stack[this.s - 1] === 1 || this.stack[this.s] === 1 ? 1 : 0;
        this.s -= 1;
        break;

      case 'NEG': // Negação
        this.stack[this.s] = 1 - this.stack[this.s];
        break;

      case 'CME': // Comparar menor
        this.stack[this.s - 1] =
          this.stack[this.s - 1] < this.stack[this.s] ? 1 : 0;
        this.s -= 1;
        break;

      case 'CMA': // Comparar maior
        this.stack[this.s - 1] =
          this.stack[this.s - 1] > this.stack[this.s] ? 1 : 0;
        this.s -= 1;
        break;

      case 'CEQ': // Comparar igual
        this.stack[this.s - 1] =
          this.stack[this.s - 1] === this.stack[this.s] ? 1 : 0;
        this.s -= 1;
        break;

      case 'CDIF': // Comparar desigual
        this.stack[this.s - 1] =
          this.stack[this.s - 1] !== this.stack[this.s] ? 1 : 0;
        this.s -= 1;
        break;

      case 'CMEQ': // Comparar menor ou igual
        this.stack[this.s - 1] =
          this.stack[this.s - 1] <= this.stack[this.s] ? 1 : 0;
        this.s -= 1;
        break;

      case 'CMAQ': // Comparar maior ou igual
        this.stack[this.s - 1] =
          this.stack[this.s - 1] >= this.stack[this.s] ? 1 : 0;
        this.s -= 1;
        break;

      case 'ALLOC': // Alocar memória
        const mAlloc = parseInt(param1 || '0', 10);
        const nAlloc = parseInt(param2 || '0', 10);
        for (let k = 0; k < nAlloc; k++) {
          this.s += 1;
          this.stack[this.s] = this.stack[mAlloc + k] || 0;
        }
        break;

      case 'DALLOC': // Desalocar memória
        const mDalloc = parseInt(param1 || '0', 10);
        const nDalloc = parseInt(param2 || '0', 10);
        for (let k = nDalloc - 1; k >= 0; k--) {
          this.stack[mDalloc + k] = this.stack[this.s];
          this.s -= 1;
        }
        break;

      case 'CALL':
        this.s += 1;
        this.stack[this.s] = this.index + 1;
        this.index = this.labelMap[param1 || ''];
        shouldIncrement = false;
        break;

      case 'RETURN':
        this.index = this.stack[this.s];
        this.s -= 1;
        shouldIncrement = false;
        break;

      case 'JMP':
        this.index = this.labelMap[param1 || ''];
        shouldIncrement = false;
        break;

      case 'JMPF':
        if (this.stack[this.s] === 0) {
          this.index = this.labelMap[param1 || ''];
          shouldIncrement = false;
        }
        this.s -= 1;
        break;

      case 'RD': // Leitura
        this.s += 1;
        const inputValue = parseInt(
          prompt('Digite o próximo valor de entrada:') || '0',
          10
        );
        this.stack[this.s] = inputValue;
        break;

      case 'PRN': // Impressão
        console.log('Imprimindo valor:', this.stack[this.s]);
        this.s -= 1;
        break;

      case 'NULL': // Nada
        break;

      default:
        console.log(`Instrução desconhecida: ${instruction}`);
    }
    // Incrementa o índice se não houver desvio
    if (shouldIncrement) {
      this.index++;
    }
  }

  // Método de execução usando `setTimeout` para evitar congestionamento com `setInterval`
  startExecution() {
    this.isExecuting = true;
    this.resetExecution();
    this.executeNextInstruction();
  }

  executeNextInstruction() {
    // Verifica se o índice atual está dentro do limite do array de instruções
    if (this.index < this.instructions.length) {
      const currentInstruction = this.instructions[this.index];

      if (currentInstruction) {
        const { instruction, attribute1, attribute2, line } =
          currentInstruction;
        this.currentLine = line;

        // Executa a instrução
        this.executeInstruction(instruction, attribute1, attribute2);

        // Verifica se a instrução atual é 'HLT' para parar imediatamente
        if (instruction === 'HLT') {
          this.finishExecution();
          return;
        }
      }

      // Define o tempo de execução com base no modo step-by-step
      const delay = this.stepByStep ? 1000 : 1;
      this.intervalId = setTimeout(() => this.executeNextInstruction(), delay);
    } else {
      this.finishExecution(); // Finaliza a execução caso todas instruções tenham sido processadas
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
