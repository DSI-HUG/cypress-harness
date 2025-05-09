import { MatCalendarCellHarness, MatCalendarHarness } from '@angular/material/datepicker/testing';
import { getButtonHarness, getDatePickerInputHarness, getHarness, getInputHarness, getOptionHarness, getSelectHarness } from '../library/src/index';
import { options } from './support/common';

describe('Angular Material Harness', () => {
    beforeEach(() => {
        cy.visit('http://localhost:4200');
    });

    it('MatButton - click()', async () => {
        cy.get('#demo-button').should('be.visible');

        getButtonHarness('#demo-button').invoke('click');

        cy.get('.message').should('be.visible').and('have.text', 'CLICKED');
    });

    it('MatSelect - select()', async () => {
        cy.get('#demo-select').should('be.visible');

        getSelectHarness('#demo-select').invoke('open');

        // Wait for animation
        cy.wait(100);

        options().should('have.length', 3);
        getOptionHarness({ text: 'Pizza' }).invoke('click');

        getSelectHarness().then(async harness => {
            expect(await harness.getValueText()).to.equal('Pizza');
        });
    });

    it('MatDatePicker - setValue()', async () => {
        cy.get('#demo-datepicker-input').should('be.visible');

        getDatePickerInputHarness('#demo-datepicker-input').invoke('setValue', '9/27/1954');

        getDatePickerInputHarness('#demo-datepicker-input').then(async datepicker => {
            expect(await datepicker.getValue()).to.equal('9/27/1954');
        });
    });

    it('TextArea - type text', async () => {
        cy.get('#demo-textarea').should('be.visible');

        getInputHarness('#demo-textarea').then(async textArea => {
            textArea.setValue('This is a comment');
        });

        cy.get('.comment').should('be.visible').and('have.text', 'This is a comment');
    });
});
