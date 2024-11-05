import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PoButtonModule, PoCheckboxModule, PoRadioGroupModule, PoTableModule } from '@po-ui/ng-components';
import axios from 'axios';


@Component({
  selector: 'app-code-execution',
  standalone: true,
  imports: [PoTableModule, PoButtonModule, PoRadioGroupModule, PoCheckboxModule, FormsModule ,CommonModule],
  templateUrl: './virtual-machine.component.html',
  styleUrls: ['./virtual-machine.component.css']
})
export class VirtualMachineComponent  implements OnInit{
  isExecuting = false;
  index: number = 0;
  s: number = 0; 
  stepByStep: boolean = false; 

  instructions: Array<{ line: number, instruction: string, attribute1: string | null, attribute2: string | null }> = [
    { instruction: "START", attribute1: null, attribute2: null },                       // Início do programa
  
    // Aloca espaço para variáveis a, b e o resultado
    { instruction: "ALLOC", attribute1: "0", attribute2: "3" },  // Aloca três posições para a, b e resultado
    {instruction: "DALLOC", attribute1: "0", attribute2: "3"}
  
  ].map((instruction, index) => ({ line: index + 1, ...instruction }));
  
  
  
  stack: Array<{ address: number, value: number }> = [];

  currentLine: number | null = null;
  intervalId: any;

  labelMap: Record<string, number> = {};

  ngOnInit() {
    this.mapLabels(); // Chama o mapeamento ao inicializar o componente
    axios.get('http://127.0.0.1:5000/get_obj')
    .then(response => {
      console.log(response.data);
    })
  }
  
mapLabels() {
    this.instructions.forEach((inst, index) => {
        if (inst.instruction == "NULL" && inst.attribute1) {
            this.labelMap[inst.attribute1] = index ;
        }
    });

    console.log("Label Map:", this.labelMap);
}

  executeInstruction(instruction: string, param1: string | null, param2: string | null) {
    switch (instruction) {
      case 'START': 
        console.log("Início do programa");
        this.s = -1;
        this.isExecuting = true;
        break;
  
      case 'HLT':
        console.log("Fim do programa");
        this.isExecuting = false;
        clearTimeout(this.intervalId);
        return;
  
      case 'LDC': // Carregar constante
        this.s += 1;
        this.stack[this.s] = { address: this.s, value: parseInt(param1 || "0", 10) };
        break;
  
      case 'LDV': // Carregar valor
        const n = parseInt(param1 || "0", 10);
        if (this.stack[n] !== undefined) {
          this.s += 1;
          this.stack[this.s] = { address: this.s, value: this.stack[n].value };
        } else {
          console.warn(`Tentativa de acesso a posição não inicializada na pilha: ${n}`);
        }
        break;
  
      case 'STR': // Armazenar valor
        const storeIndex = parseInt(param1 || "0", 10);
        if (this.stack[this.s] !== undefined) {
          this.stack[storeIndex] = { address: storeIndex, value: this.stack[this.s].value };
          this.s -= 1;
        } else {
          console.warn(`Tentativa de armazenar valor de posição não inicializada: ${this.s}`);
        }
        break;
  
      case 'ADD': // Somar
        if (this.s > 0 && this.stack[this.s] !== undefined && this.stack[this.s - 1] !== undefined) {
          this.stack[this.s - 1].value += this.stack[this.s].value;
          this.s -= 1;
        } else {
          console.warn("Operação de soma não pôde ser executada por falta de valores na pilha.");
        }
        break;
  
      case 'SUB': // Subtrair
        if (this.s > 0 && this.stack[this.s] !== undefined && this.stack[this.s - 1] !== undefined) {
          this.stack[this.s - 1].value -= this.stack[this.s].value;
          this.s -= 1;
        } else {
          console.warn("Operação de subtração não pôde ser executada por falta de valores na pilha.");
        }
        break;
  
      case 'MULT': // Multiplicar
        if (this.s > 0 && this.stack[this.s] !== undefined && this.stack[this.s - 1] !== undefined) {
          this.stack[this.s - 1].value *= this.stack[this.s].value;
          this.s -= 1;
        } else {
          console.warn("Operação de multiplicação não pôde ser executada por falta de valores na pilha.");
        }
        break;
  
      case 'DIVI': // Dividir
        if (this.s > 0 && this.stack[this.s] !== undefined && this.stack[this.s - 1] !== undefined) {
          if (this.stack[this.s].value !== 0) { // Evita divisão por zero
            this.stack[this.s - 1].value = Math.floor(this.stack[this.s - 1].value / this.stack[this.s].value);
            this.s -= 1;
          } else {
            console.error("Erro: Divisão por zero.");
          }
        } else {
          console.warn("Operação de divisão não pôde ser executada por falta de valores na pilha.");
        }
        break;
  
      case 'INV': // Inverter sinal
        if (this.stack[this.s] !== undefined) {
          this.stack[this.s].value = -this.stack[this.s].value;
        } else {
          console.warn("Tentativa de inverter sinal de posição não inicializada na pilha.");
        }
        break;
  
      case 'AND': // Conjunção
        if (this.s > 0 && this.stack[this.s] !== undefined && this.stack[this.s - 1] !== undefined) {
          this.stack[this.s - 1].value = (this.stack[this.s - 1].value === 1 && this.stack[this.s].value === 1) ? 1 : 0;
          this.s -= 1;
        } else {
          console.warn("Operação AND não pôde ser executada por falta de valores na pilha.");
        }
        break;
  
      case 'OR': // Disjunção
        if (this.s > 0 && this.stack[this.s] !== undefined && this.stack[this.s - 1] !== undefined) {
          this.stack[this.s - 1].value = (this.stack[this.s - 1].value === 1 || this.stack[this.s].value === 1) ? 1 : 0;
          this.s -= 1;
        } else {
          console.warn("Operação OR não pôde ser executada por falta de valores na pilha.");
        }
        break;
  
      case 'NEG': // Negação
        if (this.stack[this.s] !== undefined) {
          this.stack[this.s].value = 1 - this.stack[this.s].value;
        } else {
          console.warn("Tentativa de realizar NEG em posição não inicializada na pilha.");
        }
        break;
  
      case 'CME': // Comparar menor
        if (this.s > 0 && this.stack[this.s] !== undefined && this.stack[this.s - 1] !== undefined) {
          this.stack[this.s - 1].value = (this.stack[this.s - 1].value < this.stack[this.s].value) ? 1 : 0;
          this.s -= 1;
        } else {
          console.warn("Operação CME não pôde ser executada por falta de valores na pilha.");
        }
        break;
  
      case 'CMA': // Comparar maior
        if (this.s > 0 && this.stack[this.s] !== undefined && this.stack[this.s - 1] !== undefined) {
          this.stack[this.s - 1].value = (this.stack[this.s - 1].value > this.stack[this.s].value) ? 1 : 0;
          this.s -= 1;
        } else {
          console.warn("Operação CMA não pôde ser executada por falta de valores na pilha.");
        }
        break;
  
      case 'CEQ': // Comparar igual
        if (this.s > 0 && this.stack[this.s] !== undefined && this.stack[this.s - 1] !== undefined) {
          this.stack[this.s - 1].value = (this.stack[this.s - 1].value === this.stack[this.s].value) ? 1 : 0;
          this.s -= 1;
        } else {
          console.warn("Operação CEQ não pôde ser executada por falta de valores na pilha.");
        }
        break;
  
      case 'CDIF': // Comparar desigual
        if (this.s > 0 && this.stack[this.s] !== undefined && this.stack[this.s - 1] !== undefined) {
          this.stack[this.s - 1].value = (this.stack[this.s - 1].value !== this.stack[this.s].value) ? 1 : 0;
          this.s -= 1;
        } else {
          console.warn("Operação CDIF não pôde ser executada por falta de valores na pilha.");
        }
        break;
  
      case 'CMEQ': // Comparar menor ou igual
        if (this.s > 0 && this.stack[this.s] !== undefined && this.stack[this.s - 1] !== undefined) {
          this.stack[this.s - 1].value = (this.stack[this.s - 1].value <= this.stack[this.s].value) ? 1 : 0;
          this.s -= 1;
        } else {
          console.warn("Operação CMEQ não pôde ser executada por falta de valores na pilha.");
        }
        break;
  
      case 'CMAQ': // Comparar maior ou igual
        if (this.s > 0 && this.stack[this.s] !== undefined && this.stack[this.s - 1] !== undefined) {
          this.stack[this.s - 1].value = (this.stack[this.s - 1].value >= this.stack[this.s].value) ? 1 : 0;
          this.s -= 1;
        } else {
          console.warn("Operação CMAQ não pôde ser executada por falta de valores na pilha.");
        }
        break;
  
      case 'ALLOC': // Alocar memória
        const mAlloc = parseInt(param1 || "0", 10);
        const nAlloc = parseInt(param2 || "0", 10);
        for (let k = 0; k < nAlloc; k++) {
          this.s += 1;
          // Inicializa o valor na posição da pilha se não existir
          this.stack[this.s] = { address: this.s, value: this.stack[mAlloc + k]?.value || 0 };
        }
        break;
  
      case 'DALLOC': // Desalocar memória
        const mDalloc = parseInt(param1 || "0", 10);
        const nDalloc = parseInt(param2 || "0", 10);
        for (let k = nDalloc - 1; k >= 0; k--) {
          if (this.stack[this.s] !== undefined) {
            this.stack[mDalloc + k].value = this.stack[this.s].value;
            this.s -= 1;
          } else {
            console.warn(`Tentativa de desalocar posição não inicializada: ${this.s}`);
          }
        }
        break;
  
      case 'CALL': // Chamar procedimento ou função
        this.s += 1;
        this.stack[this.s] = { address: this.s, value: this.index + 1 };
        const targetCALL = this.labelMap[param1 || ""];
        if (targetCALL !== undefined) {
          this.index = targetCALL;
        } else {
          console.warn(`Destino da chamada de sub-rotina não encontrado: ${param1}`);
        }
        break;
  
      case 'RETURN': // Retornar de procedimento ou função
        if (this.stack[this.s] !== undefined) {
          this.index = this.stack[this.s].value;
          this.s -= 1;
        } else {
          console.warn("Tentativa de retornar de uma função sem valor na pilha.");
        }
        break;
  
      case 'JMP': // Desviar sempre
        const targetJMP = this.labelMap[param1 || ""];
        if (targetJMP !== undefined) {
          this.index = targetJMP;
        } else {
          console.warn(`Destino de JMP não encontrado: ${param1}`);
        }
        break;
  
      case 'JMPF': // Desviar se falso
        const targetJMPF = this.labelMap[param1 || ""];
        if (targetJMPF !== undefined && this.stack[this.s]?.value === 0) {
          this.index = targetJMPF;
        } else {
          this.index += 1;
        }
        this.s -= 1;
        break;
  
      case 'RD': // Leitura
        this.s += 1;
        const inputValue = parseInt(prompt("Digite o próximo valor de entrada:") || "0", 10);
        this.stack[this.s] = { address: this.s, value: inputValue };
        break;
  
      case 'PRN': // Impressão
        if (this.stack[this.s] !== undefined) {
          console.log("Imprimindo valor:", this.stack[this.s].value);
          this.s -= 1;
        } else {
          console.warn("Tentativa de imprimir valor de posição não inicializada na pilha.");
        }
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
        const { instruction, attribute1, attribute2, line } = currentInstruction;
        this.executeInstruction(instruction, attribute1, attribute2);
        this.currentLine = line;
      }
  
      // Avança o índice para a próxima instrução
      this.index++;
      console.log(this.s)
  
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
