import {
  Component, Input, Output, EventEmitter,
  OnInit, OnDestroy, HostListener, ElementRef,
  inject, forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DropdownService } from '../../../core/services/dropdown/dropdown.service';
import { Subscription } from 'rxjs';

export interface DropdownOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Dropdown),
    multi: true
  }]
})
export class Dropdown implements OnInit, OnDestroy {
  private el              = inject(ElementRef);
  private dropdownService = inject(DropdownService);

  @Input() options:     DropdownOption[] = [];
  @Input() placeholder: string = 'Select...';
  @Input() icon:        string = '';

  isOpen        = false;
  selectedLabel = '';
  selectedValue = '';
  isDisabled    = false;
  id            = Math.random().toString(36).slice(2); // unique ID

  private sub!: Subscription;
  private onChange  = (_: any) => {};
  private onTouched = () => {};

  ngOnInit() {
    // Close this dropdown when another opens
    this.sub = this.dropdownService.closeAll.subscribe(exceptId => {
      if (exceptId !== this.id) this.isOpen = false;
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  get displayLabel(): string {
    return this.selectedLabel || this.placeholder;
  }

  get hasValue(): boolean { return !!this.selectedValue; }

  toggle() {
    if (this.isDisabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      // Tell all other dropdowns to close
      this.dropdownService.requestClose(this.id);
    }
    this.onTouched();
  }

  select(option: DropdownOption) {
    this.selectedValue = option.value;
    this.selectedLabel = option.value === '' ? '' : option.label;
    this.isOpen        = false;
    this.onChange(option.value);
  }

  clear(event: Event) {
    event.stopPropagation();
    this.selectedValue = '';
    this.selectedLabel = '';
    this.onChange('');
  }

  isSelected(option: DropdownOption): boolean {
    return this.selectedValue === option.value;
  }

  writeValue(value: string): void {
    this.selectedValue = value || '';
    const opt = this.options.find(o => o.value === value);
    this.selectedLabel = opt && opt.value !== '' ? opt.label : '';
  }

  registerOnChange(fn: any)    { this.onChange  = fn; }
  registerOnTouched(fn: any)   { this.onTouched = fn; }
  setDisabledState(d: boolean) { this.isDisabled = d; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}