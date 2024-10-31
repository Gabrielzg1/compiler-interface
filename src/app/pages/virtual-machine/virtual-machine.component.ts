import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PoButtonModule, PoCheckboxModule, PoRadioGroupModule, PoTableModule } from '@po-ui/ng-components';

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
    { instruction: "L2", attribute1: "NULL", attribute2: null },// Rótulo L2
    { instruction: "LDC", attribute1: "10", attribute2: null }, // Carrega 10 na pilha
    { instruction: "LDC", attribute1: "20", attribute2: null }, // Carrega 20 na pilha
    { instruction: "ADD", attribute1: null, attribute2: null }, // Soma 10 + 20 (resultado: 30)
    { instruction: "STR", attribute1: "1", attribute2: null }, // Armazena o resultado (30) na posição 1

    { instruction: "LDC", attribute1: "50", attribute2: null }, // Carrega 50 na pilha
    { instruction: "LDV", attribute1: "1", attribute2: null },  // Carrega o valor da posição 1 (30)
    { instruction: "SUB", attribute1: null, attribute2: null }, // Subtrai 50 - 30 (resultado: 20)
    { instruction: "STR", attribute1: "2", attribute2: null },  // Armazena o resultado (20) na posição 2

    { instruction: "LDC", attribute1: "2", attribute2: null },  // Carrega 2 na pilha
    { instruction: "LDV", attribute1: "2", attribute2: null },  // Carrega o valor da posição 2 (20)
    { instruction: "MULT", attribute1: null, attribute2: null },// Multiplica 20 * 2 (resultado: 40)
    { instruction: "STR", attribute1: "2", attribute2: null },  // Armazena o resultado (40) na posição 3

    { instruction: "LDC", attribute1: "100", attribute2: null },// Carrega 100 na pilha
    { instruction: "LDV", attribute1: "3", attribute2: null },  // Carrega o valor da posição 3 (40)
    { instruction: "CME", attribute1: null, attribute2: null }, // Compara se 40 < 100 (resultado: 1)
    { instruction: "JMPF", attribute1: "L1", attribute2: null },// Se falso, pula para L1 (não pula)

    { instruction: "LDC", attribute1: "1", attribute2: null },  // Carrega 1 na pilha
    { instruction: "STR", attribute1: "4", attribute2: null },  // Armazena o resultado (1) na posição 4
    

    { instruction: "L1", attribute1: "NULL", attribute2: null },// Rótulo L1
    { instruction: "JMP", attribute1: "L2", attribute2: null }, // Pula para L2
    { instruction: "LDC", attribute1: "0", attribute2: null },  // Carrega 0 na pilha
    { instruction: "STR", attribute1: "1", attribute2: null },  // Armazena o resultado (0) na posição 4

    
].map((instruction, index) => ({ line: index + 1, ...instruction }));


  stack: Array<{ address: number, value: number }> = [{ address: 0, value: 0 }];

  currentLine: number | null = null;
  intervalId: any;

  labelMap: Record<string, number> = {};

  ngOnInit() {
    this.mapLabels(); // Chama o mapeamento ao inicializar o componente
  }
  
  // Mapeia os rótulos para os índices de instruções
 // Mapeia os rótulos para os índices de instruções sem removê-los da lista
mapLabels() {
  this.instructions.forEach((inst, index) => {
    if (inst.instruction.startsWith("L") && inst.attribute1 === "NULL") {
      this.labelMap[inst.instruction] = index;
    }
  });
}

  executeInstruction(instruction: string, param1: string | null, param2: string | null) {
    if (instruction.startsWith("L") && param1 === "NULL") {
      return;
    }
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

      case 'JMP': // Desviar sempre
        const targetJMP = this.labelMap[param1 || ""];
        if (targetJMP !== undefined) {
          this.index = targetJMP; // Salta para a linha indicada pelo rótulo
        }
        break;
  
      case 'JMPF': // Desviar se falso
        const targetJMPF = this.labelMap[param1 || ""];
        if (targetJMPF !== undefined && this.stack[this.s].value === 0) {
          this.index = targetJMPF; // Salta para a linha indicada pelo rótulo se o valor no topo for 0
        } else {
          this.index += 1; // Caso contrário, avança para a próxima instrução
        }
        this.s -= 1; // Reduz o ponteiro da pilha
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
      
      const time = this.stepByStep ? 1000 : 1;
      
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
    this.s = 0;
    this.stack = [{ address: 0, value: 0 }]; // Reserva a posição 0 para retorno de função
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
