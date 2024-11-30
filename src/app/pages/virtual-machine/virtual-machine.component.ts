import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  PoButtonModule,
  PoCheckboxModule,
  PoRadioGroupModule,
  PoTableModule,
  PoLoadingModule,
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
    PoLoadingModule,
  ],
  templateUrl: './virtual-machine.component.html',
  styleUrls: ['./virtual-machine.component.css'],
})
export class VirtualMachineComponent implements OnInit {
  constructor(private router: Router) {}
  isLoading: boolean = false;
  isExecuting = false;
  index: number = 0;
  s: number = -1;
  stepByStep: boolean = false;

  instructions: Array<{
    line: number;
    instruction: string;
    attribute1: string | null;
    attribute2: string | null;
    label?: string | null;
  }> = [];

  stack: Array<number> = [];
  currentLine: number | null = null;
  intervalId: any;
  labelMap: Record<string, number> = {};
  output: string = '';

  ngOnInit() {
    // Carrega as instruções da API e realiza o mapeamento das labels
    this.isLoading = true;
    axios.get('http://127.0.0.1:5000/get_obj').then((response) => {
      this.instructions = response.data.instructions;
      this.mapLabels(); // Mapeia as labels depois de carregar as instruções
      console.log('Instruções carregadas:', this.instructions);
      this.isLoading = false;
    });
  }

  mapLabels() {
    // Percorre as instruções e mapeia os labels (instruções `NULL` com `label` presente)
    this.instructions.forEach((inst, index) => {
      if (inst.label) {
        this.labelMap[inst.label] = index;
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
        this.output += this.stack[this.s] + '\n';
        this.s -= 1;
        break;

      case 'NULL': // Nada
        break;

      default:
        console.log(`Instrução desconhecida: ${instruction}`);
    }
    if (shouldIncrement) {
      this.index++;
    }
  }

  startExecution() {
    this.isExecuting = true;
    this.resetExecution();
    this.executeNextInstruction();
  }

  executeNextInstruction() {
    if (this.index < this.instructions.length) {
      const currentInstruction = this.instructions[this.index];

      if (currentInstruction) {
        const { instruction, attribute1, attribute2, line } =
          currentInstruction;
        this.currentLine = line;

        this.executeInstruction(instruction, attribute1, attribute2);

        if (instruction === 'HLT') {
          this.finishExecution();
          return;
        }
      }

      const delay = this.stepByStep ? 2000 : 1;
      this.intervalId = setTimeout(() => this.executeNextInstruction(), delay);
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
    this.output = '';
  }

  finishExecution() {
    clearTimeout(this.intervalId);
    this.isExecuting = false;
    this.currentLine = null;
  }

  ngOnDestroy() {
    clearTimeout(this.intervalId);
  }
  navigateHome(): void {
    this.router.navigate(['/home']);
  }
}
