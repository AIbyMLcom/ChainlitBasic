import { runTestServer } from '../../support/testUtils';

describe('Chat profiles', () => {
  before(() => {
    runTestServer();
    cy.visit('/');
    cy.get("input[name='email']").type('admin');
    cy.get("input[name='password']").type('admin');
    cy.get("button[type='submit']").click();
    cy.get('.MuiAlert-message').should('not.exist');
    cy.get('#chat-input').should('exist');
  });

  it('should be able to select a chat profile', () => {
    cy.get('.message').should('exist'); // temp fix as the CI isn't finding the next elements

    cy.get('[data-test="chat-profile:GPT-3.5"]').should('exist');
    cy.get('[data-test="chat-profile:GPT-4"]').should('exist');
    cy.get('[data-test="chat-profile:GPT-5"]').should('exist');

    cy.get('.message')
      .should('have.length', 1)
      .eq(0)
      .should(
        'contain',
        'starting chat with admin using the GPT-3.5 chat profile'
      );

    // Change chat profile

    cy.get('[data-test="chat-profile:GPT-4"]').click();
    cy.get('#confirm').click();

    cy.get('.message')
      .should('have.length', 1)
      .eq(0)
      .should(
        'contain',
        'starting chat with admin using the GPT-4 chat profile'
      );
    // New conversation

    cy.get('#new-chat-button').click();
    cy.get('#confirm').click();

    cy.get('.message')
      .should('have.length', 1)
      .eq(0)
      .should(
        'contain',
        'starting chat with admin using the GPT-4 chat profile'
      );
  });
});
