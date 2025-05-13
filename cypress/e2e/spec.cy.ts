describe('Ticket Management App', () => {
  beforeEach(() => {
    // Visitar la página de tickets antes de cada test
    cy.visit('http://localhost:4200/tickets');
    // Esperar a que la aplicación cargue completamente
    cy.contains('Ticket Management').should('be.visible');
  });

  it('should create a new ticket', () => {
    // Datos de prueba para el nuevo ticket
    const newTicket = {
      title: 'Test Ticket',
      description: 'This is a test ticket created by Cypress E2E test',
      status: 'open',
    };

    // Completar el formulario
    cy.get('#title').type(newTicket.title);
    cy.get('#description').type(newTicket.description);

    // El estado 'open' debería estar seleccionado por defecto, pero lo verificamos
    cy.get('#status').should('have.value', 'open');

    // Enviar el formulario
    cy.contains('button', 'Create Ticket').click();

    // Verificar que el formulario se limpie después de enviarlo
    cy.get('#title').should('have.value', '');
    cy.get('#description').should('have.value', '');

    // Verificar que el nuevo ticket aparezca en la lista
    cy.contains(newTicket.title).should('be.visible');
    cy.contains(newTicket.description).should('be.visible');

    // Verificar que el nuevo ticket tenga el estado correcto
    cy.contains('.ticket-status', 'Open').should('be.visible');
  });
});
