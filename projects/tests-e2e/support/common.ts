export const options = (): Cypress.Chainable<JQuery> => cy.get('.cdk-overlay-pane mat-option').should('be.visible');
