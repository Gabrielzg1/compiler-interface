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
    { instruction: "START", attribute1: null, attribute2: null },
    { instruction: "ALLOC", attribute1: "0", attribute2: "1" },
    { instruction: "ALLOC", attribute1: "1", attribute2: "3" },
    { instruction: "JMP", attribute1: "L1", attribute2: null },
    { instruction: "NULL", attribute1: "L2", attribute2: null },
    { instruction: "ALLOC", attribute1: "4", attribute2: "4" },
    { instruction: "JMP", attribute1: "L3", attribute2: null },
    { instruction: "NULL", attribute1: "L4", attribute2: null },
    { instruction: "RD", attribute1: null, attribute2: null },
    { instruction: "STR", attribute1: "4", attribute2: null },
    { instruction: "RD", attribute1: null, attribute2: null },
    { instruction: "STR", attribute1: "5", attribute2: null },
    { instruction: "CALL", attribute1: "L2", attribute2: null },
    { instruction: "LDV", attribute1: "0", attribute2: null },
    { instruction: "STR", attribute1: "6", attribute2: null },
    { instruction: "LDV", attribute1: "6", attribute2: null },
    { instruction: "PRN", attribute1: null, attribute2: null },
    { instruction: "RETURN", attribute1: null, attribute2: null },
    { instruction: "NULL", attribute1: "L5", attribute2: null },
    { instruction: "ALLOC", attribute1: "8", attribute2: "1" },
    { instruction: "RD", attribute1: null, attribute2: null },
    { instruction: "STR", attribute1: "8", attribute2: null },
    { instruction: "LDV", attribute1: "8", attribute2: null },
    { instruction: "LDC", attribute1: "10", attribute2: null },
    { instruction: "CME", attribute1: null, attribute2: null },
    { instruction: "JMPF", attribute1: "L6", attribute2: null },
    { instruction: "CALL", attribute1: "L4", attribute2: null },
    { instruction: "NULL", attribute1: "L6", attribute2: null },
    { instruction: "DALLOC", attribute1: "8", attribute2: "1" },
    { instruction: "RETURN", attribute1: null, attribute2: null },
    { instruction: "NULL", attribute1: "L3", attribute2: null },
    { instruction: "CALL", attribute1: "L5", attribute2: null },
    { instruction: "LDV", attribute1: "4", attribute2: null },
    { instruction: "LDV", attribute1: "5", attribute2: null },
    { instruction: "ADD", attribute1: null, attribute2: null },
    { instruction: "STR", attribute1: "0", attribute2: null },
    { instruction: "DALLOC", attribute1: "4", attribute2: "4" },
    { instruction: "RETURN", attribute1: null, attribute2: null },
    { instruction: "NULL", attribute1: "L1", attribute2: null },
    { instruction: "CALL", attribute1: "L2", attribute2: null },
    { instruction: "LDV", attribute1: "0", attribute2: null },
    { instruction: "STR", attribute1: "3", attribute2: null },
    { instruction: "LDV", attribute1: "3", attribute2: null },
    { instruction: "PRN", attribute1: null, attribute2: null },
    { instruction: "DALLOC", attribute1: "1", attribute2: "3" },
    { instruction: "DALLOC", attribute1: "0", attribute2: "1" },
    { instruction: "HLT", attribute1: null, attribute2: null }
].map((instruction, index) => ({ line: index + 1, ...instruction }));



  stack: Array<{ address: number, value: number }> = [{ address: 0, value: 0 }];

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
      case 'START': 
          console.log("Início do programa");
          break;

      case 'HLT': 
          console.log("Fim do programa");
          this.isExecuting = false;
          clearTimeout(this.intervalId);
          return;

      case 'LDC': 
          this.s += 1;
          this.stack[this.s] = { address: this.s, value: parseInt(param1 || "0", 10) };
          break;

      case 'LDV': 
          this.s += 1;
          const n = parseInt(param1 || "0", 10);
          this.stack[this.s] = { address: this.s, value: this.stack[n]?.value || 0 };
          break;

      case 'RD': 
          this.s += 1;
          const inputValue = parseInt(prompt("Digite o próximo valor de entrada:") || "0", 10);
          this.stack[this.s] = { address: this.s, value: inputValue };
          break;

      case 'STR': 
          const storeIndex = parseInt(param1 || "0", 10);
          this.stack[storeIndex] = { address: storeIndex, value: this.stack[this.s].value };
          this.s -= 1;
          break;

      case 'PRN': 
          console.log("Imprimindo valor:", this.stack[this.s].value);
          this.s -= 1;
          break;

      case 'ALLOC': 
        const mAlloc = parseInt(param1 || "0", 10);
        const nAlloc = parseInt(param2 || "0", 10);
          for (let k = 0; k <= nAlloc - 1; k++) {
              // Avança o ponteiro de pilha e mapeia a variável para o índice `m + k`
              this.s += 1;
              this.stack[this.s] = { address: this.s, value: this.stack[mAlloc + k]?.value || 0 };
          }
          break;
      
      case 'DALLOC': 
          const mDalloc = parseInt(param1 || "0", 10);
          const nDalloc = parseInt(param2 || "0", 10);
          for (let k = nDalloc - 1; k >= 0; k--) {
              this.stack[mDalloc + k].value = this.stack[this.s].value; 
              this.s = this.s - 1; // Reduz o ponteiro após cada desalocação
          }
          break;
      

      case 'CME':
          if (this.s > 0) {
              this.stack[this.s - 1].value = (this.stack[this.s - 1].value < this.stack[this.s].value) ? 1 : 0;
              this.s -= 1;
          }
          break;

      case 'CMEQ':
          if (this.s > 0) {
              this.stack[this.s - 1].value = (this.stack[this.s - 1].value <= this.stack[this.s].value) ? 1 : 0;
              this.s -= 1;
          }
          break;

      case 'CMAQ':
          if (this.s > 0) {
              this.stack[this.s - 1].value = (this.stack[this.s - 1].value >= this.stack[this.s].value) ? 1 : 0;
              this.s -= 1;
          }
          break;

      case 'CEQ':
          if (this.s > 0) {
              this.stack[this.s - 1].value = (this.stack[this.s - 1].value === this.stack[this.s].value) ? 1 : 0;
              this.s -= 1;
          }
          break;

      case 'CDIF':
          if (this.s > 0) {
              this.stack[this.s - 1].value = (this.stack[this.s - 1].value !== this.stack[this.s].value) ? 1 : 0;
              this.s -= 1;
          }
          break;

      case 'AND':
          if (this.s > 0) {
              this.stack[this.s - 1].value = (this.stack[this.s - 1].value === 1 && this.stack[this.s].value === 1) ? 1 : 0;
              this.s -= 1;
          }
          break;

      case 'OR':
          if (this.s > 0) {
              this.stack[this.s - 1].value = (this.stack[this.s - 1].value === 1 || this.stack[this.s].value === 1) ? 1 : 0;
              this.s -= 1;
          }
          break;

      case 'NEG':
          if (this.s >= 0) {
              this.stack[this.s].value = 1 - this.stack[this.s].value;
          }
          break;

      case 'INV':
          if (this.s >= 0) {
              this.stack[this.s].value = -this.stack[this.s].value;
          }
          break;

      case 'CALL': 
          this.s += 1; 
          this.stack[this.s] = { address: this.s, value: this.index + 1 };
          const targetCALL = this.labelMap[param1 || ""];
          if (targetCALL !== undefined) {
              this.index = targetCALL;
          }
          break;

      case 'RETURN': 
          this.index = this.stack[this.s].value;
          this.s -= 1; 
          break;

      case 'ADD': 
          if (this.s > 0) {
              this.stack[this.s - 1].value += this.stack[this.s].value;
              this.s -= 1;
          }
          break;

      case 'SUB': 
          if (this.s > 0) {
              this.stack[this.s - 1].value -= this.stack[this.s].value;
              this.s -= 1;
          }
          break;

      case 'MULT': 
          if (this.s > 0) {
              this.stack[this.s - 1].value *= this.stack[this.s].value;
              this.s -= 1;
          }
          break;

      case 'CMA': 
          if (this.s > 0) {
              this.stack[this.s - 1].value = (this.stack[this.s - 1].value > this.stack[this.s].value) ? 1 : 0;
              this.s -= 1;
          }
          break;

      case 'JMP': 
          const targetJMP = this.labelMap[param1 || ""];
          if (targetJMP !== undefined) {
              this.index = targetJMP;
          }
          break;

      case 'JMPF': 
          const targetJMPF = this.labelMap[param1 || ""];
          if (targetJMPF !== undefined && this.stack[this.s].value === 0) {
              this.index = targetJMPF;
          } else {
              this.index += 1;
          }
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
