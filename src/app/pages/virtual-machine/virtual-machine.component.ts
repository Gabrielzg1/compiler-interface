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
    { instruction: 'START', attribute1: null, attribute2: null }, // Início do programa

    // Aloca espaço para variáveis a, b e o resultado
    { instruction: 'ALLOC', attribute1: '0', attribute2: '4' }, // Aloca três posições para a, b e resultado

    // Outras instruções podem ser adicionadas aqui...

    { instruction: 'DALLOC', attribute1: '0', attribute2: '3' },
    { instruction: 'HLT', attribute1: null, attribute2: null },
  ].map((instruction, index) => ({ line: index + 1, ...instruction }));

  stack: Array<number> = [];

  currentLine: number | null = null;
  intervalId: any;

  labelMap: Record<string, number> = {};

  ngOnInit() {
    this.mapLabels(); // Chama o mapeamento ao inicializar o componente
    axios.get('http://127.0.0.1:5000/get_obj').then((response) => {
      console.log(response.data);
    });
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
        if (this.stack[this.s] !== 0) {
          // Evita divisão por zero
          this.stack[this.s - 1] = Math.floor(
            this.stack[this.s - 1] / this.stack[this.s]
          );
          this.s -= 1;
        } else {
          console.error('Erro: Divisão por zero.');
        }
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

      case 'CALL': // Chamar procedimento ou função
        this.s += 1;
        this.stack[this.s] = this.index + 1;
        const targetCALL = this.labelMap[param1 || ''];
        if (targetCALL !== undefined) {
          this.index = targetCALL - 1; // Ajusta o índice para a instrução de destino
        } else {
          console.error(`Rótulo não encontrado: ${param1}`);
        }
        break;

      case 'RETURN': // Retornar de procedimento ou função
        this.index = this.stack[this.s];
        this.s -= 1;
        break;

      case 'JMP': // Desviar sempre
        const targetJMP = this.labelMap[param1 || ''];
        if (targetJMP !== undefined) {
          this.index = targetJMP - 1; // Ajusta o índice para a instrução de destino
        } else {
          console.error(`Rótulo não encontrado: ${param1}`);
        }
        break;

      case 'JMPF': // Desviar se falso
        const targetJMPF = this.labelMap[param1 || ''];
        if (this.stack[this.s] === 0) {
          if (targetJMPF !== undefined) {
            this.index = targetJMPF - 1; // Ajusta o índice para a instrução de destino
          } else {
            console.error(`Rótulo não encontrado: ${param1}`);
          }
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
        this.executeInstruction(instruction, attribute1, attribute2);
      }

      // Avança o índice para a próxima instrução
      this.index++;

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
