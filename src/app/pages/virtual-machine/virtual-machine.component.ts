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

  instructions: Array<{ instruction: string, attribute1: string | null, attribute2: string | null }> = [
    { instruction: "LDV", attribute1: "A", attribute2: null },
    { instruction: "LDV", attribute1: "B", attribute2: null },
    { instruction: "CMA", attribute1: null, attribute2: null },
    { instruction: "JMPF", attribute1: "L3", attribute2: null },
    { instruction: "LDV", attribute1: "P", attribute2: null },
    { instruction: "LDV", attribute1: "Q", attribute2: null },
    { instruction: "AND", attribute1: null, attribute2: null },
    { instruction: "STR", attribute1: "Q", attribute2: null },
    { instruction: "JMP", attribute1: "L4", attribute2: null },
    { instruction: "L3", attribute1: "NULL", attribute2: null },
    { instruction: "LDV", attribute1: "A", attribute2: null },
    { instruction: "LDC", attribute1: "2", attribute2: null },
    { instruction: "LDV", attribute1: "B", attribute2: null },
    { instruction: "MULT", attribute1: null, attribute2: null },
    { instruction: "CME", attribute1: null, attribute2: null },
    { instruction: "JMPF", attribute1: "L5", attribute2: null },
    { instruction: "LDC", attribute1: "1", attribute2: null },
    { instruction: "STR", attribute1: "P", attribute2: null },
    { instruction: "JMP", attribute1: "L6", attribute2: null },
    { instruction: "L5", attribute1: "NULL", attribute2: null },
    { instruction: "LDC", attribute1: "0", attribute2: null },
    { instruction: "STR", attribute1: "Q", attribute2: null },
    { instruction: "L6", attribute1: "NULL", attribute2: null },
    { instruction: "L4", attribute1: "NULL", attribute2: null }
  ];

  columns: Array<PoTableColumn> = [
    { property: 'instruction', label: 'Instrução' },
    { property: 'attribute1', label: 'Atributo 1' },
    { property: 'attribute2', label: 'Atributo 2' }
  ];

}
